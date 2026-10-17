import { createNode } from './model';
import type { CatalogPreset } from './catalog';
import type { EditorNode, EditorNodeProps, EditorNodeType, NodeStyle } from './types';

type NodeConfig = { name?: string; props?: EditorNodeProps; style?: NodeStyle; tablet?: NodeStyle; mobile?: NodeStyle; children?: EditorNode[] };
const patch = (type: EditorNodeType, config: NodeConfig = {}): EditorNode => {
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

const text = (value: string, style: NodeStyle = {}) => patch('paragraph', { props: { text: value }, style });
const heading = (value: string, style: NodeStyle = {}) => patch('heading', { props: { text: value }, style });
const badge = (value: string, style: NodeStyle = {}) => patch('badge', { props: { text: value }, style });
const button = (value: string, style: NodeStyle = {}) => patch('button', { props: { text: value }, style });
const card = (children: EditorNode[], style: NodeStyle = {}) => patch('card', { children, style });
const container = (children: EditorNode[], style: NodeStyle = {}, mobile: NodeStyle = {}) => patch('container', { children, style, mobile });
const grid = (children: EditorNode[], columns = 3, style: NodeStyle = {}) => patch('grid', { children, style: { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: '18px', ...style }, tablet: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }, mobile: { gridTemplateColumns: '1fr' } });
const section = (name: string, children: EditorNode[], style: NodeStyle = {}) => patch('section', { name, style, children: [container(children)] });

const glassHero = () => section('Animated glass hero', [
  container([
    badge('Animated block', { animationName: 'nila-fade-in', animationDuration: '500ms' }),
    heading('A polished hero with motion, depth and clear conversion.', { maxWidth: '820px', fontSize: '64px', lineHeight: 1.02, letterSpacing: '-0.04em', textAlign: 'center', color: '#0f172a', animationName: 'nila-slide-up', animationDuration: '650ms' }),
    text('Use subtle animation to guide attention while keeping the layout readable, responsive and accessible.', { maxWidth: '680px', textAlign: 'center', fontSize: '18px', color: '#475569', animationName: 'nila-slide-up', animationDuration: '700ms', animationDelay: '80ms' }),
    container([button('Start building', { background: '#4f46e5', color: '#ffffff', boxShadow: '0 12px 30px rgba(79,70,229,.28)' }), button('View examples', { background: 'rgba(255,255,255,.75)', color: '#0f172a', border: '1px solid rgba(148,163,184,.45)' })], { width: 'auto', margin: '8px auto 0', display: 'flex', flexDirection: 'row', gap: '10px', animationName: 'nila-scale-in', animationDuration: '520ms', animationDelay: '140ms' }, { flexWrap: 'wrap', justifyContent: 'center' }),
    card([text('Live preview', { fontWeight: 700, color: '#312e81' }), heading('Visual editing that stays yours.', { fontSize: '28px' }), text('Responsive structure, reusable blocks and source ownership in one focused workflow.')], { width: '100%', maxWidth: '760px', margin: '34px auto 0', padding: '28px', background: 'rgba(255,255,255,.72)', border: '1px solid rgba(255,255,255,.9)', boxShadow: '0 30px 80px rgba(79,70,229,.16)', backdropFilter: 'blur(18px)', animationName: 'nila-slide-up', animationDuration: '750ms', animationDelay: '180ms' }),
  ], { alignItems: 'center' }),
], { padding: '100px 32px', background: 'radial-gradient(circle at 15% 15%, #ddd6fe 0, transparent 32%), radial-gradient(circle at 85% 20%, #bfdbfe 0, transparent 28%), linear-gradient(180deg,#f8fafc,#eef2ff)' });

const bentoFeatures = () => section('Bento features', [
  badge('Feature block'),
  heading('Show product value with a bento-style layout.', { fontSize: '44px', maxWidth: '720px' }),
  grid([
    card([badge('01'), heading('Visual editor', { fontSize: '24px' }), text('Drag, place and tune responsive content without hiding the underlying structure.')], { gridColumn: 'span 2', minHeight: '220px', justifyContent: 'flex-end', background: 'linear-gradient(145deg,#eef2ff,#ffffff)' }),
    card([badge('02'), heading('Fast preview', { fontSize: '22px' }), text('Switch between desktop, tablet and mobile views instantly.')], { minHeight: '220px' }),
    card([badge('03'), heading('Local-first', { fontSize: '22px' }), text('Keep project workspaces and exported source under your control.')], { minHeight: '200px' }),
    card([badge('04'), heading('Portable output', { fontSize: '22px' }), text('Export projects that do not need the builder at runtime.')], { gridColumn: 'span 2', minHeight: '200px', background: '#0f172a', color: '#ffffff' }),
  ], 3, { marginTop: '26px' }),
]);

