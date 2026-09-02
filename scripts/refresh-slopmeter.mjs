import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { copyFile, link, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { createInterface } from "node:readline";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const outputPath = path.join(root, "public", "heatmap-last-year.svg");
const manifestPath = path.join(root, "content", "slopmeter.json");
const outputTempPath = `${outputPath}.${process.pid}.tmp.svg`;
const manifestTempPath = `${manifestPath}.${process.pid}.tmp`;
const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const previousManifest = JSON.parse(await readFile(manifestPath, "utf8"));
const sourceCodexHome = process.env.CODEX_HOME?.trim()
  ? path.resolve(process.env.CODEX_HOME)
  : path.join(homedir(), ".codex");
const minimumRecordBytes = 256 * 1024 * 1024;
let codexSnapshotHome;

async function linkJsonlTree(sourceRoot, destinationRoot) {
  let entries;

  try {
    entries = await readdir(sourceRoot, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") {
      return 0;
    }
    throw error;
  }

  let linkedFiles = 0;
  for (const entry of entries) {
    const sourcePath = path.join(sourceRoot, entry.name);
    const destinationPath = path.join(destinationRoot, entry.name);

    if (entry.isDirectory()) {
      await mkdir(destinationPath, { recursive: true });
      linkedFiles += await linkJsonlTree(sourcePath, destinationPath);
    } else if (entry.isFile() && entry.name.endsWith(".jsonl")) {
      await mkdir(destinationRoot, { recursive: true });
      await link(sourcePath, destinationPath);
      linkedFiles += 1;
    }
  }

  return linkedFiles;
}

async function stageCodexHistory() {
  const snapshotHome = await mkdtemp(path.join(sourceCodexHome, ".slopmeter-"));
  try {
    const snapshotSessions = path.join(snapshotHome, "sessions");
    await mkdir(snapshotSessions);

    const activeSessionFiles = await linkJsonlTree(
      path.join(sourceCodexHome, "sessions"),
      path.join(snapshotSessions, "active")
    );
    const archivedSessionFiles = await linkJsonlTree(
      path.join(sourceCodexHome, "archived_sessions"),
      path.join(snapshotSessions, "archived")
    );

    if (activeSessionFiles + archivedSessionFiles === 0) {
      throw new Error(`No Codex session logs found under ${sourceCodexHome}.`);
    }

    return { snapshotHome, activeSessionFiles, archivedSessionFiles };
  } catch (error) {
    await rm(snapshotHome, { recursive: true, force: true });
    throw error;
  }
}

async function readOllamaCoverage() {
  const logsDirectory = path.join(homedir(), ".ollama", "logs");
  let logFiles;

  try {
    logFiles = (await readdir(logsDirectory))
      .filter((name) => /^server(?:-\d+)?\.log$/.test(name))
      .sort();
  } catch (error) {
    if (error?.code === "ENOENT") {
      return { requestCount: 0, tokenTotalsAvailable: false };
    }
    throw error;
  }

  let requestCount = 0;
  let startDate;
  let endDate;
  const requestPattern = /^\[GIN\]\s+(\d{4})\/(\d{2})\/(\d{2})\s+-\s+\S+\s+\|\s+(\d{3})\s+\|.*\|\s+POST\s+"\/(?:api\/(?:chat|generate)|v1\/chat\/completions)"/;

  for (const logFile of logFiles) {
    const lines = createInterface({
      input: createReadStream(path.join(logsDirectory, logFile)),
      crlfDelay: Infinity
    });

    for await (const line of lines) {
      const match = requestPattern.exec(line);
      if (!match || match[4] !== "200") {
        continue;
      }

      const date = `${match[1]}-${match[2]}-${match[3]}`;
      requestCount += 1;
      startDate = startDate === undefined || date < startDate ? date : startDate;
      endDate = endDate === undefined || date > endDate ? date : endDate;
    }
  }

  return {
    requestCount,
    startDate,
    endDate,
    tokenTotalsAvailable: false
  };
}

try {
  const codexHistory = await stageCodexHistory();
  codexSnapshotHome = codexHistory.snapshotHome;
  const configuredRecordBytes = Number.parseInt(process.env.SLOPMETER_MAX_JSONL_RECORD_BYTES ?? "", 10);
  const maxRecordBytes = Number.isFinite(configuredRecordBytes)
    ? Math.max(configuredRecordBytes, minimumRecordBytes)
    : minimumRecordBytes;
  const { stdout, stderr } = await execFileAsync(
    npx,
    ["--yes", "slopmeter@0.5.1", "--all", "--dark", "--format", "svg", "--output", outputTempPath],
    {
      cwd: root,
      env: {
        ...process.env,
        CODEX_HOME: codexSnapshotHome,
        CURSOR_STATE_DB_PATH: path.join(codexSnapshotHome, "cursor-disabled.vscdb"),
        PI_CODING_AGENT_DIR: path.join(codexSnapshotHome, "pi-disabled"),
        SLOPMETER_MAX_JSONL_RECORD_BYTES: String(maxRecordBytes)
      },
      maxBuffer: 1024 * 1024
    }
  );

  process.stdout.write(stdout);
  process.stderr.write(stderr);

  const summaryStart = stdout.lastIndexOf("\n{");
  if (summaryStart === -1) {
    throw new Error("Slopmeter did not return a machine-readable run summary.");
  }

  const summary = JSON.parse(stdout.slice(summaryStart + 1));
  if (
    summary.format !== "svg" ||
    summary.colorMode !== "dark" ||
    summary.rendered?.length !== 1 ||
    summary.rendered[0] !== "all" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(summary.startDate) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(summary.endDate)
  ) {
    throw new Error("Slopmeter returned an unexpected snapshot configuration.");
  }

  const providerSignals = [
    ["Claude code available", "Claude Code"],
    ["Codex available", "Codex"],
    ["Open Code available", "OpenCode"]
  ];
  const providers = providerSignals
    .filter(([signal]) => stdout.includes(signal))
    .map(([, provider]) => provider);
  if (providers.length !== providerSignals.length) {
    throw new Error("The combined snapshot requires Claude Code, Codex, and OpenCode usage data.");
  }

  const ollama = await readOllamaCoverage();

  const generatedSvg = await readFile(outputTempPath, "utf8");
  const misleadingTelemetryNote = /Claude started logging full token telemetry on [^;<]+; earlier activity may be undercounted\./;
  if (!misleadingTelemetryNote.test(generatedSvg)) {
    throw new Error("Slopmeter did not emit the expected partial-telemetry disclosure.");
  }
  await writeFile(
    outputTempPath,
    generatedSvg.replace(
      misleadingTelemetryNote,
      "Some early Claude activity has no token telemetry; combined totals may be undercounted."
    ),
    "utf8"
  );

  const manifest = {
    provider: "all",
    providers,
    generatedAt: new Date().toISOString(),
    startDate: summary.startDate,
    endDate: summary.endDate,
    image: "",
    coverage: {
      codex: {
        activeSessionFiles: codexHistory.activeSessionFiles,
        archivedSessionFiles: codexHistory.archivedSessionFiles
      },
      qwenIncludedVia: "OpenCode",
      ollama
    }
  };

  const image = await readFile(outputTempPath);
  const fingerprint = createHash("sha256").update(image).digest("hex").slice(0, 12);
  const versionedImageName = `heatmap-last-year.${fingerprint}.svg`;
  const versionedImagePath = path.join(root, "public", versionedImageName);
  manifest.image = `/${versionedImageName}`;

  await writeFile(manifestTempPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await copyFile(outputTempPath, outputPath);
  await copyFile(outputTempPath, versionedImagePath);
  await rename(manifestTempPath, manifestPath);

  if (
    previousManifest.image !== manifest.image &&
    /^\/heatmap-last-year\.[a-f0-9]{12}\.(?:png|svg)$/.test(previousManifest.image)
  ) {
    await rm(path.join(root, "public", previousManifest.image.slice(1)), { force: true });
  }

  await rm(path.join(root, "public", "heatmap-last-year.png"), { force: true });

  process.stdout.write(
    `Updated ${path.relative(root, outputPath)}, ${path.relative(root, versionedImagePath)}, and ${path.relative(root, manifestPath)}\n`
  );
} finally {
  await Promise.all([
    rm(outputTempPath, { force: true }),
    rm(manifestTempPath, { force: true }),
    codexSnapshotHome
      ? rm(codexSnapshotHome, { recursive: true, force: true })
      : Promise.resolve()
  ]);
}
