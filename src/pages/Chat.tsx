import { useEffect, useRef, useState } from 'react'
import { ChevronDown, MessageSquare, Paperclip, Send, X } from 'lucide-react'
import { figma } from '../data'
import type { ChatMessage } from '../data'
import { readLocalFile } from '../files'
import { useMarketplace } from '../state'
import { Footer, MarketplaceHeader } from '../components/layout'

export function Chat() {
  const { account, messages, setMessages } = useMarketplace()
  const [draft, setDraft] = useState('')
  const [attachment, setAttachment] = useState<ChatMessage['attachment']>()
  const [attachmentStatus, setAttachmentStatus] = useState('')
  const [reading, setReading] = useState(false)
  const [unread, setUnread] = useState(true)
  const [filter, setFilter] = useState('all')
  const thread = useRef<HTMLDivElement>(null)
  const upload = useRef<HTMLInputElement>(null)
  const avatar = figma('223-1379', 'Profile.png')

  useEffect(() => {
    if (thread.current) thread.current.scrollTop = thread.current.scrollHeight
  }, [messages])

  function sendMessage() {
    const text = draft.trim()
    if ((!text && !attachment) || reading) return
    const message: ChatMessage = { id: crypto.randomUUID(), author: 'John', text, time: new Date().toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' }), attachment }
    setMessages(previous => [...previous, message])
    setUnread(false)
    setDraft('')
    setAttachment(undefined)
    setAttachmentStatus('')
  }

  return (
    <>
      <MarketplaceHeader variant="chat" />
      <main className="market-wrap chat-page">
        <section className="chat-card">
          <h1><MessageSquare />Pesan</h1>
          <div className="chat-layout">
            <aside className="conversations">
              <div className="conversation-filter">
                <select aria-label="Filter pesan" value={filter} onChange={event => setFilter(event.target.value)}><option value="all">Semua pesan</option><option value="unread">Belum dibaca</option></select><ChevronDown size={18} aria-hidden="true" />
              </div>
              {filter === 'all' || unread ? <button type="button" className="conversation" onClick={() => { setUnread(false); setFilter('all'); thread.current?.focus() }}>
                <img src={avatar} alt="" /><span><strong>Jayson{unread ? ' · Baru' : ''}</strong><small>{messages.at(-1)?.text || messages.at(-1)?.attachment?.name}</small></span><time>{messages.at(-1)?.time}</time>
              </button> : <p className="chat-empty">Tidak ada pesan yang belum dibaca.</p>}
            </aside>
            <div className="chat-main">
              <header className="chat-contact"><img src={avatar} alt="" /><span><strong>Jayson</strong><small>Percakapan demo di browser ini</small></span></header>
              <div className="chat-scroll" role="log" tabIndex={0} aria-label="Percakapan dengan Jayson" ref={thread}>
                <div className="message-list">
                  {messages.map(message => <article className={`message ${message.author === 'John' ? 'outbound' : ''}`} key={message.id}>
                    {message.author !== 'John' && <img src={avatar} alt="" />}
                    <div><div className="message-bubble"><strong>{message.author === 'John' ? account.name : message.author}</strong>{message.text && <p>{message.text}</p>}{message.attachment && <a href={message.attachment.url} download={message.attachment.name}><Paperclip size={14} />{message.attachment.name}</a>}</div><time>{message.time}</time></div>
                  </article>)}
                </div>
              </div>
              {attachment && <div className="chat-attachment">{attachment.name}<button type="button" className="icon-button" aria-label="Hapus lampiran" onClick={() => setAttachment(undefined)}><X size={16} /></button></div>}
              {attachmentStatus && <p role="status" className="chat-attachment">{attachmentStatus}</p>}
              <form className="composer" onSubmit={event => { event.preventDefault(); sendMessage() }}>
                <input aria-label="Ketik pesan di sini" placeholder="Ketik pesan di sini" value={draft} onChange={event => setDraft(event.target.value)} />
                <input hidden type="file" ref={upload} onChange={async event => {
                  const file = event.target.files?.[0]
                  event.target.value = ''
                  if (!file) return
                  if (file.size > 1024 * 1024) { setAttachmentStatus('Lampiran maksimal 1 MB.'); return }
                  setAttachmentStatus('')
                  setReading(true)
                  try { setAttachment({ name: file.name, url: await readLocalFile(file) }) }
                  catch { setAttachmentStatus('Lampiran gagal dibaca.') }
                  finally { setReading(false) }
                }} />
                <button type="button" className="icon-button" disabled={reading} aria-label="Lampirkan berkas" onClick={() => upload.current?.click()}><Paperclip size={20} /></button>
                <button type="submit" className="icon-button" aria-label="Kirim pesan" disabled={reading || (!draft.trim() && !attachment)}><Send size={20} /></button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
