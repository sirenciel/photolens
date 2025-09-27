import { createServer } from 'http';
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, 'data', 'db.json');
const PORT = Number(process.env.PORT || 4000);

async function readState() {
  const file = await readFile(DATA_PATH, 'utf-8');
  return JSON.parse(file);
}

async function writeState(state) {
  await writeFile(DATA_PATH, JSON.stringify(state, null, 2));
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body, 'utf-8'),
  });
  res.end(body);
}

const server = createServer(async (req, res) => {
  try {
    setCorsHeaders(res);

    if (!req.url) {
      sendJson(res, 400, { message: 'Invalid request' });
      return;
    }

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const requestUrl = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'GET' && requestUrl.pathname === '/api/state') {
      const state = await readState();
      sendJson(res, 200, state);
      return;
    }

    if (req.method === 'PUT' && requestUrl.pathname === '/api/state') {
      let raw = '';
      for await (const chunk of req) {
        raw += chunk;
      }

      if (!raw) {
        sendJson(res, 400, { message: 'Request body is required' });
        return;
      }

      let payload;
      try {
        payload = JSON.parse(raw);
      } catch (error) {
        sendJson(res, 400, { message: 'Invalid JSON body' });
        return;
      }

      await writeState(payload);
      sendJson(res, 200, { message: 'State saved' });
      return;
    }

    sendJson(res, 404, { message: 'Not Found' });
  } catch (error) {
    console.error('Server error:', error);
    sendJson(res, 500, { message: 'Internal Server Error' });
  }
});

server.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
