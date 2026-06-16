import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function Admin() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    const saved = localStorage.getItem('landing_admin')
    if (saved === 'true') setAuthed(true)
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const { data } = await supabase.from('landing_settings').select('*')
    const obj = {}
    ;(data || []).forEach(item => { obj[item.key] = item.value })
    setSettings(obj)
    setLoading(false)
  }

  const login = () => {
    if (password === settings.admin_password) {
      setAuthed(true)
      localStorage.setItem('landing_admin', 'true')
    } else {
      alert('Parol noto\'g\'ri!')
    }
  }

  const update = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const save = async () => {
    setSaving(true)
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from('landing_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key)
    }
    setMessage('Saqlandi! ✅')
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const uploadImage = async (file) => {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const fileName = `bonus-${Date.now()}.${ext}`

    const { data, error } = await supabase.storage
      .from('landing-images')
      .upload(fileName, file, { upsert: true })

    if (error) {
      alert('Rasm yuklashda xato: ' + error.message)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('landing-images')
      .getPublicUrl(fileName)

    update('hero_image', urlData.publicUrl)
    setUploading(false)
    setMessage('Rasm yuklandi! ✅')
    setTimeout(() => setMessage(''), 3000)
  }

  if (loading) {
    return (
      <div style={{ background: '#0A0A0F', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Yuklanmoqda...</div>
      </div>
    )
  }

  if (!authed) {
    return (
      <div style={{ background: '#0A0A0F', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '32px', width: '320px' }}>
          <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: '500', margin: '0 0 24px', textAlign: 'center' }}>Admin Panel</h2>
          <input
            type="password"
            placeholder="Parol"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 16px', color: '#fff', fontSize: '14px', outline: 'none', marginBottom: '12px' }}
          />
          <button onClick={login}
            style={{ width: '100%', background: '#F5A623', border: 'none', borderRadius: '10px', padding: '13px', color: '#0A0A0F', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
            Kirish
          </button>
        </div>
      </div>
    )
  }

  const Section = ({ title, children }) => (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
      <h3 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 16px' }}>{title}</h3>
      {children}
    </div>
  )

  const Field = ({ label, keyName, type = 'text', placeholder = '' }) => (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '6px' }}>{label}</label>
      <input
        type={type}
        value={settings[keyName] || ''}
        onChange={e => update(keyName, e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px', outline: 'none' }}
      />
    </div>
  )

  const TextArea = ({ label, keyName }) => (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '6px' }}>{label}</label>
      <textarea
        value={settings[keyName] || ''}
        onChange={e => update(keyName, e.target.value)}
        rows={3}
        style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px', outline: 'none', resize: 'vertical' }}
      />
    </div>
  )

  return (
    <div style={{ background: '#0A0A0F', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>

      {/* Header */}
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, background: '#0A0A0F', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '30px', height: '30px', background: '#F5A623', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '12px', color: '#0A0A0F' }}>C</div>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>Landing Admin Panel</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {message && <span style={{ color: '#4CAF50', fontSize: '13px' }}>{message}</span>}
          <a href="/" target="_blank"
            style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 14px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>
            Saytni ko'rish →
          </a>
          <button onClick={save} disabled={saving}
            style={{ background: '#F5A623', border: 'none', borderRadius: '8px', padding: '9px 20px', color: '#0A0A0F', fontSize: '13px', fontWeight: '500', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
          <button onClick={() => { setAuthed(false); localStorage.removeItem('landing_admin') }}
            style={{ background: 'rgba(255,0,0,0.1)', border: '0.5px solid rgba(255,0,0,0.2)', borderRadius: '8px', padding: '8px 14px', color: '#ff6b6b', fontSize: '13px', cursor: 'pointer' }}>
            Chiqish
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px' }}>

        <Section title="Asosiy matnlar">
          <Field label="Sarlavha" keyName="hero_title" />
          <TextArea label="Tavsif matni" keyName="hero_subtitle" />
          <Field label="Tugma matni" keyName="cta_button" />
        </Section>

        <Section title="Bonus / PDF">
          <Field label="Bonus badge matni" keyName="bonus_text" />
          <Field label="PDF nomi" keyName="pdf_title" />
          <Field label="PDF tavsifi" keyName="bonus_description" />
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '6px' }}>Bonus rasmi</label>
            {settings.hero_image && (
              <img src={settings.hero_image} alt="bonus"
                style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px', display: 'block' }} />
            )}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button onClick={() => fileRef.current?.click()}
                style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 14px', color: '#fff', fontSize: '13px', cursor: 'pointer' }}>
                {uploading ? 'Yuklanmoqda...' : '📎 Rasm yuklash'}
              </button>
              {settings.hero_image && (
                <button onClick={() => update('hero_image', '')}
                  style={{ background: 'rgba(255,0,0,0.1)', border: '0.5px solid rgba(255,0,0,0.2)', borderRadius: '8px', padding: '8px 14px', color: '#ff6b6b', fontSize: '13px', cursor: 'pointer' }}>
                  O'chirish
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => e.target.files[0] && uploadImage(e.target.files[0])} />
          </div>
        </Section>

        <Section title="O'quvchi natijasi">
          <Field label="Ism" keyName="student_name" />
          <Field label="Natija (masalan: 8 mln/oy)" keyName="student_result" />
          <Field label="Sarlavha (masalan: Marketing bitiruvchisi)" keyName="student_label" />
        </Section>

        <Section title="Statistika">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="1-son" keyName="stat1_number" />
            <Field label="1-izoh" keyName="stat1_label" />
            <Field label="2-son" keyName="stat2_number" />
            <Field label="2-izoh" keyName="stat2_label" />
            <Field label="3-son" keyName="stat3_number" />
            <Field label="3-izoh" keyName="stat3_label" />
          </div>
        </Section>

        <Section title="Ishonch belgilari">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <Field label="1-chi" keyName="trust1" />
            <Field label="2-chi" keyName="trust2" />
            <Field label="3-chi" keyName="trust3" />
          </div>
        </Section>

        <Section title="Ranglar">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '6px' }}>Asosiy rang (aksent)</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" value={settings.primary_color || '#F5A623'}
                  onChange={e => update('primary_color', e.target.value)}
                  style={{ width: '40px', height: '36px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'none' }} />
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{settings.primary_color}</span>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '6px' }}>Fon rangi</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" value={settings.bg_color || '#0A0A0F'}
                  onChange={e => update('bg_color', e.target.value)}
                  style={{ width: '40px', height: '36px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'none' }} />
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{settings.bg_color}</span>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Sozlamalar">
          <Field label="Telegram kanal linki" keyName="telegram_channel" placeholder="https://t.me/cdsmarkazi" />
          <Field label="Admin parol" keyName="admin_password" type="password" />
        </Section>

        <button onClick={save} disabled={saving}
          style={{ width: '100%', background: '#F5A623', border: 'none', borderRadius: '10px', padding: '15px', color: '#0A0A0F', fontSize: '15px', fontWeight: '500', cursor: 'pointer', opacity: saving ? 0.7 : 1, marginBottom: '40px' }}>
          {saving ? 'Saqlanmoqda...' : 'Hammasini saqlash ✓'}
        </button>
      </div>
    </div>
  )
}