import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ChevronRight, Heart, History, Lock, LogOut, MapPin, Package, PenLine, Store } from 'lucide-react'
import { catalog, categories, figma, money } from '../data'
import type { Product } from '../data'
import { readLocalFile } from '../files'
import { useMarketplace } from '../state'
import { Footer, MarketplaceHeader, TransactionHeader, submitForm } from '../components/layout'
import { Button, Field, Modal, ProductImage, TextArea } from '../components/ui'
import { Missing } from './Marketplace'

export function ListingEditor() {
  const { id } = useParams()
  const { listings, ownsListing } = useMarketplace()
  const listing = listings.find(item => item.id === id && ownsListing(item))
  if (id && !listing) return <Missing />
  return <ListingForm key={id ?? 'new'} listing={listing} />
}

function ListingForm({ listing }: { listing?: Product }) {
  const { accountId, account, setListings, setCart, toggleFavorite, favorites } = useMarketplace()
  const navigate = useNavigate()
  const [photo, setPhoto] = useState(listing?.image)
  const [error, setError] = useState('')
  const [reading, setReading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [condition, setCondition] = useState<Product['condition']>(listing?.condition ?? 'Barang Bekas')
  const title = listing ? 'Barang saya' : 'Jual Barang'

  const submit = submitForm(form => {
    const value = (key: string) => String(form.get(key) ?? '').trim()
    if (reading) return
    if (!value('listing-name') || !value('listing-address') || !categories.some(category => category.name === value('listing-category'))) {
      setError('Isi nama, alamat, dan pilih kategori yang tersedia.')
      return
    }
    const updated: Product = {
      ...listing,
      id: listing?.id ?? crypto.randomUUID(),
      ownerId: listing?.ownerId ?? accountId,
      name: value('listing-name'), category: value('listing-category'),
      reason: value('listing-reason'), weight: value('listing-weight'), stock: Number(value('listing-stock')),
      description: value('listing-description'), condition, price: Number(value('listing-price')),
      address: value('listing-address'), image: photo,
      published: listing?.published ?? new Date().toISOString().slice(0, 10),
    }
    setListings(items => listing ? items.map(item => item.id === listing.id ? updated : item) : [...items, updated])
    navigate(listing ? '/jualan/edit/berhasil' : '/jualan/berhasil', { state: { completed: true, productId: updated.id } })
  })

  function deleteListing() {
    if (!listing) return
    setListings(items => items.filter(item => item.id !== listing.id))
    setCart(items => items.filter(item => item.id !== listing.id))
    if (favorites.includes(listing.id)) toggleFavorite(listing.id)
    navigate('/profil', { replace: true, state: { notice: 'Barang dihapus dari etalase.' } })
  }

  async function updatePhoto(file?: File) {
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) {
      setError('Pilih gambar dengan ukuran maksimal 2 MB.')
      return
    }
    setReading(true)
    try {
      const source = await readLocalFile(file)
      const image = new Image()
      image.src = source
      await image.decode()
      const scale = Math.min(1, 1000 / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.width * scale))
      canvas.height = Math.max(1, Math.round(image.height * scale))
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Image preview unavailable')
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      setPhoto(canvas.toDataURL('image/webp', 0.82))
      setError('')
    } catch {
      setError('Foto gagal dibaca.')
    } finally {
      setReading(false)
    }
  }

  return (
    <div className="transaction-page listing-page">
      <TransactionHeader title={title} />
      <main className="listing-main">
        <form className="listing-form" onSubmit={submit}>
          <div className="listing-column">
            <Field label={listing ? 'Nama Barang' : 'Nama barang'} name="listing-name" defaultValue={listing?.name} placeholder="Meja" required />
            {listing && <Field label="Tanggal terbit" name="listing-date" value={listing.published ?? ''} readOnly />}
            <label className="field"><span className="field-label">Kategori barang</span>
              <select className="input-shell" name="listing-category" defaultValue={listing?.category ?? ''} required>
                <option value="" disabled>Pilih kategori</option>
                {categories.map(category => <option key={category.name}>{category.name}</option>)}
              </select>
            </label>
            {!listing && <Field label="Alasan Jual" name="listing-reason" placeholder="e.g. Jarang dipakai" />}
            <Field label={listing ? 'Bobot Barang' : 'Bobot barang'} name="listing-weight" defaultValue={listing?.weight} placeholder="e.g. 3kg" />
            <Field label="Stok" name="listing-stock" type="number" min={listing ? 0 : 1} defaultValue={listing?.stock ?? 1} required />
            {listing && <Field label="Alasan Jual" name="listing-reason" defaultValue={listing.reason} placeholder="e.g. Jarang dipakai" />}
            <TextArea label={listing ? 'Deskripsi' : 'Deskripsi Barang'} name="listing-description" defaultValue={listing?.description} placeholder="Kondisi, detail, spesifikasi, ..." rows={listing ? 5 : 1} />
          </div>
          <div className="listing-column">
            <Field label="Alamat penjual" name="listing-address" defaultValue={listing?.address ?? account.address} placeholder="Contoh: Jl. Rawa Belong" required />
            <label className="field"><span className="field-label">Kondisi barang</span><select className="input-shell" value={condition} onChange={event => setCondition(event.target.value as Product['condition'])}><option>Barang Bekas</option><option>Barang Baru</option></select></label>
            <Field label="Harga Barang" type="number" min="0" name="listing-price" defaultValue={listing?.price ?? undefined} placeholder="Rp. 30.000,00" required />
            <label className="photo-picker">
              <input type="file" accept="image/*" disabled={reading} onChange={event => { void updatePhoto(event.target.files?.[0]); event.target.value = '' }} />
              <span className="photo-picker-image">
                {photo ? <img className="uploaded-photo" src={photo} alt="Pratinjau foto barang" /> : <>
                  <img className="picker-background" src={figma('491-367', 'Image202610012142446561.png')} alt="" />
                  <img className="picker-camera" src={figma('491-367', 'CameraIconSymbolPhotographSign260Nw19241899011.png')} alt="" />
                </>}
              </span>
              {reading ? 'Membaca foto…' : photo ? 'Ganti foto barang' : 'Pilih foto barang'}
            </label>
            {photo && <Button tone="outline" disabled={reading} onClick={() => setPhoto(undefined)}>Lepas foto</Button>}
            <Link className="auth-link" to="/profil">Kembali ke etalase</Link>
            {error && <p role="alert" className="form-error">{error}</p>}
            <Button className="listing-submit" type="submit" disabled={reading}>{listing ? 'Simpan perubahan' : 'Terbitkan barang'}</Button>
            {listing && <Button tone="danger" onClick={() => setConfirmDelete(true)}>Hapus barang</Button>}
          </div>
        </form>
      </main>
      <Footer compact />
      {confirmDelete && <Modal title="Hapus barang?" description={`“${listing?.name}” akan dihapus dari etalase.`} onClose={() => setConfirmDelete(false)}>
        <div className="dialog-actions"><Button tone="outline" onClick={() => setConfirmDelete(false)}>Batal</Button><Button tone="danger" onClick={deleteListing}>Ya, hapus barang</Button></div>
      </Modal>}
    </div>
  )
}

