// Ember & Thyme — Bistro Rush: a tiny static server for local play-testing only.
// Serves game/ at http://localhost:8080 and opens it in the default browser.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';

const here = fileURLToPath(new URL('.', import.meta.url));
const root = join(here, 'game');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };

const server = createServer(async (request, response) => {
  const path = request.url.split('?')[0];
  const file = join(root, path === '/' ? 'index.html' : path);
  try {
    const data = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
    response.end(data);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
});

server.listen(8080, () => {
  console.log('Ember & Thyme — Bistro Rush at http://localhost:8080');
  exec('xdg-open http://localhost:8080 || open http://localhost:8080 || true');
});
