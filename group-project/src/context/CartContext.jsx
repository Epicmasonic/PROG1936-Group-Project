// ─────────────────────────────────────────────────────────────────────────
// CartProvider — shared cart state for the whole app
//
// The cart deliberately lives in React state, NOT in Firestore. A cart is
// temporary: the customer adds, removes, and changes quantities many times
// before committing to anything. Writing every one of those clicks to the
// database would be slow and pointless. The cart only becomes a Firestore
// document when the customer submits it on the Checkout page.
//
// This is a Context rather than plain useState in App.jsx because the Menu
// page and the Checkout page are separate routes and both need the same cart.
// ─────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { CartContext } from './cart-context'

const TAX_RATE = 0.13

export const CartProvider = ({ children }) => {
  // Items currently in the cart. Each entry is a dish object plus a `qty`.
  const [cart, setCart] = useState([])

  // When the customer chooses "Edit" on an existing order, we store that
  // order's details here. Checkout uses this to decide whether to CREATE a
  // new order or UPDATE the existing one. null = placing a brand new order.
  const [editingOrder, setEditingOrder] = useState(null)

  // Add a dish to the cart. If it's already there, bump its quantity instead
  // of adding a duplicate row.
  const addToCart = (dish) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === dish.id)

      if (existingItem) {
        // Map to a NEW array with the matching item replaced — never mutate
        // state directly, or React won't detect the change and re-render.
        return prev.map(item =>
          item.id === dish.id ? { ...item, qty: item.qty + 1 } : item
        )
      }

      return [...prev, { ...dish, qty: 1 }]
    })
  }

  // "+" button in the cart panel — increase quantity by one.
  const addCartQty = (id) => {
    setCart(prev => prev.map(item =>
      item.id === id ? { ...item, qty: item.qty + 1 } : item
    ))
  }

  // "−" button in the cart panel. flatMap lets one function handle both cases:
  // returning [item] keeps the row, returning [] removes it entirely once the
  // quantity would drop to zero.
  const removeFromCart = (id) => {
    setCart(prev => prev.flatMap(item => {
      if (item.id !== id) return [item]
      if (item.qty > 1) return [{ ...item, qty: item.qty - 1 }]
      return []
    }))
  }

  // Empty the cart and leave edit mode — called after a successful checkout
  // and when the customer abandons an edit.
  const clearCart = () => {
    setCart([])
    setEditingOrder(null)
  }

  // Load an existing order's items back into the cart so the customer can
  // adjust them. Copying each item ({ ...item }) keeps the cart's objects
  // separate from the ones held in the Orders page state.
  const beginEditOrder = (order) => {
    setCart(order.items.map(item => ({ ...item })))
    setEditingOrder({ id: order.id, customerName: order.customerName, notes: order.notes || '' })
  }

  // Totals are derived from the cart on every render rather than stored in
  // their own state — that way they can never fall out of sync with the cart.
  // reduce() collapses the array of items down to a single number.
  const subtotal = cart.reduce((sum, item) => sum + item.qty * item.price, 0)
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax

  return (
    <CartContext.Provider value={{
      cart, addToCart, addCartQty, removeFromCart, clearCart,
      editingOrder, beginEditOrder,
      subtotal, tax, total,
    }}>
      {children}
    </CartContext.Provider>
  )
}
