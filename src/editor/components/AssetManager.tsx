import { FileType2, Image as ImageIcon, Plus, Search, Shapes, Trash2, Upload, Video } from 'lucide-react';
import { useMemo, useState, type ChangeEvent } from 'react';
import type { NilaAsset, NilaFont } from '../../core/project';
import { ASSET_ACCEPT, MAX_TOTAL_ASSET_BYTES, createAssetFromFile, createFontFromAsset } from '../assetPipeline';
import { ICON_ENTRIES, NilaIcon } from '../iconRegistry';

type AssetTab = 'media' | 'fonts' | 'icons';
type IconBrowserMode = 'icons' | 'emoji';

interface AssetManagerProps {
  assets: NilaAsset[];
  fonts: NilaFont[];
  canApplyFont: boolean;
  onAdd: (assets: NilaAsset[], fonts: NilaFont[]) => void;
  onDelete: (assetId: string) => void;
  onInsertAsset: (asset: NilaAsset) => void;
  onUpdateFont: (fontId: string, patch: Partial<NilaFont>) => void;
  onApplyFont: (font: NilaFont) => void;
  onInsertIcon: (value: string, mode?: 'lucide' | 'emoji') => void;
}

const EMOJIS = ['😀','😄','😍','🥳','😎','🤖','👋','👍','👏','🙏','💪','🧠','👀','❤️','💙','💚','⭐','✨','🔥','⚡','🚀','🎯','🏆','💡','🛡️','🔒','🔑','✅','❌','⚠️','📌','📍','📧','📞','💬','📱','💻','🖥️','⌨️','🛠️','⚙️','📦','🛒','💳','💰','📈','📊','📝','📚','🎓','🎨','📷','🎥','🎵','🌍','☀️','🌙','☁️','🏠','🏢','👤','👥','🍔','☕','🎁','🎉'];

