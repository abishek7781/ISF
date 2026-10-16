import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { A, CONTACT, COUNTRIES } from '../data/content'
import { useI18n } from '../i18n'

export default function Hero() {
  const { lang, t } = useI18n()
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    let timer = 0
    const on = (e: MessageEvent) => {
      if (typeof e.data !== 'string' || !e.origin.includes('youtube')) return
      try {
        const d = JSON.parse(e.data)
        if (d.event === 'infoDelivery' && d.info?.playerState === 1) timer = window.setTimeout(() => setPlaying(true), 3500)
      } catch { /* ignore non-JSON messages */ }
    }
    window.addEventListener('message', on)
    return () => { window.removeEventListener('message', on); clearTimeout(timer) }
  }, [])

  return (
    <section id="home" className="hero">
      <div className="hero-media" aria-hidden="true">
        <img src={A('badminton4-hd.webp')} alt="" fetchPriority="high" />
        <iframe title="ISF showreel" tabIndex={-1} className={playing ? 'on' : ''}
          onLoad={(e) => e.currentTarget.contentWindow?.postMessage(JSON.stringify({ event: 'listening' }), '*')}
          src="https://www.youtube-nocookie.com/embed/QskICZm-AD0?autoplay=1&mute=1&loop=1&playlist=QskICZm-AD0&controls=0&modestbranding=1&playsinline=1&rel=0&disablekb=1&fs=0&iv_load_policy=3&cc_load_policy=0&enablejsapi=1"
          allow="autoplay; encrypted-media" />
        <div className="hero-shade" />
      </div>

      <div className="container hero-in">
        <p className="hero-kicker fade" style={{ animationDelay: '.1s' }}>
          {t('Sports infrastructure, Chennai — since 2017')}
        </p>
        <h1>
          {[
            <>{t('Get your players')}</>,
            <>{lang === 'en' && 'a '}<em>{t('great sports arena')}</em>.</>,
          ].map((line, k) => (
            <span className="line" key={k}>
              <span style={{ animationDelay: `${0.2 + k * 0.12}s` }}>{line}</span>
            </span>
          ))}
        </h1>
        <div className="hero-bottom rise" style={{ animationDelay: '.6s' }}>
          <p>{t('Turnkey courts, turfs, tracks and training halls, built to global federation standards. Over 700 badminton courts delivered with BWF-approved wooden and synthetic flooring.')}</p>
          <div className="hero-cta">
            <Link to="/contact" className="visit-btn"><span className="vb-label">{t('Request a site visit')}</span><span className="vb-ico"><ArrowUpRight size={20} /></span></Link>
            <Link to="/portfolio" className="work-btn">{t('View our work')}</Link>
          </div>
        </div>
      </div>

      <div className="hero-bar fade" style={{ animationDelay: '.9s' }}>
        <div className="container hero-bar-in">
          <div className="hb-stat"><strong>700+</strong><span>{t('Badminton courts')}</span></div>
          <div className="hb-stat"><strong>10,000+</strong><span>{t('Players on ISF floors')}</span></div>
          <div className="hb-stat hide-sm"><strong>BWF</strong><span>{t('Approved systems')}</span></div>
          <div className="hb-places hide-sm">
            <span className="hb-label">{t('Projects in')}</span>
            <ul>
              {COUNTRIES.map(([name, flag]) => (
                <li key={name}><img src={A(`flags/${flag}.svg`)} alt="" width="18" height="18" />{t(name)}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
