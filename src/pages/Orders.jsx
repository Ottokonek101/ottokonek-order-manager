
import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  Inbox,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import {
  getOrders,
  getConfirmationLaunchPath,
} from '../services/orderService'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [connected, setConnected] = useState(false)

  async function load() {
    setLoading(true)
    setError('')

    try {
      const result = await getOrders()
      setOrders(result.orders)
      setConnected(result.connected)
    } catch (err) {
      setOrders([])
      setConnected(false)
      setError(err.message || 'Unable to load orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openConfirmation(order) {
    if (busy || !order.canConfirm) return

    try {
      setBusy(true)
      const path = getConfirmationLaunchPath(order.id)
      const tab = window.open(path, '_blank', 'noopener,noreferrer')

      if (!tab) {
        setError('Your browser blocked the new tab. Allow pop-ups for this site.')
      }
    } catch (err) {
      setError(err.message || 'Unable to open confirmation page.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="page-kicker">ORDER MANAGEMENT</span>
          <h1>All orders</h1>
          <p>Review incoming orders and open their official confirmation pages.</p>
        </div>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>Order list</h3>
            <p>Opening a confirmation page does not accept the order automatically.</p>
          </div>

          <button
            className="text-button"
            type="button"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {error && (
          <p
            role="alert"
            style={{
              padding: '0 26px',
              color: '#a33d2b',
              fontSize: 13,
            }}
          >
            {error}
          </p>
        )}

        {loading ? (
          <div className="empty">
            <LoaderCircle size={26} />
            <p>Loading orders…</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ORDER ID</th>
                  <th>CUSTOMER</th>
                  <th>RECEIVED</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.orderNumber || order.id}</td>
                    <td>{order.customer || '—'}</td>
                    <td>{order.receivedAt || '—'}</td>
                    <td>{order.amount ?? '—'}</td>
                    <td>{order.status || 'Unverified'}</td>
                    <td>
                      {order.status === 'Confirmed' ? (
                        <span
                          style={{
                            color: '#287f20',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                          }}
                        >
                          <ShieldCheck size={15} />
                          Confirmed
                        </span>
                      ) : (
                        <button
                          className="text-button"
                          type="button"
                          onClick={() => openConfirmation(order)}
                          disabled={busy || !order.canConfirm}
                          title={
                            order.canConfirm
                              ? 'Open official confirmation page'
                              : 'Official confirmation link not configured'
                          }
                        >
                          Accept Order
                          <ArrowUpRight size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">
            <span className="empty-icon">
              <Inbox size={26} />
            </span>

            <strong>
              {connected
                ? 'No orders available'
                : 'Orders backend not connected'}
            </strong>

            <p>
              {connected
                ? 'The secure backend is connected, but no orders are available in the database yet.'
                : 'Unable to retrieve orders from the secure backend. Check the connection and try refreshing.'}
            </p>
          </div>
        )}
      </section>
    </>
  )
}