const logoCloud = () => section('Logo cloud', [
  text('Trusted by teams building modern products', { textAlign: 'center', color: '#64748b', fontWeight: 650 }),
  container(['Acme', 'Northstar', 'Orbit', 'Vertex', 'Signal'].map((name, index) => badge(name, { background: '#ffffff', color: '#475569', border: '1px solid #e2e8f0', padding: '10px 16px', animationName: 'nila-fade-in', animationDuration: '420ms', animationDelay: `${index * 70}ms` })), { display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '22px' }),
], { padding: '44px 28px', background: '#f8fafc' });

const newsletter = () => section('Newsletter', [
  card([
    badge('Newsletter'),
    heading('Useful updates, without the noise.', { fontSize: '34px' }),
    text('A compact conversion block for product news, launches and editorial content.'),
    container([patch('input', { props: { label: 'Email', placeholder: 'you@example.com' }, style: { minWidth: '260px' } }), button('Subscribe', { minHeight: '44px' })], { display: 'flex', flexDirection: 'row', alignItems: 'end', gap: '10px' }, { flexDirection: 'column', alignItems: 'stretch' }),
  ], { padding: '34px', background: 'linear-gradient(135deg,#111827,#1e293b)', color: '#ffffff', border: '0', boxShadow: '0 24px 50px rgba(15,23,42,.18)' }),
], { padding: '70px 32px' });

const loginBlock = () => section('Login block', [
  card([
    badge('Welcome back'),
    heading('Sign in to continue', { fontSize: '30px' }),
    text('Use this visual authentication starter and connect your own backend later.'),
    patch('input', { props: { label: 'Email', placeholder: 'you@example.com' } }),
    patch('input', { props: { label: 'Password', placeholder: 'Enter your password' } }),
    button('Sign in', { width: '100%', justifyContent: 'center' }),
    patch('link', { props: { text: 'Forgot password?', href: '#' }, style: { textAlign: 'center', color: '#4f46e5' } }),
  ], { maxWidth: '430px', width: '100%', margin: '0 auto', padding: '34px', boxShadow: '0 24px 60px rgba(15,23,42,.12)' }),
], { padding: '90px 24px', background: '#f8fafc' });

const dashboardStats = () => section('Dashboard stats', [
  container([badge('Dashboard'), heading('Overview', { fontSize: '34px' }), text('A compact metrics area for admin and SaaS interfaces.')]),
  grid([
    card([text('Revenue', { color: '#64748b' }), heading('$48,280', { fontSize: '30px' }), badge('+12.8%', { background: '#dcfce7', color: '#166534' })]),
    card([text('Customers', { color: '#64748b' }), heading('2,418', { fontSize: '30px' }), badge('+6.2%', { background: '#dbeafe', color: '#1d4ed8' })]),
    card([text('Conversion', { color: '#64748b' }), heading('8.4%', { fontSize: '30px' }), badge('+1.1%', { background: '#f3e8ff', color: '#7e22ce' })]),
    card([text('Tickets', { color: '#64748b' }), heading('34', { fontSize: '30px' }), badge('-8', { background: '#fef3c7', color: '#92400e' })]),
  ], 4, { marginTop: '20px' }),
], { padding: '38px 32px', background: '#f8fafc' });

