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
  const [uploadingBg, setUploadingBg] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingStudent, setUploadingStudent] = useState(false)
  const fileRef = useRef()
  const bgFileRef = useRef()
  const logoRef = useRef()
  const studentImgRef = useRef()

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
    if (password === 'Admin2025!') {
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

  const uploadFile = async (file, folder, stateKey, stateSetter) => {
    stateSetter(true)
    const ext = file.name.split('.').pop()
    const fileName = `${folder}-${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('landing-images').upload(fileName, file, { upsert: true })
    if (error) {
      alert('Yuklashda xato: ' + error.message)
      stateSetter(false)
      return
    }
    const { data: urlData } = supabase.storage.from('landing-images').getPublicUrl(fileName)
    update(stateKey, urlData.publicUrl)
    stateSetter(false)
    setMessage('Yuklandi! ✅')
    setTimeout(() => setMessage(''), 3000)
  }

  if (loading) {
    return (
      <div style={{ background: '#0B1929', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Yuklanmoqda...</div>
      </div>
    )
  }

  if (!authed) {
    return (
      <div style={{ background: '#0B1929', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '32px', width: '320px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', justifyContent: 'center' }}>
            <div style={{ width: '32px', height: '32px', background: '#1E88E5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#fff' }}>C</div>
            <span style={{ color: '#fff', fontSize: '15px', fontWeight: '500' }}>Admin Panel</span>
          </div>
          <input
            type="password"
            placeholder="Parol"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 16px', color: '#fff', fontSize: '16px', outline: 'none', marginBottom: '12px' }}
          />
          <button onClick={login}
            style={{ width: '100%', background: '#1E88E5', border: 'none', borderRadius: '10px', padding: '13px', color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
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
        style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '16px', outline: 'none' }}
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
        style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '16px', outline: 'none', resize: 'vertical' }}
      />
    </div>
  )

  return (
    <div style={{ background: '#0B1929', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>

      {/* Header */}
      <div style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(255,255,255,0.08)', background: '#0B1929' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {settings.logo_url ? (
            <img src={settings.logo_url} alt="logo" style={{ height: '28px', objectFit: 'contain' }} />
          ) : (
            <div style={{ width: '28px', height: '28px', background: '#1E88E5', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px', color: '#fff' }}>C</div>
          )}
          <span style={{ fontSize: '14px', fontWeight: '500' }}>Landing Admin Panel</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {message && <span style={{ color: '#4CAF50', fontSize: '13px' }}>{message}</span>}
          <a href="/" target="_blank"
            style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '7px 14px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>
            Saytni ko'rish →
          </a>
          <button onClick={save} disabled={saving}
            style={{ background: '#1E88E5', border: 'none', borderRadius: '8px', padding: '8px 20px', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
          <button onClick={() => { setAuthed(false); localStorage.removeItem('landing_admin') }}
            style={{ background: 'rgba(255,0,0,0.1)', border: '0.5px solid rgba(255,0,0,0.2)', borderRadius: '8px', padding: '7px 14px', color: '#ff6b6b', fontSize: '13px', cursor: 'pointer' }}>
            Chiqish
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px' }}>

        {/* Logo */}
        <Section title="Logo">
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '6px' }}>
              CDS Logotipi (sarlavha qatorida ko'rinadi)
            </label>
            {settings.logo_url && (
              <img src={settings.logo_url} alt="logo"
                style={{ height: '48px', maxWidth: '200px', objectFit: 'contain', borderRadius: '8px', marginBottom: '8px', display: 'block', background: 'rgba(255,255,255,0.04)', padding: '8px' }} />
            )}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button onClick={() => logoRef.current?.click()}
                style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 14px', color: '#fff', fontSize: '13px', cursor: 'pointer' }}>
                {uploadingLogo ? 'Yuklanmoqda...' : '🖼️ Logo yuklash'}
              </button>
              {settings.logo_url && (
                <button onClick={() => update('logo_url', '')}
                  style={{ background: 'rgba(255,0,0,0.1)', border: '0.5px solid rgba(255,0,0,0.2)', borderRadius: '8px', padding: '8px 14px', color: '#ff6b6b', fontSize: '13px', cursor: 'pointer' }}>
                  O'chirish
                </button>
              )}
            </div>
            <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => e.target.files[0] && uploadFile(e.target.files[0], 'logo', 'logo_url', setUploadingLogo)} />
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', margin: '8px 0 0' }}>
              Tavsiya: PNG, shaffof fon, 200x60px
            </p>
          </div>
        </Section>

        {/* Fon rasm */}
        <Section title="Fon rasmi (sizning rasmingiz)">
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '6px' }}>
              Professional foto (kesma PNG bo'lsa eng yaxshi)
            </label>
            {settings.bg_image && (
              <img src={settings.bg_image} alt="bg"
                style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px', display: 'block', opacity: 0.8 }} />
            )}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button onClick={() => bgFileRef.current?.click()}
                style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 14px', color: '#fff', fontSize: '13px', cursor: 'pointer' }}>
                {uploadingBg ? 'Yuklanmoqda...' : '🖼️ Fon rasmi yuklash'}
              </button>
              {settings.bg_image && (
                <button onClick={() => update('bg_image', '')}
                  style={{ background: 'rgba(255,0,0,0.1)', border: '0.5px solid rgba(255,0,0,0.2)', borderRadius: '8px', padding: '8px 14px', color: '#ff6b6b', fontSize: '13px', cursor: 'pointer' }}>
                  O'chirish
                </button>
              )}
            </div>
            <input ref={bgFileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => e.target.files[0] && uploadFile(e.target.files[0], 'bg', 'bg_image', setUploadingBg)} />
          </div>
          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '6px' }}>
              Qoralik darajasi: {settings.bg_overlay || '0.6'}
            </label>
            <input
              type="range" min="0" max="1" step="0.05"
              value={settings.bg_overlay || '0.6'}
              onChange={e => update('bg_overlay', e.target.value)}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.2)', fontSize: '11px', marginTop: '4px' }}>
              <span>Och (0)</span><span>To'q (1)</span>
            </div>
          </div>
        </Section>

        {/* Asosiy matnlar */}
        <Section title="Asosiy matnlar">
          <Field label="Sarlavha" keyName="hero_title" placeholder="Marketing orqali daromad qiling" />
          <TextArea label="Tavsif matni" keyName="hero_subtitle" />
          <Field label="CTA tugma matni" keyName="cta_button" placeholder="Bepul videoni olish" />
          <Field label="Badge matni (tugma ustidagi)" keyName="bonus_text" placeholder="Bepul video darslik" />
        </Section>

        {/* Video darslik */}
        <Section title="Bepul video darslik">
          <Field label="Video nomi" keyName="video_title" placeholder="Marketing asoslari — 0 dan boshlab" />
          <Field label="Video tavsifi" keyName="video_description" placeholder="Ro'yxatdan o'tganingizdan so'ng yuboriladi" />
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '6px' }}>
              Video muqovasi (thumbnail) — ixtiyoriy
            </label>
            {settings.hero_image && (
              <img src={settings.hero_image} alt="thumbnail"
                style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px', display: 'block' }} />
            )}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button onClick={() => fileRef.current?.click()}
                style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 14px', color: '#fff', fontSize: '13px', cursor: 'pointer' }}>
                {uploading ? 'Yuklanmoqda...' : '📎 Muqova yuklash'}
              </button>
              {settings.hero_image && (
                <button onClick={() => update('hero_image', '')}
                  style={{ background: 'rgba(255,0,0,0.1)', border: '0.5px solid rgba(255,0,0,0.2)', borderRadius: '8px', padding: '8px 14px', color: '#ff6b6b', fontSize: '13px', cursor: 'pointer' }}>
                  O'chirish
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => e.target.files[0] && uploadFile(e.target.files[0], 'bonus', 'hero_image', setUploading)} />
          </div>
        </Section>

        {/* O'quvchi natijasi */}
        <Section title="O'quvchi natijasi">
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '6px' }}>
              O'quvchi rasmi (dumaloq ko'rinadi)
            </label>
            {settings.student_image && (
              <img src={settings.student_image} alt="student"
                style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', marginBottom: '8px', display: 'block', border: '2px solid rgba(30,136,229,0.4)' }} />
            )}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button onClick={() => studentImgRef.current?.click()}
                style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 14px', color: '#fff', fontSize: '13px', cursor: 'pointer' }}>
                {uploadingStudent ? 'Yuklanmoqda...' : '👤 Rasm yuklash'}
              </button>
              {settings.student_image && (
                <button onClick={() => update('student_image', '')}
                  style={{ background: 'rgba(255,0,0,0.1)', border: '0.5px solid rgba(255,0,0,0.2)', borderRadius: '8px', padding: '8px 14px', color: '#ff6b6b', fontSize: '13px', cursor: 'pointer' }}>
                  O'chirish
                </button>
              )}
            </div>
            <input ref={studentImgRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => e.target.files[0] && uploadFile(e.target.files[0], 'student', 'student_image', setUploadingStudent)} />
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', margin: '8px 0 0' }}>
              Tavsiya: kvadrat rasm, 200x200px, PNG yoki JPG
            </p>
          </div>
          <Field label="Ism" keyName="student_name" />
          <Field label="Natija (masalan: 8 mln/oy)" keyName="student_result" />
          <Field label="Sarlavha (masalan: Marketing bitiruvchisi)" keyName="student_label" />
        </Section>

        {/* Statistika */}
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

        {/* Ishonch belgilari */}
        <Section title="Ishonch belgilari (pastki qator)">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <Field label="1-chi" keyName="trust1" />
            <Field label="2-chi" keyName="trust2" />
            <Field label="3-chi" keyName="trust3" />
          </div>
        </Section>

        {/* Sozlamalar */}
        <Section title="Sozlamalar">
          <Field label="Telegram kanal linki" keyName="telegram_channel" placeholder="https://t.me/cdsmarkazi" />
          <Field label="Admin parol" keyName="admin_password" type="password" />
        </Section>

        <button onClick={save} disabled={saving}
          style={{ width: '100%', background: '#1E88E5', border: 'none', borderRadius: '10px', padding: '15px', color: '#fff', fontSize: '15px', fontWeight: '500', cursor: 'pointer', opacity: saving ? 0.7 : 1, marginBottom: '40px' }}>
          {saving ? 'Saqlanmoqda...' : 'Hammasini saqlash ✓'}
        </button>
      </div>
    </div>
  )
}