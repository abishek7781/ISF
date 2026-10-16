export const A = (f: string) => `/assets/${f}`

export const CONTACT = {
  phone: '18004190106',
  whatsapp: '918754552007',
  emails: ['indiasportsfloorings@gmail.com', 'info@indiasportsfloorings.com'],
  address: ['37, Manikandan Nagar, Kundrathur', 'Chennai, Tamil Nadu 600069, India'],
  overseas: 'Baoding City, Hebei Province, PRC',
  map: 'https://www.google.com/maps/place/India+Sports+Floorings(+ISF+)/@13.0440342,80.2265088,17z',
  social: {
    Facebook: 'https://www.facebook.com/IndiaSportsFlooring',
    YouTube: 'https://www.youtube.com/@indiasportsfloorings',
    Instagram: 'https://www.instagram.com/indiasportsfloorings/',
    LinkedIn: 'https://www.linkedin.com/company/31567748/',
  },
}

export const NAV = [
  ['Home', '/'], ['Products', '/products'], ['Portfolio', '/portfolio'], ['About', '/about'], ['Contact', '/contact'],
] as const

export const STATS = [
  { value: 300, suffix: '+', label: 'Projects completed', note: 'Academies, schools, clubs and leagues' },
  { value: 700, suffix: '+', label: 'Courts built', note: 'Badminton courts to BWF standards' },
  { value: 4, suffix: '', label: 'Countries', note: 'India, China, USA and Thailand' },
  { value: 7, suffix: '', label: 'Certifications', note: 'BWF approvals and lab test reports' },
]

export const COUNTRIES: [string, string][] = [['India', 'in'], ['China', 'cn'], ['USA', 'us'], ['Andaman', 'in'], ['Thailand', 'th']]

export type Product = { name: string; group: string; text?: string; image?: string; featured?: boolean }

export const CAPABILITIES: { key: string; title: string; text: string; items: Product[] }[] = [
  {
    key: 'flooring',
    title: 'Flooring',
    text: 'BWF-approved badminton floors and surfaces for every major sport, supplied and installed by our team.',
    items: [
      { name: 'Badminton Wooden Flooring', text: 'BWF-approved sprung maple floor for competition and training halls.', group: 'Badminton', image: 'badminton4.jpg', featured: true },
      { name: 'Badminton Synthetic Flooring', text: 'Cushioned synthetic court surface with steady grip and shock absorption.', group: 'Badminton', image: 'badminton4.jpg' },
      { name: 'Tennis Court Flooring', text: 'Synthetic surfaces built for pace, bounce and drainage.', group: 'Racquet', image: 'tennis.webp' },
      { name: 'Pickleball Court', text: 'Court surfaces and markings made for pickleball play.', group: 'Racquet', image: 'products/pickleball.webp' },
      { name: 'Padel Court', text: 'Padel court surface and enclosure for clubs and resorts.', group: 'Racquet', image: 'products/padel.webp' },
      { name: 'Basketball Flooring', text: 'Shock-absorbing flooring for indoor and outdoor basketball.', group: 'Court', image: 'products/basketball.webp' },
      { name: 'Futsal Flooring', text: 'Artificial turf and court surfaces for futsal and football.', group: 'Turf', image: 'tt1.webp' },
      { name: 'Running Track', text: 'Rubberised athletics track with marked lanes.', group: 'Athletics', image: 'track.webp' },
      { name: 'Skating Rink', text: 'Smooth, durable surfaces for roller skating rinks.', group: 'Athletics', image: 'skating.webp' },
      { name: 'Gym Flooring', text: 'Hard-wearing flooring for gyms and training halls.', group: 'Fitness', image: 'hyrox.webp' },
      { name: 'Archery Flooring', text: 'Safe, level flooring for archery ranges.', group: 'Target', image: 'products/archery.webp' },
      { name: 'Outdoor Sports Flooring', text: 'Weatherproof multi-sport surfaces for open-air courts.', group: 'Outdoor', image: 'products/outdoor.webp' },
      { name: 'Swimming Pool', text: 'Pool finishes and surrounds for training and leisure pools.', group: 'Aquatic', image: 'products/swimming.webp' },
    ],
  },
  {
    key: 'fabrication',
    title: 'Fabrication',
    text: 'Steel-framed net enclosures and court structures, fabricated and erected on site.',
    items: [
      { name: 'Cricket Net Enclosures', text: 'Steel-framed net enclosures for cricket practice.', group: 'Turf', image: 'tt2.webp', featured: true },
      { name: 'Court and Turf Enclosures', text: 'Fenced enclosures for turfs and multi-sport courts.', group: 'Turf', image: 'tt1.webp' },
    ],
  },
  {
    key: 'lighting',
    title: 'Lighting',
    text: 'Lighting for indoor halls and outdoor turfs, planned with the court layout.',
    items: [
      { name: 'Indoor Court Lighting', text: 'Glare-controlled lighting for indoor halls.', group: 'Indoor', image: 'badminton4.jpg', featured: true },
      { name: 'Outdoor Turf Floodlighting', text: 'Floodlights planned for even coverage on open turfs.', group: 'Outdoor', image: 'products/floodlights.webp' },
    ],
  },
]


