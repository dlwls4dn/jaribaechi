import { ClassroomTheme } from '../types';

export const CLASSROOM_THEMES: ClassroomTheme[] = [
  {
    id: 'chalkboard',
    name: '🌳 초록 분필 칠판',
    bg: 'bg-gradient-to-br from-amber-50 to-orange-100/50 text-slate-800',
    boardBg: 'bg-emerald-900 border-amber-800',
    boardBorder: 'border-8 border-amber-800 shadow-xl rounded-md',
    boardText: 'text-amber-50 font-serif tracking-widest',
    cardBg: 'bg-white border-amber-200/60 shadow-sm hover:shadow-md text-amber-950',
    cardText: 'text-amber-950',
    cardBorder: 'border-2 border-amber-200/40',
    cardHover: 'hover:border-amber-400 hover:bg-amber-50/50',
    fixedBg: 'bg-amber-500 text-white shadow-inner',
    fixedText: 'text-white',
    selectedBg: 'ring-4 ring-orange-500 ring-offset-2 scale-105',
    controlBg: 'bg-white/80 border-amber-200/50 backdrop-blur-md shadow-md',
    accentBg: 'bg-emerald-600 hover:bg-emerald-700',
    accentText: 'text-white',
    buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white',
    emptyBg: 'bg-dashed border-2 border-amber-300/40 bg-amber-50/20',
  }
];
