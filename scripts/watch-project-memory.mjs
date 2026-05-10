import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const rootDir = process.cwd();
const watchRoots = [
  "README.md",
  "package.json",
  "netlify.toml",
  "render.yaml",
  path.join("backend"),
  path.join("frontend")
];

const ignored = [
  `${path.sep}node_modules${path.sep}`,
  `${path.sep}dist${path.sep}`,
  `${path.sep}graphify-out${path.sep}`,
  `${path.sep}.git${path.sep}`
];
const statusFile = path.join(rootDir, "graphify-out", "watch-status.json");

let timer = null;
let running = false;
let queued = false;

console.log("Memory watch start");
fs.mkdirSync(path.join(rootDir, "graphify-out"), { recursive: true });
writeStatus("started");
runSync();

for (const relative of watchRoots) {
  const absolute = path.join(rootDir, relative);

  if (!fs.existsSync(absolute)) {
    continue;
  }

  fs.watch(
    absolute,
    { recursive: true },
    (_eventType, changedPath = "") => {
      const normalized = path.join(absolute, changedPath);

      if (ignored.some((segment) => normalized.includes(segment))) {
        return;
      }

      debounceSync();
    }
  );
}

function debounceSync() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    runSync();
  }, 500);
}

function runSync() {
  if (running) {
    queued = true;
    writeStatus("queued");
    return;
  }

  running = true;
  writeStatus("syncing");
  const child = spawn(process.execPath, [path.join("scripts", "sync-project-memory.mjs")], {
    cwd: rootDir,
    stdio: "inherit"
  });

  child.on("exit", (code) => {
    running = false;
    writeStatus(code === 0 ? "idle" : "error");

    if (queued) {
      queued = false;
      runSync();
    }
  });
}

function writeStatus(state) {
  fs.writeFileSync(
    statusFile,
    JSON.stringify(
      {
        pid: process.pid,
        state,
        updatedAt: new Date().toISOString()
      },
      null,
      2
    )
  );
}
