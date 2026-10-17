import type { EditorNode, EditorNodeType, NodeLocation } from './types';

const id = () => crypto.randomUUID();

export function createNode(type: EditorNodeType): EditorNode {
  const shared: Omit<EditorNode, 'name' | 'props' | 'styles'> = {
    id: id(),
    type,
    children: [],
    locked: false,
    hidden: false,
  };

  switch (type) {
    case 'section':
      return {
        ...shared,
        name: 'Section',
        props: {},
        styles: { desktop: { padding: '72px 32px', background: '#ffffff' }, tablet: {}, mobile: { padding: '44px 20px' } },
      };
    case 'container':
      return {
        ...shared,
        name: 'Container',
        props: {},
        styles: { desktop: { width: '100%', maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }, tablet: {}, mobile: {} },
      };
    case 'heading':
      return { ...shared, name: 'Heading', props: { text: 'Build something remarkable.' }, styles: { desktop: { fontSize: '48px', fontWeight: 750, lineHeight: 1.08, color: '#111827' }, tablet: { fontSize: '38px' }, mobile: { fontSize: '32px' } } };
    case 'paragraph':
      return { ...shared, name: 'Paragraph', props: { text: 'Edit this text from the inspector or directly in a later phase.' }, styles: { desktop: { fontSize: '16px', lineHeight: 1.7, color: '#4b5563' }, tablet: {}, mobile: {} } };
    case 'button':
      return { ...shared, name: 'Button', props: { text: 'Get started', href: '#' }, styles: { desktop: { display: 'inline-flex', width: 'fit-content', padding: '12px 18px', borderRadius: '10px', background: '#111827', color: '#ffffff', fontWeight: 700 }, tablet: {}, mobile: {} } };
    case 'image':
      return { ...shared, name: 'Image', props: { src: '', alt: 'Placeholder image' }, styles: { desktop: { width: '100%', minHeight: '220px', borderRadius: '16px', background: '#e5e7eb' }, tablet: {}, mobile: {} } };
    case 'divider':
      return { ...shared, name: 'Divider', props: {}, styles: { desktop: { width: '100%', height: '1px', background: '#e5e7eb' }, tablet: {}, mobile: {} } };
    case 'spacer':
      return { ...shared, name: 'Spacer', props: {}, styles: { desktop: { height: '32px' }, tablet: {}, mobile: { height: '20px' } } };
  }
}

export function cloneNode(node: EditorNode): EditorNode {
  return {
    ...structuredClone(node),
    id: id(),
    name: `${node.name} copy`,
    children: node.children.map(cloneNode),
  };
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
  return nodes.map((node) => {
    if (node.id === nodeId) return updater(node);
    return { ...node, children: updateNode(node.children, nodeId, updater) };
  });
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
  return node?.type === 'section' || node?.type === 'container';
}

export function isDescendant(nodes: EditorNode[], potentialParentId: string, childId: string): boolean {
  const parent = findNode(nodes, potentialParentId)?.node;
  if (!parent) return false;
  const walk = (children: EditorNode[]): boolean => children.some((child) => child.id === childId || walk(child.children));
  return walk(parent.children);
}
