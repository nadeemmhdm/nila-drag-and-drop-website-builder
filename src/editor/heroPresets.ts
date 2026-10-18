import { createNode } from './model';
import type { CatalogPreset } from './catalog';
import type { EditorNode, EditorNodeProps, EditorNodeType, NodeStyle } from './types';

type NodeConfig = {
  name?: string;
  props?: EditorNodeProps;
  style?: NodeStyle;
  tablet?: NodeStyle;
  mobile?: NodeStyle;
  children?: EditorNode[];
};

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

const heading = (text: string, style: NodeStyle = {}, mobile: NodeStyle = {}) => patch('heading', { props: { text }, style, mobile });
const paragraph = (text: string, style: NodeStyle = {}, mobile: NodeStyle = {}) => patch('paragraph', { props: { text }, style, mobile });
const button = (text: string, style: NodeStyle = {}) => patch('button', { props: { text }, style });
const badge = (text: string, style: NodeStyle = {}) => patch('badge', { props: { text }, style });
const div = (name: string, children: EditorNode[] = [], style: NodeStyle = {}, tablet: NodeStyle = {}, mobile: NodeStyle = {}) => patch('div', { name, children, style, tablet, mobile });
const row = (name: string, children: EditorNode[], style: NodeStyle = {}, mobile: NodeStyle = {}) => patch('row', { name, children, style, mobile });
const container = (name: string, children: EditorNode[], style: NodeStyle = {}, tablet: NodeStyle = {}, mobile: NodeStyle = {}) => patch('container', { name, children, style, tablet, mobile });
const section = (name: string, children: EditorNode[], style: NodeStyle = {}, tablet: NodeStyle = {}, mobile: NodeStyle = {}) => patch('section', { name, children, style, tablet, mobile });

const TILTED_IMAGES = [
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=82',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=82',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=82',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=82',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=82',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=82',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=82',
];

function tiltedTile(src: string, index: number): EditorNode {
  const turns = [-26, -18, -9, 0, 9, 18, 26];
  const lifts = [38, 18, 4, 0, 4, 18, 38];
  const scale = index === 3 ? 1.08 : index === 2 || index === 4 ? 1.03 : 0.96;
  return patch('image', {
    name: `Tilted image ${index + 1}`,
    props: { src, alt: `Creative portfolio frame ${index + 1}`, loading: index < 4 ? 'eager' : 'lazy' },
    style: {
      width: 'clamp(190px, 22vw, 320px)',
      height: 'clamp(130px, 15vw, 210px)',
      maxWidth: 'none',
      minWidth: '190px',
      flex: '0 0 auto',
      objectFit: 'cover',
      borderRadius: '22px',
      border: '1px solid rgba(255,255,255,.5)',
      boxShadow: index === 3 ? '0 36px 90px rgba(15,23,42,.28)' : '0 22px 60px rgba(15,23,42,.18)',
      transform: `translateY(${lifts[index]}px) rotateY(${turns[index]}deg) rotateZ(${(index - 3) * 1.2}deg) scale(${scale})`,
      transformOrigin: 'center',
      animationName: 'nila-pulse',
      animationDuration: `${4.8 + (index % 3) * 0.9}s`,
      animationDelay: `${index * -0.62}s`,
      animationTimingFunction: 'ease-in-out',
      animationIterationCount: 'infinite',
      animationFillMode: 'both',
    },
    tablet: {
      width: 'clamp(180px, 30vw, 260px)',
      height: 'clamp(125px, 20vw, 180px)',
    },
    mobile: {
      width: '190px',
      height: '132px',
      minWidth: '190px',
      borderRadius: '16px',
      transform: `translateY(${Math.round(lifts[index] * 0.55)}px) rotateY(${Math.round(turns[index] * 0.55)}deg) rotateZ(${(index - 3) * 0.8}deg) scale(${index === 3 ? 1.04 : 0.96})`,
    },
  });
}

