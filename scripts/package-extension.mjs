import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const releaseDir = path.join(rootDir, "release");
const packageJson = JSON.parse(await readFile(path.join(rootDir, "package.json"), "utf8"));
const zip = new JSZip();
const archiveRoot = "markharbor";

async function assertDistExists() {
  try {
    const distStat = await stat(distDir);
    if (!distStat.isDirectory()) {
      throw new Error("dist exists but is not a directory");
    }
  } catch {
    throw new Error("Missing dist/. Run npm run build before packaging.");
  }
}

async function addDirectory(directory, zipDirectory) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    const zipPath = `${zipDirectory}/${entry.name}`;

    if (entry.isDirectory()) {
      await addDirectory(absolutePath, zipPath);
      continue;
    }

    if (entry.isFile()) {
      zip.file(zipPath, await readFile(absolutePath));
    }
  }
}

await assertDistExists();
await mkdir(releaseDir, { recursive: true });
await addDirectory(distDir, archiveRoot);

const archive = await zip.generateAsync({
  type: "nodebuffer",
  compression: "DEFLATE",
  compressionOptions: { level: 9 }
});

const outputPath = path.join(releaseDir, `markharbor-v${packageJson.version}.zip`);
await writeFile(outputPath, archive);

console.log(`Created ${path.relative(rootDir, outputPath)}`);
