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
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
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

async function parseJsonRequest(req, res) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
  }

  if (!raw) {
    sendJson(res, 400, { message: 'Request body is required' });
    return undefined;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    sendJson(res, 400, { message: 'Invalid JSON body' });
    return undefined;
  }
}

function generateClientId(clients) {
  const highestNumericId = clients.reduce((max, client) => {
    const match = /^C(\d+)$/.exec(client.id);
    if (!match) {
      return max;
    }
    const value = Number(match[1]);
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, 0);

  const nextId = highestNumericId + 1;
  return `C${String(nextId).padStart(3, '0')}`;
}

function recomputeClientMetrics(state, client) {
  const totalBookings = state.bookings.filter(booking => booking.clientId === client.id).length;
  const totalSpent = state.invoices
    .filter(invoice => invoice.clientId === client.id)
    .reduce((sum, invoice) => sum + Number(invoice.amountPaid ?? 0), 0);

  return {
    ...client,
    totalBookings,
    totalSpent,
  };
}

function recomputeAllClientMetrics(state) {
  state.clients = state.clients.map(client => recomputeClientMetrics(state, client));
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
      const payload = await parseJsonRequest(req, res);
      if (payload === undefined) {
        return;
      }

      await writeState(payload);
      sendJson(res, 200, { message: 'State saved' });
      return;
    }

    if (req.method === 'GET' && requestUrl.pathname === '/api/clients') {
      const state = await readState();
      sendJson(res, 200, state.clients);
      return;
    }

    if (req.method === 'POST' && requestUrl.pathname === '/api/clients') {
      const payload = await parseJsonRequest(req, res);
      if (payload === undefined) {
        return;
      }

      const name = typeof payload.name === 'string' ? payload.name.trim() : '';
      const email = typeof payload.email === 'string' ? payload.email.trim() : '';
      if (!name || !email) {
        sendJson(res, 400, { message: 'Name and email are required' });
        return;
      }

      const state = await readState();
      const id = generateClientId(state.clients);
      const now = new Date().toISOString();
      const phone = typeof payload.phone === 'string' ? payload.phone : '';
      const avatarUrl = typeof payload.avatarUrl === 'string' && payload.avatarUrl.trim() !== ''
        ? payload.avatarUrl
        : `https://picsum.photos/seed/${id.toLowerCase()}/100/100`;

      const newClient = {
        id,
        name,
        email,
        phone,
        avatarUrl,
        joinDate: now,
        totalBookings: 0,
        totalSpent: 0,
      };

      if (typeof payload.notes === 'string') {
        newClient.notes = payload.notes;
      }

      if (payload.financialStatus) {
        newClient.financialStatus = payload.financialStatus;
      }

      state.clients.unshift(newClient);
      await writeState(state);
      sendJson(res, 201, newClient);
      return;
    }

    const clientIdMatch = requestUrl.pathname.match(/^\/api\/clients\/([^/]+)$/);

    if (req.method === 'PUT' && clientIdMatch) {
      const clientId = clientIdMatch[1];
      const payload = await parseJsonRequest(req, res);
      if (payload === undefined) {
        return;
      }

      const state = await readState();
      const clientIndex = state.clients.findIndex(client => client.id === clientId);
      if (clientIndex === -1) {
        sendJson(res, 404, { message: 'Client not found' });
        return;
      }

      const existing = state.clients[clientIndex];

      const name = typeof payload.name === 'string' && payload.name.trim()
        ? payload.name.trim()
        : existing.name;
      const email = typeof payload.email === 'string' && payload.email.trim()
        ? payload.email.trim()
        : existing.email;

      const updatedClient = {
        ...existing,
        name,
        email,
        phone: typeof payload.phone === 'string' ? payload.phone : existing.phone,
        avatarUrl: typeof payload.avatarUrl === 'string'
          ? payload.avatarUrl.trim() === ''
            ? ''
            : payload.avatarUrl
          : existing.avatarUrl,
      };

      if (payload.notes !== undefined) {
        updatedClient.notes = payload.notes;
      }

      if (payload.financialStatus !== undefined) {
        updatedClient.financialStatus = payload.financialStatus;
      }

      const normalisedClient = recomputeClientMetrics(state, updatedClient);
      state.clients[clientIndex] = normalisedClient;

      await writeState(state);
      sendJson(res, 200, normalisedClient);
      return;
    }

    if (req.method === 'DELETE' && clientIdMatch) {
      const clientId = clientIdMatch[1];
      const state = await readState();
      const hasClient = state.clients.some(client => client.id === clientId);
      if (!hasClient) {
        sendJson(res, 404, { message: 'Client not found' });
        return;
      }

      const bookingIdsToRemove = state.bookings
        .filter(booking => booking.clientId === clientId)
        .map(booking => booking.id);
      const bookingIdSet = new Set(bookingIdsToRemove);

      state.clients = state.clients.filter(client => client.id !== clientId);
      state.bookings = state.bookings.filter(booking => booking.clientId !== clientId);
      state.invoices = state.invoices.filter(invoice => invoice.clientId !== clientId);
      state.editingJobs = state.editingJobs
        .filter(job => job.clientId !== clientId && !bookingIdSet.has(job.bookingId));

      recomputeAllClientMetrics(state);

      await writeState(state);
      sendJson(res, 200, state);
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
