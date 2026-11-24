export function figma(frame: string, file: string) {
  return `/figma/${frame}-img${file}`
}

const home = (file: string) => figma('104-9', file)
export const money = (value: number) => `Rp${new Intl.NumberFormat('id-ID').format(value)}`

export interface Product {
  id: string
  ownerId?: string
  name: string
  price: number | null
  originalPrice?: number
  discount?: number
  image?: string
  category: string
  condition: 'Barang Bekas' | 'Barang Baru'
  description?: string
  reason?: string
  weight?: string
  stock?: number
  address?: string
  published?: string
}

export const categories = [
  ['Perawatan', 'Image50.png'], ['Buku', 'Image49.png'], ['ATK', 'Image48.png'],
  ['Elektronik', 'Ellipse43.png'], ['Perabotan Kos', 'Image35.png'], ['Hobi', 'Image31.png'],
  ['Dekorasi', 'Image32.png'], ['Fashion', 'Image33.png'], ['Olahraga', 'Image51.png'],
  ['Tas', 'Image53.png'], ['Device', 'Image55.png'], ['Alat Masak', 'Image56.png'],
].map(([name, file]) => ({ name, image: home(file), hasCircularArtwork: file === 'Ellipse43.png' }))

export const laptopDescription = [
  'Laptop MB Ne0 A18 Pro 8GB 256GB | 512GB\nGaransi Resmi Indonesia',
  'Performa & Perangkat Keras\n• Chip: Menggunakan chip Apple A18 Pro yang bertenaga untuk tugas harian dan aktivitas berbasis AI.\n• Baterai: Ketahanan daya hingga 16 jam untuk penggunaan nirkabel dan streaming video.\n• Port: Dilengkapi dengan 3 port (USB-C USB 3, USB-C USB 2, dan jek headphone 3,5 mm).',
  'Layar & Audio\n• Layar: Liquid Retina 13 inci dengan dukungan 1 miliar warna dan tingkat kecerahan tinggi (3,6 juta piksel).\n• Kamera: Kamera FaceTime HD 1080p untuk kualitas video yang jernih.\n• Audio: Sistem dua speaker pancar samping dengan dukungan Audio Spasial dan Dolby Atmos, serta deretan mikrofon ganda.',
  'Fitur Unggulan\n• Apple Intelligence: Sistem kecerdasan personal untuk membantu penulisan (Writing Tools), kreasi gambar (Genmoji), dan pengeditan foto (Clean Up).\n• Keamanan: Dilengkapi dengan Touch ID untuk akses cepat dan aman, serta enkripsi data FileVault.\n• Desain: Tersedia dalam empat pilihan warna ikonik: Silver, Blush, Citrus, dan Indigo.\n• Sistem Operasi: Menjalankan macOS yang intuitif dan terintegrasi mulus dengan ekosistem iPhone.',
  'Isi kotak:\n• Unit Ne0 A18 Pro\n• Adaptor Daya USB-C\n• Kabel USB-C ke MagSafe 3',
].join('\n\n')

export const laptopReview = {
  author: 'John A.',
  rating: 5,
  text: 'Kondisi laptop sesuai deskripsi. Saya sempat cek baterai dan keyboard saat ketemu di kampus.',
}

type CatalogRow = [id: string, name: string, price: number | null, category: string, file?: string, originalPrice?: number, discount?: number]

