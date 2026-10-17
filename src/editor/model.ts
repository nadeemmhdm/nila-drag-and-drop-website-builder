import type { EditorNode, EditorNodeType, NodeLocation, ResponsiveStyles } from './types';

const id = () => crypto.randomUUID();
const responsive = (
  desktop: Record<string, string | number> = {},
  tablet: Record<string, string | number> = {},
  mobile: Record<string, string | number> = {},
): ResponsiveStyles => ({ desktop, tablet, mobile });

export function createNode(type: EditorNodeType): EditorNode {
  const shared: Pick<EditorNode, 'id' | 'type' | 'children' | 'locked' | 'hidden'> = {
    id: id(),
    type,
    children: [],
    locked: false,
    hidden: false,
  };

  switch (type) {
    case 'section': return { ...shared, name: 'Section', props: {}, styles: responsive({ padding: '72px 32px', background: '#ffffff' }, {}, { padding: '44px 20px' }) };
    case 'container': return { ...shared, name: 'Container', props: {}, styles: responsive({ width: '100%', maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }) };
    case 'columns': return { ...shared, name: 'Columns', props: {}, styles: responsive({ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '24px' }, {}, { gridTemplateColumns: '1fr' }) };
    case 'grid': return { ...shared, name: 'Grid', props: {}, styles: responsive({ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '18px' }, { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }, { gridTemplateColumns: '1fr' }) };
    case 'card': return { ...shared, name: 'Card', props: {}, styles: responsive({ display: 'flex', flexDirection: 'column', gap: '12px', padding: '22px', border: '1px solid #e5e7eb', borderRadius: '16px', background: '#ffffff' }) };
    case 'heading': return { ...shared, name: 'Heading', props: { text: 'Build something remarkable.' }, styles: responsive({ fontSize: '48px', fontWeight: 750, lineHeight: 1.08, color: '#111827' }, { fontSize: '38px' }, { fontSize: '32px' }) };
    case 'paragraph': return { ...shared, name: 'Paragraph', props: { text: 'Describe your product, service, or idea with clear and useful copy.' }, styles: responsive({ fontSize: '16px', lineHeight: 1.7, color: '#4b5563' }) };
    case 'link': return { ...shared, name: 'Link', props: { text: 'Learn more', href: '#' }, styles: responsive({ color: '#4f46e5', fontWeight: 650, textDecoration: 'none' }) };
    case 'button': return { ...shared, name: 'Button', props: { text: 'Get started', href: '#' }, styles: responsive({ display: 'inline-flex', width: 'fit-content', padding: '12px 18px', borderRadius: '10px', background: '#111827', color: '#ffffff', fontWeight: 700, textDecoration: 'none' }) };
    case 'badge': return { ...shared, name: 'Badge', props: { text: 'New' }, styles: responsive({ display: 'inline-flex', width: 'fit-content', padding: '5px 9px', borderRadius: '999px', background: '#eef2ff', color: '#4338ca', fontSize: '12px', fontWeight: 750 }) };
    case 'image': return { ...shared, name: 'Image', props: { src: '', alt: 'Placeholder image' }, styles: responsive({ width: '100%', minHeight: '220px', borderRadius: '16px', background: '#e5e7eb', objectFit: 'cover' }) };
    case 'avatar': return { ...shared, name: 'Avatar', props: { src: '', alt: 'Avatar' }, styles: responsive({ width: '56px', height: '56px', borderRadius: '999px', objectFit: 'cover', background: '#e5e7eb' }) };
    case 'video': return { ...shared, name: 'Video', props: { src: '', alt: 'Video' }, styles: responsive({ width: '100%', minHeight: '260px', borderRadius: '16px', background: '#111827' }) };
    case 'quote': return { ...shared, name: 'Quote', props: { text: 'A focused quote can make an important point memorable.' }, styles: responsive({ padding: '18px 20px', borderLeft: '3px solid #6366f1', color: '#374151', fontSize: '18px', lineHeight: 1.6, fontStyle: 'italic' }) };
    case 'list': return { ...shared, name: 'List', props: { items: ['First item', 'Second item', 'Third item'] }, styles: responsive({ color: '#374151', lineHeight: 1.8, paddingLeft: '22px' }) };
    case 'divider': return { ...shared, name: 'Divider', props: {}, styles: responsive({ width: '100%', height: '1px', background: '#e5e7eb' }) };
    case 'spacer': return { ...shared, name: 'Spacer', props: {}, styles: responsive({ height: '32px' }, {}, { height: '20px' }) };
    case 'input': return { ...shared, name: 'Input', props: { label: 'Name', placeholder: 'Enter your name' }, styles: responsive({ width: '100%', padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: '10px', background: '#ffffff' }) };
    case 'textarea': return { ...shared, name: 'Textarea', props: { label: 'Message', placeholder: 'Write your message' }, styles: responsive({ width: '100%', minHeight: '120px', padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: '10px', background: '#ffffff' }) };
    case 'select': return { ...shared, name: 'Select', props: { label: 'Option', options: ['Option one', 'Option two', 'Option three'] }, styles: responsive({ width: '100%', padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: '10px', background: '#ffffff' }) };
    case 'checkbox': return { ...shared, name: 'Checkbox', props: { label: 'I agree', checked: false }, styles: responsive({ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }) };
  }
}

