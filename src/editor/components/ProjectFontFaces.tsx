import type { NilaAsset, NilaFont } from '../../core/project';

export function ProjectFontFaces({ assets, fonts }: { assets: NilaAsset[]; fonts: NilaFont[] }) {
  const css = fonts.map((font) => {
    const asset = assets.find((candidate) => candidate.id === font.assetId);
    if (!asset?.dataUrl) return '';
    const family = font.family.replace(/["'{};]/g, '').trim();
    return `@font-face{font-family:"${family}";src:url("${asset.dataUrl}") format("${font.format}");font-style:${font.style};font-weight:${font.weight};font-display:swap;}`;
  }).filter(Boolean).join('\n');
  return css ? <style data-nila-project-fonts>{css}</style> : null;
}
