import type { EditorNode, EditorNodeType, NodeStyle } from './types';

export type MotionProfile = 'soft' | 'tech' | 'editorial' | 'luxury' | 'playful' | 'studio' | 'dashboard';

const STRUCTURAL = new Set<EditorNodeType>(['section', 'container', 'div', 'row', 'columns', 'grid']);
const INTERACTIVE = new Set<EditorNodeType>(['button', 'link', 'card', 'image', 'avatar', 'icon', 'badge']);

const profileMotion: Record<MotionProfile, { duration: number; distance: number; curve: string; hoverY: number; hoverScale: number }> = {
  soft: { duration: 650, distance: 18, curve: 'cubic-bezier(.2,.8,.2,1)', hoverY: -4, hoverScale: 1.015 },
  tech: { duration: 560, distance: 22, curve: 'cubic-bezier(.16,1,.3,1)', hoverY: -6, hoverScale: 1.02 },
  editorial: { duration: 720, distance: 28, curve: 'cubic-bezier(.22,1,.36,1)', hoverY: -3, hoverScale: 1.01 },
  luxury: { duration: 820, distance: 16, curve: 'cubic-bezier(.16,1,.3,1)', hoverY: -5, hoverScale: 1.012 },
  playful: { duration: 520, distance: 20, curve: 'cubic-bezier(.34,1.56,.64,1)', hoverY: -7, hoverScale: 1.025 },
  studio: { duration: 700, distance: 34, curve: 'cubic-bezier(.16,1,.3,1)', hoverY: -8, hoverScale: 1.028 },
  dashboard: { duration: 480, distance: 14, curve: 'cubic-bezier(.2,.8,.2,1)', hoverY: -3, hoverScale: 1.01 },
};

function entranceFor(node: EditorNode, index: number) {
  if (node.type === 'image' || node.type === 'video' || node.type === 'card') return index % 2 ? 'nila-slide-left' : 'nila-scale-in';
  if (node.type === 'badge' || node.type === 'icon') return 'nila-fade-in';
  if (node.type === 'button' || node.type === 'link') return 'nila-scale-in';
  return 'nila-slide-up';
}

function hoverVars(type: EditorNodeType, profile: MotionProfile, current: NodeStyle): NodeStyle {
  if (!INTERACTIVE.has(type)) return current;
  const motion = profileMotion[profile];
  const next: NodeStyle = {
    ...current,
    '--nila-motion-transition': `transform 260ms ${motion.curve}, box-shadow 260ms ${motion.curve}, filter 260ms ${motion.curve}, opacity 260ms ease`,
  };
  if (type === 'button' || type === 'link' || type === 'badge') {
    next['--nila-hover-transform'] = `translateY(${motion.hoverY}px) scale(${motion.hoverScale})`;
    next['--nila-hover-filter'] = 'brightness(1.03)';
  } else if (type === 'image' || type === 'avatar') {
    next['--nila-hover-transform'] = `scale(${Math.max(1.025, motion.hoverScale + 0.015)})`;
    next['--nila-hover-filter'] = 'saturate(1.05) contrast(1.02)';
  } else if (type === 'card') {
    next['--nila-hover-transform'] = `translateY(${motion.hoverY}px) scale(${motion.hoverScale})`;
    next['--nila-hover-shadow'] = profile === 'studio'
      ? '0 28px 80px rgba(124,58,237,.22)'
      : '0 24px 60px rgba(15,23,42,.14)';
  } else if (type === 'icon') {
    next['--nila-hover-transform'] = `translateY(${motion.hoverY}px) rotate(3deg) scale(${motion.hoverScale + 0.015})`;
  }
  return next;
}

export function applyDefaultNodeMotion(node: EditorNode, profile: MotionProfile = 'soft'): EditorNode {
  const motion = profileMotion[profile];
  const structural = STRUCTURAL.has(node.type);
  const shouldAnimate = !structural && node.type !== 'divider' && node.type !== 'spacer';
  let desktop = hoverVars(node.type, profile, node.styles.desktop);
  if (shouldAnimate && String(desktop.animationName ?? 'none') === 'none') {
    desktop = {
      ...desktop,
      animationName: entranceFor(node, 0),
      animationDuration: `${motion.duration}ms`,
      animationTimingFunction: motion.curve,
      animationFillMode: 'both',
    };
  }
  return { ...node, styles: { ...node.styles, desktop } };
}

export function applyMotionTree(nodes: EditorNode[], profile: MotionProfile = 'soft'): EditorNode[] {
  const motion = profileMotion[profile];
  let order = 0;
  const walk = (node: EditorNode, rootIndex: number, depth: number): EditorNode => {
    const currentOrder = order++;
    const structural = STRUCTURAL.has(node.type);
    const shouldAnimate = !structural && node.type !== 'divider' && node.type !== 'spacer';
    const heroImmediate = rootIndex === 0 && depth <= 3;
    const delay = Math.min((currentOrder % 7) * 55, 330);
    let desktop: NodeStyle = hoverVars(node.type, profile, node.styles.desktop);
    if (shouldAnimate && String(desktop.animationName ?? 'none') === 'none') {
      desktop = {
        ...desktop,
        animationName: entranceFor(node, currentOrder),
        animationDuration: `${motion.duration}ms`,
        animationTimingFunction: motion.curve,
        animationFillMode: 'both',
        animationDelay: `${delay}ms`,
        ...(heroImmediate ? {} : { animationTimeline: 'view()', animationRange: 'entry 6% cover 32%' }),
      };
    } else if (shouldAnimate) {
      const next = { ...desktop, animationFillMode: desktop.animationFillMode ?? 'both' };
      if (heroImmediate || desktop.animationIterationCount === 'infinite') {
        delete next.animationTimeline;
        delete next.animationRange;
      } else {
        next.animationTimeline = desktop.animationTimeline ?? 'view()';
        next.animationRange = desktop.animationRange ?? 'entry 6% cover 32%';
      }
      desktop = next;
    }
    return {
      ...node,
      styles: { ...node.styles, desktop },
      children: node.children.map((child) => walk(child, rootIndex, depth + 1)),
    };
  };
  return nodes.map((node, index) => walk(node, index, 0));
}

export function withMotion(build: () => EditorNode[], profile: MotionProfile = 'soft') {
  return () => applyMotionTree(build(), profile);
}
