import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Landing() {
  const [settings, setSettings] = useState({})
  const [form, setForm] = useState({ full_name: '', phone: '+998' })
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadSettings() }, [])

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
      <div style={{ background: '#0B1929', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Yuklanmoqda...</div>
      </div>
    )
  }

  const primary = '#1E88E5'
  const primaryLight = '#64B5F6'
  const bg = settings.bg_color || '#0B1929'
  const bgImage = settings.bg_image
  const bgOverlay = settings.bg_overlay || '0.7'

  // Matn shadow — orqa fondan ajralib turish uchun
  const textShadow = '0 2px 16px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.8)'

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#fff',
      background: bgImage ? 'transparent' : bg,
    }}>

      {/* Fon rasm */}
      {bgImage && (
        <>
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
            zIndex: 0
          }} />
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: `linear-gradient(135deg, rgba(11,25,41,${bgOverlay}), rgba(13,31,60,${bgOverlay}))`,
            zIndex: 1
          }} />
        </>
      )}

      {!bgImage && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: bg, zIndex: 0
        }} />
      )}

      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* Header */}
        <div style={{
          padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '0.5px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
          background: 'rgba(11,25,41,0.85)',
          position: 'sticky', top: 0, zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="CDS Logo"
                style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
            ) : (
              <div style={{
                width: '30px', height: '30px', background: primary,
                borderRadius: '8px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: '700', fontSize: '13px', color: '#fff'
              }}>C</div>
            )}
            <span style={{ fontSize: '14px', fontWeight: '500', textShadow }}>
              Creator Digital School
            </span>
          </div>
          <a href={settings.telegram_channel} target="_blank" rel="noreferrer"
            style={{
              background: 'rgba(30,136,229,0.2)',
              border: '0.5px solid rgba(30,136,229,0.5)',
              borderRadius: '20px', padding: '6px 14px',
              color: '#fff', fontSize: '12px', textDecoration: 'none',
              whiteSpace: 'nowrap', fontWeight: '500'
            }}>
            Telegram kanal →
          </a>
        </div>

        {/* Main */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
            alignItems: 'center',
            padding: '40px 0 32px'
          }}>

            {/* Chap — forma */}
            <div>

              {/* Video kartochka */}
              <div style={{
                background: 'rgba(11,25,41,0.92)',
                border: '1px solid rgba(30,136,229,0.4)',
                borderRadius: '14px',
                padding: '16px',
                marginBottom: '24px',
                display: 'flex',
                gap: '14px',
                alignItems: 'center',
                backdropFilter: 'blur(12px)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
              }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: '3px', background: primary, borderRadius: '14px 0 0 14px'
                }} />

                {settings.hero_image ? (
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img src={settings.hero_image} alt="video"
                      style={{ width: '72px', height: '54px', objectFit: 'cover', borderRadius: '8px', display: 'block' }} />
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(0,0,0,0.35)', borderRadius: '8px'
                    }}>
                      <div style={{
                        width: 0, height: 0,
                        borderTop: '7px solid transparent',
                        borderBottom: '7px solid transparent',
                        borderLeft: '12px solid white',
                        marginLeft: '3px'
                      }} />
                    </div>
                  </div>
                ) : (
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '50%',
                    background: 'rgba(30,136,229,0.25)',
                    border: '1.5px solid rgba(30,136,229,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <div style={{
                      width: 0, height: 0,
                      borderTop: '9px solid transparent',
                      borderBottom: '9px solid transparent',
                      borderLeft: `16px solid ${primary}`,
                      marginLeft: '4px'
                    }} />
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'inline-block',
                    background: 'rgba(30,136,229,0.25)',
                    border: '0.5px solid rgba(30,136,229,0.5)',
                    borderRadius: '10px', padding: '2px 10px',
                    color: '#fff', fontSize: '10px', fontWeight: '600',
                    marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px'
                  }}>
                    BEPUL VIDEO DARSLIK
                  </div>
                  <div style={{
                    color: '#fff', fontSize: '14px', fontWeight: '600',
                    marginBottom: '4px', lineHeight: '1.3',
                    textShadow
                  }}>
                    {settings.video_title || settings.pdf_title || 'Marketing asoslari — 0 dan boshlab'}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '11px' }}>
                    {settings.video_description || "Ro'yxatdan o'tganingizdan so'ng yuboriladi"}
                  </div>
                </div>
              </div>

              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(30,136,229,0.15)',
                border: '0.5px solid rgba(30,136,229,0.35)',
                borderRadius: '20px', padding: '5px 12px',
                marginBottom: '16px'
              }}>
                <span style={{ fontSize: '11px' }}>🎬</span>
                <span style={{ color: '#fff', fontSize: '11px', fontWeight: '500', textShadow }}>
                  {settings.bonus_text || 'Bepul video darslik'}
                </span>
              </div>

              {/* Sarlavha */}
              <h1 style={{
                fontSize: 'clamp(24px, 5vw, 34px)',
                fontWeight: '600', lineHeight: '1.2', margin: '0 0 14px',
                textShadow
              }}>
                {settings.hero_title?.split(' ').map((word, i, arr) =>
                  i >= arr.length - 2
                    ? <span key={i} style={{ color: primaryLight }}>{word} </span>
                    : <span key={i} style={{ color: '#fff' }}>{word} </span>
                ) || (
                  <span>Raqamli <span style={{ color: primaryLight }}>marketing mutaxassisi</span> bo'ling</span>
                )}
              </h1>

              {/* Tavsif */}
              <p style={{
                color: 'rgba(255,255,255,0.85)', fontSize: '14px',
                lineHeight: '1.65', margin: '0 0 24px',
                textShadow: '0 1px 8px rgba(0,0,0,0.9)'
              }}>
                {settings.hero_subtitle}
              </p>

              {/* Forma */}
              {submitted ? (
                <div style={{
                  background: 'rgba(11,25,41,0.92)',
                  border: '1px solid rgba(30,136,229,0.4)',
                  borderRadius: '14px', padding: '28px', textAlign: 'center',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
                }}>
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎉</div>
                  <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600', marginBottom: '8px', textShadow }}>
                    Rahmat! Ro'yxatdan o'tdingiz!
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px' }}>
                    Video darslik tez orada yuboriladi
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Ismingiz"
                    value={form.full_name}
                    onChange={e => { setForm({ ...form, full_name: e.target.value }); setError('') }}
                    style={{
                      background: 'rgba(11,25,41,0.9)',
                      border: `1px solid ${!form.full_name && error ? 'rgba(255,100,100,0.6)' : 'rgba(30,136,229,0.4)'}`,
                      borderRadius: '10px', padding: '14px 16px',
                      color: '#fff', fontSize: '16px', outline: 'none',
                      width: '100%', boxSizing: 'border-box',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.3)'
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
                      background: 'rgba(11,25,41,0.9)',
                      border: `1px solid ${form.phone === '+998' && error ? 'rgba(255,100,100,0.6)' : 'rgba(30,136,229,0.4)'}`,
                      borderRadius: '10px', padding: '14px 16px',
                      color: '#fff', fontSize: '16px', outline: 'none',
                      width: '100%', boxSizing: 'border-box',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.3)'
                    }}
                  />

                  {error && (
                    <div style={{
                      background: 'rgba(255,80,80,0.15)',
                      border: '1px solid rgba(255,80,80,0.3)',
                      borderRadius: '8px', padding: '10px 14px',
                      color: '#ff8080', fontSize: '13px', textAlign: 'center'
                    }}>
                      ⚠️ {error}
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{
                      background: submitting
                        ? 'rgba(30,136,229,0.5)'
                        : 'linear-gradient(135deg, #1565C0, #1E88E5)',
                      border: 'none', borderRadius: '10px',
                      padding: '15px', color: '#fff',
                      fontSize: '15px', fontWeight: '600',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      width: '100%', letterSpacing: '0.3px',
                      boxShadow: '0 4px 16px rgba(30,136,229,0.4)'
                    }}>
                    {submitting
                      ? 'Yuborilmoqda...'
                      : (settings.cta_button || 'Bepul videoni olish') + ' →'}
                  </button>

                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '12px'
                  }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', margin: 0, textShadow }}>
                      Spam yubormaymiz
                    </p>
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
                    <p style={{ color: primaryLight, fontSize: '11px', margin: 0, textShadow }}>
                      500+ kishi oldi
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* O'ng — o'quvchi + statistika */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              <div style={{
                background: 'rgba(11,25,41,0.88)',
                border: '1px solid rgba(30,136,229,0.25)',
                borderRadius: '12px', padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: '12px',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.35)'
              }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: 'rgba(30,136,229,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', flexShrink: 0
                }}>👨‍💻</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', textShadow }}>
                    {settings.student_name}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px' }}>
                    {settings.student_label}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ color: primaryLight, fontSize: '15px', fontWeight: '600', textShadow }}>
                    {settings.student_result}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>daromad</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[
                  { num: settings.stat1_number, label: settings.stat1_label },
                  { num: settings.stat2_number, label: settings.stat2_label },
                  { num: settings.stat3_number, label: settings.stat3_label },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: 'rgba(11,25,41,0.88)',
                    border: '1px solid rgba(30,136,229,0.2)',
                    borderRadius: '10px', padding: '14px 8px', textAlign: 'center',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                  }}>
                    <div style={{ color: primaryLight, fontSize: '20px', fontWeight: '600', textShadow }}>
                      {s.num}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px' }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div style={{
          borderTop: '0.5px solid rgba(255,255,255,0.08)',
          padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '24px', flexWrap: 'wrap',
          background: 'rgba(11,25,41,0.85)',
          backdropFilter: 'blur(12px)'
        }}>
          {[
            { icon: '🔒', text: settings.trust1 || 'Spam yubormaymiz' },
            { icon: '⚡', text: settings.trust2 || "24 soat ichida bog'lanamiz" },
            { icon: '🎓', text: settings.trust3 || '500+ bitiruvchi' },
          ].map((t, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              color: 'rgba(255,255,255,0.55)', fontSize: '12px'
            }}>
              <span>{t.icon}</span> {t.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}