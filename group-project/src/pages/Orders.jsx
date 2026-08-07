import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase.jsx'
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore'
import { useCart } from '../context/useCart'
import './Orders.css'

const OrderCard = ({ order, onEdit, onCancel }) => {
  const [cancelling, setCancelling] = useState(false)

  const handleCancelOrder = async () => {
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
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrders() {
      const snapshot = await getDocs(collection(db, 'orders'))
      const items = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
      setOrders(items)
      setLoading(false)
    }
    loadOrders()
  }, [])

  const handleEditOrder = (order) => {
    beginEditOrder(order)
    navigate('/menu')
  }

  const handleCancelOrder = async (orderId) => {
    await deleteDoc(doc(db, 'orders', orderId))
    setOrders(prev => prev.filter(o => o.id !== orderId))
  }

  return (
    <div className="orders-page">
      <h1 className="orders-title">Orders</h1>

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