function buildTiltedGridHero(): EditorNode[] {
  const band = row('Curved image band', TILTED_IMAGES.map(tiltedTile), {
    position: 'absolute',
    left: '-28%',
    right: '-28%',
    top: '48%',
    width: '156%',
    minWidth: '156%',
    height: '260px',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '18px',
    perspective: '1050px',
    transform: 'translateY(-50%) rotateZ(-2.5deg)',
    transformStyle: 'preserve-3d',
    maskImage: 'linear-gradient(90deg,transparent 0%,#000 12%,#000 88%,transparent 100%)',
    WebkitMaskImage: 'linear-gradient(90deg,transparent 0%,#000 12%,#000 88%,transparent 100%)',
    zIndex: 1,
    pointerEvents: 'none',
  }, {
    left: '-45%',
    right: '-45%',
    width: '190%',
    minWidth: '190%',
  });

  const topCopy = container('Hero title', [
    badge('CURVED MOTION GALLERY', {
      background: 'rgba(255,255,255,.76)',
      color: '#1f2937',
      border: '1px solid rgba(15,23,42,.12)',
      backdropFilter: 'blur(12px)',
      letterSpacing: '.12em',
      fontSize: '11px',
    }),
    heading('Every frame, brought into focus.', {
      maxWidth: '780px',
      fontSize: 'clamp(48px,7vw,92px)',
      lineHeight: 0.92,
      letterSpacing: '-.055em',
      fontWeight: 760,
      color: '#111827',
      textAlign: 'center',
    }, { fontSize: '44px', lineHeight: 0.98 }),
  ], {
    position: 'relative',
    zIndex: 4,
    alignItems: 'center',
    textAlign: 'center',
    gap: '16px',
    paddingTop: '62px',
  });

  const bottomCopy = container('Hero footer copy', [
    paragraph('Images bend around the scene, flatten at the centre and drift toward the edges. Replace any frame with your own project imagery.', {
      maxWidth: '600px',
      fontSize: '15px',
      lineHeight: 1.65,
      textAlign: 'center',
      color: '#475569',
    }),
    button('Explore selected work', {
      background: '#111827',
      color: '#ffffff',
      borderRadius: '999px',
      padding: '13px 20px',
      boxShadow: '0 12px 36px rgba(15,23,42,.18)',
    }),
  ], {
    position: 'absolute',
    left: '50%',
    bottom: '42px',
    width: 'min(92%, 680px)',
    transform: 'translateX(-50%)',
    alignItems: 'center',
    gap: '14px',
    zIndex: 4,
  }, {}, {
    bottom: '26px',
    width: '90%',
  });

  const stage = div('Tilted Grid Hero stage', [band, topCopy, bottomCopy], {
    position: 'relative',
    width: '100%',
    minHeight: '680px',
    overflow: 'hidden',
    borderRadius: '30px',
    background: 'radial-gradient(circle at 50% 44%,#ffffff 0 18%,#eef2ff 52%,#e2e8f0 100%)',
    border: '1px solid rgba(15,23,42,.08)',
    boxShadow: '0 30px 90px rgba(15,23,42,.12)',
    isolation: 'isolate',
  }, { minHeight: '640px', borderRadius: '24px' }, { minHeight: '660px', borderRadius: '0' });

  return [section('Tilted Grid Hero', [stage], {
    width: '100%',
    padding: '28px',
    background: '#f8fafc',
    overflow: 'hidden',
  }, { padding: '20px' }, { padding: '0' })];
}

const shape = (name: string, style: NodeStyle, children: EditorNode[] = []) => div(name, children, style);

