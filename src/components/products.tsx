import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { categories, figma, money } from '../data'
import type { Product } from '../data'
import { useMarketplace } from '../state'
import { catalogUrl, DesignIcon } from './layout'
import { ProductImage } from './ui'

export function ProductCard({ product, showCondition = true, guest = false }: { product: Product; showCondition?: boolean; guest?: boolean }) {
  const { favorites, toggleFavorite, addToCart, signedIn, ownsListing, cart } = useMarketplace()
  const navigate = useNavigate()
  const location = useLocation()
  const favorite = favorites.includes(product.id)
  const to = `/barang/${product.id}`
  const owned = ownsListing(product)
  const quantity = cart.find(item => item.id === product.id)?.quantity ?? 0
  const unavailable = product.price === null || (product.stock ?? Infinity) <= (signedIn ? quantity : 0)
  const login = () => navigate('/masuk', { state: { returnTo: location.pathname + location.search + location.hash } })
  return (
    <article className="product-card">
      <Link className="product-visual" to={to}>
        <ProductImage src={product.image} name={product.name} />
        {showCondition && <span className="condition-label">{product.condition}</span>}
        {product.discount && <span className="discount-label">{product.discount}%<br />OFF</span>}
      </Link>
      <div className="product-info">
        <Link className="product-name" to={to}>{product.name}</Link>
        <div className="product-price">{product.price !== null && money(product.price)} {product.originalPrice && <del>{money(product.originalPrice)}</del>}</div>
        <div className="product-actions">
          <button className="icon-button" type="button" aria-label={owned ? 'Barang milikmu' : `Beli ${product.name}`} title={owned ? 'Barang milikmu' : unavailable ? 'Barang belum tersedia untuk dibeli' : undefined} disabled={owned || unavailable} onClick={() => {
            if (guest || !signedIn) { login(); return }
            if (addToCart(product)) navigate('/keranjang')
          }}><DesignIcon file="Buy.svg" size={19} /></button>
          <button className="icon-button" type="button" aria-label={`Favorit ${product.name}`} aria-pressed={signedIn && favorite} onClick={() => signedIn ? toggleFavorite(product.id) : login()}>
            <DesignIcon file={signedIn && favorite ? 'Love.png' : 'Property1Component43.png'} size={16} />
          </button>
        </div>
      </div>
    </article>
  )
}

export function ProductGrid({ items, showCondition, guest }: { items: Product[]; showCondition?: boolean; guest?: boolean }) {
  return <div className="product-grid">{items.map(product => <ProductCard key={product.id} product={product} showCondition={showCondition} guest={guest} />)}</div>
}

const PRODUCT_BATCH_SIZE = 10

export function InfiniteProductGrid({ items, guest = false }: { items: Product[]; guest?: boolean }) {
  const [visibleCount, setVisibleCount] = useState(() => Math.min(PRODUCT_BATCH_SIZE, items.length))
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const hasMore = visibleCount < items.length

  useEffect(() => {
    const marker = loadMoreRef.current
    if (!marker || !hasMore) return

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.unobserve(marker)
      setVisibleCount(current => Math.min(current + PRODUCT_BATCH_SIZE, items.length))
    }, { rootMargin: '450px 0px' })

    observer.observe(marker)
    return () => observer.disconnect()
  }, [hasMore, items.length, visibleCount])

  return <>
    <div className="product-grid infinite-product-grid">
      {items.slice(0, visibleCount).map(product => <ProductCard key={product.id} product={product} guest={guest} />)}
    </div>
    <div className={`product-feed-status ${hasMore ? 'is-loading' : 'is-complete'}`} ref={loadMoreRef} aria-live="polite">
      {hasMore ? <><span className="feed-spinner" aria-hidden="true" />Memuat produk lainnya...</> : 'Semua produk sudah ditampilkan'}
    </div>
  </>
}

export function SectionTitle({ children, link }: { children: React.ReactNode; link?: string }) {
  return <div className="section-heading"><h2>{children}</h2>{link && <Link to={link}>View All <ChevronRight size={16} /></Link>}</div>
}

