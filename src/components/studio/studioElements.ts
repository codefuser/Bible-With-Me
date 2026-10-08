export interface StudioElementDef {
  id: string;
  name: string;
  nameTa: string;
  category: string;
  viewBox: string;
  svgPath: string;
  defaultColor: string;
}

export const STUDIO_ELEMENTS: StudioElementDef[] = [
  // ─── CROSSES ───
  {
    id: 'cross-classic',
    name: 'Classic Cross',
    nameTa: 'பாரம்பரிய சிலுவை',
    category: 'Cross',
    viewBox: '0 0 24 24',
    svgPath: 'M10 2h4v6h6v4h-6v10h-4V12H4V8h6V2z',
    defaultColor: '#fbbf24'
  },
  {
    id: 'cross-latin',
    name: 'Latin Cross Outline',
    nameTa: 'வரிவடிவ சிலுவை',
    category: 'Cross',
    viewBox: '0 0 24 24',
    svgPath: 'M11 2h2v7h7v2h-7v11h-2V11H4V9h7V2z',
    defaultColor: '#ffffff'
  },
  {
    id: 'cross-radiant',
    name: 'Radiant Cross',
    nameTa: 'ஒளிரும் சிலுவை',
    category: 'Cross',
    viewBox: '0 0 24 24',
    svgPath: 'M12 2l1.5 5.5L19 9l-4.5 3.5L16 18l-4-3-4 3 1.5-5.5L5 9l5.5-1.5L12 2z',
    defaultColor: '#f59e0b'
  },

  // ─── SYMBOLS & SPIRIT ───
  {
    id: 'dove-peace',
    name: 'Holy Spirit Dove',
    nameTa: 'பரிசுத்த ஆவியின் புறா',
    category: 'Spirit',
    viewBox: '0 0 24 24',
    svgPath: 'M12 2c2 2 4 5 3 8 3-1 6-2 7 0-2 2-5 3-7 3-1 3-3 6-5 9-1-2-1-4-1-6-2 1-4 1-6 0 1-2 3-3 5-4-1-3-1-6 0-8 2-1 3-2 4-2z',
    defaultColor: '#ffffff'
  },
  {
    id: 'open-bible',
    name: 'Open Scripture',
    nameTa: 'திறந்த வேதாகமம்',
    category: 'Scripture',
    viewBox: '0 0 24 24',
    svgPath: 'M2 4c3-1 6-1 10 1 4-2 7-2 10-1v15c-3-1-6-1-10 1-4-2-7-2-10-1V4zm10 2v13',
    defaultColor: '#fbbf24'
  },
  {
    id: 'crown-majesty',
    name: 'Royal Crown',
    nameTa: 'ராஜ கிரீடம்',
    category: 'Royalty',
    viewBox: '0 0 24 24',
    svgPath: 'M2 19h20v2H2v-2zm1-14l4 7 5-8 5 8 4-7v12H3V5z',
    defaultColor: '#f59e0b'
  },
  {
    id: 'sacred-flame',
    name: 'Revival Fire',
    nameTa: 'எழுப்புதல் அக்கினி',
    category: 'Spirit',
    viewBox: '0 0 24 24',
    svgPath: 'M12 2c1 3 4 5 4 9a6 6 0 1 1-12 0c0-3 2-6 5-8 0 2 1 4 3 4 1-2 0-4 0-5z',
    defaultColor: '#ef4444'
  },
  {
    id: 'olive-branch',
    name: 'Olive Branch',
    nameTa: 'ஒலிவக் கிளை',
    category: 'Peace',
    viewBox: '0 0 24 24',
    svgPath: 'M2 22C4 16 9 10 16 5c-3 4-5 9-5 15M16 5c3-1 5 1 5 3s-3 3-5 3M9 12c-2-2-1-5 1-6s4 1 4 4M6 18c-2-2-1-4 1-5s4 1 3 4',
    defaultColor: '#10b981'
  },
  {
    id: 'star-bethlehem',
    name: 'Star of Bethlehem',
    nameTa: 'பெத்லகேம் நட்சத்திரம்',
    category: 'Light',
    viewBox: '0 0 24 24',
    svgPath: 'M12 0l2 8 8 2-8 2-2 8-2-8-8-2 8-2 2-8z',
    defaultColor: '#fef08a'
  },
  {
    id: 'sacred-heart',
    name: 'Grace Heart',
    nameTa: 'கிருபையின் இதயம்',
    category: 'Love',
    viewBox: '0 0 24 24',
    svgPath: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
    defaultColor: '#f43f5e'
  },
  {
    id: 'wheat-harvest',
    name: 'Wheat Harvest',
    nameTa: 'கதிர் அறுவடை',
    category: 'Peace',
    viewBox: '0 0 24 24',
    svgPath: 'M12 22V10M12 10c-2-2-4-2-6 0 2 2 4 2 6 0zm0-3c-2-2-4-2-6 0 2 2 4 2 6 0zm0 3c2-2 4-2 6 0-2 2-4 2-6 0zm0-3c2-2 4-2 6 0-2 2-4 2-6 0zm0-4V2',
    defaultColor: '#f59e0b'
  },
  {
    id: 'sunburst-rays',
    name: 'Divine Sunburst',
    nameTa: 'பரலோக ஒளிக்கதிர்கள்',
    category: 'Light',
    viewBox: '0 0 24 24',
    svgPath: 'M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83',
    defaultColor: '#fbbf24'
  }
];
