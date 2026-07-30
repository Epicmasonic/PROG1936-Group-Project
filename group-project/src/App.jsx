import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Menu from './pages/Menu'
import './App.css'

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"     element={<Home />} />
        <Route path="/menu" element={<Menu />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
