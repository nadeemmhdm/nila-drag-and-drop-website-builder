import { Activity, ArrowRight, Bell, BookOpen, Briefcase, Calendar, Camera, Check, ChevronRight, CircleHelp, Cloud, Code, CreditCard, Database, Download, ExternalLink, Eye, File, Github, Globe, Heart, Home, Image as ImageIcon, Link, Lock, Mail, MapPin, Menu, MessageCircle, Moon, Phone, Play, Plus, Search, Settings, Shield, ShoppingBag, Sparkles, Star, Sun, Trash2, Upload, User, Users, Video, X, Zap } from 'lucide-react';

export const ICON_ENTRIES = [
  ['Activity', Activity], ['Arrow Right', ArrowRight], ['Bell', Bell], ['Book', BookOpen], ['Briefcase', Briefcase], ['Calendar', Calendar], ['Camera', Camera], ['Check', Check], ['Chevron Right', ChevronRight], ['Help', CircleHelp], ['Cloud', Cloud], ['Code', Code], ['Credit Card', CreditCard], ['Database', Database], ['Download', Download], ['External Link', ExternalLink], ['Eye', Eye], ['File', File], ['GitHub', Github], ['Globe', Globe], ['Heart', Heart], ['Home', Home], ['Image', ImageIcon], ['Link', Link], ['Lock', Lock], ['Mail', Mail], ['Map Pin', MapPin], ['Menu', Menu], ['Message', MessageCircle], ['Moon', Moon], ['Phone', Phone], ['Play', Play], ['Plus', Plus], ['Search', Search], ['Settings', Settings], ['Shield', Shield], ['Shopping Bag', ShoppingBag], ['Sparkles', Sparkles], ['Star', Star], ['Sun', Sun], ['Trash', Trash2], ['Upload', Upload], ['User', User], ['Users', Users], ['Video', Video], ['Close', X], ['Zap', Zap],
] as const;

export type NilaIconName = (typeof ICON_ENTRIES)[number][0];

export function NilaIcon({ name = 'Sparkles', size = 24 }: { name?: string; size?: number | string }) {
  const entry = ICON_ENTRIES.find(([label]) => label === name) ?? ICON_ENTRIES.find(([label]) => label === 'Sparkles')!;
  const Icon = entry[1];
  return <Icon size={size} aria-hidden="true" />;
}