function mascotFigure(): EditorNode {
  const eye = (name: string, left: string) => shape(name, [
    shape(`${name} highlight`, {}, {
      position: 'absolute',
      width: '7px',
      height: '7px',
      borderRadius: '50%',
      background: '#ffffff',
      left: '7px',
      top: '7px',
    }),
  ] as unknown as NodeStyle);

  // The face is built from normal Nila divs rather than an SVG or external asset,
  // keeping the block editable and exportable with no runtime dependency.
  const leftEye = div('Left eye', [shape('Left eye shine', [], {
    position: 'absolute', width: '7px', height: '7px', borderRadius: '50%', background: '#ffffff', left: '7px', top: '7px',
  })], {
    position: 'absolute', left: '30%', top: '43%', width: '30px', height: '36px', borderRadius: '50%', background: 'radial-gradient(circle at 38% 32%,#4b5563 0 12%,#111827 42%,#020617 100%)', boxShadow: 'inset 0 -4px 8px rgba(0,0,0,.28)',
  });
  const rightEye = div('Right eye', [shape('Right eye shine', [], {
    position: 'absolute', width: '7px', height: '7px', borderRadius: '50%', background: '#ffffff', left: '7px', top: '7px',
  })], {
    position: 'absolute', right: '30%', top: '43%', width: '30px', height: '36px', borderRadius: '50%', background: 'radial-gradient(circle at 38% 32%,#4b5563 0 12%,#111827 42%,#020617 100%)', boxShadow: 'inset 0 -4px 8px rgba(0,0,0,.28)',
  });

  const face = div('Mascot face', [
    shape('Left ear', [], { position: 'absolute', left: '-9%', top: '35%', width: '18%', height: '24%', borderRadius: '50%', background: '#f2c6a6', boxShadow: 'inset -8px 0 16px rgba(122,46,20,.15)' }),
    shape('Right ear', [], { position: 'absolute', right: '-9%', top: '35%', width: '18%', height: '24%', borderRadius: '50%', background: '#f2c6a6', boxShadow: 'inset 8px 0 16px rgba(122,46,20,.15)' }),
    leftEye,
    rightEye,
    shape('Left brow', [], { position: 'absolute', left: '27%', top: '35%', width: '19%', height: '8px', borderRadius: '999px', background: '#3b2518', transform: 'rotate(-8deg)' }),
    shape('Right brow', [], { position: 'absolute', right: '27%', top: '35%', width: '19%', height: '8px', borderRadius: '999px', background: '#3b2518', transform: 'rotate(8deg)' }),
    shape('Mascot nose', [], { position: 'absolute', left: '50%', top: '54%', width: '28px', height: '24px', borderRadius: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle at 36% 30%,#ffd9c2,#e8aa86 68%,#c77b59)' }),
    shape('Mascot smile', [], { position: 'absolute', left: '50%', top: '66%', width: '104px', height: '48px', transform: 'translateX(-50%)', borderRadius: '14px 14px 44px 44px', background: 'linear-gradient(#ffffff 0 34%,#5b1f22 35% 100%)', border: '3px solid rgba(138,53,36,.45)', boxShadow: 'inset 0 -12px 0 #d9575a' }),
    shape('Left blush', [], { position: 'absolute', left: '16%', top: '59%', width: '62px', height: '34px', borderRadius: '50%', background: 'radial-gradient(ellipse,#ff7d7d66,transparent 68%)' }),
    shape('Right blush', [], { position: 'absolute', right: '16%', top: '59%', width: '62px', height: '34px', borderRadius: '50%', background: 'radial-gradient(ellipse,#ff7d7d66,transparent 68%)' }),
  ], {
    position: 'absolute',
    left: '50%',
    top: '19%',
    width: '62%',
    aspectRatio: '1 / 1.14',
    transform: 'translateX(-50%)',
    borderRadius: '48% 48% 46% 46%',
    background: 'radial-gradient(circle at 35% 26%,rgba(255,255,255,.6),transparent 30%),linear-gradient(145deg,#fbd7bb,#f1bd98 74%,#dea17c)',
    boxShadow: 'inset 0 -18px 40px rgba(122,46,20,.16),0 18px 50px rgba(17,24,39,.14)',
    zIndex: 3,
  });

  const beanie = div('Mascot beanie', [
    shape('Beanie cuff', [], { position: 'absolute', left: '7%', right: '7%', bottom: '-8%', height: '29%', borderRadius: '18px 18px 28px 28px', background: 'repeating-linear-gradient(90deg,#222 0 7px,#2b2b2d 7px 11px)', boxShadow: 'inset 0 -8px 16px rgba(0,0,0,.28)' }),
    shape('Beanie tag', [], { position: 'absolute', left: '20%', bottom: '-17%', width: '34px', height: '54px', borderRadius: '5px', background: 'linear-gradient(145deg,#c99569,#9b6847)', border: '2px dashed rgba(255,255,255,.55)', transform: 'rotate(-8deg)', boxShadow: '0 8px 12px rgba(0,0,0,.15)' }),
  ], {
    position: 'absolute',
    left: '18%',
    right: '18%',
    top: '5%',
    height: '31%',
    borderRadius: '50% 50% 24% 24%',
    background: 'radial-gradient(circle at 34% 20%,rgba(255,255,255,.16),transparent 32%),linear-gradient(145deg,#27272a,#101012)',
    boxShadow: 'inset 0 -18px 28px rgba(0,0,0,.35)',
    zIndex: 6,
  });

  const body = div('Mascot body', [
    shape('Left collar', [], { position: 'absolute', left: '24%', top: '4%', width: '30%', height: '31%', background: '#232326', clipPath: 'polygon(0 0,100% 20%,58% 100%)', transform: 'rotate(6deg)' }),
    shape('Right collar', [], { position: 'absolute', right: '24%', top: '4%', width: '30%', height: '31%', background: '#232326', clipPath: 'polygon(0 20%,100% 0,42% 100%)', transform: 'rotate(-6deg)' }),
  ], {
    position: 'absolute',
    left: '7%',
    right: '7%',
    bottom: '-7%',
    height: '38%',
    borderRadius: '48% 48% 8% 8%',
    background: 'linear-gradient(180deg,#2a2a2d,#111113)',
    boxShadow: 'inset 0 18px 28px rgba(255,255,255,.05)',
    zIndex: 1,
  });

  return div('Interactive mascot', [body, face, beanie, badge('HI, I AM OPEN TO WORK', {
    position: 'absolute',
    left: '-5%',
    top: '10%',
    maxWidth: '170px',
    whiteSpace: 'normal',
    lineHeight: 1.25,
    padding: '10px 13px',
    borderRadius: '18px 18px 18px 4px',
    background: '#ffffff',
    color: '#111111',
    border: '2px solid #111111',
    boxShadow: '7px 7px 0 #5fb57a',
    fontSize: '12px',
    fontWeight: 800,
    zIndex: 8,
  })], {
    position: 'absolute',
    right: '2%',
    bottom: '-1%',
    width: 'clamp(320px,38vw,500px)',
    height: 'clamp(430px,49vw,620px)',
    maxWidth: '48%',
    animationName: 'nila-pulse',
    animationDuration: '5.5s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
    transformOrigin: '50% 90%',
    zIndex: 4,
  }, { right: '-5%', maxWidth: '50%' }, {
    position: 'relative',
    right: 'auto',
    bottom: 'auto',
    width: 'min(92vw,420px)',
    maxWidth: '100%',
    height: '510px',
    margin: '10px auto -42px',
  });
}

function buildMascotPortfolioHero(): EditorNode[] {
  const top = row('Portfolio top rule', [
    badge('08/01  VISUAL DESIGN', { background: '#5fb57a', color: '#111111', border: '2px solid #111111', padding: '8px 14px', fontWeight: 850 }),
    paragraph('MAKE IT HELPFUL', { width: 'fit-content', fontWeight: 850, color: '#111111', fontSize: '13px', letterSpacing: '.04em' }),
    paragraph('{ SELECTED / WORKS }', { width: 'fit-content', marginLeft: 'auto', fontWeight: 760, color: '#111111', fontSize: '13px' }),
  ], { alignItems: 'center', gap: '18px', zIndex: 8, position: 'relative' }, { flexWrap: 'wrap', gap: '10px' });

  const headline = container('Portfolio headline', [
    heading('2026 ↘ UI', { fontSize: 'clamp(58px,8.1vw,118px)', lineHeight: 0.82, letterSpacing: '-.065em', fontWeight: 900, color: '#111111', textTransform: 'uppercase' }, { fontSize: '56px' }),
    heading('PORTFOLIO', { fontSize: 'clamp(58px,8.1vw,118px)', lineHeight: 0.82, letterSpacing: '-.065em', fontWeight: 900, color: '#111111' }, { fontSize: '56px' }),
    heading('DESIGN', { fontSize: 'clamp(58px,8.1vw,118px)', lineHeight: 0.82, letterSpacing: '-.065em', fontWeight: 900, color: '#111111' }, { fontSize: '56px' }),
    heading('WORK S*', { fontSize: 'clamp(70px,9.4vw,138px)', lineHeight: 0.8, letterSpacing: '-.055em', fontWeight: 900, color: '#111111' }, { fontSize: '64px' }),
  ], {
    position: 'relative',
    zIndex: 3,
    width: '66%',
    maxWidth: '850px',
    gap: '2px',
    paddingTop: '60px',
  }, { width: '70%' }, { width: '100%', paddingTop: '36px' });

  const seeking = row('Seeking pill', [
    badge('SEEKING*', { background: '#ffffff', color: '#111111', border: '2px solid #111111', borderRadius: '999px', padding: '13px 22px', fontSize: '15px', fontWeight: 850 }),
    button('UI / GRAPHIC  →', { marginLeft: '-22px', padding: '13px 28px 13px 34px', borderRadius: '0 999px 999px 0', background: '#5fb57a', color: '#111111', border: '2px solid #111111', fontSize: '15px', fontWeight: 850 }),
  ], { width: 'fit-content', gap: 0, position: 'relative', zIndex: 8, marginTop: '34px' });

  const services = row('Portfolio services', [
    paragraph('Brand design', { width: 'fit-content', fontWeight: 800, color: '#111111' }),
    paragraph('Logo design', { width: 'fit-content', fontWeight: 800, color: '#111111' }),
    paragraph('Interface design', { width: 'fit-content', fontWeight: 800, color: '#111111' }),
    paragraph('IP character design', { width: 'fit-content', fontWeight: 800, color: '#111111' }),
  ], {
    position: 'absolute',
    left: '0',
    bottom: '18px',
    width: '72%',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '14px 34px',
    zIndex: 8,
  }, {
    width: '64%',
  });

  const stage = div('Mascot Portfolio Hero stage', [top, headline, seeking, services, mascotFigure()], {
    position: 'relative',
    width: '100%',
    minHeight: '760px',
    padding: '34px 44px 58px',
    overflow: 'hidden',
    background: 'linear-gradient(rgba(17,17,17,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(17,17,17,.08) 1px,transparent 1px),#ebebea',
    backgroundSize: '54px 54px',
    color: '#111111',
    border: '1px solid #111111',
    borderRadius: '28px',
    boxShadow: '0 28px 80px rgba(15,23,42,.12)',
    isolation: 'isolate',
  }, {
    minHeight: '720px',
    padding: '28px 30px 54px',
  }, {
    minHeight: '1040px',
    padding: '24px 20px 42px',
    borderRadius: '0',
    backgroundSize: '38px 38px',
  });

  return [section('Mascot Portfolio Hero', [stage], {
    width: '100%',
    padding: '28px',
    background: '#f7f7f5',
    overflow: 'hidden',
  }, { padding: '20px' }, { padding: '0' })];
}

export const HERO_SECTION_PRESETS: CatalogPreset[] = [
  {
    id: 'hero-tilted-grid',
    kind: 'section',
    name: 'Tilted Grid Hero',
    category: 'Hero',
    description: 'Curved cinematic image band with perspective, staggered motion, centre-focused copy and edge fading.',
    tags: ['hero', 'gallery', 'animated', 'tilted', 'portfolio'],
    build: buildTiltedGridHero,
  },
  {
    id: 'hero-mascot-portfolio',
    kind: 'section',
    name: 'Mascot Portfolio Hero',
    category: 'Hero',
    description: 'Editorial portfolio poster with oversized type, seeking pill, service rail and an original layered mascot built from editable Nila shapes.',
    tags: ['hero', 'portfolio', 'mascot', 'animated', 'editorial'],
    build: buildMascotPortfolioHero,
  },
];
