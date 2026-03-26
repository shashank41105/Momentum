import fs from "node:fs";
import path from "node:path";

const rootDir = path.resolve(import.meta.dirname, "..");
const sourceDir = path.join(rootDir, "node_modules", "@next", "swc-wasm-nodejs");
const targetDir = path.join(rootDir, "node_modules", "next", "wasm", "@next", "swc-wasm-nodejs");

if (!fs.existsSync(sourceDir)) {
  console.log("[prepare-swc-wasm] source package not found, skipping.");
  process.exit(0);
}

fs.mkdirSync(targetDir, { recursive: true });

for (const fileName of ["package.json", "README.md", "wasm.d.ts", "wasm.js", "wasm_bg.wasm"]) {
  const sourceFile = path.join(sourceDir, fileName);
  const targetFile = path.join(targetDir, fileName);
  if (fs.existsSync(sourceFile)) {
    fs.copyFileSync(sourceFile, targetFile);
  }
}

console.log("[prepare-swc-wasm] fallback wasm package prepared.");
