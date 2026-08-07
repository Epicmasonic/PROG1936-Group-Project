import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { db } from '../firebase.jsx'
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { useCart } from '../context/useCart'
import './Checkout.css'

const Checkout = () => {
  const navigate = useNavigate()
  const { cart, subtotal, tax, total, clearCart, editingOrder } = useCart()
  const [customerName, setCustomerName] = useState(editingOrder?.customerName || '')
  const [notes, setNotes] = useState(editingOrder?.notes || '')
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')
  const [placedOrder, setPlacedOrder] = useState(null)

  const handleCancelEdit = () => {
    clearCart()
    navigate('/orders')
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (!customerName.trim() || cart.length === 0) return

    setPlacing(true)
    setError('')

    const items = cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      qty: item.qty,
    }))

    try {
      if (editingOrder) {
        await updateDoc(doc(db, 'orders', editingOrder.id), {
          customerName: customerName.trim(),
          notes: notes.trim(),
          items,
          subtotal,
          tax,
          total,
        })
        setPlacedOrder({ id: editingOrder.id, customerName: customerName.trim(), updated: true })
      } else {
        const docRef = await addDoc(collection(db, 'orders'), {
          customerName: customerName.trim(),
          notes: notes.trim(),
          items,
          subtotal,
          tax,
          total,
          status: 'pending',
          createdAt: serverTimestamp(),
        })
        setPlacedOrder({ id: docRef.id, customerName: customerName.trim(), updated: false })
      }

      clearCart()
    } catch (err) {
      console.error('Failed to save order:', err)
      setError('Could not save your order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  if (placedOrder) {
    return (
      <div className="checkout-page">
        <div className="checkout-confirm">
          <span className="checkout-confirm-icon">✅</span>
          <h1>{placedOrder.updated ? 'Order updated!' : 'Order placed!'}</h1>
          <p>Thanks, {placedOrder.customerName} — your order {placedOrder.updated ? 'has been updated' : 'is in'}.</p>

          <div className="checkout-confirm-id-box">
            <span>Order ID</span>
            <strong>{placedOrder.id}</strong>
          </div>

          <p className="checkout-confirm-hint">
            Save this ID if you'd like to look up, edit, or cancel your order later.
          </p>

          <div className="checkout-confirm-actions">
            <Link to="/menu" className="checkout-back-btn">Back to Menu</Link>
            <Link to="/orders" className="checkout-back-btn checkout-back-btn-ghost">View Orders</Link>
          </div>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <span className="checkout-empty-icon">🛒</span>
          <h1>Your cart is empty</h1>
          <p>Add some dishes from the menu before checking out.</p>
          <Link to="/menu" className="checkout-back-btn">Browse Menu</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="checkout-inner">
        <h1 className="checkout-title">Checkout</h1>

        {editingOrder && (
          <div className="checkout-editing-banner">
            <span>Editing order <strong>{editingOrder.id}</strong></span>
            <button type="button" onClick={handleCancelEdit}>Cancel edit</button>
          </div>
        )}

        <div className="checkout-grid">
          <form className="checkout-form" onSubmit={handlePlaceOrder}>
            <label className="checkout-label" htmlFor="customerName">Name</label>
            <input
              id="customerName"
              className="checkout-input"
              type="text"
              placeholder="Your name"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              required
            />

            <label className="checkout-label" htmlFor="notes">Order notes (optional)</label>
            <textarea
              id="notes"
              className="checkout-input checkout-textarea"
              placeholder="e.g. no onions, extra spicy…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />

            {error && <p className="checkout-error">{error}</p>}

            <button className="checkout-place-btn" type="submit" disabled={placing}>
              {placing
                ? 'Saving…'
                : editingOrder
                  ? `Save Changes · $${total.toFixed(2)}`
                  : `Place Order · $${total.toFixed(2)}`}
            </button>
          </form>

          <div className="checkout-summary">
            <h2 className="checkout-summary-title">Order Summary</h2>
            <div className="checkout-summary-items">
              {cart.map(item => (
                <div key={item.id} className="checkout-summary-row">
                  <span>{item.name} <em>×{item.qty}</em></span>
                  <strong>${(item.price * item.qty).toFixed(2)}</strong>
                </div>
              ))}
            </div>

            <div className="checkout-summary-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>
              <div className="summary-row">
                <span>Estimated tax</span>
                <strong>${tax.toFixed(2)}</strong>
              </div>
              <div className="summary-row total-row">
                <span>Total</span>
                <strong>${total.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
