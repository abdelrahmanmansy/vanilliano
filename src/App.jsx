import { Route, Routes } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Products from './pages/Products'
import CategoryPage from './pages/CategoryPage'
import ProductDetail from './pages/ProductDetail'
import SearchPage from './pages/SearchPage'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import Offers from './pages/Offers'
import About from './pages/About'
import Contact from './pages/Contact'
import FAQ from './pages/FAQ'
import Login from './pages/Login'
import Register from './pages/Register'
import Checkout from './pages/Checkout'
import Dashboard from './pages/Dashboard'
import AdminLogin from './pages/AdminLogin'
import NotFound from './pages/NotFound'

const CategoryRoute = () => {
  const { slug } = useParams()
  return <CategoryPage slug={slug} />
}

const ProductRoute = () => {
  const { id } = useParams()
  return <ProductDetail productId={id} />
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/category/:slug" element={<CategoryRoute />} />
        <Route path="/product/:id" element={<ProductRoute />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App