export function CategoryStrip({ selected }: { selected?: string }) {
  const stripRef = useRef<HTMLDivElement>(null)
  const [canScroll, setCanScroll] = useState(false)

  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return
    const updateOverflow = () => setCanScroll(strip.scrollWidth > strip.clientWidth + 1)
    updateOverflow()
    const observer = new ResizeObserver(updateOverflow)
    observer.observe(strip)
    return () => observer.disconnect()
  }, [])

  function moveCategories(direction: -1 | 1) {
    const strip = stripRef.current
    if (!strip) return
    const atEnd = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 2
    const atStart = strip.scrollLeft <= 2
    if (direction === 1 && atEnd) strip.scrollTo({ left: 0, behavior: 'smooth' })
    else if (direction === -1 && atStart) strip.scrollTo({ left: strip.scrollWidth - strip.clientWidth, behavior: 'smooth' })
    else strip.scrollBy({ left: direction * strip.clientWidth * 0.75, behavior: 'smooth' })
  }

  return <div className={`category-carousel${canScroll ? ' has-arrows' : ''}`}>
    {canScroll && <button type="button" className="category-arrow category-previous" onClick={() => moveCategories(-1)} aria-label="Kategori sebelumnya"><DesignIcon file="Group383.svg" size={48} /></button>}
    <div className="category-strip" aria-label="Pilihan kategori" ref={stripRef}>{categories.map(category => (
      <Link key={category.name} to={selected === category.name ? '/barang#filter' : `${catalogUrl(category.name)}#filter`} aria-current={selected === category.name ? 'true' : undefined}>
        <span className={category.hasCircularArtwork ? 'category-photo category-photo-native-circle' : 'category-photo'}>
          <img src={category.image} alt="" />
        </span>
        {category.name}
      </Link>
    ))}</div>
    {canScroll && <>
      <button type="button" className="category-arrow category-next" onClick={() => moveCategories(1)} aria-label="Kategori berikutnya"><DesignIcon file="Group384.svg" size={48} /></button>
      <p className="category-swipe-hint">Geser untuk lihat kategori lainnya <ChevronRight size={14} aria-hidden="true" /></p>
    </>}
  </div>
}

export function Hero() {
  const [slide, setSlide] = useState(0)
  const [lastInteraction, setLastInteraction] = useState<number>()
  const showLenovo = slide === 1

  useEffect(() => {
    const autoplayDelay = 3500
    const cooldown = 7000
    const firstDelay = lastInteraction === undefined
      ? autoplayDelay
      : Math.max(0, lastInteraction + cooldown - Date.now())
    let timer = window.setTimeout(advance, firstDelay)

    function advance() {
      setSlide(current => 1 - current)
      timer = window.setTimeout(advance, autoplayDelay)
    }

    return () => window.clearTimeout(timer)
  }, [lastInteraction])

  function selectSlide(index: number) {
    setLastInteraction(Date.now())
    setSlide(index)
  }

  const changeSlide = () => selectSlide(1 - slide)

  return (
    <section className="hero" aria-label="Banner BeeStash">
      <div className="hero-viewport">
        <div className="hero-track" data-slide={slide}>
          <div className="hero-art" inert={showLenovo}>
            <div className="hero-inner">
              <div className="hero-campus"><img src={figma('104-9', 'Image202609262220274585.png')} alt="Gedung Binus University" /></div>
              <div className="hero-copy">
                <p className="hero-tag">#DariBinusianUntukBinusian</p>
                <h1>Warisan Kating untuk <strong>Kosan Kamu!</strong></h1>
                <p>Beli perlengkapan kos pre-loved dari sesama Binusian. Lebih<br className="hero-line" /> murah, terpercaya, dan gampang COD-an di area kampus.</p>
              </div>
            </div>
          </div>
          <div className="hero-art hero-lenovo" inert={!showLenovo}>
            <div className="hero-lenovo-art" role="img" aria-label="Lenovo dengan tiga laptop">
              <img className="lenovo-logo" src="/figma/lenovo-logo.png" alt="" />
              <img className="lenovo-foldable" src="/figma/lenovo-foldable.png" alt="" />
              <img className="lenovo-laptop" src="/figma/lenovo-laptop.png" alt="" />
            </div>
          </div>
        </div>
        <button type="button" onClick={changeSlide} className="hero-arrow left" aria-label="Slide sebelumnya"><DesignIcon file="Group383.svg" size={48} /></button>
        <button type="button" onClick={changeSlide} className="hero-arrow right" aria-label="Slide berikutnya"><DesignIcon file="Group384.svg" size={48} /></button>
      </div>
      <div className="slider-dots">
        <button type="button" onClick={() => selectSlide(0)} aria-label="Slide 1" aria-pressed={!showLenovo} />
        <button type="button" onClick={() => selectSlide(1)} aria-label="Slide 2" aria-pressed={showLenovo} />
      </div>
    </section>
  )
}
