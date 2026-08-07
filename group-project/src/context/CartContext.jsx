import { useState } from 'react'
import { CartContext } from './cart-context'

const TAX_RATE = 0.13

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])
  const [editingOrder, setEditingOrder] = useState(null)

  const addToCart = (dish) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === dish.id)

      if (existingItem) {
        return prev.map(item =>
          item.id === dish.id ? { ...item, qty: item.qty + 1 } : item
        )
      }

      return [...prev, { ...dish, qty: 1 }]
    })
  }

  const addCartQty = (id) => {
    setCart(prev => prev.map(item =>
      item.id === id ? { ...item, qty: item.qty + 1 } : item
    ))
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.flatMap(item => {
      if (item.id !== id) return [item]
      if (item.qty > 1) return [{ ...item, qty: item.qty - 1 }]
      return []
    }))
  }

  const clearCart = () => {
    setCart([])
    setEditingOrder(null)
  }

  const beginEditOrder = (order) => {
    setCart(order.items.map(item => ({ ...item })))
    setEditingOrder({ id: order.id, customerName: order.customerName, notes: order.notes || '' })
  }

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
