
import 'dotenv/config';
import express from 'express';
import admin from 'firebase-admin';
import { google } from 'googleapis';

// ========================================
// ENVIRONMENT CONFIGURATION
// ========================================

const {
  FIREBASE_PROJECT_ID,
  AUTHORIZED_UID,
  SPREADSHEET_ID,
  PORT = '3001'
} = process.env;

const requiredVariables = [
  'FIREBASE_PROJECT_ID',
  'AUTHORIZED_UID',
  'SPREADSHEET_ID',
  'GOOGLE_APPLICATION_CREDENTIALS'
];

for (const key of requiredVariables) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

// ========================================
// FIREBASE ADMIN INITIALIZATION
// ========================================

// Credentials are stored privately on Render.
// Never expose service-account credentials in frontend code.

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: FIREBASE_PROJECT_ID
});

// ========================================
// GOOGLE SHEETS INITIALIZATION
// ========================================

const googleAuth = new google.auth.GoogleAuth({
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets.readonly'
  ]
});

const sheets = google.sheets({
  version: 'v4',
  auth: googleAuth
});

// ========================================
// EXPRESS APPLICATION
// ========================================

const app = express();

app.disable('x-powered-by');

app.use(express.json({
  limit: '20kb'
}));

// Prevent sensitive responses from being cached.
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// ========================================
// CORS CONFIGURATION
// ========================================

const allowedOrigin = 'https://ottokonek101.github.io';

app.use((req, res, next) => {
  res.setHeader(
    'Access-Control-Allow-Origin',
    allowedOrigin
  );

  res.setHeader('Vary', 'Origin');

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, OPTIONS'
  );

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Authorization, Content-Type'
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// ========================================
// FIREBASE AUTHENTICATION MIDDLEWARE
// ========================================

async function requireOwner(req, res, next) {
  const header = req.get('authorization') || '';
  const match = /^Bearer (\S+)$/.exec(header);

  if (!match) {
    console.warn(
      '[AUTH] Authentication failed: Missing Bearer token'
    );

    return res.status(401).json({
      error: 'Sign in required'
    });
  }

  try {
    // Verify the Firebase ID token and check revocation.
    const decoded = await admin.auth().verifyIdToken(
      match[1],
      true
    );

    // Only the authorized administrator may access orders.
    if (decoded.uid !== AUTHORIZED_UID) {
      console.warn(
        '[AUTH] Access denied: UID does not match authorized user'
      );

      return res.status(403).json({
        error: 'Access denied'
      });
    }

    req.ownerUid = decoded.uid;

    return next();

  } catch (error) {
    // Log the error category without exposing tokens or credentials.
    console.error('[AUTH] Firebase verification failed:', {
      code: error.code || 'unknown'
    });

    return res.status(401).json({
      error: 'Invalid or expired login'
    });
  }
}

// ========================================
// HEALTH CHECK ENDPOINT
// ========================================

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true
  });
});

// ========================================
// GET ORDERS FROM GOOGLE SHEETS
// ========================================

app.get('/api/orders', requireOwner, async (_req, res) => {
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "'Orders'!A:E"
    });

    const [headers = [], ...rows] = result.data.values || [];

    const expectedHeaders = [
      'Order Number',
      'Customer',
      'Received At',
      'Status',
      'Last Synced'
    ];

    const validHeaders = expectedHeaders.every(
      (name, index) => headers[index] === name
    );

    if (!validHeaders) {
      console.error(
        '[SHEETS] Unexpected Orders sheet columns'
      );

      return res.status(500).json({
        error: 'Unexpected Orders sheet columns'
      });
    }

    const orders = rows
      .filter(row => row[0])
      .map(row => ({
        id: String(row[0]),
        orderNumber: String(row[0]),
        customer: row[1] || '',
        receivedAt: row[2] || '',
        status: row[3] || 'Unverified',
        lastSynced: row[4] || '',
        canConfirm: false
      }));

    return res.json({
      orders,
      count: orders.length
    });

  } catch (error) {
    console.error('[SHEETS] Read failed:', {
      code: error.code || 'unknown',
      status: error.response?.status || null
    });

    return res.status(502).json({
      error: 'Unable to read private order database'
    });
  }
});

// ========================================
// ORDER CONFIRMATION LINK
// ========================================

// Official confirmation links are not configured yet.
// Never guess or expose private confirmation URLs.

app.get(
  '/api/orders/:id/confirm-link',
  requireOwner,
  (_req, res) => {
    return res.status(501).json({
      error: 'Official confirmation links are not configured yet'
    });
  }
);

// ========================================
// START SERVER
// ========================================

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(
    `[SERVER] Ottokonek Secure API listening on port ${PORT}`
  );
});
