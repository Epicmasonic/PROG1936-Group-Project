import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import './App.css'

const App = () => {
  return (
    <BrowserRouter>
      <CartProvider>
        <Navbar />
        <Routes>
          <Route path="/"         element={<Home />} />
          <Route path="/menu"     element={<Menu />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders"   element={<Orders />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}

export default App
