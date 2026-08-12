// ─────────────────────────────────────────────────────────────────────────
// Orders page — READ and DELETE
//
// Reads every document from the Firestore 'orders' collection and renders one
// card per order. Each card can start an edit (handled over on Checkout) or
// cancel the order outright, which deletes the document.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase.jsx'
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore'
import { useCart } from '../context/useCart'
import './Orders.css'

// Presentational child component. It receives one order plus two callbacks as
// props and owns no data of its own — the parent decides what edit and cancel
// actually do.
const OrderCard = ({ order, onEdit, onCancel }) => {
  const [cancelling, setCancelling] = useState(false)

  const handleCancelOrder = async () => {
    // Deleting is irreversible, so confirm before calling up to the parent.
    if (!window.confirm('Cancel this order? This cannot be undone.')) return
    setCancelling(true)
    await onCancel(order.id)
    setCancelling(false)
  }

  return (
    <div className="order-card">
      <div className="order-card-header">
        <div>
          <p className="order-customer">{order.customerName}</p>
          <p className="order-id">ID: {order.id}</p>
        </div>
        <span className={`order-status status-${order.status}`}>{order.status}</span>
      </div>

      {/* One row per dish in this order. The dish's own id is used as the
          key — stable and unique within the order, unlike an array index. */}
      <div className="order-items">
        {order.items.map(item => (
          <div key={item.id} className="order-item-row">
            <span className="order-item-name">{item.name}</span>
            <span className="order-item-qty">×{item.qty}</span>
            <strong>${(item.price * item.qty).toFixed(2)}</strong>
          </div>
        ))}
      </div>

      <div className="order-totals">
        <span>Total</span>
        <strong>${order.total.toFixed(2)}</strong>
      </div>

      <div className="order-card-actions">
        <button className="order-btn order-btn-ghost" type="button" onClick={() => onEdit(order)}>
          Edit
        </button>
        <button className="order-btn order-btn-danger" type="button" onClick={handleCancelOrder} disabled={cancelling}>
          {cancelling ? 'Cancelling…' : 'Cancel order'}
        </button>
      </div>
    </div>
  )
}

const Orders = () => {
  const navigate = useNavigate()
  const { beginEditOrder } = useCart()

  // Starts as an empty array so the render below can safely .map() over it
  // before the Firestore data has arrived.
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  // ── READ ────────────────────────────────────────────────────────────────
  // Fetching from Firestore is asynchronous, so it can't happen inline during
  // render. useEffect with an empty [] dependency array runs this exactly once,
  // right after the component first mounts.
  useEffect(() => {
    async function loadOrders() {
      try {
        const snapshot = await getDocs(collection(db, 'orders'))
        // Each document's ID lives outside its data, so it has to be merged in
        // manually. Without it there'd be no way to target a specific order for
        // the update and delete operations below.
        const items = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
        setOrders(items)
      } catch (err) {
        console.error('Failed to load orders:', err)
        setLoadError('Could not load your orders. Please refresh the page.')
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

  // Load this order's items into the shared cart, then send the customer to
  // the Menu so they can adjust quantities. The actual UPDATE happens later,
  // on the Checkout page, once they submit.
  const handleEditOrder = (order) => {
    beginEditOrder(order)
    navigate('/menu')
  }

  // ── DELETE ──────────────────────────────────────────────────────────────
  const handleCancelOrder = async (orderId) => {
    try {
      // Remove the document from Firestore...
      await deleteDoc(doc(db, 'orders', orderId))
      // ...then drop it from local state too, so the card disappears immediately
      // instead of waiting for a page refresh.
      setOrders(prev => prev.filter(o => o.id !== orderId))
    } catch (err) {
      console.error('Failed to cancel order:', err)
      setLoadError('Could not cancel that order. Please try again.')
    }
  }

  return (
    <div className="orders-page">
      <h1 className="orders-title">Orders</h1>

      {loadError && <p className="orders-error">{loadError}</p>}

      {/* Conditional rendering: loading -> empty -> the actual list. The
          loading state matters because the Firestore fetch takes a moment,
          and without it the page would flash "No orders yet." first. */}
      {loading ? (
        <p className="orders-loading">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="orders-empty">No orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onEdit={handleEditOrder}
              onCancel={handleCancelOrder}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders
