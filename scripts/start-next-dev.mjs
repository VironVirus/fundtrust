import { createWriteStream } from "node:fs";
import { join } from "node:path";
import { createServer } from "node:http";
import { parse } from "node:url";
import { spawnSync } from "node:child_process";
import next from "next";

const projectRoot = process.cwd();
const logPath = join(projectRoot, "codex-dev.log");
const logStream = createWriteStream(logPath, { flags: "a" });

function log(message) {
  logStream.write(`[${new Date().toISOString()}] ${message}\n`);
}

function killListeners(port) {
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

  for (const line of result.stdout.split(/\r?\n/)) {
    const match = line.trim().match(/LISTENING\s+(\d+)$/);
    if (!match) {
      continue;
    }

    log(`Stopping PID ${match[1]} on port ${port}`);
    spawnSync("cmd.exe", ["/d", "/s", "/c", `taskkill /PID ${match[1]} /T /F`], {
      cwd: projectRoot,
      encoding: "utf8",
      windowsHide: true,
      timeout: 10000,
    });
  }
}

async function main() {
  log("Starting programmatic Next dev server");
  killListeners(3001);

  const app = next({
    dev: true,
    dir: projectRoot,
  });

  const handle = app.getRequestHandler();

  log("Preparing Next app");
  await app.prepare();
  log("Next app prepared");

  const server = createServer((req, res) => {
    const method = req.method ?? "GET";
    const url = req.url ?? "/";
    const startedAt = Date.now();
    log(`Request start ${method} ${url}`);
    const slowTimer = setTimeout(() => {
      log(`Request pending ${method} ${url} after ${Date.now() - startedAt}ms`);
    }, 10000);

    res.on("finish", () => {
      clearTimeout(slowTimer);
      log(`Request finish ${method} ${url} status=${res.statusCode} in ${Date.now() - startedAt}ms`);
    });

    const parsedUrl = parse(url, true);

    handle(req, res, parsedUrl).catch((error) => {
      clearTimeout(slowTimer);
      log(`Request error: ${error instanceof Error ? error.stack ?? error.message : String(error)}`);
      res.statusCode = 500;
      res.end("Fundtrust dev server request failed.");
    });
  });

  server.on("error", (error) => {
    log(`Server error: ${error instanceof Error ? error.stack ?? error.message : String(error)}`);
  });

  server.listen(3001, "127.0.0.1", () => {
    log("Next dev server listening on http://127.0.0.1:3001");
  });
}

main().catch((error) => {
  log(`Fatal startup error: ${error instanceof Error ? error.stack ?? error.message : String(error)}`);
  process.exit(1);
});
