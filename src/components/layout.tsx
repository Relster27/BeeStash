import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Instagram, ListFilter, Package } from 'lucide-react'
import { figma } from '../data'
import { useMarketplace } from '../state'
import { Modal } from './ui'

export function Brand({ to = '/', className = '' }: { to?: string; className?: string }) {
  return <Link to={to} className={`brand ${className}`} aria-label="BeeStash"><span>Bee</span>Stash</Link>
}

export function DesignIcon({ file, frame = '104-9', size = 18 }: { file: string; frame?: string; size?: number }) {
  return <img src={figma(frame, file)} width={size} height={size} className="design-icon" alt="" aria-hidden="true" />
}

export function SearchBar({ initial = '', placeholder = 'Cari barang di BeeStash', onSearch, onFilter }: { initial?: string; placeholder?: string; onSearch: (query: string) => void; onFilter?: () => void }) {
  return (
    <form role="search" className="search-bar" onSubmit={event => {
      event.preventDefault()
      onSearch(String(new FormData(event.currentTarget).get('search') ?? '').trim())
    }}>
      <button className="icon-button" type="submit" aria-label="Cari"><DesignIcon file="Search.svg" size={17} /></button>
      <input type="search" name="search" aria-label={placeholder} placeholder={placeholder} defaultValue={initial} />
      {onFilter && <button className="icon-button" type="button" onClick={onFilter} aria-label="Filter"><ListFilter size={18} /></button>}
    </form>
  )
}

export function catalogUrl(category?: string, search?: string) {
  const params = new URLSearchParams()
  if (category) params.set('kategori', category)
  if (search) params.set('q', search)
  return params.size ? `/barang?${params}` : '/barang'
}

export function MarketplaceHeader({ variant = 'home', search = '' }: { variant?: 'home' | 'catalog' | 'detail' | 'chat' | 'profile'; search?: string }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { signedIn } = useMarketplace()
  const cartLink = <NavLink to="/keranjang"><DesignIcon file="Buy.svg" />Keranjang</NavLink>
  const account = <NavLink to={signedIn ? '/profil' : '/masuk'}><DesignIcon file="Draft24ActionUser.svg" />{signedIn ? 'Profil' : 'Masuk / Daftar'}</NavLink>
  const sell = <NavLink to="/jualan"><Package size={18} />Jualan</NavLink>
  return (
    <header className={`market-header market-${variant}`}>
      <div className="market-wrap market-main">
        <Brand />
        <SearchBar key={search} initial={search} onSearch={query => {
          const target = `${catalogUrl(undefined, query)}#hasil`
          if (target === location.pathname + location.search + location.hash) document.getElementById('hasil')?.scrollIntoView()
          else navigate(target)
        }} onFilter={() => {
          if (location.pathname === '/barang' && location.hash === '#filter') document.getElementById('filter')?.scrollIntoView()
          else navigate(`/barang${location.pathname === '/barang' ? location.search : ''}#filter`)
        }} />
        <nav className="market-actions" aria-label="Navigasi utama">
          {(signedIn || variant === 'catalog') && sell}{cartLink}{account}
        </nav>
      </div>
    </header>
  )
}

export function TransactionHeader({ title, children }: { title: string; children?: ReactNode }) {
  return <header className="transaction-header"><div className="transaction-title"><Brand to="/barang" /><h1>{title}</h1></div>{children}</header>
}

const services = {
  'About Us': 'BeeStash membantu mahasiswa Binus menemukan dan menjual barang preloved di sekitar kampus.',
  'Terms & Conditions': 'Gunakan deskripsi yang sesuai dengan kondisi barang dan sepakati cara serah terima dengan penjual. Ketentuan resmi belum tersedia di prototipe ini.',
  FAQ: 'Kamu bisa menjelajahi katalog sebagai tamu. Masuk untuk menyimpan favorit, menjual barang, atau mencoba checkout.',
  'Privacy Policy': 'Akun dan aktivitas demo disimpan di browser ini. Kebijakan privasi resmi belum tersedia.',
  'E-waste Policy': 'Untuk barang elektronik rusak, gunakan fasilitas pengumpulan limbah elektronik setempat. BeeStash belum menyediakan layanan pengumpulan.',
  'Cancellation & Return Policy': 'Pembatalan dan pengembalian belum tersedia di prototipe ini. Hubungi penjual untuk mendiskusikan kondisi barang sebelum menyepakati transaksi.',
}

export function Footer({ compact = false }: { compact?: boolean }) {
  const [service, showService] = useState<keyof typeof services | 'Download App'>()
  return (
    <footer className={compact ? 'site-footer compact-footer' : 'site-footer'}>
      <div className={compact ? 'footer-compact-inner' : 'market-wrap'}>
        <div className="footer-columns">
          <div>
            <Brand />
            <h2>Contact Us</h2>
            <a href="https://wa.me/622029182132"><DesignIcon file="AntDesignWhatsAppOutlined.svg" /> <span>WhatsApp<br />+62 202-918-2132</span></a>
            <a href="https://www.instagram.com/bee__stash/"><Instagram className="design-icon" size={18} aria-hidden="true" /> <span>Instagram<br />@bee__stash</span></a>
          </div>
          <div className="footer-services">
            <h2>Customer Services</h2>
            <ul>{(Object.keys(services) as (keyof typeof services)[]).slice(0, compact ? 2 : undefined).map(label => <li key={label}><button type="button" onClick={() => showService(label)}>{label}</button></li>)}</ul>
          </div>
          {!compact && <div className="footer-downloads">
            <h2>Download App</h2>
            <div className="store-badges">
              <button type="button" onClick={() => showService('Download App')}><img src={figma('104-9', 'Image11.png')} alt="Download on the App Store" /></button>
              <button type="button" onClick={() => showService('Download App')}><img src={figma('104-9', 'Image10.png')} alt="Get it on Google Play" /></button>
            </div>
          </div>}
        </div>
        {!compact && <p className="copyright">© 2026 All rights reserved. BeeStash.</p>}
      </div>
      {service && <Modal title={service} onClose={() => showService(undefined)}><p>{service === 'Download App' ? 'Aplikasi BeeStash belum tersedia di App Store atau Google Play. Kamu bisa menggunakan versi web ini.' : services[service]}</p></Modal>}
    </footer>
  )
}

export function submitForm<T>(callback: (form: FormData) => T) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    return callback(new FormData(event.currentTarget))
  }
}
