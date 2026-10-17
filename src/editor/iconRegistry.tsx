import * as Lucide from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICON_KEYS = [
  'Activity','Airplay','AlarmClock','AlignCenter','AlignLeft','AlignRight','Archive','ArrowDown','ArrowDownLeft','ArrowDownRight','ArrowLeft','ArrowRight','ArrowUp','ArrowUpLeft','ArrowUpRight','AtSign','Award','BadgeCheck','Ban','Banknote','BarChart3','Battery','Bell','Bluetooth','Bold','BookOpen','Bookmark','Bot','Box','Briefcase','Brush','Bug','Building2','Bus','Calculator','Calendar','Camera','Car','ChartNoAxesCombined','Check','CheckCircle2','ChevronDown','ChevronLeft','ChevronRight','ChevronUp','CircleHelp','CircleUser','Clipboard','Clock','Cloud','Code','Code2','Coffee','Coins','Columns3','Command','Compass','Contact','Copy','Cpu','CreditCard','Crown','Database','Delete','Download','Edit3','ExternalLink','Eye','EyeOff','Facebook','File','FileCode2','FileText','Filter','Flag','Folder','FolderOpen','Gamepad2','Gauge','Gift','GitBranch','GitCommit','Github','GitPullRequest','Globe','GraduationCap','Grid3X3','GripVertical','HardDrive','Hash','Heart','HelpCircle','History','Home','Image','Inbox','Info','Instagram','Italic','Key','Laptop','Layers3','LayoutDashboard','LayoutGrid','LayoutTemplate','Lightbulb','Link','Linkedin','List','ListChecks','Loader2','Lock','LogIn','LogOut','Mail','Map','MapPin','Maximize2','Menu','MessageCircle','Mic','Minimize2','Minus','Monitor','Moon','MoreHorizontal','MousePointerClick','Move','Music','Navigation','Package','PanelLeft','Pause','PenTool','Phone','Play','Plus','Podcast','Power','Printer','Quote','Radio','Redo2','RefreshCw','Rocket','Save','Search','Send','Server','Settings','Share2','Shield','ShieldCheck','ShoppingBag','ShoppingCart','SlidersHorizontal','Smartphone','Smile','Sparkles','Star','Sun','Table','Tablet','Tag','Terminal','Text','ThumbsUp','Trash2','TrendingUp','TriangleAlert','Trophy','Twitter','Type','Undo2','Unlock','Upload','User','UserCheck','UserPlus','Users','Video','Volume2','Wallet','Wifi','Wrench','X','Youtube','Zap','ZoomIn','ZoomOut',
] as const;

const LEGACY_ALIASES: Record<string, string> = {
  'Arrow Right':'ArrowRight', Book:'BookOpen', Help:'CircleHelp', 'Credit Card':'CreditCard', 'External Link':'ExternalLink', GitHub:'Github', 'Map Pin':'MapPin', Message:'MessageCircle', 'Shopping Bag':'ShoppingBag', Trash:'Trash2', Close:'X',
};

export type NilaIconName = (typeof ICON_KEYS)[number];
export const ICON_ENTRIES = ICON_KEYS.map((key) => [key, humanize(key)] as const);

export function resolveIconKey(value?: string): string {
  if (!value) return 'Sparkles';
  const aliased = LEGACY_ALIASES[value] ?? value.replace(/\s+/g, '');
  return ICON_KEYS.includes(aliased as NilaIconName) ? aliased : 'Sparkles';
}

export function NilaIcon({ name = 'Sparkles', size = 24 }: { name?: string; size?: number | string }) {
  const key = resolveIconKey(name);
  const Icon = (Lucide as unknown as Record<string, LucideIcon>)[key] ?? Lucide.Sparkles;
  return <Icon size={size} aria-hidden="true" />;
}

function humanize(value: string) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
}
