import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CONTACT } from '../data/content'
import { useI18n } from '../i18n'

export const openCookieChoice = () => window.dispatchEvent(new Event('isf-open-consent'))

const SECTIONS: [string, string][] = [
  ['who', 'Who we are'],
  ['collect', 'What we collect'],
  ['use', 'How we use it'],
  ['cookies', 'Cookies and storage'],
  ['services', 'Services we use'],
  ['sharing', 'Who we share it with'],
  ['retention', 'How long we keep it'],
  ['rights', 'Your choices and rights'],
  ['security', 'Security'],
  ['children', 'Children'],
  ['changes', 'Changes to this policy'],
  ['contact', 'Contact us'],
]

const Check = () => <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" /><path d="M6 10.5l2.7 2.7L14 7.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
const Cross = () => <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" /><path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
const Sliders = () => <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true"><path d="M3 6h9M16 6h1M3 14h1M8 14h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><circle cx="14" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" /><circle cx="6" cy="14" r="2" stroke="currentColor" strokeWidth="1.5" /></svg>

export default function PrivacyPage() {
  const { t } = useI18n()
  const [active, setActive] = useState(SECTIONS[0][0])
  useEffect(() => { document.title = `${t('Privacy Policy')} | India Sports Infra` }, [t])
  useEffect(() => {
    const els = SECTIONS.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
      if (vis) setActive(vis.target.id)
    }, { rootMargin: '-90px 0px -65% 0px' })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  const email = CONTACT.emails[1]
  const collected: [string, string, string][] = [
    ['Contact details', 'Your name and the WhatsApp phone number you enter in the form.', 'Contact form'],
    ['Project details', 'The type of project (badminton court, cricket turf, pickleball court or other) and any sport you describe.', 'Contact form'],
    ['Call preference', 'The date and time you would like us to call you back.', 'Contact form'],
    ['Conversations', 'What you tell us when you message, call or email us directly, including WhatsApp.', 'Direct contact'],
    ['Design choices', 'Court options you pick in Craft Your Court. These stay in your browser and are not sent to us unless you share them.', 'Court designer'],
    ['Device and usage data', 'Pages viewed and how the contact form is used, collected only if you accept analytics.', 'Analytics (optional)'],
  ]
  const rows: [string, string, string, string][] = [
    ['isf-theme', 'Remembers light or dark mode', 'Essential', 'Until you clear browser data'],
    ['isf-lang', 'Remembers your language', 'Essential', 'Until you clear browser data'],
    ['isf-consent', 'Remembers your cookie choice', 'Essential', 'Until you clear browser data'],
    ['Zoho analytics', 'Measures how the contact form and pages are used', 'Analytics, optional', 'Set by Zoho, only if you allow'],
    ['YouTube', 'Plays embedded videos, may set cookies on play', 'Third party, on play', 'Set by YouTube'],
  ]
  const retention: [string, string][] = [
    ['Enquiries that do not lead to a project', 'Kept for a reasonable period so we can follow up, then deleted or anonymised.'],
    ['Customers and project records', 'Kept for the life of the project and for a reasonable period afterwards for warranty, accounting and legal records.'],
    ['Cookie and storage items', 'Kept in your browser until you clear them or change your choice.'],
  ]

  return (
    <div className="dark-page">
      <section className="pv">
        <div className="container">
          <header className="pv-hero">
            <span className="pv-kicker">{t('Legal')}</span>
            <h1>{t('Privacy Policy')}</h1>
            <p className="pv-lead">This policy explains what personal information India Sports Infra (&ldquo;ISF&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) collects through this website, why we collect it, who sees it, and the choices you have.</p>
            <div className="pv-meta">
              <span><b>Last updated</b>5 October 2026</span>
              <span><b>Applies to</b>This website</span>
              <span><b>Questions</b><a href={`mailto:${email}`}>{email}</a></span>
            </div>
          </header>

          <div className="pv-glance" aria-label="Summary">
            <div className="pv-g"><span className="pv-gi ok"><Check /></span><h3>What we collect</h3><p>Only what you type into our contact form or tell us directly, plus optional analytics.</p></div>
            <div className="pv-g"><span className="pv-gi no"><Cross /></span><h3>What we never do</h3><p>We never sell your information or ask for payment details, ID numbers or passwords here.</p></div>
            <div className="pv-g"><span className="pv-gi ct"><Sliders /></span><h3>Your control</h3><p>Change your cookie choice any time, or ask us to access, correct or delete your data.</p></div>
          </div>

          <div className="pv-grid">
            <nav className="pv-toc" aria-label="On this page">
              <b>On this page</b>
              <ol>
                {SECTIONS.map(([id, label], i) => (
                  <li key={id}><a href={`#${id}`} className={active === id ? 'on' : ''} onClick={(e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); history.replaceState(null, '', `#${id}`) }}><i>{String(i + 1).padStart(2, '0')}</i>{label}</a></li>
                ))}
              </ol>
            </nav>

            <article className="pv-body">
              <section id="who" className="pv-sec">
                <h2><i>01</i>Who we are</h2>
                <p>India Sports Infra is a sports infrastructure company that builds sports flooring, fabrication and lighting for courts, turfs and training facilities. For this website we decide why and how your personal information is used.</p>
                <div className="pv-card">
                  <div><b>Company</b><span>India Sports Infra</span></div>
                  <div><b>Address</b><span>{CONTACT.address.join(', ')}</span></div>
                  <div><b>Email</b><span><a href={`mailto:${email}`}>{email}</a></span></div>
                  <div><b>Phone</b><span><a href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</a></span></div>
                </div>
              </section>

              <section id="collect" className="pv-sec">
                <h2><i>02</i>What we collect</h2>
                <p>We collect information in three ways: what you give us, what you tell us in conversation, and, only if you agree, how you use the site.</p>
                <div className="pv-table pv-t3" role="table" aria-label="Information we collect">
                  <div className="pv-row pv-head" role="row"><span>Information</span><span>Details</span><span>Where from</span></div>
                  {collected.map((r) => <div className="pv-row" role="row" key={r[0]}><span>{r[0]}</span><span>{r[1]}</span><span>{r[2]}</span></div>)}
                </div>
                <p className="pv-note">We do not ask for payment details, government identity numbers or passwords on this website, and you should not send them to us through the contact form.</p>
              </section>

              <section id="use" className="pv-sec">
                <h2><i>03</i>How we use it</h2>
                <ul>
                  <li>To call or message you about your court, turf or training facility and to prepare a quote.</li>
                  <li>To manage our enquiries, schedule site visits and follow up on projects.</li>
                  <li>To keep the site working the way you set it up, such as remembering your language and theme.</li>
                  <li>To understand how the site is used and to improve it, but only if you accept analytics.</li>
                  <li>To meet our legal, accounting and record-keeping duties.</li>
                </ul>
                <p>We rely on your consent when you submit the form or accept analytics, and on our legitimate interest in answering enquiries and running our business. <strong>We do not sell your personal information.</strong></p>
              </section>

              <section id="cookies" className="pv-sec">
                <h2><i>04</i>Cookies and storage</h2>
                <p>The site stores a few small items in your browser. Essential items are needed for the site to work the way you set it up. Analytics run only if you choose <em>Accept all</em> in the cookie banner.</p>
                <div className="pv-table pv-t4" role="table" aria-label="Cookies and storage">
                  <div className="pv-row pv-head" role="row"><span>Name</span><span>Purpose</span><span>Type</span><span>Duration</span></div>
                  {rows.map((r) => <div className="pv-row" role="row" key={r[0]}><span>{r[0]}</span><span>{r[1]}</span><span>{r[2]}</span><span>{r[3]}</span></div>)}
                </div>
                <p className="pv-action"><button className="pv-btn" onClick={openCookieChoice}>{t('Change my cookie choice')}</button><span>You can also clear these items from your browser settings at any time.</span></p>
              </section>

              <section id="services" className="pv-sec">
                <h2><i>05</i>Services we use</h2>
                <p>We use a small number of trusted services to run the site. Each handles data under its own terms.</p>
                <div className="pv-svc">
                  <div><b>Zoho CRM</b><p>Receives the details you submit in the contact form so our team can respond. Zoho processes this data on our behalf.</p></div>
                  <div><b>Zoho analytics</b><p>Measures how pages and the contact form are used. Runs only if you allow analytics.</p></div>
                  <div><b>YouTube</b><p>Privacy-enhanced embeds play our project and testimonial videos. YouTube may set its own cookies when you press play.</p></div>
                  <div><b>Google Maps</b><p>Shows our office location on the Contact page.</p></div>
                  <div><b>WhatsApp</b><p>Opens a chat with us when you use the WhatsApp button. Anything you send there is handled under WhatsApp&rsquo;s own terms.</p></div>
                </div>
              </section>

              <section id="sharing" className="pv-sec">
                <h2><i>06</i>Who we share it with</h2>
                <p>We share personal information only where it is needed to run our business or where the law requires it:</p>
                <ul>
                  <li><strong>Service providers</strong> such as the tools listed above, who act on our instructions.</li>
                  <li><strong>Our project team and partners</strong> who need your details to survey, quote or deliver your project.</li>
                  <li><strong>Authorities</strong> when we are legally required to disclose information.</li>
                </ul>
                <p>Some providers may process data outside India. Where that happens we expect them to protect it to a standard consistent with this policy and applicable law.</p>
              </section>

              <section id="retention" className="pv-sec">
                <h2><i>07</i>How long we keep it</h2>
                <p>We keep personal information only as long as we need it for the purposes above, unless you ask us to delete it sooner.</p>
                <div className="pv-list">
                  {retention.map((r) => <div key={r[0]}><b>{r[0]}</b><span>{r[1]}</span></div>)}
                </div>
              </section>

              <section id="rights" className="pv-sec">
                <h2><i>08</i>Your choices and rights</h2>
                <p>You can ask us at any time to:</p>
                <ul>
                  <li>tell you what personal information we hold about you;</li>
                  <li>correct anything that is wrong or out of date;</li>
                  <li>delete your information, where we are not required to keep it;</li>
                  <li>stop using your information for follow-up calls or messages; and</li>
                  <li>withdraw consent for analytics, using the cookie button above.</li>
                </ul>
                <p>Where applicable law gives you further rights, including under India&rsquo;s Digital Personal Data Protection Act, 2023, we will honour them. To make a request, email <a href={`mailto:${email}`}>{email}</a>. We may need to confirm who you are first, and we aim to reply within a reasonable time.</p>
              </section>

              <section id="security" className="pv-sec">
                <h2><i>09</i>Security</h2>
                <p>We take reasonable steps to protect the information you send us, including encrypted connections to this site and limiting access to the people who need it. No method of transmission over the internet or of electronic storage is completely secure, so we cannot guarantee absolute security.</p>
              </section>

              <section id="children" className="pv-sec">
                <h2><i>10</i>Children</h2>
                <p>This website is intended for businesses, institutions and adults. We do not knowingly collect information from children. If you believe a child has sent us their details, tell us and we will delete them.</p>
              </section>

              <section id="changes" className="pv-sec">
                <h2><i>11</i>Changes to this policy</h2>
                <p>We may update this policy from time to time, for example when we add a feature or a service changes. The date at the top shows when it was last changed. We encourage you to review it now and then.</p>
              </section>

              <section id="contact" className="pv-sec">
                <h2><i>12</i>Contact us</h2>
                <p>Questions about this policy or about your information? We are happy to help.</p>
                <div className="pv-cta">
                  <div><b>Talk to our team</b><span>Email <a href={`mailto:${email}`}>{email}</a> or call <a href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</a>.</span></div>
                  <Link to="/contact" className="pv-btn">Contact us</Link>
                </div>
              </section>
            </article>
          </div>
        </div>
      </section>
    </div>
  )
}
