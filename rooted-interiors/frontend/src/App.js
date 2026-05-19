import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <CartProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={
                <div style={{ textAlign: 'center', padding: '100px 24px' }}>
                  <p style={{ fontSize: '4rem' }}>🌿</p>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: '#5C4033', marginTop: 16 }}>
                    Page Not Found
                  </h2>
                  <a href="/" style={{ display: 'inline-block', marginTop: 24, color: '#5C4033', fontWeight: 600 }}>
                    ← Go Home
                  </a>
                </div>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#FEFCF8',
              color: '#2C1810',
              border: '1px solid #E8DDD3',
              fontFamily: "'Jost', sans-serif",
              fontSize: '0.9rem',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(92,64,51,0.15)',
            },
          }}
        />
      </Router>
    </CartProvider>
  );
}

export default App;