const catalogRows: CatalogRow[] = [
  ['sendal', 'Sendal Charles & Keith', 125000, 'Fashion', 'Image29.png'],
  ['macbook-m2', 'Laptop Apple Macbook M2 Pro (2021) (Bekas)', 2000000, 'Elektronik', 'Image5.png', 4000000, 75],
  ['kulkas', 'Kulkas', 50000000, 'Perabotan Kos', 'Image3.png'],
  ['rice-cooker', 'Rice Cooker GM Bear', 230000, 'Alat Masak', 'Image4.png'],
  ['dartboard', 'Dartboard', null, 'Hobi', 'Image22.png'],
  ['kalkulator', 'Kalkulator', 201000, 'ATK'],
  ['fisika', 'Buku Fisika (ComPhys)', 100000000, 'Buku'],
  ['tomie', 'Novel Tomie', 21000, 'Buku'],
  ['alat-bantu-dengar', 'Alat bantu dengar', 5000000, 'Elektronik'],
  ['icecube', 'Sepatu IceCube', null, 'Fashion'],
  ['kipas-laptop', 'Kipas Laptop', 30000, 'Device'],
  ['ram', 'RAM 32 GB', 4000000, 'Device'],
  ['termodinamika', 'Buku Termodinamika', 50000, 'Buku', undefined, 100000, 50],
  ['galon', 'Galon kosong', 10000, 'Perabotan Kos'],
  ['kulkas-mini', 'Kulkas mini kos', null, 'Perabotan Kos'],
  ['ransel', 'Tas Ransel', 30000, 'Tas', 'Image53.png'],
  ['parfum', 'Parfum ABC', 1000000, 'Perawatan'],
  ['masterkey', 'Keyboard MasterKey', 41000, 'Device'],
  ['shin-protector', 'Shin Protector', 20000, 'Olahraga', undefined, 100000, 80],
  ['box', 'Box Container', 50000, 'Perabotan Kos'],
  ['gitar', 'Full Set Gitar Listrik', 4000000, 'Hobi'],
  ['redmi', 'Smart Watch Redmi', 3000000, 'Elektronik', 'Image31.png'],
  ['kipas', 'Kipas Angin', 10000, 'Perabotan Kos'],
  ['rice-cooker-lop', 'Rice Cooker Lop', null, 'Alat Masak'],
  ['tas-tabung', 'Tas Tabung', 20000, 'Tas'],
  ['ransel-biru', 'Tas Ransel Biru', 20000, 'Tas'],
  ['polo', 'Baju Polo', 50000, 'Fashion', undefined, 70000, 28],
  ['red-gem', 'Keyboard Red Gem', 500000, 'Device'],
  ['e-pan', 'E-Pan AllTou', null, 'Alat Masak'],
  ['dyson', 'Catokan Dyson', 2000000, 'Perawatan'],
  ['tomie-2', 'Novel Tomie', 5000, 'Buku'],
  ['ikan-hiasan', 'Ikan Hiasan', 70000, 'Dekorasi'],
  ['nokia', 'Smart Watch Nokia', 1000000, 'Elektronik'],
  ['finger-board', 'Finger Board', null, 'Hobi'],
  ['sweater', 'Sweater', 50000, 'Fashion'],
  ['toefl', 'Buku TOEFL', 50000, 'Buku', undefined, 200000, 75],
  ['catokan', 'Catokan S', 400000, 'Perawatan', undefined, 2000000, 80],
  ['tumbler', 'Karet Tumbler', 1000, 'Perabotan Kos'],
  ['sepatu-olahraga', 'Sepatu Olahraga', 500000, 'Olahraga'],
  ['ekonomi', 'Buku Ekonomi Pak Ekno', 20000, 'Buku'],
]

const catalogProductImages: Record<string, string> = {
  kalkulator: '/products/kalkulator.jpg',
  fisika: '/products/fisika.jpg',
  tomie: '/products/tomie.png',
  'tomie-2': '/products/tomie.png',
  'alat-bantu-dengar': '/products/alat-bantu-dengar.jpg',
  icecube: '/products/icecube.jpg',
  'kipas-laptop': '/products/kipas-laptop.jpg',
  ram: '/products/ram.jpg',
  termodinamika: '/products/termodinamika.jpg',
  galon: '/products/galon.jpg',
  'kulkas-mini': '/products/kulkas-mini.jpg',
  parfum: '/products/parfum.jpg',
  masterkey: '/products/masterkey.jpg',
  'shin-protector': '/products/shin-protector.jpg',
  box: '/products/box.jpg',
  gitar: '/products/gitar.jpg',
  kipas: '/products/kipas.jpg',
  'rice-cooker-lop': '/products/rice-cooker-lop.jpg',
  'tas-tabung': '/products/tas-tabung.jpg',
  'ransel-biru': '/products/ransel-biru.jpg',
  polo: '/products/polo.jpg',
  'red-gem': '/products/red-gem.jpg',
  'e-pan': '/products/e-pan.png',
  dyson: '/products/dyson.jpg',
  'ikan-hiasan': '/products/ikan-hiasan.jpg',
  nokia: '/products/nokia.jpg',
  'finger-board': '/products/finger-board.jpg',
  sweater: '/products/sweater.jpg',
  toefl: '/products/toefl.jpg',
  catokan: '/products/catokan.jpg',
  tumbler: '/products/tumbler.jpg',
  'sepatu-olahraga': '/products/sepatu-olahraga.jpg',
  ekonomi: '/products/ekonomi.jpg',
}

