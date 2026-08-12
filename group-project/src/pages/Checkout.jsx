// ─────────────────────────────────────────────────────────────────────────
// Checkout page — CREATE and UPDATE
//
// This single page handles both cases:
//   • No order being edited  -> addDoc()    creates a new order  (CREATE)
//   • An order being edited  -> updateDoc() overwrites it        (UPDATE)
//
// Which path runs is decided by `editingOrder` from the cart context, which
// the Orders page sets when the customer clicks "Edit" on an existing order.
// ─────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { db } from '../firebase.jsx'
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { useCart } from '../context/useCart'
import './Checkout.css'

const Checkout = () => {
  const navigate = useNavigate()

  // Cart contents and the derived totals come from the shared cart context,
  // so this page always matches whatever was built up on the Menu page.
  const { cart, subtotal, tax, total, clearCart, editingOrder } = useCart()
  // Controlled form fields. When editing an existing order, they start
  // pre-filled with that order's saved values instead of empty.
  const [customerName, setCustomerName] = useState(editingOrder?.customerName || '')
  const [notes, setNotes] = useState(editingOrder?.notes || '')

  // UI state around the Firestore write:
  //   placing     -> disables the button so the order can't be submitted twice
  //   error       -> message shown if the write fails
  //   placedOrder -> once set, the page swaps to the confirmation screen
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')
  const [placedOrder, setPlacedOrder] = useState(null)

  // Abandon an in-progress edit: empty the cart, drop edit mode, go back.
  const handleCancelEdit = () => {
    clearCart()
    navigate('/orders')
  }

  const handlePlaceOrder = async (e) => {
    // Stop the browser's default form submit, which would reload the page and
    // wipe all React state.
    e.preventDefault()

    // Form validation: a name is required (and whitespace-only doesn't count),
    // and there has to be something in the cart to order.
    if (!customerName.trim() || cart.length === 0) return

    setPlacing(true)
    setError('')

    // Store a trimmed-down copy of each cart item rather than the whole dish
    // object. The order only needs what appeared on the receipt — saving the
    // full record (ingredients, allergens, image URL...) would bloat every
    // order document with data that already lives in menuItems.
    const items = cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      qty: item.qty,
    }))

    try {
      if (editingOrder) {
        // ── UPDATE ──────────────────────────────────────────────────────
        // doc(db, 'orders', id) points at one specific existing document.
        // updateDoc only overwrites the fields listed here, so `status` and
        // `createdAt` survive the edit untouched.
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
        // ── CREATE ──────────────────────────────────────────────────────
        // addDoc appends a new document to the 'orders' collection and lets
        // Firestore generate a unique ID for it. That generated ID is what we
        // show the customer as their Order ID — no ID logic of our own needed.
        // serverTimestamp() records the time from Firebase's servers rather
        // than the user's device clock, so timestamps stay consistent.
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

      // Order is safely saved, so empty the cart and leave edit mode.
      clearCart()
    } catch (err) {
      // Network failure, permission error, etc. — tell the customer rather
      // than silently doing nothing.
      console.error('Failed to save order:', err)
      setError('Could not save your order. Please try again.')
    } finally {
      // Runs whether the write succeeded or failed, so the button never stays
      // stuck on "Saving…".
      setPlacing(false)
    }
  }

  // ── Conditional rendering: three possible screens ──────────────────────
  // 1. Order was just saved -> confirmation with the Order ID
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

  // 2. Nothing in the cart -> nudge them back to the menu
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

  // 3. Normal case -> the checkout form plus an order summary
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