export function AssetManager({ assets, fonts, canApplyFont, onAdd, onDelete, onInsertAsset, onUpdateFont, onApplyFont, onInsertIcon }: AssetManagerProps) {
  const [tab, setTab] = useState<AssetTab>('media');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [iconQuery, setIconQuery] = useState('');
  const [mediaQuery, setMediaQuery] = useState('');
  const [iconMode,setIconMode]=useState<IconBrowserMode>('icons');
  const media = useMemo(()=>assets.filter((asset) => asset.kind === 'image' || asset.kind === 'video').filter((asset)=>!mediaQuery.trim()||asset.name.toLowerCase().includes(mediaQuery.trim().toLowerCase())),[assets,mediaQuery]);
  const projectSize = assets.reduce((sum, asset) => sum + asset.size, 0);
  const icons = useMemo(() => ICON_ENTRIES.filter(([key,label]) => `${key} ${label}`.toLowerCase().includes(iconQuery.toLowerCase())), [iconQuery]);

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!files.length) return;
    setBusy(true);
    setError(null);
    const addedAssets: NilaAsset[] = [];
    const addedFonts: NilaFont[] = [];
    let currentAssets = [...assets];
    let currentFonts = [...fonts];
    let total = projectSize;
    try {
      for (const file of files) {
        if (total + file.size > MAX_TOTAL_ASSET_BYTES) throw new Error('Project asset limit is 80 MB for the current browser session.');
        const asset = await createAssetFromFile(file, currentAssets);
        currentAssets = [...currentAssets, asset];
        addedAssets.push(asset);
        total += asset.size;
        if (asset.kind === 'font') {
          const font = createFontFromAsset(asset, currentFonts);
          currentFonts = [...currentFonts, font];
          addedFonts.push(font);
        }
      }
      onAdd(addedAssets, addedFonts);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Upload failed.');
    } finally {
      setBusy(false);
    }
  };

  return <div className="asset-manager asset-manager-v2">
    <div className="asset-overview"><div><strong>{assets.length}</strong><span>Files</span></div><div><strong>{media.length}</strong><span>Media</span></div><div><strong>{fonts.length}</strong><span>Fonts</span></div><div><strong>{formatBytes(projectSize)}</strong><span>Used</span></div></div>
    <div className="asset-tabs"><button type="button" className={tab === 'media' ? 'active' : ''} onClick={() => setTab('media')}><ImageIcon size={13} /> Media</button><button type="button" className={tab === 'fonts' ? 'active' : ''} onClick={() => setTab('fonts')}><FileType2 size={13} /> Fonts</button><button type="button" className={tab === 'icons' ? 'active' : ''} onClick={() => setTab('icons')}><Shapes size={13} /> Icons</button></div>
    {tab !== 'icons' ? <label className={`asset-upload asset-upload-v2${busy ? ' busy' : ''}`}><span className="asset-upload-icon"><Upload size={17} /></span><span><strong>{busy ? 'Reading files…' : 'Upload local files'}</strong><small>Images, videos and fonts are kept inside this project.</small></span><input type="file" multiple accept={ASSET_ACCEPT} disabled={busy} onChange={upload} /></label> : null}
    {error ? <div className="asset-error">{error}</div> : null}
    {tab === 'media' ? <><div className="asset-search"><Search size={13}/><input value={mediaQuery} onChange={(event)=>setMediaQuery(event.target.value)} placeholder="Search uploaded media"/></div><div className="asset-list asset-grid-v2">{media.length ? media.map((asset) => <article className="asset-card asset-card-v2" key={asset.id}><div className="asset-preview">{asset.kind === 'image' ? <img src={asset.dataUrl} alt="" /> : <video src={asset.dataUrl} muted preload="metadata"/>}</div><div className="asset-meta"><strong>{asset.name}</strong><span>{asset.kind} · {formatBytes(asset.size)}</span><code>{asset.projectPath}</code></div><div className="asset-actions"><button type="button" className="primary" onClick={() => onInsertAsset(asset)}><Plus size={12} /> Insert</button><button type="button" className="danger" onClick={() => onDelete(asset.id)} title="Delete asset"><Trash2 size={12} /></button></div></article>) : <Empty label={mediaQuery?'No matching media.':'No media uploaded yet.'} />}</div></> : null}
    {tab === 'fonts' ? <div className="asset-list">{fonts.length ? fonts.map((font) => { const asset = assets.find((candidate) => candidate.id === font.assetId); return <article className="font-card" key={font.id}><div className="font-sample" style={{ fontFamily: `"${font.family}", sans-serif` }}>Aa</div><label>Family<input value={font.family} onChange={(event) => onUpdateFont(font.id, { family: event.target.value.replace(/["'{};]/g, '') })} /></label><div className="font-row"><label>Weight<select value={font.weight} onChange={(event) => onUpdateFont(font.id, { weight: event.target.value })}>{['300','400','500','600','700','800','900'].map((weight) => <option key={weight}>{weight}</option>)}</select></label><label>Style<select value={font.style} onChange={(event) => onUpdateFont(font.id, { style: event.target.value as NilaFont['style'] })}><option value="normal">Normal</option><option value="italic">Italic</option></select></label></div><code>{asset?.projectPath ?? 'Missing font asset'}</code><div className="asset-actions"><button type="button" disabled={!canApplyFont} onClick={() => onApplyFont(font)}>Apply to selected</button><button type="button" className="danger" onClick={() => onDelete(font.assetId)}><Trash2 size={12} /></button></div></article>; }) : <Empty label="Upload a local font to register it." />}</div> : null}
    {tab === 'icons' ? <><div className="icon-mode-switch"><button type="button" className={iconMode==='icons'?'active':''} onClick={()=>setIconMode('icons')}>Lucide icons</button><button type="button" className={iconMode==='emoji'?'active':''} onClick={()=>setIconMode('emoji')}>Emoji</button></div>{iconMode==='icons'?<><div className="icon-search"><Search size={13} /><input value={iconQuery} onChange={(event) => setIconQuery(event.target.value)} placeholder={`Search ${ICON_ENTRIES.length} icons`} /></div><div className="icon-grid icon-grid-v2">{icons.map(([key,label]) => <button type="button" key={key} title={`Insert ${label}`} onClick={() => onInsertIcon(key,'lucide')}><NilaIcon name={key} size={18} /><span>{label}</span></button>)}</div></>:<div className="emoji-grid">{EMOJIS.map((emoji)=><button type="button" key={emoji} onClick={()=>onInsertIcon(emoji,'emoji')} title={`Insert ${emoji}`}>{emoji}</button>)}</div>}</> : null}
    <div className="asset-usage"><span>{formatBytes(projectSize)} / 80 MB</span><div><i style={{width:`${Math.min(100,(projectSize/MAX_TOTAL_ASSET_BYTES)*100)}%`}}/></div></div>
  </div>;
}

function Empty({ label }: { label: string }) { return <div className="asset-empty">{label}</div>; }
function formatBytes(value: number) { if (value < 1024) return `${value} B`; if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`; return `${(value / 1024 / 1024).toFixed(1)} MB`; }
