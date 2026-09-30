import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const url = process.env.API_OPENAPI_URL || "http://localhost:3000/api/docs-json";
const cli = path.join(root, "node_modules", "openapi-typescript", "bin", "cli.js");
const output = path.join(root, "src", "lib", "api", "schema.d.ts");

const result = spawnSync(process.execPath, [cli, url, "-o", output], {
  stdio: "inherit",
  cwd: root,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
