import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versionFile = path.join(__dirname, "..", "version.js");

const currentContent = fs.readFileSync(versionFile, "utf8");
const versionMatch = currentContent.match(/['"]([0-9]+\.[0-9]+\.[0-9]+)['"]/);
if (!versionMatch) {
  console.error("Could not find version in version.js");
  process.exit(1);
}

const currentVersion = versionMatch[1];
const [major, minor, patch] = currentVersion.split(".").map(Number);

let newVersion;
if (patch < 9) {
  newVersion = `${major}.${minor}.${patch + 1}`;
} else {
  newVersion = `${major}.${minor + 1}.0`;
}

const newContent = `export const version = '${newVersion}';`;
fs.writeFileSync(versionFile, newContent);

console.log(`Updated version from ${currentVersion} to ${newVersion}`);
