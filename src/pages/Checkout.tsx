import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight, Minus, Plus, ShoppingCart } from 'lucide-react'
import { catalog, deliveryOptions, initialCart, money, serviceFee } from '../data'
import type { CartItem } from '../data'
import { useMarketplace } from '../state'
import { SearchBar, TransactionHeader, submitForm } from '../components/layout'
import { ActionLink, Button, Field, Modal, ProductImage, TextArea } from '../components/ui'

const subtotal = (items: CartItem[]) => items.reduce((total, item) => total + item.price * item.quantity, 0)
const totalItems = (items: CartItem[]) => items.reduce((total, item) => total + item.quantity, 0)

function useCartReview() {
  const { cart, listings, ownsListing } = useMarketplace()
  const products = [...catalog, ...listings]
  return cart.map(item => {
    const product = products.find(candidate => candidate.id === item.id)
    const demoItem = initialCart.find(candidate => candidate.id === item.id)
    const limit = product?.stock ?? Infinity
    const invalid = product ? ownsListing(product) || product.price === null || item.quantity > limit : !demoItem
    const listing = listings.find(candidate => candidate.id === item.id)
    const reviewedItem = product?.price != null
      ? { ...item, ownerId: listing?.ownerId, name: product.name, price: product.price, image: product.image }
      : demoItem ? { ...item, image: demoItem.image } : item
    return { item: reviewedItem, invalid, limit }
  })
}

export function Cart() {
  const { cart, setCart } = useMarketplace()
  const rows = useCartReview()
  const [query, setQuery] = useState('')
  const [searchReset, setSearchReset] = useState(0)
  const visible = rows.filter(({ item }) => item.name.toLowerCase().includes(query.toLowerCase()))
  const invalid = rows.some(row => row.invalid)

  function update(id: string, amount: number) {
    setCart(items => items.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item))
  }

  return (
    <div className="transaction-page cart-page">
      <TransactionHeader title="Keranjang Saya"><SearchBar key={searchReset} placeholder="Cari barang di keranjang" onSearch={setQuery} /></TransactionHeader>
      {query && <div className="cart-search-options"><Button tone="outline" onClick={() => { setQuery(''); setSearchReset(value => value + 1) }}>Tampilkan semua barang</Button></div>}
      <main className="cart-main">
        {cart.length === 0 ? <section className="empty-cart">
          <span className="empty-cart-icon"><ShoppingCart size={42} /></span>
          <h2>Keranjangmu masih kosong</h2>
          <p>Yuk, temukan barang preloved favorit dari teman kampusmu.</p>
          <ActionLink to="/barang">Jelajahi barang</ActionLink>
        </section> : <>
          <div className="cart-table" role="table" aria-label="Isi keranjang">
            <div className="cart-row cart-labels" role="row">{['Info Produk', 'Harga Satuan', 'Kuantitas', 'Harga Total', 'Aksi'].map(label => <span key={label} role="columnheader">{label}</span>)}</div>
            {visible.map(({ item, invalid, limit }) => <div className="cart-row" role="row" key={item.id}>
              <div role="cell" className="cart-product"><ProductImage src={item.image} name={item.name} /><span>{item.name}{invalid && <small className="form-error">Stok kurang atau barang tidak tersedia.</small>}</span></div>
              <div className="cart-money unit-price" role="cell">{money(item.price)}</div>
              <div role="cell" className="quantity">
                <button onClick={() => update(item.id, -1)} disabled={item.quantity === 1} aria-label={`Kurangi ${item.name}`}><Minus size={16} /></button>
                <output aria-label={`Kuantitas ${item.name}`}>{item.quantity}</output>
                <button onClick={() => update(item.id, 1)} disabled={invalid || item.quantity >= limit} aria-label={`Tambah ${item.name}`}><Plus size={16} /></button>
              </div>
              <div className="cart-money line-price" role="cell">{money(item.price * item.quantity)}</div>
              <div className="cart-remove" role="cell"><Button tone="danger" onClick={() => setCart(items => items.filter(product => product.id !== item.id))}>Hapus<span className="sr-only"> {item.name}</span></Button></div>
            </div>)}
            {!visible.length && <div className="empty-result">Barang tidak ditemukan di keranjang.</div>}
          </div>
          <section className="cart-summary">
            <h2>Ringkasan Pesanan</h2>
            <span>Total Produk: <b>{totalItems(cart)} Barang</b></span>
            <span>Total Harga: <b>{money(subtotal(rows.map(row => row.item)))}</b></span>
            {invalid ? <Button disabled>Checkout</Button> : <ActionLink to="/pembayaran">Checkout</ActionLink>}
          </section>
        </>}
      </main>
    </div>
  )
}

type Delivery = (typeof deliveryOptions)[number]['id']
type Payment = 'qris' | 'bank'

