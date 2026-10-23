OTTOKONEK PRIVATE API - LOCAL DEVELOPMENT
========================================
This backend verifies Firebase ID tokens and the authorized Firebase UID before reading your PRIVATE Google Sheets Orders tab. It is localhost-only.

1) In Google Cloud Console select project ottokonek-order-manager-a7295.
   Enable Google Sheets API (APIs & Services > Library).
2) Create a service account (IAM & Admin > Service Accounts) in that project.
   Download a JSON key ONLY if company policy permits it. Store it as:
   backend/service-account.json
   Do NOT upload this file to GitHub or share it in chat.
3) In Google Sheets, Share the order spreadsheet with the service account's client_email as Viewer.
4) In backend folder copy .env.example to .env (Windows CMD: copy .env.example .env).
   The Firebase UID and spreadsheet ID are already filled in. Never put .env in GitHub.
5) In CMD: cd backend && npm install && npm run dev
6) Health check: http://127.0.0.1:3001/api/health
7) For Vite development, add this to existing vite.config.js defineConfig options:
     server: { proxy: { '/api': 'http://127.0.0.1:3001' } }
   Keep your existing plugins and other settings.
8) React MUST send Firebase ID token on each GET /api/orders:
     const token = await auth.currentUser.getIdToken();
     const response = await fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } });
     if (!response.ok) throw new Error('Could not load orders');
     const { orders } = await response.json();
   Use your existing Firebase auth instance. Don't hardcode tokens.

IMPORTANT:
- The current Orders.jsx/orderService.js may need adapting to the response {orders:[]}.
- The service account only needs Viewer access to the Sheet, NOT project Owner/Editor.
- This server is for local testing. Do NOT expose port 3001 to the internet or deploy it to GitHub Pages.
- Firebase Google Sign-In by itself does not restrict access; this API checks verified UID.
- The API intentionally does NOT provide confirmation links yet. Order status is Unverified.
- If organization policy blocks JSON key creation, STOP: use a keyless hosted backend or approved workload identity rather than bypassing the policy.
- Store credential JSON securely; the ZIP does not contain any secret credential.
