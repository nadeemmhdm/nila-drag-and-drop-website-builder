import { describe, expect, it } from 'vitest';
import { materializeAiSitePlan } from '../src/ai/sitePlanner';
import type { EditorNode } from '../src/editor/types';

function flatten(nodes:EditorNode[]):EditorNode[]{return nodes.flatMap((node)=>[node,...flatten(node.children)]);}

describe('AI site planner',()=>{
  it('uses only local Nila presets and keeps media as alt-text placeholders',()=>{
    const result=materializeAiSitePlan({
      siteName:'Acme Studio',
      browserTitle:'Acme Studio — Websites',
      description:'A web studio.',
      theme:{primary:'#2563eb',background:'#ffffff',surface:'#f8fafc',text:'#111827',muted:'#475569'},
      pages:[{name:'Home',slug:'/',sections:[{presetId:'hero-split',texts:['Local-first agency','Build fast websites','Clear copy','Start now','Learn more'],mediaAlt:['Team collaborating on a website project']},{presetId:'not-allowed',texts:['Ignored']}]}],
    },'Project Name');
    expect(result.pages).toHaveLength(1);
    expect(result.seo.siteName).toBe('Acme Studio');
    expect(result.seo.browserTitle).toContain('Acme Studio');
    const nodes=flatten(result.pages[0].nodes);
    expect(nodes.some((node)=>node.props.text==='Build fast websites')).toBe(true);
    const media=nodes.find((node)=>node.type==='image');
    expect(media?.props.alt).toBe('Team collaborating on a website project');
    expect(media?.props.src).toBe('');
    expect(media?.props.assetId).toBeUndefined();
    const button=nodes.find((node)=>node.type==='button');
    expect(button?.styles.desktop.background).toBe('#2563eb');
  });
});
