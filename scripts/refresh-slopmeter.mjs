import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFile, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const outputPath = path.join(root, "public", "heatmap-last-year.png");
const manifestPath = path.join(root, "content", "slopmeter.json");
const outputTempPath = `${outputPath}.${process.pid}.tmp.png`;
const manifestTempPath = `${manifestPath}.${process.pid}.tmp`;
const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const previousManifest = JSON.parse(await readFile(manifestPath, "utf8"));

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
    endDate: summary.endDate,
    image: ""
  };

  const image = await readFile(outputTempPath);
  const fingerprint = createHash("sha256").update(image).digest("hex").slice(0, 12);
  const versionedImageName = `heatmap-last-year.${fingerprint}.png`;
  const versionedImagePath = path.join(root, "public", versionedImageName);
  manifest.image = `/${versionedImageName}`;

  await writeFile(manifestTempPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await copyFile(outputTempPath, outputPath);
  await copyFile(outputTempPath, versionedImagePath);
  await rename(manifestTempPath, manifestPath);

  if (
    previousManifest.image !== manifest.image &&
    /^\/heatmap-last-year\.[a-f0-9]{12}\.png$/.test(previousManifest.image)
  ) {
    await rm(path.join(root, "public", previousManifest.image.slice(1)), { force: true });
  }

  process.stdout.write(
    `Updated ${path.relative(root, outputPath)}, ${path.relative(root, versionedImagePath)}, and ${path.relative(root, manifestPath)}\n`
  );
} finally {
  await Promise.all([
    rm(outputTempPath, { force: true }),
    rm(manifestTempPath, { force: true })
  ]);
}