export const CERTS = [
  { title: 'BWF Approval, Court Mat', image: 'a1.webp' },
  { title: 'BWF Approval, Wooden Flooring', image: 'a2.webp' },
  { title: 'Installation Completion Certificate', image: 'a4.webp' },
  { title: 'Junior Badminton League Certificate', image: 'a5.webp' },
  { title: 'TNBSL Completion Certificate', image: 'a6.webp' },
  { title: 'Lab Test Report, PVC Court Mat', image: 'a7.webp' },
  { title: 'Lab Test Report, Wooden Floor', image: 'cert.webp' },
]

export const PORTFOLIO = [
  { n: 700, label: 'Badminton courts' }, { n: 50, label: 'Pickleball courts' }, { n: 50, label: 'Turf courts' },
  { n: 10, label: 'Tennis courts' }, { n: 10, label: 'Squash courts' }, { n: 5, label: 'Skating rinks' },
  { n: 2, label: 'Swimming pools' }, { n: 2, label: 'Archery ranges' }, { n: 2, label: 'Gym projects' },
]

export const GALLERY = [
  { image: 'badminton4.jpg', label: 'Badminton', group: 'Racquet' }, { image: 'tennis.webp', label: 'Tennis', group: 'Racquet' },
  { image: 'squash.webp', label: 'Squash', group: 'Racquet' }, { image: 'track.webp', label: 'Running track', group: 'Athletics' },
  { image: 'tt1.webp', label: 'Football turf', group: 'Turf' }, { image: 'tt2.webp', label: 'Cricket turf', group: 'Turf' },
  { image: 'skating.webp', label: 'Skating rink', group: 'Athletics' }, { image: 'shooting.webp', label: 'Shooting range', group: 'Training' },
  { image: 'hyrox.webp', label: 'Hyrox facility', group: 'Training' }, { image: 'redbull.webp', label: 'Fencing', group: 'Training' },
]

export const VIDEOS = [
  { id: 'U71SKGrzVmo', title: 'Project showcase', by: 'India Sports Floorings' },
  { id: 'DNBAU1VIOT8', title: 'Wooden flooring testimonial', by: 'TT Sports Academy' },
  { id: 'CTsATYJz7yE', title: 'Narendra Varma Raju', by: 'Gayathri Sports Arena' },
  { id: '31yrUbdA_sM', title: 'Vidya Balan', by: 'Client testimonial' },
  { id: '41PBi6qvgNk', title: 'Academy walkthrough', by: 'TT Sports Academy' },
]

export const TESTIMONIALS = [
  { quote: "It's very good quality wood and products they are using for badminton court making. As a badminton player I experienced it.", name: 'Diju V', role: 'Olympian' },
  { quote: 'Everything is done professionally.', name: 'Anil Kumar Raju', role: 'Current Indian top 10 doubles badminton player' },
  { quote: 'Wonderful and quality work. Excellent, thanks.', name: 'Geoffray', role: 'Former Tamil Nadu top player' },
  { quote: 'Great team to work with. Very prompt in timely completion and neat finishing.', name: 'Elangovan P', role: 'Client' },
  { quote: 'The quality is excellent and the workers are very professional. We are very happy.', name: 'Chethan Chethu', role: 'Client' },
  { quote: 'A team that showed excellence, commitment and experience. India Sports Flooring really gave my court a professional outlook.', name: 'K P Santhosh Nathan', role: 'Client' },
]

const logo = (n: string) => `logos/${n}.png`
export const CLIENTS = ['b1','b10','b11','b12','b13','b14','b15','b16','b17','b18','b22','b24','b26','b3','b7','b8','b9'].map(logo)
export const PARTNERS = ['b20','b21','b23','b25','b4','b5','b6','b2','lemon'].map(logo)

