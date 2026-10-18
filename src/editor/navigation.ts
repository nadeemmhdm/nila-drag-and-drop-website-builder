import type { EditorNode } from './types';

const NAV_NAME = /(^|\b)(navbar|navigation|site nav|main nav)(\b|$)/i;

export function isNavbarNode(node: EditorNode) {
  return node.type === 'section' && NAV_NAME.test(node.name.trim());
}

export function navbarBrand(node: EditorNode, fallback = 'Site') {
  let result = '';
  const visit = (nodes: EditorNode[]) => {
    for (const child of nodes) {
      if (child.type === 'heading' && child.props.text?.trim()) {
        result = child.props.text.trim();
        return true;
      }
      if (visit(child.children)) return true;
    }
    return false;
  };
  visit(node.children);
  return result || fallback;
}

export function navbarItems(node: EditorNode) {
  const items: EditorNode[] = [];
  const visit = (nodes: EditorNode[]) => {
    for (const child of nodes) {
      if ((child.type === 'link' || child.type === 'button') && child.props.text?.trim()) {
        items.push(child);
      }
      if (child.children.length) visit(child.children);
    }
  };
  visit(node.children);
  return items.slice(0, 12);
}

export function pageHasNavbar(nodes: EditorNode[]) {
  return nodes.some(isNavbarNode);
}
