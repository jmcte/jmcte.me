import { execFile } from "node:child_process";
import { rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const outputPath = path.join(root, "public", "heatmap-last-year.png");
const manifestPath = path.join(root, "content", "slopmeter.json");
const outputTempPath = `${outputPath}.${process.pid}.tmp.png`;
const manifestTempPath = `${manifestPath}.${process.pid}.tmp`;
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

try {
  const { stdout, stderr } = await execFileAsync(
    npx,
    ["--yes", "slopmeter@0.5.1", "--codex", "--dark", "--format", "png", "--output", outputTempPath],
    {
      cwd: root,
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
    summary.format !== "png" ||
    summary.colorMode !== "dark" ||
    summary.rendered?.length !== 1 ||
    summary.rendered[0] !== "codex" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(summary.startDate) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(summary.endDate)
  ) {
    throw new Error("Slopmeter returned an unexpected snapshot configuration.");
  }

  const manifest = {
    provider: "codex",
    generatedAt: new Date().toISOString(),
    startDate: summary.startDate,
    endDate: summary.endDate
  };

  await writeFile(manifestTempPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await rename(outputTempPath, outputPath);
  await rename(manifestTempPath, manifestPath);
  process.stdout.write(`Updated ${path.relative(root, outputPath)} and ${path.relative(root, manifestPath)}\n`);
} finally {
  await Promise.all([
    rm(outputTempPath, { force: true }),
    rm(manifestTempPath, { force: true })
  ]);
}
