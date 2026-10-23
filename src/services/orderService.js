
import { auth } from './firebase'

const API_BASE_URL = 'https://ottokonek-secure-api.onrender.com'

export async function getOrders() {
  // Wait for Firebase to restore the existing login session.
  await auth.authStateReady()

  const user = auth.currentUser
  if (!user) {
    throw new Error('Please sign in with Google to view orders.')
  }

  const token = await user.getIdToken()

  let response
  try {
    response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
  } catch {
    throw new Error('Unable to reach the secure orders backend.')
  }

  if (response.status === 401) {
    throw new Error('Your login could not be verified. Please sign in again.')
  }

  if (response.status === 403) {
    throw new Error('Your Google account is not authorized to view orders.')
  }

  if (!response.ok) {
    throw new Error(`Could not load orders (HTTP ${response.status}).`)
  }

  const data = await response.json()

  if (!Array.isArray(data.orders)) {
    throw new Error('The backend returned an unexpected response.')
  }

  return {
    orders: data.orders,
    connected: true,
  }
}

export function getConfirmationLaunchPath(orderId) {
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(String(orderId))) {
    throw new Error('Invalid order ID.')
  }

  // Official confirmation links are not configured yet.
  // Never construct or guess private order confirmation URLs.
  throw new Error('Official order confirmation links are not available yet.')
}
