import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Landing() {
  const [settings, setSettings] = useState({})
  const [form, setForm] = useState({ full_name: '', phone: '+998' })
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const { data } = await supabase.from('landing_settings').select('*')
    const obj = {}
    ;(data || []).forEach(item => { obj[item.key] = item.value })
    setSettings(obj)
    setLoading(false)
  }

  const handleSubmit = async () => {
    if (!form.full_name && form.phone === '+998') {
      setError("Ma'lumotlaringizni qoldiring!")
      return
    }
    if (!form.full_name) {
      setError("Birinchi ismingizni to'ldiring!")
      return
    }
    if (!form.phone || form.phone === '+998') {
      setError("Telefon raqamingizni qoldiring!")
      return
    }
    setError('')
    setSubmitting(true)

    const { data: channel } = await supabase
      .from('channels').select('id').eq('name', 'Landing Page').single()

    const { data: pipeline } = await supabase
      .from('pipelines').select('id').order('created_at').limit(1).single()

    const { data: stage } = await supabase
      .from('pipeline_stages').select('id')
      .eq('pipeline_id', pipeline?.id)
      .eq('name', 'Yangi lid').single()

    const { data: newLead } = await supabase.from('leads').insert([{
      full_name: form.full_name,
      phone: form.phone,
      heat: 'cold',
      channel_id: channel?.id || null,
      pipeline_id: pipeline?.id || null,
      stage_id: stage?.id || null,
    }]).select().single()

    // Avtomatik menejerga biriktirish
    if (newLead?.id) {
      fetch('https://cds-crm-backend-production.up.railway.app/api/auto-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: newLead.id })
      }).catch(() => {})
    }

    setSubmitted(true)
    setSubmitting(false)

    if (settings.telegram_channel) {
      window.open(settings.telegram_channel, '_blank')
    }
  }

  if (loading) {
    return (
      <div style={{ background: '#0A0A0F', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Yuklanmoqda...</div>
      </div>
    )
  }

  const primary = settings.primary_color || '#F5A623'
  const bg = settings.bg_color || '#0A0A0F'

  return (
    <div style={{ background: bg, minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>

      {/* Header */}
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: primary, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '13px', color: bg }}>C</div>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>Creator Digital School</span>
        </div>
        <a href={settings.telegram_channel} target="_blank" rel="noreferrer"
          style={{ background: `${primary}15`, border: `0.5px solid ${primary}30`, borderRadius: '20px', padding: '5px 14px', color: primary, fontSize: '12px', textDecoration: 'none' }}>
          Telegram kanal
        </a>
      </div>

      {/* Main */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center', padding: '48px 0' }}>

          {/* Left */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `${primary}12`, border: `0.5px solid ${primary}25`, borderRadius: '20px', padding: '6px 14px', marginBottom: '24px' }}>
              <span>🎁</span>
              <span style={{ color: primary, fontSize: '12px', fontWeight: '500' }}>{settings.bonus_text}</span>
            </div>

            <h1 style={{ fontSize: '32px', fontWeight: '500', lineHeight: '1.25', margin: '0 0 16px' }}>
              {settings.hero_title?.split(' ').map((word, i, arr) =>
                i >= arr.length - 2
                  ? <span key={i} style={{ color: primary }}>{word} </span>
                  : <span key={i}>{word} </span>
              )}
            </h1>

            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px', lineHeight: '1.65', margin: '0 0 32px' }}>
              {settings.hero_subtitle}
            </p>

            {submitted ? (
              <div style={{ background: `${primary}15`, border: `0.5px solid ${primary}30`, borderRadius: '14px', padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎉</div>
                <div style={{ color: primary, fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>Rahmat! Ro'yxatdan o'tdingiz!</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Menejerimiz tez orada siz bilan bog'lanadi</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Ismingiz"
                  value={form.full_name}
                  onChange={e => {
                    setForm({ ...form, full_name: e.target.value })
                    setError('')
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: `0.5px solid ${!form.full_name && error ? 'rgba(255,100,100,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '10px', padding: '14px 16px', color: '#fff', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box'
                  }}
                />
                <input
                  type="tel"
                  placeholder="+998 90 000 00 00"
                  value={form.phone}
                  onChange={e => {
                    const val = e.target.value
                    if (!val.startsWith('+998')) return
                    setForm({ ...form, phone: val })
                    setError('')
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: `0.5px solid ${form.phone === '+998' && error ? 'rgba(255,100,100,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '10px', padding: '14px 16px', color: '#fff', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box'
                  }}
                />

                {error && (
                  <div style={{ background: 'rgba(255,80,80,0.1)', border: '0.5px solid rgba(255,80,80,0.25)', borderRadius: '8px', padding: '10px 14px', color: '#ff8080', fontSize: '13px', textAlign: 'center' }}>
                    ⚠️ {error}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{ background: primary, border: 'none', borderRadius: '10px', padding: '15px', color: bg, fontSize: '14px', fontWeight: '500', cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Yuborilmoqda...' : (settings.cta_button || "Ro'yxatdan o'tish") + ' →'}
                </button>
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', margin: '0', textAlign: 'center' }}>Spam yubormaymiz. Ma'lumotlaringiz xavfsiz.</p>
              </div>
            )}
          </div>

          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: `0.5px solid ${primary}25`, borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              {settings.hero_image ? (
                <img src={settings.hero_image} alt="bonus" style={{ width: '56px', height: '70px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
              ) : (
                <div style={{ width: '56px', height: '70px', background: `linear-gradient(135deg, ${primary}, #E8920F)`, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>📄</div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ color: primary, fontSize: '10px', fontWeight: '500', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>BEPUL</div>
                <div style={{ color: '#fff', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>{settings.pdf_title}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>{settings.bonus_description}</div>
              </div>
              <div style={{ background: `${primary}15`, border: `0.5px solid ${primary}30`, borderRadius: '8px', padding: '6px 10px', flexShrink: 0 }}>
                <span style={{ color: primary, fontSize: '11px', fontWeight: '500' }}>Bepul</span>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${primary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>👨‍💻</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '500' }}>{settings.student_name}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>{settings.student_label}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: primary, fontSize: '15px', fontWeight: '500' }}>{settings.student_result}</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>daromad</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {[
                { num: settings.stat1_number, label: settings.stat1_label },
                { num: settings.stat2_number, label: settings.stat2_label },
                { num: settings.stat3_number, label: settings.stat3_label },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px 8px', textAlign: 'center' }}>
                  <div style={{ color: primary, fontSize: '20px', fontWeight: '500' }}>{s.num}</div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trust bar */}
      <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px' }}>
        {[
          { icon: '🔒', text: settings.trust1 },
          { icon: '⚡', text: settings.trust2 },
          { icon: '🎓', text: settings.trust3 },
        ].map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>
            <span>{t.icon}</span> {t.text}
          </div>
        ))}
      </div>
    </div>
  )
}