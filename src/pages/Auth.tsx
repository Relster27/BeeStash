import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { demoAccount, emailCode, figma } from '../data'
import { useMarketplace } from '../state'
import { Brand, DesignIcon, submitForm } from '../components/layout'
import { ActionLink, Button, Field, Modal } from '../components/ui'

const campusEmail = /^[^\s@]+@(?:[a-z0-9-]+\.)*binus\.ac\.id$/i
const demoPassword = 'beestash-demo'

async function passwordDigest(id: string, password: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(id + ':' + password))
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('')
}

function AuthBackground({ children, frame, mark = true }: { children: ReactNode; frame: string; mark?: boolean }) {
  return (
    <main className="auth-screen" style={{
      backgroundImage: `url(${figma(frame, 'Image30.png')}), url(${figma(frame, 'Image32.svg')})`,
    }}>
      {mark && <Brand className="auth-brand" />}
      {children}
    </main>
  )
}

function AuthFeature({ register = false }: { register?: boolean }) {
  const frame = register ? '491-889' : '491-890'
  return (
    <aside className="auth-feature">
      <span className="feature-float left"><DesignIcon frame={frame} file={register ? 'Frame.svg' : 'Frame3.svg'} size={28} /></span>
      <span className="feature-float right"><DesignIcon frame={frame} file={register ? 'Frame1.svg' : 'Frame4.svg'} size={28} /></span>
      <div className="feature-search"><DesignIcon frame={frame} file={register ? 'Frame2.svg' : 'Frame5.svg'} size={40} /></div>
      <h2>{register ? 'Bergabung' : 'Temukan'}</h2>
      <p>Beli barang pre-loved dari kating, hemat budget, dan langsung COD di sekitar kampus tanpa ribet.</p>
      <strong>#DARIBINUSIANUNTUKBINUSIAN</strong>
    </aside>
  )
}

export function Login() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { profiles, credentials, setSignedIn } = useMarketplace()
  const [loading, setLoading] = useState(false)
  const [pendingId, setPendingId] = useState('')
  const [error, setError] = useState('')
  const [visible, setVisible] = useState(false)
  const [recovery, setRecovery] = useState(false)

  useEffect(() => {
    if (!state?.signOut) return
    setSignedIn(false)
    navigate('/masuk', { replace: true })
  }, [state, setSignedIn, navigate])

  useEffect(() => {
    if (!pendingId) return
    const timer = window.setTimeout(() => navigate('/masuk/verifikasi', { state: { accountId: pendingId, returnTo: state?.returnTo } }), 450)
    return () => window.clearTimeout(timer)
  }, [pendingId, navigate, state])

  const login = submitForm(async form => {
    if (loading) return
    const email = String(form.get('email')).trim().toLowerCase()
    const password = String(form.get('password'))
    const id = Object.keys(profiles).find(key => profiles[key].email.toLowerCase() === email)
    if (!campusEmail.test(email) || !id) {
      setError('Masukkan email Binus yang terdaftar.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const matches = id === 'demo' ? password === demoPassword : credentials[id] === await passwordDigest(id, password)
      if (!matches) {
        setError('Email atau password tidak sesuai.')
        setLoading(false)
        return
      }
      setPendingId(id)
    } catch {
      setError('Verifikasi password tidak tersedia di browser ini.')
      setLoading(false)
    }
  })

  return (
    <AuthBackground frame={loading ? '491-891' : '491-890'}>
      <div className="auth-card login-card" inert={loading}>
        <div className="auth-form-pane">
          <Brand />
          <h1>Selamat Datang</h1>
          <p className="muted auth-intro">Masuk untuk mulai mencari barang pre-loved anak kos.</p>
          {state?.returnTo && <p className="status-text">Masuk untuk melanjutkan.</p>}
          <form className="auth-form" onSubmit={login}>
            <Field label="Email Binus" name="email" type="email" autoComplete="username" placeholder="email@binus.ac.id" icon={<DesignIcon frame="491-890" file="Frame.svg" />} required />
            <Field label="Password" name="password" type={visible ? 'text' : 'password'} autoComplete="current-password" required placeholder="••••••••••••" icon={<DesignIcon frame="491-890" file="Frame1.svg" />} trailing={<button type="button" className="icon-button password-toggle" onClick={() => setVisible(!visible)} aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button>} />
            {error && <p className="form-error" role="alert">{error}</p>}
            <Button type="submit">Masuk</Button>
          </form>
          <button type="button" className="auth-link forgot-link" onClick={() => setRecovery(true)}>Lupa Password?</button>
          <p className="auth-switch">Belum punya akun? <Link to="/daftar" state={state}>Daftar di sini</Link></p>
          <p className="auth-demo">Akun demo · {profiles.demo?.email ?? demoAccount.email} / {demoPassword}</p>
        </div>
        <AuthFeature />
      </div>
      {loading && <div className="loading-overlay" role="status" aria-label="Memuat"><img src={figma('491-891', 'Property1Group17.svg')} alt="" /></div>}
      {recovery && <Modal title="Lupa Password?" onClose={() => setRecovery(false)}>
        <p>Pemulihan password melalui email belum tersedia. Akun demo menggunakan password {demoPassword}.</p>
      </Modal>}
    </AuthBackground>
  )
}

