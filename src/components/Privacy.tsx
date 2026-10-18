import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CONTACT } from '../data/content'
import { useI18n } from '../i18n'

export const openCookieChoice = () => window.dispatchEvent(new Event('isf-open-consent'))

export default function PrivacyPage() {
  const { t } = useI18n()
  useEffect(() => { document.title = `${t('Privacy Policy')} | India Sports Infra` }, [t])
  const email = CONTACT.emails[1]
  const rows: [string, string, string][] = [
    ['isf-theme', 'Remembers light or dark mode', 'Essential, stored in your browser'],
    ['isf-lang', 'Remembers your language', 'Essential, stored in your browser'],
    ['isf-consent', 'Remembers your cookie choice', 'Essential, stored in your browser'],
    ['Zoho form analytics', 'Measures how the contact form is used', 'Only if you allow Analytics'],
  ]
  return (
    <div className="dark-page">
      <section className="pv">
        <div className="container pv-in">
          <span className="pv-kicker">{t('Legal')}</span>
          <h1>{t('Privacy Policy')}</h1>
          <p className="pv-date">Last updated: 5 October 2026</p>
          <p className="pv-lead">This policy explains what personal information India Sports Infra (&ldquo;ISF&rdquo;, &ldquo;we&rdquo;) collects through this website, why we collect it, and the choices you have.</p>

          <h2>1. Who we are</h2>
          <p>India Sports Infra, {CONTACT.address.join(', ')}. You can reach us at <a href={`mailto:${email}`}>{email}</a> or on <a href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</a>.</p>

          <h2>2. What we collect</h2>
          <p>When you send a request through our contact form we collect your name, your WhatsApp phone number, the type of project you are planning, any sport you describe, and the date and time you would like us to call you. If you message or call us directly, we keep what you tell us in that conversation.</p>
          <p>We do not ask for payment details, government identity numbers or passwords on this website.</p>

          <h2>3. How we use it</h2>
          <ul>
            <li>To call or message you about your court, turf or training facility and to prepare a quote.</li>
            <li>To manage our enquiries and follow up on projects.</li>
            <li>To understand how the site is used and to improve it, if you accept analytics.</li>
          </ul>
          <p>We do not sell your personal information.</p>

          <h2>4. Cookies and local storage</h2>
          <p>The site stores a few small items in your browser. Essential items are needed for the site to work the way you set it up. Analytics are used only if you choose Accept all in the cookie banner.</p>
          <div className="pv-table" role="table" aria-label="Cookies and storage">
            <div className="pv-row head" role="row"><span>Name</span><span>Purpose</span><span>Type</span></div>
            {rows.map((r) => <div className="pv-row" role="row" key={r[0]}><span>{r[0]}</span><span>{r[1]}</span><span>{r[2]}</span></div>)}
          </div>
          <p><button className="pv-btn" onClick={openCookieChoice}>{t('Change my cookie choice')}</button></p>

          <h2>5. Services we use</h2>
          <ul>
            <li><strong>Zoho CRM</strong> receives the details you submit in the contact form so our team can respond. Zoho processes this data on our behalf.</li>
            <li><strong>YouTube</strong> (privacy-enhanced embed) plays the project and testimonial videos on some pages. YouTube may set its own cookies when you press play.</li>
            <li><strong>Google Maps</strong> shows our office location on the Contact page.</li>
            <li><strong>WhatsApp</strong> opens a chat with us when you use the WhatsApp button. Anything you send there is handled under WhatsApp&rsquo;s own terms.</li>
          </ul>

          <h2>6. How long we keep it</h2>
          <p>We keep enquiry details for as long as needed to respond to you and to manage any resulting project, and for a reasonable period afterwards for our records, unless you ask us to delete them sooner.</p>

          <h2>7. Your choices and rights</h2>
          <p>You can ask us to tell you what we hold about you, to correct it, or to delete it, and you can withdraw consent for analytics at any time using the button above. Where applicable law gives you further rights, including under India&rsquo;s Digital Personal Data Protection Act, 2023, we will honour them. To make a request, email <a href={`mailto:${email}`}>{email}</a>.</p>

          <h2>8. Security</h2>
          <p>We take reasonable steps to protect the information you send us, but no method of transmission over the internet is completely secure.</p>

          <h2>9. Children</h2>
          <p>This website is intended for businesses, institutions and adults. We do not knowingly collect information from children.</p>

          <h2>10. Changes to this policy</h2>
          <p>We may update this policy from time to time. The date at the top shows when it was last changed.</p>

          <h2>11. Contact</h2>
          <p>Questions about this policy? <Link to="/contact">Contact us</Link> or write to <a href={`mailto:${email}`}>{email}</a>.</p>
        </div>
      </section>
    </div>
  )
}
