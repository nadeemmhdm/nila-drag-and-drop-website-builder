import type { CatalogPreset } from './catalog';
import { createNode } from './model';
import { withMotion, type MotionProfile } from './motion';
import type { EditorNode, EditorNodeProps, EditorNodeType, NodeStyle } from './types';

type Config = {
  name?: string;
  props?: EditorNodeProps;
  style?: NodeStyle;
  tablet?: NodeStyle;
  mobile?: NodeStyle;
  children?: EditorNode[];
};

const patch = (type: EditorNodeType, config: Config = {}): EditorNode => {
  const base = createNode(type);
  return {
    ...base,
    name: config.name ?? base.name,
    props: { ...base.props, ...config.props },
    styles: {
      desktop: { ...base.styles.desktop, ...config.style },
      tablet: { ...base.styles.tablet, ...config.tablet },
      mobile: { ...base.styles.mobile, ...config.mobile },
    },
    children: config.children ?? base.children,
  };
};

const h = (value: string, style: NodeStyle = {}) => patch('heading', { props: { text: value }, style });
const p = (value: string, style: NodeStyle = {}) => patch('paragraph', { props: { text: value }, style });
const b = (value: string, style: NodeStyle = {}, props: EditorNodeProps = {}) => patch('button', { props: { text: value, ...props }, style });
const badge = (value: string, style: NodeStyle = {}) => patch('badge', { props: { text: value }, style });
const icon = (name: string, style: NodeStyle = {}) => patch('icon', { props: { iconName: name, iconMode: 'lucide' }, style });
const image = (alt: string, style: NodeStyle = {}) => patch('image', { props: { alt }, style });
const card = (children: EditorNode[], style: NodeStyle = {}, mobile: NodeStyle = {}) => patch('card', { children, style, mobile });
const container = (children: EditorNode[], style: NodeStyle = {}, mobile: NodeStyle = {}) => patch('container', { children, style, mobile });
const row = (children: EditorNode[], style: NodeStyle = {}, mobile: NodeStyle = {}) => patch('row', { children, style, mobile });
const columns = (children: EditorNode[], style: NodeStyle = {}, mobile: NodeStyle = {}) => patch('columns', { children, style, mobile });
const grid = (children: EditorNode[], columnsCount = 3, style: NodeStyle = {}, mobile: NodeStyle = {}) => patch('grid', {
  children,
  style: { gridTemplateColumns: `repeat(${columnsCount}, minmax(0, 1fr))`, gap: '18px', ...style },
  tablet: { gridTemplateColumns: columnsCount > 2 ? 'repeat(2, minmax(0, 1fr))' : undefined },
  mobile: { gridTemplateColumns: '1fr', ...mobile },
});
const section = (name: string, children: EditorNode[], style: NodeStyle = {}, mobile: NodeStyle = {}) => patch('section', {
  name,
  style,
  mobile,
  children: [container(children)],
});