export function Register() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { profiles } = useMarketplace()
  const [error, setError] = useState('')
  const [policy, setPolicy] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = submitForm(async form => {
    if (saving) return
    if (form.get('new-password') !== form.get('confirm-password')) {
      setError('Konfirmasi password harus sama.')
      return
    }
    const draft = {
      name: String(form.get('name')).trim(), nim: String(form.get('nim')).trim(),
      email: String(form.get('email')).trim().toLowerCase(), phone: String(form.get('phone')).trim(), address: '',
    }
    if (!draft.name || !campusEmail.test(draft.email) || !/^\+?[\d\s-]{8,20}$/.test(draft.phone)) {
      setError('Periksa nama, email Binus, dan nomor WhatsApp.')
      return
    }
    if (Object.values(profiles).some(profile => profile.email.toLowerCase() === draft.email)) {
      setError('Email ini sudah terdaftar. Silakan masuk.')
      return
    }
    setSaving(true)
    try {
      const accountId = crypto.randomUUID()
      const credential = await passwordDigest(accountId, String(form.get('new-password')))
      navigate('/daftar/verifikasi', { state: { draft, accountId, credential, returnTo: state?.returnTo } })
    } catch {
      setError('Pendaftaran tidak dapat dilanjutkan di browser ini.')
      setSaving(false)
    }
  })

  return (
    <AuthBackground frame="491-889" mark={false}>
      <div className="auth-card register-card">
        <div className="auth-form-pane">
          <Brand />
          <h1>Buat Akun Baru</h1>
          <p className="muted auth-intro">Daftar menggunakan data mahasiswa Anda untuk mulai jual-beli barang pre-loved dengan aman.</p>
          <form className="auth-form" onSubmit={submit}>
            <div className="register-fields">
              <Field label="Nama Lengkap" name="name" autoComplete="name" required />
              <Field label="NIM" name="nim" required inputMode="numeric" pattern="[0-9]{8,12}" placeholder="2401234567" />
              <Field label="Email Kampus" name="email" type="email" autoComplete="email" required placeholder="@binus.ac.id" />
              <Field label="No. WhatsApp" name="phone" type="tel" autoComplete="tel" required placeholder="0812xxxxxx" />
              <Field label="Password" name="new-password" type="password" autoComplete="new-password" minLength={6} required placeholder="••••••••" />
              <Field label="Konfirmasi Password" name="confirm-password" type="password" autoComplete="new-password" minLength={6} required placeholder="••••••••" />
            </div>
            <div className="terms"><input type="checkbox" aria-label="Setujui syarat dan kebijakan privasi" required /><span>Saya menyetujui <button type="button" className="auth-link" onClick={() => setPolicy('Syarat & Ketentuan')}>Syarat &amp; Ketentuan</button> serta <button type="button" className="auth-link" onClick={() => setPolicy('Kebijakan Privasi')}>Kebijakan Privasi</button> BeeStash.</span></div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <Button type="submit" disabled={saving}>{saving ? 'Memproses…' : 'Daftar Sekarang'}</Button>
          </form>
          <p className="auth-switch">Sudah punya akun? <Link to="/masuk" state={state}>Masuk di sini</Link></p>
        </div>
        <AuthFeature register />
      </div>
      {policy && <Modal title={policy} onClose={() => setPolicy('')}><p>Pendaftaran demo disimpan di browser ini setelah verifikasi.</p></Modal>}
    </AuthBackground>
  )
}

export function Verification({ register = false }: { register?: boolean }) {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { activateAccount, profiles } = useMarketplace()
  const [feedback, setFeedback] = useState('')
  const entry = register ? '/daftar' : '/masuk'
  if (!state?.accountId || (register ? !state.draft || !state.credential : !profiles[state.accountId])) {
    return <Navigate to={entry} replace />
  }
  const submit = submitForm(form => {
    if (form.get('code') !== emailCode) {
      setFeedback(`Kode tidak sesuai. Gunakan kode demo ${emailCode}.`)
      return
    }
    activateAccount(state.accountId, register ? state.draft : undefined, register ? state.credential : undefined)
    const returnTo: unknown = state.returnTo
    navigate(typeof returnTo === 'string' && /^\/(?![/\\])/.test(returnTo) ? returnTo : '/barang', { replace: true })
  })
  return (
    <AuthBackground frame="491-897">
      <section className="verification-card">
        <Brand />
        <h1>Verifikasi akun</h1>
        <p className="auth-demo">Gunakan kode demo {emailCode} untuk melanjutkan.</p>
        <form onSubmit={submit}>
          <Field label="Kode verifikasi" name="code" required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{5}" placeholder="e.g. 28024" icon={<DesignIcon frame="491-897" file="Frame.svg" />} />
          {feedback && <p role="status" className="verification-feedback">{feedback}</p>}
          <div className="verification-actions">
            <Button type="submit">Verifikasi</Button>
            <Link className="button button-yellow" to={entry} state={{ returnTo: state.returnTo }}>Kembali</Link>
          </div>
        </form>
      </section>
    </AuthBackground>
  )
}

const confirmation = {
  listing: 'Barang berhasil ditambahkan ke etalase',
  edit: 'Perubahan barang berhasil disimpan',
  order: 'Pesanan demo berhasil dibuat',
}

export function Confirmation({ kind }: { kind: keyof typeof confirmation }) {
  const { state } = useLocation()
  if (!state?.completed) return <Navigate to={kind === 'order' ? '/keranjang' : '/profil'} replace />
  return (
    <main className="confirmation-screen" style={{ backgroundImage: `url(${figma(kind === 'order' ? '495-1590' : '491-873', 'Image33.svg')})` }}>
      <section className="confirmation-card">
        <Brand to="/barang" />
        <h1>{confirmation[kind]}</h1>
        <ActionLink to={kind === 'order' ? '/profil?tab=riwayat' : state.productId ? `/barang/${state.productId}` : '/profil'}>{kind === 'order' ? 'Lihat riwayat belanja' : 'Lihat barang'}</ActionLink>
      </section>
    </main>
  )
}