export const catalog: Product[] = catalogRows.map(([id, name, price, category, file, originalPrice, discount]) => ({
  id, name, price, category, image: file ? home(file) : catalogProductImages[id], originalPrice, discount,
  condition: 'Barang Bekas',
  ...(id === 'macbook-m2' && { description: laptopDescription, weight: '100g', published: '2 October 2026 (20:00)' }),
}))

export const featured = catalog.filter(product => product.discount).slice(0, 5)

export const promotions = [
  { title: 'Study Lamp', value: '80% OFF', background: 'Rectangle14.png', image: 'Image61.png', category: 'Perabotan Kos' },
  { title: 'Paket Hemat! Towel Set', value: '20%', background: 'Rectangle15.png', image: 'Image58.png', category: 'Perabotan Kos' },
  { title: 'Lengkapi Kebutuhan Kuliahmu !', value: '40%', background: 'Image59.png', image: 'Image48.png', category: 'ATK' },
]

export const demoAccount = {
  name: 'Anton Chigurh', nim: '2802234567', email: 'bina.nusantara@binus.ac.id',
  phone: '+62 812-3456-7890', address: 'Jl. Rawa Belong Blok C, No. 67',
}

export const initialListings: Product[] = [
  { id: 'buku-kalkulus', name: 'Buku Kalkulus 1', price: 50000, image: '/products/buku-kalkulus.jpg', category: 'Buku', condition: 'Barang Bekas', weight: '800g', stock: 1, reason: 'Sudah tidak dipakai', address: demoAccount.address, published: '20/09/2026', description: 'Buku Kalkulus 1 terbitan Julan Hernadi, dipakai selama 3 tahun, kondisi layak pakai, robek-robek sedikit akibat pemakaian. halaman masih lengkap semua, dan materi masih relevan untuk matematika semester 1-3' },
  { id: 'kipas-kos', name: 'Kipas Angin', price: 10000, image: '/products/kipas.jpg', category: 'Perabotan Kos', condition: 'Barang Bekas', stock: 1 },
]

export interface CartItem {
  id: string
  ownerId?: string
  name: string
  price: number
  quantity: number
  image?: string
  note?: string
}

export const initialCart: CartItem[] = [
  { id: 'galaxy-m33', name: 'Galaxy M33', price: 16999, quantity: 1, note: 'kondisi baik' },
  { id: 'samsung-ultra', name: 'Samsung Ultra 22', price: 16999, quantity: 1, note: 'preloved' },
  { id: 'cart-kulkas', name: 'Kulkas', image: home('Image3.png'), price: 20000, quantity: 1, note: 'preloved' },
]

export const emailCode = '28024'
export const serviceFee = 1000
export const deliveryOptions = [
  { id: 'courier', title: 'Kurir reguler', description: 'Estimasi 2–4 hari', price: 10000 },
  { id: 'campus', title: 'Ambil di kampus', description: 'Atur jadwal dengan penjual', price: 0 },
] as const

export interface ChatMessage {
  id: string
  author: 'Jayson' | 'John'
  text: string
  time: string
  attachment?: { name: string; url: string }
}

export const initialMessages: ChatMessage[] = [
  { id: 'john-1', author: 'John', text: 'Thank you !', time: '12:02 PM' },
  { id: 'jayson-1', author: 'Jayson', text: 'Thank you !', time: '12:02 PM' },
]
