import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
const root = resolve(process.argv[2] || '.');
const port = Number(process.env.PORT || 4173);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.mp4':'video/mp4','.woff2':'font/woff2'};
createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
    let file = normalize(join(root, pathname === '/' ? 'index.html' : pathname));
    if (!file.startsWith(root)) throw new Error('bad path');
    try { if ((await stat(file)).isDirectory()) file = join(file,'index.html'); } catch { if (extname(pathname)) throw new Error('missing asset'); file = join(root,'index.html'); }
    const info = await stat(file);
    const type = types[extname(file).toLowerCase()] || 'application/octet-stream';
    const cache = extname(file).toLowerCase()==='.mp4' ? 'public,max-age=31536000,immutable' : 'no-cache';
    const range = req.headers.range;
    if (range && extname(file).toLowerCase()==='.mp4') {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match) { res.writeHead(416, {'content-range': `bytes */${info.size}`}); return res.end(); }
      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Math.min(Number(match[2]), info.size - 1) : info.size - 1;
      if (start > end || start >= info.size) { res.writeHead(416, {'content-range': `bytes */${info.size}`}); return res.end(); }
      const body = (await readFile(file)).subarray(start, end + 1);
      res.writeHead(206, {'content-type':type,'content-length':body.length,'content-range':`bytes ${start}-${end}/${info.size}`,'accept-ranges':'bytes','cache-control':cache});
      return res.end(body);
    }
    const body = await readFile(file);
    res.writeHead(200, {'content-type': type, 'content-length':body.length, 'accept-ranges': extname(file).toLowerCase()==='.mp4' ? 'bytes' : 'none', 'cache-control': cache});
    res.end(body);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`http://127.0.0.1:${port}`));
