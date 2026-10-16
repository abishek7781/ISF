import { ZH_MORE, TH_MORE } from './translations'
import { HI } from './langs/hi'
import { TA } from './langs/ta'
import { MS } from './langs/ms'
import { TE } from './langs/te'
import { ML } from './langs/ml'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'zh' | 'th' | 'hi' | 'ta' | 'te' | 'ml' | 'ms'
export const LANGS: { code: Lang; short: string; name: string; flag: string }[] = [
  { code: 'en', short: 'EN', name: 'English', flag: 'gb' },
  { code: 'zh', short: '中文', name: '中文', flag: 'cn' },
  { code: 'th', short: 'ไทย', name: 'ไทย', flag: 'th' },
  { code: 'hi', short: 'HI', name: 'हिन्दी', flag: 'in' },
  { code: 'ta', short: 'TA', name: 'தமிழ்', flag: 'in' },
  { code: 'te', short: 'TE', name: 'తెలుగు', flag: 'in' },
  { code: 'ml', short: 'ML', name: 'മലയാളം', flag: 'in' },
  { code: 'ms', short: 'BM', name: 'Bahasa Melayu', flag: 'my' },
]

// Dictionaries are keyed by the English text. Anything not listed falls back to English.
const ZH: Record<string, string> = {
  Home: '首页', Products: '产品', Portfolio: '项目案例', About: '关于我们', Contact: '联系我们',
  'Language': '语言', 'Switch to light mode': '切换到浅色模式', 'Switch to dark mode': '切换到深色模式',
  'Sports infrastructure, Chennai — since 2017': '体育基础设施 · 金奈 · 始于2017年',
  'Get your players': '为您的运动员打造',
  'a': '', 'great sports arena': '一流的运动场馆',
  'Turnkey courts, turfs, tracks and training halls, built to global federation standards. Over 700 badminton courts delivered with BWF-approved wooden and synthetic flooring.': '交钥匙球场、草坪、跑道与训练馆，符合国际联合会标准。已交付700多块羽毛球场，采用BWF认可的木质与合成地板。',
  'Request a site visit': '预约现场勘察', 'View our work': '查看我们的项目',
  'Badminton courts': '羽毛球场', 'Players on ISF floors': '在ISF场地运动的人数', 'Approved systems': '认可系统',
  'Projects in': '项目遍布', 'Talk to our sports infrastructure team': '联系我们的体育基础设施团队',
  'Product guide': '产品指南', 'Everything a sports venue needs, from the floor up.': '体育场馆所需的一切，从地面开始。',
  Flooring: '运动地板', Fabrication: '钢结构制作', Lighting: '照明',
  'Sport surfaces for every discipline': '适用于各类运动的场地表面',
  'Steel-framed net enclosures and court structures, fabricated and erected on site.': '钢结构围网与场地结构，现场制作并安装。',
  'Lighting for indoor halls and outdoor turfs, planned with the court layout.': '室内场馆与室外球场照明，与场地布局统一规划。',
  'BWF-approved badminton floors and surfaces for every major sport, supplied and installed by our team.': '符合BWF标准的羽毛球地板及各类运动场地表面，由我们团队供货并安装。',
  'Learn more': '了解更多', 'Request a quote': '获取报价', 'Get a call back': '预约回电', 'products': '款产品',
  'Badminton Wooden Flooring': '羽毛球木地板', 'Badminton Synthetic Flooring': '羽毛球合成地板', 'Tennis Court Flooring': '网球场地板',
  'Pickleball Court': '匹克球场', 'Padel Court': '板式网球场', 'Basketball Flooring': '篮球场地板', 'Futsal Flooring': '五人制足球场地',
  'Running Track': '跑道', 'Skating Rink': '溜冰场', 'Gym Flooring': '健身房地板', 'Archery Flooring': '射箭场地',
  'Outdoor Sports Flooring': '室外运动地板', 'Swimming Pool': '游泳池', 'Cricket Net Enclosures': '板球训练围网',
  'Court and Turf Enclosures': '球场与草坪围网', 'Indoor Court Lighting': '室内球场照明', 'Outdoor Turf Floodlighting': '室外球场泛光照明',
  'Hear from the experts in badminton court flooring and construction.': '听听羽毛球场地板与施工专家的建议。',
  'Planning a sports facility?': '正在规划体育设施？', 'Tell us what you are building and we will get back with a plan and a quote.': '告诉我们您的建设需求，我们将提供方案和报价。',
  Company: '公司', Offices: '办事处', Phone: '电话', WhatsApp: 'WhatsApp', Email: '电子邮件',
  'Who we are': '关于我们', 'Turnkey sports infrastructure built to global federation standards.': '符合国际联合会标准的交钥匙体育基础设施。',
  'More about ISF': '更多关于ISF', 'Contact with us': '联系我们',
  'Tell us about your court, turf or training facility. Our team will call you back at a time that suits you with a plan and a quote.': '请告诉我们您的球场、草坪或训练设施情况。我们的团队将在您方便的时间回电，并提供方案和报价。',
  'Phone Number': '电话号码', 'Email Address': '电子邮箱',
}
const TH: Record<string, string> = {
  Home: 'หน้าแรก', Products: 'ผลิตภัณฑ์', Portfolio: 'ผลงาน', About: 'เกี่ยวกับเรา', Contact: 'ติดต่อเรา',
  'Language': 'ภาษา', 'Switch to light mode': 'เปลี่ยนเป็นโหมดสว่าง', 'Switch to dark mode': 'เปลี่ยนเป็นโหมดมืด',
  'Sports infrastructure, Chennai — since 2017': 'โครงสร้างพื้นฐานด้านกีฬา เจนไน ตั้งแต่ปี 2017',
  'Get your players': 'มอบให้นักกีฬาของคุณ',
  'a': '', 'great sports arena': 'สนามกีฬาระดับยอดเยี่ยม',
  'Turnkey courts, turfs, tracks and training halls, built to global federation standards. Over 700 badminton courts delivered with BWF-approved wooden and synthetic flooring.': 'สนาม สนามหญ้า ลู่วิ่ง และห้องฝึกซ้อมแบบครบวงจร ได้มาตรฐานสหพันธ์สากล ส่งมอบสนามแบดมินตันกว่า 700 สนามด้วยพื้นไม้และพื้นสังเคราะห์ที่ได้รับการรับรองจาก BWF',
  'Request a site visit': 'นัดเยี่ยมชมพื้นที่', 'View our work': 'ดูผลงานของเรา',
  'Badminton courts': 'สนามแบดมินตัน', 'Players on ISF floors': 'ผู้เล่นบนพื้น ISF', 'Approved systems': 'ระบบที่ได้รับการรับรอง',
  'Projects in': 'โครงการใน', 'Talk to our sports infrastructure team': 'พูดคุยกับทีมโครงสร้างพื้นฐานด้านกีฬาของเรา',
  'Product guide': 'คู่มือผลิตภัณฑ์', 'Everything a sports venue needs, from the floor up.': 'ทุกสิ่งที่สถานที่กีฬาต้องการ เริ่มจากพื้น',
  Flooring: 'พื้นสนามกีฬา', Fabrication: 'งานโครงสร้างเหล็ก', Lighting: 'ระบบไฟส่องสว่าง',
  'Sport surfaces for every discipline': 'พื้นผิวสำหรับกีฬาทุกประเภท',
  'Steel-framed net enclosures and court structures, fabricated and erected on site.': 'โครงเหล็กและตาข่ายล้อมสนาม ผลิตและติดตั้งหน้างาน',
  'Lighting for indoor halls and outdoor turfs, planned with the court layout.': 'ไฟส่องสว่างสำหรับโรงยิมและสนามกลางแจ้ง วางแผนร่วมกับผังสนาม',
  'BWF-approved badminton floors and surfaces for every major sport, supplied and installed by our team.': 'พื้นแบดมินตันที่ได้รับการรับรองจาก BWF และพื้นผิวสำหรับกีฬาหลักทุกประเภท จัดหาและติดตั้งโดยทีมงานของเรา',
  'Learn more': 'ดูเพิ่มเติม', 'Request a quote': 'ขอใบเสนอราคา', 'Get a call back': 'ให้เราโทรกลับ', 'products': 'รายการ',
  'Badminton Wooden Flooring': 'พื้นไม้แบดมินตัน', 'Badminton Synthetic Flooring': 'พื้นสังเคราะห์แบดมินตัน', 'Tennis Court Flooring': 'พื้นสนามเทนนิส',
  'Pickleball Court': 'สนามพิคเคิลบอล', 'Padel Court': 'สนามปาเดล', 'Basketball Flooring': 'พื้นสนามบาสเกตบอล', 'Futsal Flooring': 'พื้นสนามฟุตซอล',
  'Running Track': 'ลู่วิ่ง', 'Skating Rink': 'ลานสเก็ต', 'Gym Flooring': 'พื้นยิม', 'Archery Flooring': 'พื้นสนามยิงธนู',
  'Outdoor Sports Flooring': 'พื้นสนามกีฬากลางแจ้ง', 'Swimming Pool': 'สระว่ายน้ำ', 'Cricket Net Enclosures': 'ตาข่ายล้อมสนามคริกเก็ต',
  'Court and Turf Enclosures': 'ตาข่ายล้อมสนามและสนามหญ้า', 'Indoor Court Lighting': 'ไฟสนามในร่ม', 'Outdoor Turf Floodlighting': 'ไฟสปอตไลต์สนามกลางแจ้ง',
  'Hear from the experts in badminton court flooring and construction.': 'รับคำแนะนำจากผู้เชี่ยวชาญด้านพื้นและการก่อสร้างสนามแบดมินตัน',
  'Planning a sports facility?': 'กำลังวางแผนสร้างสถานที่กีฬาใช่ไหม',
  'Tell us what you are building and we will get back with a plan and a quote.': 'บอกเราว่าคุณกำลังสร้างอะไร แล้วเราจะส่งแผนงานและใบเสนอราคากลับไป',
  Company: 'บริษัท', Offices: 'สำนักงาน', Phone: 'โทรศัพท์', WhatsApp: 'WhatsApp', Email: 'อีเมล',
  'Who we are': 'เราคือใคร', 'Turnkey sports infrastructure built to global federation standards.': 'โครงสร้างพื้นฐานด้านกีฬาแบบครบวงจร ได้มาตรฐานสหพันธ์สากล',
  'More about ISF': 'เกี่ยวกับ ISF เพิ่มเติม', 'Contact with us': 'ติดต่อเรา',
  'Tell us about your court, turf or training facility. Our team will call you back at a time that suits you with a plan and a quote.': 'บอกเราเกี่ยวกับสนาม สนามหญ้า หรือสถานที่ฝึกซ้อมของคุณ ทีมงานจะโทรกลับในเวลาที่คุณสะดวกพร้อมแผนงานและใบเสนอราคา',
  'Phone Number': 'หมายเลขโทรศัพท์', 'Email Address': 'อีเมล',
}
const DICT: Record<Lang, Record<string, string>> = { en: {}, zh: { ...ZH, ...ZH_MORE }, th: { ...TH, ...TH_MORE }, hi: HI, ta: TA, te: TE, ml: ML, ms: MS }

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (s: string) => string }
const I18n = createContext<Ctx>({ lang: 'en', setLang: () => {}, t: (s) => s })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try { const v = localStorage.getItem('isf-lang'); if (LANGS.some((l) => l.code === v)) return v as Lang } catch { /* storage unavailable */ }
    return 'en'
  })
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang === 'ms' ? 'ms-MY' : lang
    try { localStorage.setItem('isf-lang', lang) } catch { /* storage unavailable */ }
  }, [lang])
  const t = (s: string) => DICT[lang][s] ?? s
  return <I18n.Provider value={{ lang, setLang, t }}>{children}</I18n.Provider>
}

const LOCALES: Record<Lang, string> = { en: 'en-IN', zh: 'zh-CN', th: 'th-TH-u-ca-gregory', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', ml: 'ml-IN', ms: 'ms-MY' }
export const localeOf = (l: Lang) => LOCALES[l]
export const useI18n = () => useContext(I18n)
