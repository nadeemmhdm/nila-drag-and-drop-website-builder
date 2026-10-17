import { describe, expect, it } from 'vitest';
import { AI_DEFAULTS, normalizeOllamaCloudModel } from '../src/ai/client';
import { getStyleGroupsForNode, supportsAnimation } from '../src/editor/styleControls';

const properties = (type: Parameters<typeof getStyleGroupsForNode>[0]) => getStyleGroupsForNode(type).flatMap((group) => group.controls.map((control) => control.property));

describe('AI provider defaults', () => {
  it('uses the direct Ollama Cloud model naming expected by ollama.com', () => {
    expect(AI_DEFAULTS.ollama.model).toBe('gpt-oss:120b');
    expect(normalizeOllamaCloudModel('gpt-oss:120b-cloud')).toBe('gpt-oss:120b');
  });
});

describe('contextual inspector controls', () => {
  it('shows typography for text without container-only grid controls', () => {
    const text = properties('paragraph');
    expect(text).toContain('fontSize');
    expect(text).toContain('color');
    expect(text).toContain('backgroundColor');
    expect(text).toContain('width');
    expect(text).not.toContain('gridTemplateColumns');
  });

  it('shows media sizing and object-fit without text-only controls', () => {
    const image = properties('image');
    expect(image).toContain('width');
    expect(image).toContain('height');
    expect(image).toContain('objectFit');
    expect(image).not.toContain('textTransform');
  });

  it('shows layout controls for containers and keeps spacer minimal', () => {
    expect(properties('grid')).toContain('gridTemplateColumns');
    expect(properties('row')).toContain('flexDirection');
    expect(properties('spacer')).not.toContain('fontSize');
    expect(supportsAnimation('spacer')).toBe(false);
    expect(supportsAnimation('button')).toBe(true);
  });
});
