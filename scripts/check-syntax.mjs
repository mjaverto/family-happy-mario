import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

let failures = 0;

// (a) syntax-check every src/*.js
const srcDir = "src";
const jsFiles = readdirSync(srcDir).filter((f) => f.endsWith(".js"));
for (const f of jsFiles) {
  const p = join(srcDir, f);
  try {
    execFileSync(process.execPath, ["--check", p], { stdio: "pipe" });
    console.log(`ok   ${p}`);
  } catch (e) {
    failures++;
    console.error(`FAIL ${p}\n${e.stderr?.toString() ?? e.message}`);
  }
}

// (b) referenced assets in index.html exist
const html = readFileSync("index.html", "utf8");
const refs = [...html.matchAll(/(?:src|href)="(src\/[^"]+)"/g)].map((m) => m[1]);
for (const ref of refs) {
  try {
    readFileSync(ref);
    console.log(`ok   ref ${ref}`);
  } catch {
    failures++;
    console.error(`FAIL missing referenced asset: ${ref}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log(
  `\nAll ${jsFiles.length} script(s) + ${refs.length} reference(s) passed`
);