export function Checkout() {
  const { account, setCart, setOrders, setListings } = useMarketplace()
  const rows = useCartReview()
  const cart = rows.map(row => row.item)
  const invalid = rows.some(row => row.invalid)
  const navigate = useNavigate()
  const [payment, setPayment] = useState<Payment>('qris')
  const [delivery, setDelivery] = useState<Delivery>('campus')
  const [bank, setBank] = useState('BCA')
  const [deliveryOpen, setDeliveryOpen] = useState(false)
  const [error, setError] = useState('')
  const currentDelivery = deliveryOptions.find(option => option.id === delivery)!
  const total = subtotal(cart) + currentDelivery.price + serviceFee

  function createOrder(form: FormData) {
    if (!cart.length || invalid) return
    const name = String(form.get('recipient')).trim()
    const phone = String(form.get('recipient-phone')).trim()
    const address = String(form.get('recipient-address')).trim()
    if (!name || !address || !/^\+?[\d\s-]{8,20}$/.test(phone)) {
      setError('Periksa nama, nomor telepon, dan alamat tujuan.')
      return
    }
    setOrders(orders => [{
      id: crypto.randomUUID(), items: cart, total, date: new Date().toLocaleDateString('id-ID'),
      delivery: currentDelivery.title, payment: payment === 'qris' ? 'QRIS' : `Transfer bank · ${bank}`,
      recipient: { name, phone, address }, note: String(form.get('seller-note')).trim(),
    }, ...orders])
    setListings(items => items.map(item => {
      const purchased = cart.find(line => line.id === item.id)
      return purchased && item.stock !== undefined ? { ...item, stock: item.stock - purchased.quantity } : item
    }))
    setCart([])
    navigate('/pembayaran/berhasil', { replace: true, state: { completed: true } })
  }

  return (
    <div className="transaction-page checkout-page">
      <TransactionHeader title="Pembayaran" />
      <main className="checkout-main">
        {cart.length === 0 ? <section className="empty-cart"><h2>Keranjangmu masih kosong</h2><ActionLink to="/barang">Jelajahi barang</ActionLink></section> : invalid ? <section className="empty-cart"><h2>Periksa isi keranjang</h2><p>Beberapa barang sudah berubah atau stoknya tidak mencukupi.</p><ActionLink to="/keranjang">Kembali ke keranjang</ActionLink></section> : <form className="checkout-layout" onSubmit={submitForm(createOrder)}>
          <section className="checkout-panel checkout-details">
            <h2>Alamat Pengiriman</h2>
            <div className="checkout-recipient">
              <Field label="Nama penerima" name="recipient" defaultValue={account.name} autoComplete="name" required />
              <Field label="Nomor telepon" name="recipient-phone" type="tel" defaultValue={account.phone} autoComplete="tel" required />
            </div>
            <Field label="Kampus / alamat tujuan" name="recipient-address" defaultValue={account.address} autoComplete="street-address" placeholder="Masukkan kampus atau alamat lengkap" required />
            <h3>Opsi pengiriman</h3>
            <button type="button" className="delivery-selected" onClick={() => setDeliveryOpen(true)} aria-haspopup="dialog">
              <span><b>{currentDelivery.title}</b><small>Klik untuk mengganti opsi pengiriman.</small></span><ChevronDown size={18} />
            </button>
            <h2 className="checkout-items-title">Produk yang dibeli</h2>
            <ul className="checkout-items">{cart.map(item => <li key={item.id}>
              <span>{item.name}{item.note && ` • ${item.note}`}{item.quantity > 1 && ` × ${item.quantity}`}</span>
              {catalog.some(product => product.id === item.id) || initialCart.some(product => product.id === item.id) ? <Link to="/pesan">Chat penjual</Link> : <small>Chat belum tersedia</small>}<strong>{money(item.price * item.quantity)}</strong>
            </li>)}</ul>
            <TextArea label="Catatan untuk penjual (opsional)" name="seller-note" placeholder="Tulis pesan atau atur waktu pengambilan" rows={2} />
          </section>
          <section className="checkout-panel checkout-summary">
            <h2>Rincian Pesanan</h2>
            <dl>
              <div><dt>{totalItems(cart)} barang</dt><dd>{money(subtotal(cart))}</dd></div>
              <div><dt>Biaya pengiriman</dt><dd>{money(currentDelivery.price)}</dd></div>
              <div><dt>Biaya layanan</dt><dd>{money(serviceFee)}</dd></div>
              <div className="payment-total"><dt>Total Pembayaran</dt><dd>{money(total)}</dd></div>
            </dl>
            <fieldset className="payment-options">
              <legend>Pilih metode pembayaran</legend>
              <label className={payment === 'qris' ? 'selected' : ''}><input type="radio" name="payment" checked={payment === 'qris'} onChange={() => setPayment('qris')} /> QRIS</label>
              <label className={payment === 'bank' ? 'selected' : ''}><input type="radio" name="payment" checked={payment === 'bank'} onChange={() => setPayment('bank')} /> Transfer bank</label>
            </fieldset>
            {payment === 'bank' && <fieldset className="bank-options"><legend>Pilih bank transfer</legend>{['BCA', 'Mandiri', 'BNI'].map(name => <label key={name}><input type="radio" name="bank" checked={bank === name} onChange={() => setBank(name)} /> {name}</label>)}</fieldset>}
            <p className="muted demo-checkout">Mode demo. Tidak ada pembayaran yang ditagihkan.</p>
            {error && <p className="form-error" role="alert">{error}</p>}
            <Button type="submit" className="pay-button">Buat pesanan</Button>
          </section>
        </form>}
      </main>
      {deliveryOpen && <Modal title="Pilih opsi pengiriman" description="Cara barang sampai kepadamu" onClose={() => setDeliveryOpen(false)}>
        <div className="delivery-options">{deliveryOptions.map(option => <button type="button" key={option.id} onClick={() => { setDelivery(option.id); setDeliveryOpen(false) }} aria-pressed={option.id === delivery}>
          <span><b>{option.title}</b><small>{option.description}</small></span>
          <strong>{option.price ? money(option.price) : 'Gratis'}</strong><ChevronRight size={17} />
        </button>)}</div>
      </Modal>}
    </div>
  )
}