const profileTabs = [
  { id: 'etalase', label: 'Etalase Saya', icon: Store },
  { id: 'pesanan', label: 'Pesanan Masuk', icon: Package },
  { id: 'riwayat', label: 'Riwayat Belanja', icon: History },
  { id: 'alamat', label: 'Alamat & Lokasi COD', icon: MapPin },
  { id: 'keamanan', label: 'Keamanan & Privasi', icon: Lock },
]

export function Profile() {
  const { account, setAccount, listings, ownsListing, profiles, orders, incomingOrders, favorites } = useMarketplace()
  const [params, setParams] = useSearchParams()
  const tab = profileTabs.find(item => item.id === params.get('tab'))?.id ?? 'etalase'
  const ownListings = listings.filter(ownsListing)
  const visibleListings = params.get('list') === 'all' ? ownListings : ownListings.slice(0, 4)
  const [edit, setEdit] = useState(false)
  const [addressSaved, setAddressSaved] = useState(false)
  const [editError, setEditError] = useState('')
  const { state } = useLocation()
  const navigate = useNavigate()
  const savedProducts = [...catalog, ...listings].filter(product => favorites.includes(product.id))
  return (
    <>
      <MarketplaceHeader variant="profile" />
      <main className="market-wrap profile-page">
        <section className="profile-banner" aria-label="Informasi profil">
          <span className="profile-avatar">{account.name.split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase()}</span>
          <div><h1>{account.name}</h1><p>NIM: {account.nim}</p><p>{account.email}</p><p>{account.phone}</p></div>
          <Button tone="outline" onClick={() => { setEditError(''); setEdit(true) }}><PenLine size={16} />Edit Profil</Button>
        </section>
        <div className="profile-layout">
          <nav className="profile-nav" aria-label="Menu profil">
            {profileTabs.map(({ id, icon: Icon, label }) => <button key={id} className={tab === id ? 'active' : ''} aria-current={tab === id ? 'page' : undefined} onClick={() => setParams(id === 'etalase' ? {} : { tab: id })}><Icon size={20} />{label}</button>)}
            <button className="logout" onClick={() => navigate('/masuk', { replace: true, state: { signOut: true } })}><LogOut size={20} />Keluar</button>
          </nav>
          <section className="profile-content">
            {tab === 'etalase' && <>
              {state?.notice && <p role="status" className="status-text">{state.notice}</p>}
              <div className="profile-stats"><div><b>{ownListings.filter(item => item.stock !== 0).length}</b>Barang Aktif</div></div>
              <div className="profile-heading" id="barang-dijual"><h2>Barang Dijual</h2>{ownListings.length > 4 && params.get('list') !== 'all' && <Link to="/profil?list=all#barang-dijual">Lihat Semua <ChevronRight size={16} /></Link>}<Link to="/jualan">Jual barang <ChevronRight size={16} /></Link></div>
              {!visibleListings.length && <p className="empty-result">Belum ada barang di etalase.</p>}
              <div className="listing-grid">{visibleListings.map(item => <Link to={`/barang/${item.id}`} key={item.id} className="owned-listing">
                <ProductImage src={item.image} name={item.name} />
                <span><strong>{item.name}</strong><span>{item.price !== null && money(item.price)}</span></span>
              </Link>)}</div>
              {savedProducts.length > 0 && <><div className="profile-heading"><h2><Heart size={19} /> Barang Favorit</h2></div><ul className="saved-list">{savedProducts.map(item => <li key={item.id}><Link to={`/barang/${item.id}`}>{item.name}</Link></li>)}</ul></>}
            </>}
            {tab === 'pesanan' && <><h2>Pesanan Masuk</h2>{incomingOrders.length ? <ul className="order-list">{incomingOrders.map(order => <li key={order.id}><strong>{order.items.map(item => `${item.name} × ${item.quantity}`).join(', ')}</strong><span>{order.date} · {order.delivery}</span><b>{money(order.total)}</b></li>)}</ul> : <p className="muted">Belum ada pesanan masuk.</p>}</>}
            {tab === 'riwayat' && <><h2>Riwayat Belanja</h2>{orders.length ? <ul className="order-list">{orders.map(order => <li key={order.id}><strong>{order.items.map(item => item.name).join(', ')}</strong><span>{order.date} · {order.delivery} · {order.payment}</span><b>{money(order.total)}</b></li>)}</ul> : <p className="muted">Belum ada riwayat belanja.</p>}</>}
            {tab === 'alamat' && <><h2>Alamat &amp; Lokasi COD</h2><form className="profile-form" onSubmit={submitForm(form => {
              const address = String(form.get('account-address')).trim()
              if (!address) return
              setAccount(previous => ({ ...previous, address }))
              setAddressSaved(true)
            })}>
              <Field label="Alamat" name="account-address" defaultValue={account.address} required />
              <Button type="submit">Simpan alamat</Button>{addressSaved && <p role="status">Alamat disimpan.</p>}
            </form></>}
            {tab === 'keamanan' && <><h2>Keamanan &amp; Privasi</h2><p className="muted">{account.email}</p><p className="muted">Verifikasi demo tersimpan di browser ini.</p></>}
          </section>
        </div>
      </main>
      <Footer compact />
      {edit && <Modal title="Edit Profil" onClose={() => setEdit(false)}><form className="profile-form" onSubmit={submitForm(form => {
        const name = String(form.get('edit-name')).trim()
        const email = String(form.get('edit-email')).trim().toLowerCase()
        if (!name || !/^[^\s@]+@(?:[a-z0-9-]+\.)*binus\.ac\.id$/i.test(email) ||
            Object.values(profiles).some(profile => profile !== account && profile.email.toLowerCase() === email)) {
          setEditError('Isi nama dan email Binus yang belum dipakai akun lain.')
          return
        }
        setAccount(previous => ({
          ...previous, name, email,
          phone: String(form.get('edit-phone')).trim(), nim: String(form.get('edit-nim')).trim(),
        }))
        setEdit(false)
      })}>
        <Field label="Nama Lengkap" name="edit-name" defaultValue={account.name} required />
        <Field label="NIM" name="edit-nim" defaultValue={account.nim} inputMode="numeric" pattern="[0-9]{8,12}" required />
        <Field label="Email Kampus" name="edit-email" type="email" defaultValue={account.email} required />
        <Field label="No. WhatsApp" name="edit-phone" type="tel" defaultValue={account.phone} required />
        {editError && <p className="form-error" role="alert">{editError}</p>}
        <Button type="submit">Simpan Profil</Button>
      </form></Modal>}
    </>
  )
}
