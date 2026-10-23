import 'dotenv/config';
import express from 'express';
import admin from 'firebase-admin';
import { google } from 'googleapis';

const { FIREBASE_PROJECT_ID, AUTHORIZED_UID, SPREADSHEET_ID, PORT = '3001' } = process.env;
for (const key of ['FIREBASE_PROJECT_ID', 'AUTHORIZED_UID', 'SPREADSHEET_ID', 'GOOGLE_APPLICATION_CREDENTIALS']) {
  if (!process.env[key]) throw new Error(`Missing ${key} in backend/.env`);
}

// Uses a server-only Google service-account credential. NEVER expose it to Vite/GitHub.
admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: FIREBASE_PROJECT_ID });
const auth = new google.auth.GoogleAuth({ scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
const sheets = google.sheets({ version: 'v4', auth });
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

app.use((req, res, next) => {
  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://ottokonek101.github.io'
  );
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

async function requireOwner(req, res, next) {
  const header = req.get('authorization') || '';
  const match = /^Bearer (\S+)$/.exec(header);
  if (!match) return res.status(401).json({ error: 'Sign in required' });
  try {
    const decoded = await admin.auth().verifyIdToken(match[1], true);
    if (decoded.uid !== AUTHORIZED_UID) return res.status(403).json({ error: 'Access denied' });
    req.ownerUid = decoded.uid;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired login' });
  }
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/orders', requireOwner, async (_req, res) => {
  try {
    const result = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "'Orders'!A:E" });
    const [headers = [], ...rows] = result.data.values || [];
    const expected = ['Order Number', 'Customer', 'Received At', 'Status', 'Last Synced'];
    if (!expected.every((name, i) => headers[i] === name)) {
      return res.status(500).json({ error: 'Unexpected Orders sheet columns' });
    }
    const orders = rows.filter(row => row[0]).map(row => ({
      id: String(row[0]),
      orderNumber: String(row[0]),
      customer: row[1] || '',
      receivedAt: row[2] || '',
      status: row[3] || 'Unverified',
      lastSynced: row[4] || '',
      canConfirm: false
    }));
    res.json({ orders, count: orders.length });
  } catch (error) {
    console.error('Sheets read failed:', error.code || error.message);
    res.status(502).json({ error: 'Unable to read private order database' });
  }
});

// No confirmation-link endpoint yet: private action URLs must be stored securely
// and opened only after authenticated lookup. Never guess confirmation URLs.
app.get('/api/orders/:id/confirm-link', requireOwner, (_req, res) => {
  res.status(501).json({ error: 'Official confirmation links are not configured yet' });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Ottokonek private API listening on http://0.0.0.0:${PORT}`);
});