export function cloneNode(node: EditorNode): EditorNode {
  return { ...structuredClone(node), id: id(), name: `${node.name} copy`, children: node.children.map(cloneNode) };
}

export function findNode(nodes: EditorNode[], nodeId: string): NodeLocation | null {
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (node.id === nodeId) return { node, parentId: null, index };
    const nested = findNodeWithParent(node.children, nodeId, node.id);
    if (nested) return nested;
  }
  return null;
}

function findNodeWithParent(nodes: EditorNode[], nodeId: string, parentId: string): NodeLocation | null {
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (node.id === nodeId) return { node, parentId, index };
    const nested = findNodeWithParent(node.children, nodeId, node.id);
    if (nested) return nested;
  }
  return null;
}

export function getChildren(nodes: EditorNode[], parentId: string | null): EditorNode[] {
  if (parentId === null) return nodes;
  return findNode(nodes, parentId)?.node.children ?? [];
}

export function replaceChildren(nodes: EditorNode[], parentId: string | null, children: EditorNode[]): EditorNode[] {
  if (parentId === null) return children;
  return updateNode(nodes, parentId, (node) => ({ ...node, children }));
}

export function updateNode(nodes: EditorNode[], nodeId: string, updater: (node: EditorNode) => EditorNode): EditorNode[] {
  return nodes.map((node) => node.id === nodeId ? updater(node) : { ...node, children: updateNode(node.children, nodeId, updater) });
}

export function removeNode(nodes: EditorNode[], nodeId: string): { nodes: EditorNode[]; removed: EditorNode | null; parentId: string | null; index: number } {
  const index = nodes.findIndex((node) => node.id === nodeId);
  if (index >= 0) {
    const next = [...nodes];
    const [removed] = next.splice(index, 1);
    return { nodes: next, removed, parentId: null, index };
  }
  for (const node of nodes) {
    const nested = removeNode(node.children, nodeId);
    if (nested.removed) {
      return {
        nodes: nodes.map((candidate) => candidate.id === node.id ? { ...candidate, children: nested.nodes } : candidate),
        removed: nested.removed,
        parentId: node.id,
        index: nested.index,
      };
    }
  }
  return { nodes, removed: null, parentId: null, index: -1 };
}

export function insertNode(nodes: EditorNode[], parentId: string | null, index: number, node: EditorNode): EditorNode[] {
  const children = [...getChildren(nodes, parentId)];
  const safeIndex = Math.max(0, Math.min(index, children.length));
  children.splice(safeIndex, 0, node);
  return replaceChildren(nodes, parentId, children);
}

export function isContainerNode(node?: EditorNode | null): boolean {
  return node ? ['section', 'container', 'columns', 'grid', 'card'].includes(node.type) : false;
}

export function isDescendant(nodes: EditorNode[], potentialParentId: string, childId: string): boolean {
  const parent = findNode(nodes, potentialParentId)?.node;
  if (!parent) return false;
  const walk = (children: EditorNode[]): boolean => children.some((child) => child.id === childId || walk(child.children));
  return walk(parent.children);
}
