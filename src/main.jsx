import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { ProductsProvider } from './context/ProductsContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            <WishlistProvider>
              <App />
            </WishlistProvider>
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </BrowserRouter>
    <Toaster
      position="top-left"
      toastOptions={{
        style: {
          direction: 'rtl',
          fontFamily: 'Cairo, sans-serif',
          fontWeight: 700,
          background: '#2b0a26',
          color: '#fdefd4',
          borderRadius: '1rem',
        },
      }}
    />
  </StrictMode>,
)