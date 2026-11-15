"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const args = process.argv.slice(2);
const valueAfter = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const host = valueAfter("--host", "0.0.0.0");
const port = Number(valueAfter("--port", "4173"));

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".cjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
};

function safeFile(url) {
  const pathname = decodeURIComponent(new URL(url, "http://preview.local").pathname);
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const resolved = path.resolve(root, relative);
  return resolved === root || resolved.startsWith(`${root}${path.sep}`) ? resolved : null;
}

http.createServer((request, response) => {
  const file = safeFile(request.url || "/");
  if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    response.writeHead(404, {"content-type": "text/plain; charset=utf-8"});
    response.end("Not found");
    return;
  }

  const stat = fs.statSync(file);
  const type = mime[path.extname(file).toLowerCase()] || "application/octet-stream";
  const range = request.headers.range;
  const headers = {
    "accept-ranges": "bytes",
    "cache-control": "no-store",
    "content-type": type,
  };

  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match) {
      response.writeHead(416, {"content-range": `bytes */${stat.size}`});
      response.end();
      return;
    }
    const start = match[1] ? Number(match[1]) : 0;
    const end = match[2] ? Math.min(Number(match[2]), stat.size - 1) : stat.size - 1;
    if (start > end || start >= stat.size) {
      response.writeHead(416, {"content-range": `bytes */${stat.size}`});
      response.end();
      return;
    }
    response.writeHead(206, {
      ...headers,
      "content-length": end - start + 1,
      "content-range": `bytes ${start}-${end}/${stat.size}`,
    });
    if (request.method === "HEAD") response.end();
    else fs.createReadStream(file, {start, end}).pipe(response);
    return;
  }

  response.writeHead(200, {...headers, "content-length": stat.size});
  if (request.method === "HEAD") response.end();
  else fs.createReadStream(file).pipe(response);
}).listen(port, host, () => {
  process.stdout.write(`Via Roma preview ready on ${host}:${port}\n`);
});
