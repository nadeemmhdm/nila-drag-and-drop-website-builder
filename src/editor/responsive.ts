import type { DeviceViewport } from '../core/project';
import type { EditorNode, NodeStyle, ResponsiveStyles } from './types';

function parsePx(value: string | number | undefined): number | null {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return null;
  const match = /^(-?\d+(?:\.\d+)?)px$/i.exec(value.trim());
  return match ? Number(match[1]) : null;
}

function mergeMissing(target: NodeStyle, defaults: NodeStyle) {
  const next = { ...target };
  for (const [key, value] of Object.entries(defaults)) {
    if (next[key] === undefined || next[key] === '') next[key] = value;
  }
  return next;
}

function capLegacyHeadingFontSize(desktop: NodeStyle, tablet: NodeStyle, mobile: NodeStyle) {
  const desktopPx = parsePx(desktop.fontSize);
  if (desktopPx === null) return { tablet, mobile };
  const nextTablet = { ...tablet };
  const nextMobile = { ...mobile };
  // Older template nodes inherited the generic Heading tablet/mobile defaults even
  // when their desktop size was intentionally smaller (e.g. Navbar/Footer labels).
  if (String(nextTablet.fontSize ?? '') === '38px' && desktopPx < 38) nextTablet.fontSize = `${desktopPx}px`;
  if (String(nextMobile.fontSize ?? '') === '32px' && desktopPx < 32) nextMobile.fontSize = `${desktopPx}px`;
  return { tablet: nextTablet, mobile: nextMobile };
}

export function resolvedResponsiveStyles(node: EditorNode): ResponsiveStyles {
  const desktop: NodeStyle = { ...node.styles.desktop };
  let tablet: NodeStyle = { ...node.styles.tablet };
  let mobile: NodeStyle = { ...node.styles.mobile };

  if (node.type === 'heading') ({ tablet, mobile } = capLegacyHeadingFontSize(desktop, tablet, mobile));

  const structural = ['section', 'container', 'div', 'row', 'columns', 'grid', 'card'].includes(node.type);
  if (structural) {
    tablet = mergeMissing(tablet, { maxWidth: '100%', minWidth: 0 });
    mobile = mergeMissing(mobile, { maxWidth: '100%', minWidth: 0 });
  }

  if (node.type === 'section') {
    tablet = mergeMissing(tablet, { width: '100%', padding: '56px 24px' });
    mobile = mergeMissing(mobile, { width: '100%', padding: '40px 16px' });
  }
  if (node.type === 'container' || node.type === 'div' || node.type === 'card') {
    tablet = mergeMissing(tablet, { width: '100%' });
    mobile = mergeMissing(mobile, { width: '100%' });
  }
  if (node.type === 'row') {
    tablet = mergeMissing(tablet, { width: '100%', flexWrap: 'wrap' });
    mobile = mergeMissing(mobile, { width: '100%', flexWrap: 'wrap', gap: '10px' });
  }
  if (node.type === 'columns') {
    mobile = mergeMissing(mobile, { gridTemplateColumns: 'minmax(0, 1fr)', gap: '16px' });
  }
  if (node.type === 'grid') {
    tablet = mergeMissing(tablet, { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' });
    mobile = mergeMissing(mobile, { gridTemplateColumns: 'minmax(0, 1fr)' });
  }

  if (['heading', 'paragraph', 'link', 'button', 'badge', 'quote', 'list'].includes(node.type)) {
    tablet = mergeMissing(tablet, { maxWidth: '100%' });
    mobile = mergeMissing(mobile, { maxWidth: '100%', overflowWrap: 'anywhere' });
  }
  if (['image', 'avatar', 'video', 'input', 'textarea', 'select', 'checkbox', 'divider', 'spacer', 'icon'].includes(node.type)) {
    tablet = mergeMissing(tablet, { maxWidth: '100%' });
    mobile = mergeMissing(mobile, { maxWidth: '100%' });
  }

  const name = node.name.trim().toLowerCase();
  if (name === 'navbar') {
    tablet = { ...tablet, padding: tablet.padding ?? '14px 20px' };
    mobile = { ...mobile, padding: mobile.padding ?? '12px 16px' };
  }
  if (name === 'nav row') {
    tablet = { ...tablet, flexWrap: 'wrap', gap: tablet.gap ?? '14px' };
    mobile = { ...mobile, width: '100%', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start', gap: '12px' };
  }
  if (name === 'nav links') {
    tablet = { ...tablet, flexWrap: 'wrap' };
    mobile = { ...mobile, width: '100%', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '10px 14px', margin: 0 };
  }
  if (name === 'footer') {
    tablet = { ...tablet, padding: tablet.padding ?? '44px 24px' };
    mobile = { ...mobile, padding: mobile.padding ?? '32px 16px' };
  }
  if (name === 'footer content') {
    tablet = mergeMissing(tablet, { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' });
    mobile = { ...mobile, gridTemplateColumns: 'minmax(0, 1fr)', gap: mobile.gap ?? '22px' };
  }
  if (name === 'footer bottom row') {
    mobile = { ...mobile, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', gap: '8px' };
  }

  // A desktop grid span should not create implicit extra columns on phones.
  if (mobile.gridColumn === undefined && desktop.gridColumn !== undefined) mobile.gridColumn = 'auto';
  if (mobile.gridRow === undefined && desktop.gridRow !== undefined) mobile.gridRow = 'auto';

  return { desktop, tablet, mobile };
}

export function mergedResponsiveStyle(node: EditorNode, viewport: DeviceViewport): NodeStyle {
  const styles = resolvedResponsiveStyles(node);
  return {
    ...styles.desktop,
    ...(viewport === 'tablet' || viewport === 'mobile' ? styles.tablet : {}),
    ...(viewport === 'mobile' ? styles.mobile : {}),
  };
}
