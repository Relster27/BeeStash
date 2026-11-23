import { useEffect, useRef, useState } from 'react'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Box, X } from 'lucide-react'

type Tone = 'primary' | 'yellow' | 'outline' | 'danger' | 'subtle'

export function Button({ tone = 'primary', className = '', type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone }) {
  return <button type={type} className={`button button-${tone} ${className}`} {...props} />
}

export function ActionLink({ to, children, tone = 'primary', className = '' }: { to: string; children: ReactNode; tone?: Tone; className?: string }) {
  return <Link to={to} className={`button button-${tone} ${className}`}>{children}</Link>
}

export function Field({ label, icon, trailing, ...input }: InputHTMLAttributes<HTMLInputElement> & { label: string; icon?: ReactNode; trailing?: ReactNode }) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={input.id ?? input.name}>{label}</label>
      <div className="input-shell">
        {icon}
        <input {...input} id={input.id ?? input.name} />
        {trailing}
      </div>
    </div>
  )
}

export function TextArea({ label, name, placeholder, defaultValue, rows = 3 }: { label: string; name: string; placeholder?: string; defaultValue?: string; rows?: number }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <textarea className="input-shell textarea" name={name} placeholder={placeholder} defaultValue={defaultValue} rows={rows} />
    </label>
  )
}

export function ProductImage({ src, name, className = '' }: { src?: string; name: string; className?: string }) {
  const [failedSource, setFailedSource] = useState<string>()
  return src && src !== failedSource
    ? <img className={`product-image ${className}`} src={src} alt={name} loading="lazy" decoding="async" onError={() => setFailedSource(src)} />
    : <span className={`product-image product-image-missing ${className}`} role="img" aria-label={`Foto ${name} tidak tersedia`}><Box aria-hidden="true" /></span>
}

export function Modal({ title, description, children, onClose }: { title: string; description?: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    return () => { dialog?.close() }
  }, [])
  return (
    <dialog ref={ref} className="modal" aria-labelledby="dialog-title" onCancel={event => { event.preventDefault(); onClose() }}>
      <button className="icon-button modal-close" type="button" onClick={onClose} aria-label="Tutup"><X size={20} /></button>
      <h2 id="dialog-title">{title}</h2>
      {description && <p className="muted">{description}</p>}
      <div className="modal-content">{children}</div>
    </dialog>
  )
}