const dashboardShell = () => section('Dashboard shell', [
  patch('grid', { name: 'Dashboard layout', style: { gridTemplateColumns: '240px minmax(0,1fr)', gap: '18px', minHeight: '560px' }, mobile: { gridTemplateColumns: '1fr' }, children: [
    card([
      heading('Nila Admin', { fontSize: '20px' }),
      ...['Overview', 'Analytics', 'Customers', 'Projects', 'Settings'].map((item, index) => patch('link', { props: { text: item, href: '#' }, style: { display: 'block', padding: '10px 12px', borderRadius: '9px', background: index === 0 ? '#eef2ff' : 'transparent', color: index === 0 ? '#4338ca' : '#475569', fontWeight: index === 0 ? 700 : 550 } })),
    ], { minHeight: '100%', padding: '18px' }),
    container([
      container([heading('Dashboard', { fontSize: '32px' }), button('New project')], { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }, { flexWrap: 'wrap' }),
      grid([
        card([text('Active projects'), heading('18', { fontSize: '32px' })]),
        card([text('Team members'), heading('9', { fontSize: '32px' })]),
        card([text('Tasks due'), heading('24', { fontSize: '32px' })]),
      ], 3),
      card([heading('Recent activity', { fontSize: '20px' }), ...['Landing page updated', 'New client invited', 'Export completed', 'Project published'].map((item) => container([text(item), badge('Just now')], { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eef2f7' }))], { marginTop: '4px' }),
    ], { gap: '18px' }),
  ] }),
], { padding: '24px', background: '#eef2f7' });

const profileCard = () => section('Profile card', [
  card([
    patch('avatar', { style: { width: '78px', height: '78px' } }),
    heading('Jordan Lee', { fontSize: '26px', textAlign: 'center' }),
    text('Product designer focused on simple systems and thoughtful interaction.', { textAlign: 'center' }),
    container([badge('Design'), badge('Systems'), badge('Research')], { display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }),
    button('View profile', { margin: '8px auto 0' }),
  ], { maxWidth: '420px', margin: '0 auto', padding: '34px', alignItems: 'center', boxShadow: '0 20px 50px rgba(15,23,42,.1)', animationName: 'nila-scale-in', animationDuration: '520ms' }),
], { padding: '72px 24px' });

const processSteps = () => section('Process steps', [
  badge('How it works'),
  heading('A simple path from idea to launch.', { fontSize: '40px', maxWidth: '680px' }),
  grid([
    card([badge('01'), heading('Choose a starting point', { fontSize: '21px' }), text('Begin from a template, block or empty page.')]),
    card([badge('02'), heading('Compose visually', { fontSize: '21px' }), text('Arrange elements and refine responsive styles.')]),
    card([badge('03'), heading('Preview and verify', { fontSize: '21px' }), text('Check links, breakpoints, SEO and content structure.')]),
    card([badge('04'), heading('Export your source', { fontSize: '21px' }), text('Keep a portable project ready for deployment.')]),
  ], 4, { marginTop: '24px' }),
]);

const animatedCta = () => section('Animated CTA', [
  card([
    badge('Ready to ship?', { animationName: 'nila-fade-in', animationDuration: '450ms' }),
    heading('Turn a rough page into a polished experience.', { maxWidth: '760px', fontSize: '46px', textAlign: 'center', color: '#ffffff', animationName: 'nila-slide-up', animationDuration: '620ms' }),
    text('Build from reusable patterns, then make the structure, style and motion your own.', { maxWidth: '620px', textAlign: 'center', color: '#cbd5e1', animationName: 'nila-slide-up', animationDuration: '680ms', animationDelay: '70ms' }),
    button('Create a page', { margin: '6px auto 0', background: '#ffffff', color: '#111827', animationName: 'nila-scale-in', animationDuration: '500ms', animationDelay: '130ms' }),
  ], { padding: '54px 32px', alignItems: 'center', background: 'linear-gradient(135deg,#312e81,#111827 58%,#172554)', border: '0', borderRadius: '28px', overflow: 'hidden' }),
], { padding: '72px 28px' });

export const EXTRA_SECTION_PRESETS: CatalogPreset[] = [
  { id: 'animated-glass-hero', kind: 'section', name: 'Glass Motion Hero', category: 'Animated', description: 'Layered hero with tasteful entrance motion and glass surface.', tags: ['animated', 'hero', 'motion'], build: () => [glassHero()] },
  { id: 'bento-features', kind: 'section', name: 'Bento Feature Grid', category: 'Marketing', description: 'Asymmetric feature cards with responsive spans.', tags: ['bento', 'features', 'cards'], build: () => [bentoFeatures()] },
  { id: 'logo-cloud-motion', kind: 'section', name: 'Animated Logo Cloud', category: 'Animated', description: 'Compact social-proof row with staggered fade-in.', tags: ['animated', 'logos', 'proof'], build: () => [logoCloud()] },
  { id: 'newsletter-dark', kind: 'section', name: 'Newsletter Card', category: 'Marketing', description: 'High-contrast newsletter conversion block.', tags: ['newsletter', 'form', 'cta'], build: () => [newsletter()] },
  { id: 'login-clean', kind: 'section', name: 'Clean Login', category: 'Application', description: 'Centered authentication starter with clear hierarchy.', tags: ['login', 'auth', 'form'], build: () => [loginBlock()] },
  { id: 'dashboard-stats', kind: 'section', name: 'Dashboard Stats', category: 'Dashboard', description: 'Four responsive metric cards for admin interfaces.', tags: ['dashboard', 'stats', 'widgets'], build: () => [dashboardStats()] },
  { id: 'dashboard-shell', kind: 'section', name: 'Dashboard Shell', category: 'Dashboard', description: 'Sidebar, top area, metrics and activity composition.', tags: ['dashboard', 'sidebar', 'admin'], build: () => [dashboardShell()] },
  { id: 'profile-card', kind: 'section', name: 'Profile Card', category: 'Application', description: 'Animated user profile card with tags and action.', tags: ['profile', 'card', 'animated'], build: () => [profileCard()] },
  { id: 'process-steps', kind: 'section', name: 'Process Steps', category: 'Marketing', description: 'Four-step workflow section for product and service pages.', tags: ['steps', 'process', 'workflow'], build: () => [processSteps()] },
  { id: 'animated-cta', kind: 'section', name: 'Animated CTA', category: 'Animated', description: 'Motion-enhanced call-to-action with high contrast.', tags: ['animated', 'cta', 'conversion'], build: () => [animatedCta()] },
];

const resumeTemplate = () => [
  section('Resume hero', [badge('Portfolio'), heading('Designer and developer creating useful digital products.', { fontSize: '58px', maxWidth: '850px' }), text('A flexible resume starter with space for experience, work, skills and contact details.', { maxWidth: '680px', fontSize: '18px' }), container([button('View work'), button('Contact me', { background: '#ffffff', color: '#111827', border: '1px solid #d1d5db' })], { display: 'flex', flexDirection: 'row', gap: '10px', width: 'auto', margin: 0 })], { padding: '96px 32px' }),
  processSteps(),
  profileCard(),
  animatedCta(),
];

const propertyTemplate = () => [
  section('Property hero', [badge('Property'), heading('Find a place that feels like home.', { fontSize: '58px', maxWidth: '780px' }), text('A clean property website starter for listings, agencies and local real-estate brands.', { maxWidth: '650px' }), container([patch('input', { props: { label: 'Location', placeholder: 'City or neighbourhood' } }), button('Search homes')], { display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'end', maxWidth: '720px' }, { flexDirection: 'column', alignItems: 'stretch' })], { padding: '100px 32px', background: 'linear-gradient(180deg,#f0fdf4,#ffffff)' }),
  section('Featured properties', [heading('Featured homes', { fontSize: '38px' }), grid([card([patch('image'), heading('Modern family home', { fontSize: '21px' }), text('3 bed · 2 bath · Central location'), badge('$420k')]), card([patch('image'), heading('City apartment', { fontSize: '21px' }), text('2 bed · 2 bath · Skyline views'), badge('$310k')]), card([patch('image'), heading('Quiet villa', { fontSize: '21px' }), text('4 bed · 3 bath · Garden'), badge('$590k')])])]),
  processSteps(),
  animatedCta(),
];

const animatedStudioTemplate = () => [glassHero(), logoCloud(), bentoFeatures(), profileCard(), animatedCta()];
const dashboardTemplate = () => [dashboardShell(), dashboardStats()];

export const EXTRA_TEMPLATE_PRESETS: CatalogPreset[] = [
  { id: 'resume-modern', kind: 'template', name: 'Resume Portfolio', category: 'Personal', description: 'Modern resume and portfolio starter built from Nila primitives.', tags: ['resume', 'portfolio', 'free-pattern'], build: resumeTemplate },
  { id: 'property-modern', kind: 'template', name: 'Property Landing', category: 'Business', description: 'Property search and listing website starter.', tags: ['property', 'real-estate', 'free-pattern'], build: propertyTemplate },
  { id: 'animated-studio', kind: 'template', name: 'Animated Studio', category: 'Creative', description: 'Motion-rich creative landing page with accessible animations.', tags: ['animated', 'studio', 'motion'], build: animatedStudioTemplate },
  { id: 'dashboard-starter', kind: 'template', name: 'Dashboard Starter', category: 'Application', description: 'Responsive admin workspace with sidebar, metrics and activity.', tags: ['dashboard', 'admin', 'application'], build: dashboardTemplate },
];
