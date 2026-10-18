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

export function pageHasNavbar(nodes: EditorNode[]) {
  return nodes.some(isNavbarNode);
}
