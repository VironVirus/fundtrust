import { createWriteStream } from "node:fs";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import { spawn, spawnSync } from "node:child_process";

const projectRoot = process.cwd();
const logPath = join(projectRoot, "codex-restart.log");
const out = createWriteStream(logPath, { flags: "a" });

function log(message) {
  out.write(`[${new Date().toISOString()}] ${message}\n`);
}

function run(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
      ...options,
    });

    child.stdout.on("data", (chunk) => out.write(chunk));
    child.stderr.on("data", (chunk) => out.write(chunk));
    child.on("error", (error) => {
      log(`[error] ${String(error)}`);
    });
    child.on("exit", (code, signal) => {
      resolve({ code, signal });
    });
  });
}

function getListeningPids(port) {
  const result = spawnSync(
    "cmd.exe",
    ["/d", "/s", "/c", `netstat -ano | findstr LISTENING | findstr :${port}`],
    {
      cwd: projectRoot,
      encoding: "utf8",
      windowsHide: true,
      timeout: 10000,
    },
  );

  const pids = new Set();
  for (const line of result.stdout.split(/\r?\n/)) {
    const match = line.trim().match(/LISTENING\s+(\d+)$/);
    if (match) {
      pids.add(match[1]);
    }
  }

  return [...pids];
}

function killPorts(ports) {
  for (const port of ports) {
    for (const pid of getListeningPids(port)) {
      log(`Stopping PID ${pid} on port ${port}`);
      spawnSync("cmd.exe", ["/d", "/s", "/c", `taskkill /PID ${pid} /T /F`], {
        cwd: projectRoot,
        encoding: "utf8",
        windowsHide: true,
        timeout: 10000,
      });
    }
  }
}

async function main() {
  await fs.writeFile(logPath, "");
  log("Starting Fundtrust rebuild");
  killPorts([3000, 3001, 3003]);

  log("Running next build");
  const buildResult = await run("node", [
    "node_modules/next/dist/bin/next",
    "build",
  ]);

  if (buildResult.code !== 0) {
    log(`Build failed with code=${buildResult.code} signal=${buildResult.signal}`);
    out.end();
    process.exit(buildResult.code ?? 1);
  }

  log("Build completed successfully");
  log("Starting next start on port 3001");

  const server = spawn(
    "node",
    ["node_modules/next/dist/bin/next", "start", "-p", "3001"],
    {
      cwd: projectRoot,
      windowsHide: true,
      detached: true,
      stdio: ["ignore", "ignore", "ignore"],
    },
  );

  server.unref();
  log(`Started server PID ${server.pid} on port 3001`);
  out.end();
}

main().catch((error) => {
  log(`[fatal] ${error instanceof Error ? error.stack ?? error.message : String(error)}`);
  out.end();
  process.exit(1);
});
