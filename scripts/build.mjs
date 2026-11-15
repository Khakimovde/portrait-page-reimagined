import { spawnSync } from "node:child_process";
import { buildTarget } from "./build-target.mjs";

const args = buildTarget(process.env) === "cloud"
  ? ["build"]
  : ["build", "--config", "vite.static.config.ts"];
const result = spawnSync(process.execPath, ["node_modules/vite/bin/vite.js", ...args], {
  stdio: "inherit",
  env: process.env,
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);