export const OUR_SERVICES: { name: string; group: string; image?: string }[] = [
  { name: 'Badminton court construction', group: 'Court and racquet', image: 'badminton4.jpg' },
  { name: 'Tennis court construction', group: 'Court and racquet', image: 'tennis.webp' },
  { name: 'Pickleball court construction', group: 'Court and racquet' },
  { name: 'Squash court construction', group: 'Court and racquet', image: 'squash.webp' },
  { name: 'Football court construction', group: 'Turf and field', image: 'tt1.webp' },
  { name: 'Cricket turf construction', group: 'Turf and field', image: 'tt2.webp' },
  { name: 'Running track construction', group: 'Athletics', image: 'track.webp' },
  { name: 'Skating rink construction', group: 'Athletics', image: 'skating.webp' },
  { name: 'Gym construction', group: 'Fitness', image: 'hyrox.webp' },
  { name: 'Hyrox construction', group: 'Fitness', image: 'hyrox.webp' },
  { name: 'Gym equipment', group: 'Fitness', image: 'gym.webp' },
  { name: 'Swimming pool construction', group: 'Target and aquatic' },
  { name: 'Archery range construction', group: 'Target and aquatic' },
  { name: 'Shooting range construction', group: 'Target and aquatic', image: 'shooting.webp' },
  { name: 'Fencing', group: 'Target and aquatic', image: 'redbull.webp' },
]

export const FAQS = [
  { q: 'What types of sports flooring do you offer in India?', a: 'Durable indoor court flooring, resilient outdoor sports surfaces and specialised gym flooring, tailored to the sport and the venue.' },
  { q: 'Can you install sports flooring in commercial spaces in India?', a: 'Yes. We install high-performance flooring for gyms, sports complexes and recreation centres, meeting both functional and aesthetic requirements.' },
  { q: 'Do you provide sports flooring maintenance services in India?', a: 'Yes. Our maintenance service covers everything from routine cleaning to repair work, keeping your floor in top condition.' },
  { q: 'What makes India Sports Flooring different from other flooring companies in India?', a: 'Flooring designed to international standards, precise installation by an experienced team, and a strong focus on durability, performance and customer satisfaction.' },
  { q: 'How can I get a quote for sports flooring in India?', a: 'Share your project details with us and our team will prepare a comprehensive quote tailored to your requirements.' },
  { q: 'Which type of flooring is used for a badminton hall?', a: 'A shock-absorbent surface with the right balance of grip and cushioning, typically synthetic wood or cushioned vinyl designed for indoor sport.' },
  { q: 'What is the cost of constructing an indoor badminton court in India?', a: 'It depends on court size, flooring type, lighting and amenities, and typically ranges from INR 10 lakhs to 30 lakhs. We provide a detailed quote for your specific needs.' },
  { q: 'Which floor is best for badminton?', a: 'Wooden floors such as maple or beech give excellent cushioning and consistent response; cushioned synthetic surfaces are durable and easy to maintain. We help you choose the right one.' },
  { q: 'What is the size of badminton court flooring?', a: '13.4 m long by 6.1 m wide for doubles, and 13.4 m by 5.18 m for singles. Every ISF installation is laid out to these exact dimensions.' },
  { q: 'How to build a badminton court?', a: 'Planning and design, site preparation and drainage, foundation and subfloor, flooring installation, court marking and equipment, then lighting and finishing. We can handle every step.' },
]

export const ZOHO = {
  action: 'https://crm.zoho.in/crm/WebToLeadForm',
  analytics: 'https://crm.zohopublic.in/crm/WebFormAnalyticsServeServlet?rid=3982914aec302f82f4fdd65c8bc2ea156aef7f564b784742eea3338be0b579446e48502ec673dcfea3112fcafaf893a8gid86ad5b38eff091e052ae7149effd25943644a51c8462859098ab3ebd741a000dgid74549c504ac282547d7d82bbab3e0a20ce13dac7fe602d3d3ce5485ed3a000c7gidbb098d1bb420bd9b00bcd41dc41d9e5de16e5c2e9ef5449ed8c71ef60154810e&tw=fcf34108bd3ecf9fe2019bfbb18c81e6191da7926f111733e5840f77c11e82ad&version=v2',
  hidden: {
    xnQsjsdp: 'b049bd447251128472790e041a852618b687c24f3a168e97f77e9ff8f305e9da',
    zc_gad: '',
    xmIwtLD: '4ab78b77aea2da625e00c607c5ecf53fd31eee97cdd5ab94b158f17a2bbd315b08f4ca1037af62cda5ddb46a8559f15c',
    actionType: 'TGVhZHM=',
    returnURL: 'null',
    aG9uZXlwb3Q: '',
    'Lead Source': 'Website',
  },
  projectTypes: ['Badminton Court', 'Cricket Turf', 'Pickleball Court', 'Other'],
  // value the CRM's Sport Type list has for brochure requests
  brochureType: 'Presentation download',
}
