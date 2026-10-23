// Order data is available only after a protected backend is configured.
// Never store order-action tokens in frontend code or public data.
export async function getOrders() {
  let response
  try {
    response = await fetch('/api/orders', {
      credentials: 'include', cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
  } catch {
    throw new Error('Unable to reach the orders backend.')
  }

  const contentType = response.headers.get('content-type') || ''
  // Vite's SPA fallback returns index.html for missing /api routes.
  if (!contentType.toLowerCase().includes('application/json')) {
    return { orders: [], connected: false }
  }
  if (response.status === 401 || response.status === 403) {
    throw new Error('Sign in to your secure orders backend to view orders.')
  }
  if (!response.ok) throw new Error(`Could not load orders (HTTP ${response.status}).`)

  let data
  try { data = await response.json() }
  catch { throw new Error('The orders backend returned invalid JSON.') }
  if (!Array.isArray(data)) throw new Error('The orders backend returned an unexpected response.')
  return { orders: data, connected: true }
}

export function getConfirmationLaunchPath(orderId) {
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(String(orderId))) throw new Error('Invalid order ID.')
  return `/api/orders/${encodeURIComponent(orderId)}/confirm-link`
}
