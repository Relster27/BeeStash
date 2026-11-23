import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom'
import '@fontsource/plus-jakarta-sans/latin-400.css'
import '@fontsource/plus-jakarta-sans/latin-500.css'
import '@fontsource/plus-jakarta-sans/latin-600.css'
import '@fontsource/plus-jakarta-sans/latin-700.css'
import '@fontsource/plus-jakarta-sans/latin-800.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import './styles.css'
import MarketplaceProvider from './MarketplaceProvider'
import { Catalog, Home, Missing, ProductDetail } from './pages/Marketplace'
import { Confirmation, Login, Register, Verification } from './pages/Auth'
import { ListingEditor, Profile } from './pages/Account'
import { Cart, Checkout } from './pages/Checkout'
import { Chat } from './pages/Chat'
import { useMarketplace } from './state'

function ScrollToRoute() {
  const { hash, pathname } = useLocation()
  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1))
      if (target) target.scrollIntoView()
    } else {
      window.scrollTo(0, 0)
    }
  }, [hash, pathname])
  return null
}

function RequireAccount() {
  const { signedIn } = useMarketplace()
  const location = useLocation()
  return signedIn ? <Outlet /> : <Navigate to="/masuk" replace state={{ returnTo: location.pathname + location.search + location.hash }} />
}

function RoutedProduct() {
  const { id } = useParams()
  return <ProductDetail key={id} />
}

function App() {
  return (
    <MarketplaceProvider>
      <ScrollToRoute />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/barang" element={<Catalog />} />
        <Route path="/barang/:id" element={<RoutedProduct />} />
        <Route path="/masuk" element={<Login />} />
        <Route path="/masuk/verifikasi" element={<Verification />} />
        <Route path="/daftar" element={<Register />} />
        <Route path="/daftar/verifikasi" element={<Verification register />} />
        <Route element={<RequireAccount />}>
          <Route path="/jualan" element={<ListingEditor />} />
          <Route path="/jualan/:id/edit" element={<ListingEditor />} />
          <Route path="/jualan/berhasil" element={<Confirmation kind="listing" />} />
          <Route path="/jualan/edit/berhasil" element={<Confirmation kind="edit" />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="/keranjang" element={<Cart />} />
          <Route path="/pembayaran" element={<Checkout />} />
          <Route path="/pembayaran/berhasil" element={<Confirmation kind="order" />} />
          <Route path="/pesan" element={<Chat />} />
        </Route>
        <Route path="*" element={<Missing />} />
      </Routes>
    </MarketplaceProvider>
  )
}

createRoot(document.getElementById('root')!).render(<StrictMode><BrowserRouter><App /></BrowserRouter></StrictMode>)
