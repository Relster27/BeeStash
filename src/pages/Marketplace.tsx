import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ChevronDown, ChevronRight, SlidersHorizontal, Star } from 'lucide-react'
import { catalog, featured, figma, laptopReview, money, promotions } from '../data'
import { useMarketplace } from '../state'
import { catalogUrl, Footer, MarketplaceHeader } from '../components/layout'
import { CategoryStrip, Hero, InfiniteProductGrid, ProductGrid, SectionTitle } from '../components/products'
import { ActionLink, Button, Modal, ProductImage } from '../components/ui'

function priceBound(value: string | null) {
  return value !== null && /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) ? Number(value) : null
}

function publishedTime(value?: string) {
  const date = value?.replace(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/, '$3-$2-$1').replace(/ \(.*\)$/, '')
  return Date.parse(date ?? '') || 0
}

export function Home() {
  const { signedIn, listings } = useMarketplace()
  const feedProducts = [...catalog, ...listings]
  return (
    <>
      <MarketplaceHeader />
      <main>
        <Hero />
        <div className="market-wrap home-sections">
          <section><SectionTitle>Pilihan <em>Kategori</em></SectionTitle><CategoryStrip /></section>
          <section id="diskon"><SectionTitle link="/barang">Diskon <em>Besar!</em></SectionTitle><ProductGrid items={featured} showCondition={false} guest={!signedIn} /></section>
          <section>
            <SectionTitle>Ulasan <em>Terbaik</em></SectionTitle>
            <div className="promotion-grid">{promotions.map(item => (
              <Link className="promotion" key={item.title} to={catalogUrl(item.category)} style={{ backgroundImage: `url(${figma('104-9', item.background)})` }}>
                <img src={figma('104-9', item.image)} alt="" />
                <div><h3>{item.title}</h3><span>Shop Now</span><strong>{item.value}</strong></div>
              </Link>
            ))}</div>
          </section>
          <section className="product-feed" aria-labelledby="product-feed-title">
            <div className="section-heading"><h2 id="product-feed-title">Semua <em>Produk</em></h2><span>Temukan barang dari berbagai kategori</span></div>
            <InfiniteProductGrid items={feedProducts} guest={!signedIn} />
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}

export function Catalog() {
  const { hash, search: query } = useLocation()
  const params = new URLSearchParams(query)
  const navigate = useNavigate()
  const { listings } = useMarketplace()
  const category = params.get('kategori') ?? ''
  const search = params.get('q') ?? ''
  const condition = params.get('kondisi') ?? ''
  const minimumPrice = priceBound(params.get('hargaMin'))
  const maximumPrice = priceBound(params.get('hargaMax'))
  const invalidRange = minimumPrice !== null && maximumPrice !== null && minimumPrice > maximumPrice
  const sort = params.get('urut') ?? 'terbaru'
  const items = [...catalog, ...listings]
    .filter(product =>
      (!category || product.category === category) &&
      (!condition || product.condition === condition) &&
      (!search || `${product.name} ${product.category}`.toLowerCase().includes(search.toLowerCase())) &&
      (minimumPrice === null || (product.price !== null && product.price >= minimumPrice)) &&
      (maximumPrice === null || (product.price !== null && product.price <= maximumPrice)),
    )
    .sort((a, b) => {
      if (sort === 'harga-rendah') return (a.price ?? Infinity) - (b.price ?? Infinity)
      if (sort === 'harga-tinggi') return (b.price ?? -1) - (a.price ?? -1)
      if (sort === 'diskon') return (b.discount ?? 0) - (a.discount ?? 0)
      return publishedTime(b.published) - publishedTime(a.published)
    })

  const hasFilters = Boolean(condition || params.has('hargaMin') || params.has('hargaMax') || sort !== 'terbaru')

  function setFilter(name: string, value: string) {
    if (name.startsWith('harga') && value && priceBound(value) === null) return
    const next = new URLSearchParams(params)
    if (value) next.set(name, value)
    else next.delete(name)
    navigate({ search: next.toString(), hash }, { replace: name.startsWith('harga'), preventScrollReset: true })
  }

  function selectCondition(value: string) {
    setFilter('kondisi', condition === value ? '' : value)
  }

  function clearFilters() {
    const next = new URLSearchParams(params)
    const filterKeys = ['kondisi', 'hargaMin', 'hargaMax', 'urut']
    filterKeys.forEach(key => next.delete(key))
    navigate({ search: next.toString(), hash }, { preventScrollReset: true })
  }

  return (
    <>
      <MarketplaceHeader variant="catalog" search={search} />
      <main>
        <Hero />
        <div className="catalog-tools">
          <section><h2>Kategori</h2><CategoryStrip selected={category} /></section>
          <section className="filter-section" id="filter">
            <div className="filter-heading">
              <div><SlidersHorizontal size={19} aria-hidden="true" /><h2>Filter</h2></div>
              {hasFilters && <button type="button" className="clear-filters" onClick={clearFilters}>Reset filter</button>}
            </div>
            <div className="filter-panel">
              <fieldset className="filter-group condition-filter">
                <legend>Kondisi</legend>
                <div className="filter-chips">
                  {['Barang Baru', 'Barang Bekas'].map(item => <button type="button" className="filter-chip" key={item} aria-pressed={condition === item} onClick={() => selectCondition(item)}>{item}</button>)}
                </div>
              </fieldset>
              <fieldset className="filter-group price-filter">
                <legend>Rentang harga</legend>
                <div className="price-inputs">
                  <label><span>Rp</span><input type="number" min="0" inputMode="numeric" value={params.get('hargaMin') ?? ''} onChange={event => setFilter('hargaMin', event.target.value)} placeholder="Minimum" aria-label="Harga minimum" /></label>
                  <span className="price-separator">–</span>
                  <label><span>Rp</span><input type="number" min="0" inputMode="numeric" value={params.get('hargaMax') ?? ''} onChange={event => setFilter('hargaMax', event.target.value)} placeholder="Maksimum" aria-label="Harga maksimum" /></label>
                </div>
              </fieldset>
              <label className="filter-group filter-select">
                <span>Urutkan</span>
                <select value={sort} onChange={event => setFilter('urut', event.target.value === 'terbaru' ? '' : event.target.value)}>
                  <option value="terbaru">Terbaru</option>
                  <option value="harga-rendah">Harga terendah</option>
                  <option value="harga-tinggi">Harga tertinggi</option>
                  <option value="diskon">Diskon terbesar</option>
                </select>
                <ChevronDown size={16} aria-hidden="true" />
              </label>
            </div>
            {invalidRange && <p className="form-error status-text" role="alert">Harga minimum harus lebih kecil atau sama dengan harga maksimum.</p>}
          </section>
        </div>
        <section className="market-wrap catalog-results" id="hasil" aria-label="Daftar barang">
          <div className="results-heading"><h2>{search ? `Hasil pencarian “${search}”` : category || 'Semua barang'}</h2><span>{items.length} barang ditemukan</span></div>
          {items.length ? <ProductGrid items={items} /> : <div className="empty-result">Barang tidak ditemukan.</div>}
        </section>
      </main>
      <Footer />
    </>
  )
}

export function ProductDetail() {
  const { id } = useParams()
  const { listings, addToCart, followed, setFollowed, signedIn, ownsListing, profiles, cart } = useMarketplace()
  const navigate = useNavigate()
  const [gallery, showGallery] = useState(false)
  const [added, setAdded] = useState(false)
  const product = [...catalog, ...listings].find(item => item.id === id)
  if (!product) return <Missing />
  const laptop = product.id === 'macbook-m2'
  const owned = ownsListing(product)
  const sellerListing = listings.find(item => item.id === product.id)
  const sellerName = sellerListing ? profiles[sellerListing.ownerId ?? 'demo']?.name ?? 'Penjual BeeStash' : 'Jayson Chrisnanda'
  const quantity = cart.find(item => item.id === product.id)?.quantity ?? 0
  const unavailable = product.price === null || (product.stock ?? Infinity) <= (signedIn ? quantity : 0)
  const promptLogin = () => navigate('/masuk', { state: { returnTo: `/barang/${product.id}` } })
  function purchase(checkout: boolean) {
    if (!signedIn) return promptLogin()
    if (!product || !addToCart(product)) return
    if (checkout) navigate('/keranjang')
    else setAdded(true)
  }
  const photo = laptop ? figma('223-7', 'ItemImage.png') : product.image
  const sellerPhoto = figma('223-7', 'Profile.png')
  const related = [...catalog, ...listings].filter(item => item.id !== id && item.category === product.category).slice(0, 5)
  return (
    <>
      <MarketplaceHeader variant="detail" />
      <main className="market-wrap detail-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/barang">Home</Link><ChevronRight size={16} />
          <Link to={catalogUrl(product.category)}>{laptop ? 'Electronics' : product.category}</Link><ChevronRight size={16} />
          <span>{laptop ? 'Macbook M2' : product.name}</span>
        </nav>
        <div className="detail-grid">
          <section className="detail-left" aria-label="Foto produk dan pembelian">
            <div className="detail-photo">
              {photo ? <button type="button" onClick={() => showGallery(true)} aria-label="Perbesar foto"><ProductImage src={photo} name={product.name} /></button> : <ProductImage name={product.name} />}
              {product.discount && <span className="discount-label">{product.discount}%<br />OFF</span>}
            </div>
            {photo && <button type="button" className="gallery-preview" onClick={() => showGallery(true)}><ProductImage src={photo} name={product.name} /><small>1 foto produk</small></button>}
            <div className="seller-card">
              <img src={sellerPhoto} alt="" />
              <div><strong>{sellerName}</strong>{!sellerListing && <small>★ 5.0 (2)</small>}</div>
              {owned ? <ActionLink to={`/jualan/${product.id}/edit`} tone="subtle">Edit barang</ActionLink> : sellerListing ? <small>Chat penjual ini belum tersedia</small> : <>
                <Button tone="subtle" onClick={() => signedIn ? setFollowed(value => !value) : promptLogin()} aria-pressed={signedIn && followed}><img src={figma('223-7', 'Add.png')} alt="" />{signedIn && followed ? 'Diikuti' : 'Ikuti'}</Button>
                <ActionLink to="/pesan" tone="yellow"><img src={figma('223-7', 'ChatBubble.png')} alt="" />Chat</ActionLink>
              </>}
            </div>
            {(product.weight || laptop) && <div className="specs">
              {product.weight && <span><img src={figma('223-7', 'Scales.png')} alt="" />Berat: {product.weight}</span>}
              {laptop && <span><img src={figma('223-7', 'Width.png')} alt="" />Ukuran: 1cm</span>}
            </div>}
            <div className="purchase-card">
              <div className="purchase-prices"><span>Harga</span><div>{product.price !== null ? <strong><img src={figma('223-7', 'Image39.png')} alt="" />{money(product.price)}</strong> : 'Harga belum tersedia'}{product.originalPrice && <del>{money(product.originalPrice)}</del>}</div></div>
              {owned ? <p className="status-text">Ini barang yang kamu jual.</p> : <div className="purchase-actions">
                <Button disabled={unavailable} onClick={() => purchase(false)}>Tambah ke Keranjang</Button>
                <Button tone="yellow" disabled={unavailable} onClick={() => purchase(true)}>Beli</Button>
              </div>}
              {!owned && product.stock !== undefined && <p className="status-text">{product.stock === 0 ? 'Stok habis.' : unavailable && product.price !== null ? 'Semua stok tersedia sudah ada di keranjang.' : `Stok: ${product.stock}`}</p>}
              {added && signedIn && <p className="status-text" role="status">Ditambahkan ke <Link to="/keranjang">keranjang</Link>.</p>}
            </div>
          </section>
          <section className="detail-copy">
            <h1>{product.name}</h1>
            <div className="detail-meta"><Link to={`${catalogUrl(product.category)}#filter`}>{product.category}</Link><span>{product.condition}</span>{product.published && <small>Terbit {product.published}</small>}</div>
            {product.description && <p className="detail-description">{product.description}</p>}
          </section>
        </div>
        {laptop && <section className="detail-reviews" aria-label="Ulasan produk">
          <div className="rating-box">
            <div><span className="rating-score"><Star fill="#ffd24d" color="#ffd24d" />5.0<small> / 5.0</small></span><p>100% satisfied</p><small>2 ratings · 2 reviews</small></div>
            <div className="rating-bars">{[5, 4, 3, 2, 1].map(value => <span key={value}>{value} <b>★</b><i className={value === 5 ? 'filled' : ''} /></span>)}</div>
          </div>
          <div className="rating-review"><h2>Ulasan</h2><div><img src={sellerPhoto} alt="" /><div><strong>{laptopReview.author}</strong><p className="star-text">{laptopReview.rating} ★</p><p>{laptopReview.text}</p></div></div></div>
        </section>}
        {related.length > 0 && <section className="similar-products"><SectionTitle link={`${catalogUrl(product.category)}#filter`}>Produk Serupa</SectionTitle><ProductGrid items={related} /></section>}
      </main>
      <Footer />
      {gallery && <Modal title={product.name} onClose={() => showGallery(false)}><img className="gallery-large" src={photo} alt={product.name} /></Modal>}
    </>
  )
}

export function Missing() {
  return <><MarketplaceHeader /><main className="market-wrap missing"><h1>Halaman tidak ditemukan</h1><ActionLink to="/barang">Jelajahi barang</ActionLink></main><Footer /></>
}