function siteNav(brand: string, dark = false, accent = '#6366f1') {
  return section('Navbar', [
    container([
      h(brand, { fontSize: '21px', color: dark ? '#ffffff' : '#111827' }),
      row([
        patch('link', { props: { text: 'Home', href: '#' }, style: { color: dark ? '#d4d4d8' : '#374151' } }),
        patch('link', { props: { text: 'Work', href: '#' }, style: { color: dark ? '#d4d4d8' : '#374151' } }),
        patch('link', { props: { text: 'About', href: '#' }, style: { color: dark ? '#d4d4d8' : '#374151' } }),
        b('Get started', { background: accent, color: dark ? '#09090b' : '#ffffff' }),
      ], { width: 'auto', gap: '13px' }),
    ], { maxWidth: '1180px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '18px' }),
  ], {
    padding: '17px 28px',
    background: dark ? '#0b0b0f' : 'rgba(255,255,255,.94)',
    borderBottom: dark ? '1px solid rgba(255,255,255,.08)' : '1px solid #e5e7eb',
  });
}

function footer(brand: string, dark = false, accent = '#6366f1') {
  return section('Footer', [
    grid([
      container([h(brand, { fontSize: '24px', color: dark ? '#ffffff' : '#111827' }), p('A focused digital experience built with Nila.', { color: dark ? '#9ca3af' : '#64748b' })]),
      container([h('Explore', { fontSize: '15px', color: dark ? '#ffffff' : '#111827' }), patch('link', { props: { text: 'About' } }), patch('link', { props: { text: 'Services' } })]),
      container([h('Connect', { fontSize: '15px', color: dark ? '#ffffff' : '#111827' }), patch('link', { props: { text: 'Contact' }, style: { color: accent } }), patch('link', { props: { text: 'Instagram' } })]),
    ]),
    patch('divider', { style: { margin: '22px 0 8px', background: dark ? 'rgba(255,255,255,.12)' : '#e5e7eb' } }),
    p(`© ${new Date().getFullYear()} ${brand}. All rights reserved.`, { fontSize: '13px', color: dark ? '#71717a' : '#94a3b8' }),
  ], { padding: '58px 32px', background: dark ? '#09090b' : '#fafafa', color: dark ? '#d1d5db' : '#374151' });
}

function featureCard(title: string, copy: string, iconName: string, accent: string, surface = '#ffffff') {
  return card([
    icon(iconName, { width: '44px', height: '44px', borderRadius: '12px', background: `${accent}18`, color: accent }),
    h(title, { fontSize: '21px' }),
    p(copy),
  ], { background: surface, minHeight: '195px' });
}

function stat(value: string, label: string, style: NodeStyle = {}) {
  return card([h(value, { fontSize: '42px', ...style }), p(label, { color: style.color ? style.color : '#64748b' })], { background: 'transparent', border: '0', padding: '12px' });
}

function saas() {
  const brand = 'OrbitFlow';
  const heroVisual = card([
    row([badge('Live workspace'), badge('12 teammates', { background: '#dcfce7', color: '#166534' })], { justifyContent: 'space-between' }),
    h('Launch board', { fontSize: '28px' }),
    grid([
      card([p('In progress'), h('24', { fontSize: '32px' })], { background: '#f8fafc' }),
      card([p('Completed'), h('81%', { fontSize: '32px' })], { background: '#eef2ff' }),
    ], 2),
    card([p('Today'), h('Design review → Build → QA', { fontSize: '18px' }), p('Every handoff stays visible.')], { background: '#111827', color: '#ffffff' }),
  ], { padding: '28px', background: 'linear-gradient(145deg,#ffffff,#eef2ff)', border: '1px solid #c7d2fe', boxShadow: '0 30px 80px rgba(79,70,229,.16)' });
  return [
    siteNav(brand, false, '#4f46e5'),
    section('SaaS hero', [
      columns([
        container([
          badge('AI WORKSPACE', { background: '#eef2ff', color: '#4338ca' }),
          h('One workspace to turn busy work into momentum.', { fontSize: '68px', letterSpacing: '-.055em', maxWidth: '760px' }),
          p('Plan projects, automate handoffs and keep every decision visible without adding another complicated tool.', { fontSize: '18px', maxWidth: '640px' }),
          row([b('Start free', { background: '#4f46e5', padding: '14px 22px' }), b('Watch demo', { background: '#ffffff', color: '#111827', border: '1px solid #d1d5db' })], { width: 'auto' }),
        ]),
        heroVisual,
      ], { gridTemplateColumns: '1.08fr .92fr', gap: '54px' }, { gridTemplateColumns: '1fr' }),
    ], { padding: '96px 32px', background: 'radial-gradient(circle at 78% 18%,#c7d2fe 0,transparent 24%),linear-gradient(180deg,#fff,#f8fafc)' }),
    section('SaaS proof', [p('Used by focused teams at', { textAlign: 'center', fontWeight: 650 }), row(['NORTHSTAR','PIXELCO','VERGE','ATLAS','LOOM'].map((name) => badge(name, { background: '#ffffff', color: '#475569', border: '1px solid #e2e8f0', padding: '10px 16px' })), { justifyContent: 'center', gap: '12px' })], { padding: '38px 28px', background: '#f8fafc' }),
    section('SaaS bento', [
      badge('WHY ORBITFLOW'),
      h('Clarity where teams usually lose time.', { fontSize: '46px', maxWidth: '760px' }),
      grid([
        card([icon('Workflow'), h('Automations that stay understandable', { fontSize: '24px' }), p('Automate repetitive steps while people stay in control.')], { gridColumn: 'span 2', minHeight: '230px', background: 'linear-gradient(135deg,#eef2ff,#fff)' }),
        featureCard('Shared context', 'Notes, approvals and project state live next to the work.', 'MessagesSquare', '#4f46e5'),
        featureCard('Fast handoffs', 'Ownership and next actions stay obvious.', 'ArrowRightLeft', '#06b6d4'),
        card([badge('LIVE'), h('98.4%', { fontSize: '44px', color: '#ffffff' }), p('Tasks completed without a status meeting.', { color: '#cbd5e1' })], { gridColumn: 'span 2', background: '#111827' }),
      ], 3),
    ], { padding: '90px 32px' }),
    section('SaaS pricing', [
      badge('PRICING'),
      h('Start small. Upgrade when the team grows.', { fontSize: '42px' }),
      grid([
        card([h('Starter', { fontSize: '22px' }), h('$0', { fontSize: '42px' }), p('For solo builders.'), patch('list', { props: { items: ['3 projects','Core automations','Local export'] } }), b('Start free', { width: '100%' })]),
        card([badge('MOST POPULAR'), h('Pro', { fontSize: '22px' }), h('$19', { fontSize: '42px' }), p('For teams shipping weekly.'), patch('list', { props: { items: ['Unlimited projects','Advanced workflows','Team permissions'] } }), b('Choose Pro', { width: '100%', background: '#4f46e5' })], { border: '2px solid #6366f1', boxShadow: '0 22px 55px rgba(79,70,229,.14)' }),
      ], 2, { maxWidth: '850px', margin: '28px auto 0' }),
    ], { background: '#f8fafc' }),
    footer(brand),
  ];
}

function agency() {
  const brand = 'Northline Studio';
  return [
    siteNav(brand, true, '#f97316'),
    section('Agency editorial hero', [
      badge('INDEPENDENT DIGITAL STUDIO', { background: '#f97316', color: '#111827' }),
      h('We make brands impossible to scroll past.', { fontSize: '84px', lineHeight: .95, letterSpacing: '-.065em', color: '#ffffff', maxWidth: '1050px' }),
      row([p('Strategy, identity and digital experiences for ambitious companies.', { maxWidth: '620px', fontSize: '19px', color: '#a1a1aa' }), b('Start a project', { background: '#f97316', color: '#111827' })], { justifyContent: 'space-between', alignItems: 'end', gap: '30px' }),
    ], { padding: '110px 32px 82px', background: 'linear-gradient(160deg,#09090b,#18181b 66%,#291607)' }),
    section('Agency capabilities', [
      row([h('What we do', { fontSize: '42px' }), p('Senior thinking, sharp execution, no unnecessary layers.', { maxWidth: '480px' })], { justifyContent: 'space-between' }),
      grid([
        featureCard('Brand systems', 'Positioning, identity and flexible rules.', 'Shapes', '#f97316', '#fff7ed'),
        featureCard('Web experiences', 'Editorial websites with purposeful motion.', 'MonitorUp', '#f97316'),
        featureCard('Launch campaigns', 'Ideas and assets built to create momentum.', 'Megaphone', '#f97316'),
      ]),
    ]),
    section('Agency numbers', [grid([stat('42','Brands launched',{color:'#ffffff'}), stat('11','Countries reached',{color:'#ffffff'}), stat('94%','Referral-led work',{color:'#ffffff'})])], { padding: '64px 32px', background: '#0f0f12' }),
    section('Agency process', [badge('OUR PROCESS'), h('Focused enough to move fast. Structured enough to stay clear.', { fontSize: '46px', maxWidth: '850px' }), grid([
      card([badge('01'), h('Find the sharp idea', { fontSize: '23px' }), p('Research, positioning and a memorable creative direction.')]),
      card([badge('02'), h('Build the system', { fontSize: '23px' }), p('Design language, interaction rules and reusable components.')]),
      card([badge('03'), h('Launch with intent', { fontSize: '23px' }), p('QA, rollout assets and practical team handoff.')]),
    ])], { background: '#fafafa' }),
    section('Agency client note', [card([badge('CLIENT NOTE', { background: '#ffedd5', color: '#9a3412' }), patch('quote', { props: { text: '“Northline gave us a point of view, not just a prettier website.”' }, style: { fontSize: '34px', borderLeft: '0', padding: 0 } }), p('— Founder, growth company')], { padding: '46px', maxWidth: '920px', margin: '0 auto', background: '#fff7ed', border: '1px solid #fed7aa' })]),
    section('Agency contact', [columns([
      container([badge('LET’S TALK'), h('Have a launch worth caring about?', { fontSize: '54px', color: '#ffffff' }), p('Tell us what is changing and what a strong outcome looks like.', { color: '#a1a1aa' })]),
      card([patch('input', { props: { label: 'Name', placeholder: 'Your name' } }), patch('input', { props: { label: 'Email', placeholder: 'you@company.com', inputType: 'email' } }), patch('textarea', { props: { label: 'Project', placeholder: 'What are you building?' } }), b('Send project brief', { background: '#f97316', color: '#111827', width: '100%' })], { background: '#18181b', color: '#ffffff', border: '1px solid #27272a' }),
    ])], { background: '#09090b' }),
    footer(brand, true, '#f97316'),
  ];
}

function portfolio() {
  const brand = 'Mira / Works';
  return [
    siteNav(brand, false, '#0f172a'),
    section('Portfolio intro', [columns([
      container([badge('PRODUCT DESIGNER + DEVELOPER', { background: '#ecfeff', color: '#155e75' }), h('Quiet interfaces. Clear decisions. Strong details.', { fontSize: '70px', letterSpacing: '-.06em' }), p('I design and build digital products for teams that care about usefulness and craft.', { fontSize: '18px' }), b('View selected work')]),
      card([image('Portrait or workspace photograph', { minHeight: '420px', borderRadius: '28px' }), row([badge('Available for select projects'), badge('Kerala / Remote', { background: '#f1f5f9', color: '#475569' })], { justifyContent: 'space-between' })], { padding: '14px', borderRadius: '30px', background: '#f8fafc' }),
    ], { gridTemplateColumns: '1.15fr .85fr', gap: '58px' }, { gridTemplateColumns: '1fr' })], { padding: '96px 32px' }),
    section('Selected work', [row([h('Selected work', { fontSize: '44px' }), p('Projects where product thinking and visual craft had to work together.', { maxWidth: '480px' })], { justifyContent: 'space-between' }), grid([
      card([image('Fintech dashboard case study', { minHeight: '300px' }), badge('PRODUCT SYSTEM'), h('Ledger — making complex finance feel obvious.', { fontSize: '27px' }), p('Product strategy · UX · Design system')], { gridColumn: 'span 2', background: '#f8fafc' }),
      card([image('Travel mobile app case study', { minHeight: '260px' }), badge('MOBILE'), h('Roam — trip planning without the tabs.', { fontSize: '24px' })], { background: '#fefce8' }),
      card([image('Developer tool interface', { minHeight: '260px' }), badge('DEV TOOL'), h('Trace — debugging with less noise.', { fontSize: '24px' })], { background: '#eef2ff' }),
    ], 3)], { background: '#ffffff' }),
    section('Portfolio profile', [columns([
      container([badge('ABOUT'), h('I like work where structure matters as much as style.', { fontSize: '44px' }), p('My process blends product reasoning, interface design and front-end implementation.')]),
      grid([stat('05+','Years designing'), stat('28','Products shipped'), stat('3','Core disciplines'), stat('1','Point of contact')], 2),
    ], { gap: '56px' })], { background: '#f8fafc' }),
    section('Portfolio contact', [card([badge('NEXT PROJECT'), h('If the product needs clarity, I’m interested.', { fontSize: '48px', textAlign: 'center' }), p('Send a short note about the problem, timeline and team.', { textAlign: 'center' }), b('Start a conversation', { margin: '0 auto' })], { padding: '56px', alignItems: 'center', borderRadius: '28px', background: '#ecfeff' })]),
    footer(brand),
  ];
}

function business() {
  const brand = 'Harbor & Co.';
  return [
    siteNav(brand, false, '#0369a1'),
    section('Business hero', [columns([
      container([badge('TRUSTED BUSINESS PARTNER', { background: '#e0f2fe', color: '#075985' }), h('Practical expertise for the decisions that shape your next stage.', { fontSize: '60px' }), p('Advisory, operations and growth support for established businesses.', { fontSize: '18px' }), row([b('Book consultation', { background: '#0369a1' }), b('Our services', { background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' })], { width: 'auto' })]),
      card([badge('THIS QUARTER'), h('18.6%', { fontSize: '56px', color: '#0369a1' }), p('Average operational efficiency gain.'), patch('divider'), row([stat('32','Active clients'), stat('96%','Retention')], { justifyContent: 'space-between' })], { background: '#f0f9ff', border: '1px solid #bae6fd', padding: '32px' }),
    ], { gap: '54px' })], { background: 'linear-gradient(180deg,#fff,#f0f9ff)' }),
    section('Business services', [badge('CAPABILITIES'), h('Support where it creates measurable leverage.', { fontSize: '42px' }), grid([
      featureCard('Operations', 'Simplify workflows, roles and reporting.', 'Workflow', '#0369a1'),
      featureCard('Growth planning', 'Prioritize the channels most likely to move revenue.', 'TrendingUp', '#0369a1'),
      featureCard('Digital systems', 'Implement practical tools without unnecessary complexity.', 'Blocks', '#0369a1'),
    ])]),
    section('Business proof', [grid([stat('12+','Years of experience',{color:'#ffffff'}), stat('₹120Cr','Client revenue supported',{color:'#ffffff'}), stat('9','Industries served',{color:'#ffffff'}), stat('4.9/5','Average client rating',{color:'#ffffff'})], 4)], { padding: '56px 32px', background: '#0c4a6e' }),
    section('Business team', [row([h('Senior people stay close to the work.', { fontSize: '42px' }), p('No handoff maze. Your core team remains involved.', { maxWidth: '460px' })], { justifyContent: 'space-between' }), grid(['Asha Menon','Daniel Roy','Maya Thomas'].map((name,index) => card([patch('avatar', { props: { alt: `${name} portrait` }, style: { width: '72px', height: '72px' } }), h(name, { fontSize: '21px' }), p(['Operations lead','Growth advisor','Digital systems'][index])])))] , { background: '#f8fafc' }),
    section('Business consultation', [columns([container([badge('CONSULTATION'), h('Bring us the messy version.', { fontSize: '46px' }), p('We will help turn it into a clear next step.')]), card([patch('input', { props: { label: 'Work email', inputType: 'email', placeholder: 'you@company.com' } }), patch('select', { props: { label: 'Primary need', options: ['Operations','Growth','Digital systems'] } }), patch('textarea', { props: { label: 'Context', placeholder: 'What are you trying to improve?' } }), b('Request consultation', { background: '#0369a1', width: '100%' })])])]),
    footer(brand),
  ];
}

function appLanding() {
  const brand = 'Pulse';
  const phone = card([
    badge('9:41'),
    h('Good morning, Nila', { fontSize: '26px' }),
    p('Three priorities. Two focus blocks. One calm day.'),
    card([p('NEXT FOCUS'), h('Website launch', { fontSize: '22px' }), badge('45 min', { background: '#ede9fe', color: '#6d28d9' })], { background: '#faf5ff' }),
    grid([stat('7','day streak'), stat('82%','focus score')], 2),
  ], { maxWidth: '360px', margin: '0 auto', borderRadius: '34px', padding: '26px', background: '#ffffff', boxShadow: '0 36px 90px rgba(124,58,237,.2)', border: '8px solid #111827' });
  return [
    siteNav(brand, false, '#7c3aed'),
    section('App hero', [columns([container([badge('NEW · VERSION 2.0', { background: '#f3e8ff', color: '#6b21a8' }), h('Your day, organized around energy — not endless lists.', { fontSize: '64px', letterSpacing: '-.05em' }), p('Focus sessions, simple planning and gentle routines in one mobile app.', { fontSize: '18px' }), row([b('Download for iOS'), b('Get Android', { background: '#7c3aed' })], { width: 'auto' })]), container([phone], { alignItems: 'center' })], { gridTemplateColumns: '1.08fr .92fr', gap: '56px' })], { background: 'radial-gradient(circle at 82% 20%,#ddd6fe 0,transparent 30%),linear-gradient(180deg,#fff,#faf5ff)' }),
    section('App features', [badge('BUILT FOR REAL DAYS'), h('Small interactions that make the whole app feel lighter.', { fontSize: '44px' }), grid([
      featureCard('Focus mode', 'A quiet timer that hides everything except the chosen task.', 'Timer', '#7c3aed', '#faf5ff'),
      featureCard('Energy planning', 'Match important work to the time you actually have attention.', 'BatteryCharging', '#7c3aed'),
      featureCard('Gentle streaks', 'Stay consistent without turning missed days into guilt.', 'Flame', '#7c3aed'),
    ])]),
    section('App review', [card([patch('quote', { props: { text: '“Pulse is the first productivity app I kept using after the first week.”' }, style: { fontSize: '32px', borderLeft: '0', textAlign: 'center' } }), p('★★★★★ · App Store review', { textAlign: 'center', color: '#7c3aed', fontWeight: 700 })], { maxWidth: '860px', margin: '0 auto', padding: '48px', background: '#f5f3ff', border: '0' })]),
    section('App download', [columns([container([badge('READY WHEN YOU ARE'), h('Start with one calmer day.', { fontSize: '46px', color: '#ffffff' }), p('Free to try. No credit card required.', { color: '#cbd5e1' })]), row([b('Download Pulse', { background: '#7c3aed' }), badge('4.9 ★', { padding: '12px 15px' })], { justifyContent: 'flex-end' })])], { background: '#111827' }),
    footer(brand),
  ];
}

function comingSoon() {
  const brand = 'Aster';
  return [
    section('Navbar', [container([h(brand, { fontSize: '22px', color: '#ffffff' }), badge('PRIVATE BETA', { background: 'rgba(255,255,255,.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,.16)' })], { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' })], { padding: '20px 30px', background: '#09090b' }),
    section('Launch hero', [container([badge('LAUNCHING SOON', { background: '#27272a', color: '#e4e4e7' }), h('A better place for ideas before they become tasks.', { fontSize: '78px', lineHeight: .98, letterSpacing: '-.06em', textAlign: 'center', color: '#ffffff' }), p('A private thinking space for notes, research and early product decisions.', { fontSize: '19px', textAlign: 'center', color: '#a1a1aa' }), row([patch('input', { props: { label: 'Email', placeholder: 'you@example.com', inputType: 'email' }, style: { minWidth: '310px', background: '#18181b', border: '1px solid #3f3f46', color: '#ffffff' } }), b('Join the waitlist', { background: '#e4e4e7', color: '#09090b', minHeight: '46px' })], { alignItems: 'end', justifyContent: 'center', width: 'auto' }, { flexDirection: 'column', alignItems: 'stretch', width: '100%' })], { alignItems: 'center', minHeight: '620px', justifyContent: 'center' })], { background: 'radial-gradient(circle at 50% 20%,#3f3f46 0,transparent 34%),#09090b' }),
    section('Launch countdown', [grid([stat('04','Weeks'), stat('18','Days'), stat('07','Hours'), stat('42','Minutes')], 4, { maxWidth: '820px', margin: '0 auto' })], { background: '#f4f4f5', padding: '52px 28px' }),
    section('Launch preview', [badge('WHAT IS COMING'), h('Capture the messy thinking. Keep the useful parts.', { fontSize: '44px' }), grid([
      featureCard('Daily notes', 'Fast capture without forcing structure too early.', 'NotebookPen', '#27272a'),
      featureCard('Connected research', 'Link references and decisions without building a second brain.', 'Network', '#27272a'),
      featureCard('Private by default', 'A calm local-first workspace with clear export paths.', 'Shield', '#27272a'),
    ])]),
    footer(brand, true, '#e4e4e7'),
  ];
}

function resume() {
  const brand = 'Arjun N.';
  return [
    siteNav(brand),
    section('Resume hero', [columns([container([badge('FULL-STACK DEVELOPER'), h('I build dependable products from interface to infrastructure.', { fontFamily: 'Georgia, serif', fontSize: '62px', fontWeight: 500 }), p('Developer based in Kerala, focused on useful web applications and maintainable systems.', { fontSize: '18px' }), row([b('View projects'), b('Download résumé', { background: '#ffffff', color: '#111827', border: '1px solid #cbd5e1' })], { width: 'auto' })]), card([patch('avatar', { props: { alt: 'Developer portrait' }, style: { width: '96px', height: '96px' } }), h('Available for full-time & freelance', { fontSize: '22px' }), p('React · TypeScript · Node · Cloudflare · Security-minded development'), badge('Open to remote')], { background: '#f8fafc', padding: '30px' })])]),
    section('Resume experience', [h('Experience', { fontFamily: 'Georgia, serif', fontSize: '44px', fontWeight: 500 }), container([
      card([row([h('Product Developer', { fontSize: '23px' }), badge('2025 — NOW')], { justifyContent: 'space-between' }), p('Independent projects'), p('Built local-first tools, automation workflows and production web applications.')]),
      card([row([h('Web Developer', { fontSize: '23px' }), badge('2024 — 2025')], { justifyContent: 'space-between' }), p('Freelance'), p('Designed and shipped responsive client websites and internal tools.')]),
    ])], { background: '#fafafa' }),
    section('Resume toolkit', [h('Core toolkit', { fontFamily: 'Georgia, serif', fontSize: '40px', fontWeight: 500 }), row(['React','TypeScript','Vite','Cloudflare','Firebase','Node.js','Security','UI/UX'].map((item) => badge(item, { padding: '10px 14px', background: '#ffffff', border: '1px solid #e2e8f0', color: '#334155' })), { flexWrap: 'wrap' })]),
    section('Resume projects', [h('Selected builds', { fontFamily: 'Georgia, serif', fontSize: '40px', fontWeight: 500 }), grid([
      card([badge('LOCAL AI'), h('Offline AI workspace', { fontSize: '24px' }), p('Local model runtime, tools, RAG and safe search.')]),
      card([badge('WEB APP'), h('Attendance platform', { fontSize: '24px' }), p('Role-based attendance, leave requests and reports.')]),
      card([badge('SECURITY'), h('Secure sharing tool', { fontSize: '24px' }), p('Protected links, audit logs and emergency controls.')]),
    ])]),
    footer(brand),
  ];
}

function property() {
  const brand = 'Atelier Homes';
  return [
    siteNav(brand, false, '#92400e'),
    section('Property luxury hero', [columns([container([badge('CURATED HOMES · KERALA', { background: '#fef3c7', color: '#92400e' }), h('Spaces chosen for how they feel, not just how they photograph.', { fontFamily: 'Georgia, serif', fontWeight: 500, fontSize: '62px' }), p('A considered collection of homes, villas and apartments across Kerala.', { fontSize: '18px' }), row([patch('input', { props: { label: 'Location', placeholder: 'Kochi, Calicut, Malappuram' } }), b('Explore homes', { background: '#92400e' })], { alignItems: 'end' })]), image('Warm contemporary villa exterior', { minHeight: '500px', borderRadius: '28px' })], { gap: '50px' })], { background: '#fffbeb' }),
    section('Featured properties', [row([h('Homes worth seeing in person', { fontFamily: 'Georgia, serif', fontSize: '42px', fontWeight: 500 }), b('View all listings', { background: '#ffffff', color: '#92400e', border: '1px solid #d6d3d1' })], { justifyContent: 'space-between' }), grid([
      card([image('Sea-facing apartment', { minHeight: '250px' }), badge('KOCHI'), h('Sea House 04', { fontFamily: 'Georgia, serif', fontSize: '25px', fontWeight: 500 }), p('3 bed · 2 bath · 1,860 sq ft'), h('₹1.42 Cr', { fontSize: '22px', color: '#92400e' })]),
      card([image('Minimal garden villa', { minHeight: '250px' }), badge('MALAPPURAM'), h('Garden Court', { fontFamily: 'Georgia, serif', fontSize: '25px', fontWeight: 500 }), p('4 bed · 3 bath · private garden'), h('₹98 L', { fontSize: '22px', color: '#92400e' })]),
      card([image('Urban penthouse interior', { minHeight: '250px' }), badge('CALICUT'), h('Skyline 17', { fontFamily: 'Georgia, serif', fontSize: '25px', fontWeight: 500 }), p('3 bed · terrace · city view'), h('₹1.18 Cr', { fontSize: '22px', color: '#92400e' })]),
    ])]),
    section('Property advisory', [columns([image('Agent consultation', { minHeight: '380px', borderRadius: '26px' }), container([badge('PRIVATE ADVISORY'), h('Buying a home is personal. The process should feel that way.', { fontFamily: 'Georgia, serif', fontSize: '42px', fontWeight: 500 }), p('We shortlist, arrange viewings, compare documents and stay through closing.'), grid([stat('72h','Average shortlist time'), stat('4.9/5','Buyer satisfaction')], 2), b('Speak with an advisor', { background: '#92400e' })])])], { background: '#f5f5f4' }),
    footer(brand, false, '#92400e'),
  ];
}

function animatedStudio() {
  const brand = 'VOID/FORM';
  return [
    siteNav(brand, true, '#a3ff12'),
    section('Studio hero', [container([
      badge('CREATIVE TECHNOLOGY STUDIO', { background: '#a3ff12', color: '#0a0a0a' }),
      h('We build digital experiences that move before you touch them.', { fontSize: '94px', lineHeight: .9, letterSpacing: '-.075em', color: '#f4f4f5', maxWidth: '1180px' }),
      row([p('Identity, interactive websites and launch experiences for culture-shaping brands.', { fontSize: '19px', color: '#a1a1aa', maxWidth: '560px' }), b('Enter the studio', { background: '#a3ff12', color: '#09090b' })], { justifyContent: 'space-between', alignItems: 'end', gap: '30px' }),
      row(['MOTION','IDENTITY','WEBGL','EDITORIAL','EXPERIMENTS'].map((item) => badge(item, { background: 'transparent', color: '#71717a', border: '1px solid #27272a', padding: '9px 14px' })), { marginTop: '30px', flexWrap: 'wrap' }),
    ], { minHeight: '690px', justifyContent: 'center' })], { background: 'radial-gradient(circle at 85% 12%,rgba(163,255,18,.14),transparent 28%),radial-gradient(circle at 12% 74%,rgba(124,58,237,.18),transparent 30%),#09090b' }),
    section('Studio marquee', [row(['MAKE','MOVE','DISTORT','REPEAT','SURPRISE'].map((item) => h(item, { fontSize: '34px', color: '#d4d4d8', whiteSpace: 'nowrap' })), { justifyContent: 'space-between', gap: '28px', flexWrap: 'wrap' })], { padding: '30px 32px', background: '#18181b', borderTop: '1px solid #27272a', borderBottom: '1px solid #27272a' }),
    section('Studio work', [row([h('Selected collisions', { fontSize: '52px', color: '#ffffff' }), p('Projects where design, code and movement become one system.', { maxWidth: '450px', color: '#a1a1aa' })], { justifyContent: 'space-between' }), grid([
      card([image('Experimental fashion campaign', { minHeight: '360px', borderRadius: '0' }), badge('FASHION / 2026', { background: '#a3ff12', color: '#09090b' }), h('Afterimage', { fontSize: '30px', color: '#ffffff' }), p('A campaign site built like a live editorial spread.', { color: '#a1a1aa' })], { gridColumn: 'span 2', background: '#111113', border: '1px solid #27272a', borderRadius: '0' }),
      card([image('Music visual identity', { minHeight: '300px', borderRadius: '0' }), badge('MUSIC'), h('Signal Loss', { fontSize: '26px', color: '#ffffff' })], { background: '#18181b', border: '1px solid #27272a', borderRadius: '0' }),
      card([image('Creative software landing page', { minHeight: '300px', borderRadius: '0' }), badge('PRODUCT'), h('Soft Machine', { fontSize: '26px', color: '#ffffff' })], { background: '#18181b', border: '1px solid #27272a', borderRadius: '0' }),
      card([badge('LIVE SYSTEM'), h('Motion should explain hierarchy — not decorate it.', { fontSize: '35px', color: '#09090b' }), p('Every transition earns its place.', { color: '#27272a' })], { gridColumn: 'span 2', background: '#a3ff12', border: '0', borderRadius: '0', minHeight: '270px', justifyContent: 'center' }),
    ], 3)], { background: '#09090b' }),
    section('Studio capabilities', [badge('CAPABILITIES', { background: '#27272a', color: '#a3ff12' }), h('From static idea to living system.', { fontSize: '52px', color: '#ffffff' }), grid([
      featureCard('Interactive direction', 'Motion systems, prototypes and behaviour principles.', 'MousePointer2', '#a3ff12', '#18181b'),
      featureCard('Digital identity', 'Flexible type, colour and interaction rules.', 'Scan', '#a3ff12', '#18181b'),
      featureCard('Creative development', 'Expressive front-end builds with production discipline.', 'Code2', '#a3ff12', '#18181b'),
    ])], { background: '#111113', color: '#ffffff' }),
    section('Studio CTA', [card([badge('NEXT / 01', { background: '#a3ff12', color: '#09090b' }), h('Bring the strange version first.', { fontSize: '62px', lineHeight: .95, color: '#ffffff' }), p('The sharpest ideas usually arrive before they become sensible.', { color: '#a1a1aa' }), b('Start a conversation', { background: '#a3ff12', color: '#09090b' })], { padding: '60px', background: 'linear-gradient(135deg,#18181b,#2e1065)', border: '1px solid #3f3f46', borderRadius: '0' })], { background: '#09090b' }),
    footer(brand, true, '#a3ff12'),
  ];
}

function dashboard() {
  const brand = 'MetricOS';
  const sidebar = card([
    h(brand, { fontSize: '20px' }),
    badge('PRO WORKSPACE'),
    ...['Overview','Analytics','Projects','Customers','Settings'].map((item,index) => row([
      icon(['LayoutDashboard','ChartNoAxesCombined','FolderKanban','Users','Settings'][index], { fontSize: '18px' }),
      p(item, { color: index === 0 ? '#4338ca' : '#475569', fontWeight: index === 0 ? 700 : 550 }),
    ], { padding: '10px 11px', borderRadius: '10px', background: index === 0 ? '#eef2ff' : 'transparent' })),
    patch('spacer', { style: { height: '110px' } }),
    card([p('Storage'), h('62%', { fontSize: '25px' }), p('6.2 GB of 10 GB', { fontSize: '12px' })], { background: '#f8fafc' }),
  ], { borderRadius: '0', border: '0', borderRight: '1px solid #e2e8f0', padding: '18px', background: '#ffffff' });
  const metricGrid = grid([
    card([p('Revenue'), h('$84,240', { fontSize: '30px' }), badge('+18.2%', { background: '#dcfce7', color: '#166534' })]),
    card([p('Active users'), h('12,480', { fontSize: '30px' }), badge('+7.4%', { background: '#dbeafe', color: '#1d4ed8' })]),
    card([p('Conversion'), h('8.42%', { fontSize: '30px' }), badge('+1.2%', { background: '#f3e8ff', color: '#7e22ce' })]),
    card([p('Open tickets'), h('34', { fontSize: '30px' }), badge('-8', { background: '#fef3c7', color: '#92400e' })]),
  ], 4);
  const performance = card([
    row([h('Performance', { fontSize: '20px' }), badge('Last 30 days')], { justifyContent: 'space-between' }),
    container([p('Revenue trend'), h('▁▂▄▃▅▆▇█▇', { fontSize: '42px', letterSpacing: '.08em', color: '#4f46e5' })], { minHeight: '220px', justifyContent: 'center' }),
  ], { gridColumn: 'span 2' });
  const channels = card([h('Top channels', { fontSize: '20px' }), ...['Organic search · 42%','Direct · 28%','Social · 18%','Referral · 12%'].map((item) => p(item, { padding: '9px 0', borderBottom: '1px solid #eef2f7' }))]);
  const projects = card([
    row([h('Recent projects', { fontSize: '20px' }), b('View all', { background: '#ffffff', color: '#4f46e5' })], { justifyContent: 'space-between' }),
    ...['Website redesign','Mobile onboarding','Growth dashboard'].map((item,index) => row([container([h(item, { fontSize: '16px' }), p(['Design review','In development','Ready to launch'][index], { fontSize: '13px' })]), badge(['68%','42%','96%'][index])], { justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eef2f7' })),
  ]);
  const content = container([
    row([container([p('WORKSPACE'), h('Overview', { fontSize: '32px' })]), row([b('Export', { background: '#ffffff', color: '#111827', border: '1px solid #d1d5db' }), b('New report', { background: '#4f46e5' })], { width: 'auto' })], { justifyContent: 'space-between' }),
    metricGrid,
    grid([performance, channels], 3),
    projects,
  ], { padding: '28px', gap: '20px' });
  return [section('Dashboard shell', [patch('grid', { name: 'Application shell', style: { gridTemplateColumns: '235px minmax(0,1fr)', gap: '0', minHeight: '780px', background: '#f8fafc' }, mobile: { gridTemplateColumns: '1fr' }, children: [sidebar, content] })], { padding: '0', background: '#f8fafc' })];
}

function education() {
  const brand = 'LearnArc';
  return [
    siteNav(brand, false, '#0f766e'),
    section('Education hero', [columns([container([badge('LEARN AT YOUR PACE', { background: '#ccfbf1', color: '#115e59' }), h('Career-ready learning without the classroom noise.', { fontSize: '62px' }), p('Short guided programs, practical projects and mentor feedback.', { fontSize: '18px' }), row([b('Browse programs', { background: '#0f766e' }), b('Meet mentors', { background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' })], { width: 'auto' })]), card([badge('POPULAR PATH'), h('Full-stack web development', { fontSize: '28px' }), p('12 weeks · beginner friendly · portfolio project'), grid([stat('36','Lessons'), stat('08','Projects')], 2), b('View curriculum', { background: '#0f766e', width: '100%' })], { background: '#f0fdfa', border: '1px solid #99f6e4' })])], { background: 'linear-gradient(180deg,#fff,#f0fdfa)' }),
    section('Education paths', [badge('PROGRAMS'), h('Pick a path with an outcome you can show.', { fontSize: '42px' }), grid([
      featureCard('Web Development', 'Build and deploy modern responsive applications.', 'Code2', '#0f766e'),
      featureCard('Cybersecurity Basics', 'Learn defensive security and core networking.', 'ShieldCheck', '#0f766e'),
      featureCard('UI/UX Foundations', 'Turn product ideas into clear usable interfaces.', 'PenTool', '#0f766e'),
    ])]),
    section('Education proof', [columns([card([patch('quote', { props: { text: '“The projects made the concepts stick. I had work I could explain in an interview.”' }, style: { borderLeft: '0', fontSize: '26px' } }), p('— Recent learner')], { background: '#ecfdf5' }), container([h('Learn by building', { fontSize: '38px' }), patch('list', { props: { items: ['Short lessons with clear outcomes','Practical projects every module','Mentor review on key submissions','Portfolio-ready final build'] } })])])], { background: '#f8fafc' }),
    footer(brand),
  ];
}

function restaurant() {
  const brand = 'Saffron Table';
  return [
    siteNav(brand, true, '#eab308'),
    section('Restaurant hero', [columns([container([badge('KERALA · SEASONAL KITCHEN', { background: '#eab308', color: '#1c1917' }), h('Dinner built around fire, spice and what is fresh today.', { fontFamily: 'Georgia, serif', fontWeight: 500, fontSize: '64px', color: '#ffffff' }), p('A modern Kerala menu shaped by local produce and coastal flavours.', { fontSize: '18px', color: '#d6d3d1' }), row([b('Reserve a table', { background: '#eab308', color: '#1c1917' }), b('View menu', { background: 'transparent', color: '#ffffff', border: '1px solid #57534e' })], { width: 'auto' })]), image('Restaurant dining room with warm lighting', { minHeight: '500px', borderRadius: '24px' })])], { background: '#1c1917' }),
    section('Restaurant menu', [badge('TONIGHT'), h('A few favourites from the kitchen.', { fontFamily: 'Georgia, serif', fontWeight: 500, fontSize: '44px' }), grid([
      card([h('Charred pearl spot', { fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: 500 }), p('Raw mango · coconut · curry leaf'), h('₹720', { fontSize: '18px', color: '#a16207' })]),
      card([h('Malabar short rib', { fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: 500 }), p('Black pepper · shallot · appam'), h('₹860', { fontSize: '18px', color: '#a16207' })]),
      card([h('Tender coconut brûlée', { fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: 500 }), p('Palm sugar · sea salt'), h('₹380', { fontSize: '18px', color: '#a16207' })]),
    ])]),
    section('Restaurant story', [columns([image('Chef plating regional dish', { minHeight: '380px', borderRadius: '26px' }), container([badge('OUR KITCHEN'), h('Regional food, treated with patience.', { fontFamily: 'Georgia, serif', fontSize: '42px', fontWeight: 500 }), p('We work with small farms and fishers, then keep the cooking focused.'), b('Read our story')])])], { background: '#fefce8' }),
    section('Restaurant booking', [card([h('Your table is waiting.', { fontFamily: 'Georgia, serif', fontSize: '42px', fontWeight: 500, textAlign: 'center', color: '#ffffff' }), p('Dinner · Tuesday–Sunday · 6:30 PM–11:00 PM', { textAlign: 'center', color: '#d6d3d1' }), b('Reserve now', { margin: '0 auto', background: '#eab308', color: '#1c1917' })], { padding: '50px', alignItems: 'center', background: '#1c1917', border: '0' })]),
    footer(brand, true, '#eab308'),
  ];
}

function event() {
  const brand = 'NEXT/26';
  const speakerNames = ['Anika Rao','Faisal K.','Maya George'];
  return [
    siteNav(brand, true, '#22d3ee'),
    section('Event hero', [container([badge('NOV 21–22 · KOCHI', { background: '#22d3ee', color: '#083344' }), h('Two days for people building what comes next.', { fontSize: '82px', lineHeight: .94, letterSpacing: '-.065em', color: '#ffffff' }), p('Designers, developers, founders and researchers sharing practical ideas.', { fontSize: '19px', color: '#cbd5e1' }), row([b('Get your pass', { background: '#22d3ee', color: '#083344' }), badge('Early bird · ₹1,499', { background: '#164e63', color: '#cffafe' })], { width: 'auto' })], { minHeight: '600px', justifyContent: 'center' })], { background: 'radial-gradient(circle at 82% 18%,rgba(34,211,238,.22),transparent 26%),#082f49' }),
    section('Event speakers', [badge('SPEAKERS'), h('Ideas from people doing the work.', { fontSize: '44px' }), grid(speakerNames.map((name,index) => card([patch('avatar', { props: { alt: `${name} speaker portrait` }, style: { width: '84px', height: '84px' } }), h(name, { fontSize: '23px' }), p(['Product systems','Applied AI','Creative technology'][index])], { alignItems: 'center', textAlign: 'center' }))) ]),
    section('Event schedule', [columns([container([badge('DAY 01'), h('Ideas & systems', { fontSize: '36px' }), ...['10:00 · Opening keynote','11:30 · Product systems panel','14:00 · Applied AI workshop','17:30 · Studio showcase'].map((item) => p(item, { padding: '12px 0', borderBottom: '1px solid #e2e8f0' }))]), container([badge('DAY 02'), h('Build & connect', { fontSize: '36px' }), ...['09:30 · Design engineering','11:00 · Security by default','14:30 · Founder roundtable','18:00 · Closing session'].map((item) => p(item, { padding: '12px 0', borderBottom: '1px solid #e2e8f0' }))])])], { background: '#ecfeff' }),
    section('Event pass', [card([h('Be in the room.', { fontSize: '48px', color: '#ffffff' }), p('Limited seats. Student passes available.', { color: '#bae6fd' }), b('Book NEXT/26 pass', { background: '#22d3ee', color: '#083344' })], { padding: '52px', background: '#082f49', border: '0', alignItems: 'center' })]),
    footer(brand, true, '#22d3ee'),
  ];
}

function developer() {
  const brand = 'dev://n';
  return [
    siteNav(brand, true, '#22c55e'),
    section('Developer hero', [columns([container([badge('FULL-STACK / OPEN TO WORK', { background: '#052e16', color: '#86efac', border: '1px solid #166534' }), h('I turn product ideas into fast, secure web software.', { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '60px', color: '#f8fafc' }), p('React, TypeScript, APIs, Cloudflare and security-aware architecture.', { fontSize: '18px', color: '#94a3b8' }), row([b('See projects', { background: '#22c55e', color: '#052e16' }), b('GitHub', { background: '#111827', color: '#ffffff', border: '1px solid #334155' })], { width: 'auto' })]), card([p('$ whoami', { fontFamily: 'ui-monospace, monospace', color: '#22c55e' }), h('Nadeem — web developer', { fontFamily: 'ui-monospace, monospace', fontSize: '24px', color: '#e2e8f0' }), p('> shipping local-first tools\n> learning security deeply\n> building useful products', { fontFamily: 'ui-monospace, monospace', color: '#94a3b8', whiteSpace: 'pre-line' })], { background: '#020617', border: '1px solid #1e293b' })])], { background: '#020617' }),
    section('Developer stack', [badge('STACK'), h('Tools I reach for when reliability matters.', { fontSize: '42px' }), row(['React','TypeScript','Vite','Node','Cloudflare','Firebase','SQL','GitHub'].map((item) => badge(item, { padding: '10px 14px', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0' })), { flexWrap: 'wrap' })]),
    section('Developer projects', [h('Recent builds', { fontSize: '42px' }), grid([
      card([badge('AI TOOL'), h('Local AI desktop workspace', { fontSize: '24px' }), p('Offline model runtime, tools, RAG and safe web search.'), b('View project', { background: '#052e16', color: '#86efac' })]),
      card([badge('SECURITY'), h('Secure file sharing', { fontSize: '24px' }), p('Protected links, policies, logs and emergency lock controls.'), b('View project', { background: '#052e16', color: '#86efac' })]),
      card([badge('EDTECH'), h('Exam platform', { fontSize: '24px' }), p('Role-based exams, question generation and assessment flows.'), b('View project', { background: '#052e16', color: '#86efac' })]),
    ])], { background: '#f8fafc' }),
    footer(brand, true, '#22c55e'),
  ];
}

function product() {
  const brand = 'KIN / ONE';
  return [
    siteNav(brand, false, '#ef4444'),
    section('Product hero', [columns([container([badge('NEW DROP · 01', { background: '#fee2e2', color: '#991b1b' }), h('A daily carry bag designed around the things you actually bring.', { fontSize: '64px', letterSpacing: '-.055em' }), p('Weather-resistant shell, modular pockets and a compact shape.', { fontSize: '18px' }), row([b('Buy KIN One · ₹4,990', { background: '#ef4444' }), badge('Free shipping')], { width: 'auto' })]), image('Minimal product bag on neutral background', { minHeight: '520px', borderRadius: '32px', background: '#fee2e2' })])], { background: '#fff7ed' }),
    section('Product features', [grid([
      featureCard('Weather ready', 'Coated shell and protected zips for everyday rain.', 'CloudRain', '#ef4444'),
      featureCard('Modular inside', 'Move dividers and pouches around your actual gear.', 'PanelsTopLeft', '#ef4444'),
      featureCard('Comfort first', 'Wide straps and balanced weight for long days.', 'Backpack', '#ef4444'),
    ])]),
    section('Product detail', [columns([image('Product interior detail', { minHeight: '430px', borderRadius: '28px' }), container([badge('DETAILS'), h('One bag. Fewer compromises.', { fontSize: '44px' }), patch('list', { props: { items: ['18L compact profile','16-inch laptop sleeve','Two removable organizers','Hidden passport pocket','Recycled ripstop shell'] } }), b('See all specifications')])])], { background: '#f8fafc' }),
    section('Product review', [card([patch('quote', { props: { text: '“It carries more than it looks like it should, but never feels bulky.”' }, style: { fontSize: '30px', borderLeft: '0', textAlign: 'center' } }), p('— Early customer', { textAlign: 'center' })], { maxWidth: '820px', margin: '0 auto', padding: '48px', background: '#fff7ed', border: '0' })]),
    footer(brand, false, '#ef4444'),
  ];
}

type TemplateDefinition = {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  profile: MotionProfile;
  build: () => EditorNode[];
};

const definitions: TemplateDefinition[] = [
  { id: 'saas', name: 'SaaS Landing', category: 'SaaS', description: 'Product-led software landing page with bento proof, pricing and workspace visuals.', tags: ['saas','startup','animated','bento'], profile: 'tech', build: saas },
  { id: 'agency', name: 'Agency', category: 'Business', description: 'Dark editorial agency site with impact metrics, process and high-contrast contact.', tags: ['agency','services','animated','editorial'], profile: 'editorial', build: agency },
  { id: 'portfolio', name: 'Portfolio', category: 'Personal', description: 'Asymmetric creative portfolio with selected work, profile story and minimal contact.', tags: ['portfolio','creative','animated','editorial'], profile: 'editorial', build: portfolio },
  { id: 'business', name: 'Business', category: 'Business', description: 'Trust-focused corporate site with advisory services, proof and consultation flow.', tags: ['company','business','animated','corporate'], profile: 'soft', build: business },
  { id: 'app', name: 'App Landing', category: 'Product', description: 'Vibrant mobile app launch with phone UI mockup, features and app-store style proof.', tags: ['app','product','animated','mobile'], profile: 'playful', build: appLanding },
  { id: 'coming-soon', name: 'Coming Soon', category: 'Launch', description: 'Immersive dark pre-launch page with countdown, waitlist and feature preview.', tags: ['launch','waitlist','animated','minimal'], profile: 'studio', build: comingSoon },
  { id: 'resume-modern', name: 'Resume Portfolio', category: 'Personal', description: 'Editorial developer résumé with experience timeline, skills and selected projects.', tags: ['resume','portfolio','animated','developer'], profile: 'editorial', build: resume },
  { id: 'property-modern', name: 'Property Landing', category: 'Business', description: 'Warm luxury real-estate experience with search, curated listings and buyer advisory.', tags: ['property','real-estate','animated','luxury'], profile: 'luxury', build: property },
  { id: 'animated-studio', name: 'Animated Studio', category: 'Creative', description: 'Experimental neon studio with oversized type, moving visual rhythm and project bento.', tags: ['animated','studio','motion','creative'], profile: 'studio', build: animatedStudio },
  { id: 'dashboard-starter', name: 'Dashboard Starter', category: 'Application', description: 'Responsive admin application shell with metrics, performance and project activity.', tags: ['dashboard','admin','application','animated'], profile: 'dashboard', build: dashboard },
  { id: 'education-modern', name: 'Education Platform', category: 'Education', description: 'Friendly learning platform with course paths, project-led benefits and learner proof.', tags: ['education','course','animated','learning'], profile: 'soft', build: education },
  { id: 'restaurant-modern', name: 'Restaurant', category: 'Hospitality', description: 'Warm high-end restaurant site with menu highlights, story and reservation CTA.', tags: ['restaurant','food','animated','hospitality'], profile: 'luxury', build: restaurant },
  { id: 'event-modern', name: 'Event Conference', category: 'Event', description: 'Bold conference landing page with speakers, schedule and ticket conversion.', tags: ['event','conference','animated','tickets'], profile: 'tech', build: event },
  { id: 'developer-modern', name: 'Developer Portfolio', category: 'Developer', description: 'Terminal-inspired developer portfolio with stack, projects and dark technical styling.', tags: ['developer','portfolio','animated','code'], profile: 'tech', build: developer },
  { id: 'product-modern', name: 'Product Launch', category: 'Commerce', description: 'Editorial physical-product launch with feature story, detail section and social proof.', tags: ['product','commerce','animated','launch'], profile: 'playful', build: product },
];

export const DISTINCT_TEMPLATE_PRESETS: CatalogPreset[] = definitions.map((item) => ({
  id: item.id,
  kind: 'template',
  name: item.name,
  category: item.category,
  description: item.description,
  tags: item.tags,
  build: withMotion(item.build, item.profile),
}));
