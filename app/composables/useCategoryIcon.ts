/**
 * Category icon system — JD/Taobao style circular colored backgrounds with SVG path icons.
 *
 * Each category maps to: { color (gradient pair), icon (SVG path for 24x24 viewBox) }
 * Parent categories use bold colors; sub-categories use the parent's color palette.
 */

interface CatIconDef {
  /** Gradient: [from, to] */
  colors: [string, string]
  /** SVG path(s) for 24x24 viewBox, stroke-based (stroke-width 1.5, fill none) */
  path: string
}

// ── Parent category color palettes ──
const PALETTES = {
  digital: ['#6366f1', '#818cf8'] as [string, string],   // indigo
  computer: ['#3b82f6', '#60a5fa'] as [string, string],  // blue
  clothing: ['#f59e0b', '#fbbf24'] as [string, string],  // amber
  shoes: ['#ec4899', '#f472b6'] as [string, string],     // pink
  beauty: ['#e879a0', '#f0abcb'] as [string, string],    // rose
  food: ['#22c55e', '#4ade80'] as [string, string],      // green
  appliance: ['#0ea5e9', '#38bdf8'] as [string, string], // sky
  sports: ['#f97316', '#fb923c'] as [string, string],    // orange
}

// ── SVG paths (24x24 viewBox, stroke-linecap="round" stroke-linejoin="round") ──
const ICONS: Record<string, CatIconDef> = {
  // === 手机数码 (Parent) ===
  '手机数码': {
    colors: PALETTES.digital,
    path: 'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm4 18h.01',
  },
  '手机': {
    colors: PALETTES.digital,
    path: 'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm4 18h.01',
  },
  '手机配件': {
    colors: PALETTES.digital,
    path: 'M7 2v4a2 2 0 0 1-2 2H2m0 0V4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4h-3a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h3v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4h3a2 2 0 0 0 2-2v-4',
  },
  '摄影摄像': {
    colors: PALETTES.digital,
    path: 'M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  },
  '智能设备': {
    colors: PALETTES.digital,
    path: 'M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6c0 7-3 9-3 9h18s-3-2-3-9zM13.73 21a2 2 0 0 1-3.46 0M12 2v1',
  },
  '影音娱乐': {
    colors: PALETTES.digital,
    path: 'M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z',
  },

  // === 电脑办公 (Parent) ===
  '电脑办公': {
    colors: PALETTES.computer,
    path: 'M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55A1 1 0 0 1 20.39 21H3.61a1 1 0 0 1-.89-1.45L4 16',
  },
  '笔记本': {
    colors: PALETTES.computer,
    path: 'M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55A1 1 0 0 1 20.39 21H3.61a1 1 0 0 1-.89-1.45L4 16',
  },
  '台式机': {
    colors: PALETTES.computer,
    path: 'M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6zm8 14h4m-2-4v4',
  },
  '显示器': {
    colors: PALETTES.computer,
    path: 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zm5 17h8m-4-5v5',
  },
  '键鼠外设': {
    colors: PALETTES.computer,
    path: 'M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7zm4 3h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12',
  },
  '办公文具': {
    colors: PALETTES.computer,
    path: 'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z',
  },

  // === 服饰男装 (Parent) ===
  '服饰男装': {
    colors: PALETTES.clothing,
    path: 'M6.5 2 2 7l3.5 1L7 22h10l1.5-14 3.5-1L17.5 2C17.5 2 15 5 12 5S6.5 2 6.5 2z',
  },
  'T恤衬衫': {
    colors: PALETTES.clothing,
    path: 'M6.5 2 2 7l3.5 1L7 22h10l1.5-14 3.5-1L17.5 2C17.5 2 15 5 12 5S6.5 2 6.5 2z',
  },
  '外套夹克': {
    colors: PALETTES.clothing,
    path: 'M3 21V8l4-5h10l4 5v13M3 8h18M7 3l5 5 5-5M12 8v13',
  },
  '裤装': {
    colors: PALETTES.clothing,
    path: 'M5 3h14v5l-3 13h-2L12 10l-2 11H8L5 8V3zm0 5h14',
  },
  '内衣袜子': {
    colors: PALETTES.clothing,
    path: 'M7 4a3 3 0 0 1 3 3v3H4V7a3 3 0 0 1 3-3zm10 0a3 3 0 0 1 3 3v3h-6V7a3 3 0 0 1 3-3zM4 10h6v4c0 3-1.5 5-3 6s-3-1-3-1V10zm10 0h6v9s-1.5 2-3 1-3-3-3-6V10z',
  },

  // === 鞋靴箱包 (Parent) ===
  '鞋靴箱包': {
    colors: PALETTES.shoes,
    path: 'M2 18h20M2 18v-3a4 4 0 0 1 4-4h2l2-3h4l2 3h2a4 4 0 0 1 4 4v3M6 11V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4',
  },
  '运动鞋': {
    colors: PALETTES.shoes,
    path: 'M2 18h20M2 18v-3c0-1 .5-2.5 2-3l4-2c1-.5 2 0 3 1l1 1h4l6 3v3',
  },
  '休闲鞋': {
    colors: PALETTES.shoes,
    path: 'M3 18h18v1H3v-1zm0-1c0-2 1-4 3-5l5-3c1 0 2.5.5 3 2l1 2h5c2 0 3 1.5 3 3v1H3z',
  },
  '双肩包': {
    colors: PALETTES.shoes,
    path: 'M6 21V9a6 6 0 0 1 12 0v12M6 12h12M9 3a3 3 0 0 1 6 0M6 21h12M10 15v3m4-3v3',
  },
  '拉杆箱': {
    colors: PALETTES.shoes,
    path: 'M6 6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6zm0 4h12m-3 10v2m-6-2v2M10 2v2m4-2v2',
  },

  // === 美妆护肤 (Parent) ===
  '美妆护肤': {
    colors: PALETTES.beauty,
    path: 'M9 2h6l1 7H8L9 2zm-1 7h8v2a6 6 0 0 1-4 5.66V20h4v2H7v-2h4v-3.34A6 6 0 0 1 7 11V9h1z',
  },
  '面部护肤': {
    colors: PALETTES.beauty,
    path: 'M8 2h8v4H8V2zm0 4v3a4 4 0 0 0 8 0V6M8 6H6v8a6 6 0 0 0 12 0V6h-2M12 13v4m-2-2h4',
  },
  '彩妆': {
    colors: PALETTES.beauty,
    path: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.7 1.5-1.5 0-.39-.15-.74-.39-1.03-.23-.28-.37-.62-.37-.97 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.17-4.5-9-10-9zM6.5 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z',
  },
  '洗护用品': {
    colors: PALETTES.beauty,
    path: 'M10 2h4v3h-4V2zm-2 3h8v2l-1 13a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2L8 7V5zm6 0c2 0 4 1 4 3',
  },
  '香水': {
    colors: PALETTES.beauty,
    path: 'M10 4h4v2h-4V4zM9 6h6v2H9V6zm0 2h6v10a3 3 0 0 1-3 3 3 3 0 0 1-3-3V8zm1-6h4M8 2h8m-6 6v2m4-2v2',
  },

  // === 食品生鲜 (Parent) ===
  '食品生鲜': {
    colors: PALETTES.food,
    path: 'M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zm4-6 1 3m4-3v3m4-3-1 3',
  },
  '零食坚果': {
    colors: PALETTES.food,
    path: 'M12 2C8 2 4 6 4 10c0 3 1.5 5.5 4 7v3h8v-3c2.5-1.5 4-4 4-7 0-4-4-8-8-8zm-2 18h4v2h-4v-2z',
  },
  '茶饮冲调': {
    colors: PALETTES.food,
    path: 'M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zm4-6 1 3m4-3v3m4-3-1 3',
  },
  '生鲜水果': {
    colors: PALETTES.food,
    path: 'M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm-1 0c-3-1-5 1-5 1s2 2 5 1',
  },
  '粮油调味': {
    colors: PALETTES.food,
    path: 'M10 2h4v4h-4V2zM8 6h8l1 4H7l1-4zm-1 4h10l1 10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2l1-10z',
  },

  // === 家用电器 (Parent) ===
  '家用电器': {
    colors: PALETTES.appliance,
    path: 'M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5zm7 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 12h.01',
  },
  '空调': {
    colors: PALETTES.appliance,
    path: 'M3 4h18a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm0 8h18M8 16v4m4-6v6m4-4v4',
  },
  '冰箱': {
    colors: PALETTES.appliance,
    path: 'M5 2h14a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm0 9h14M9 5v4m0 4v3',
  },
  '洗衣机': {
    colors: PALETTES.appliance,
    path: 'M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5zm7 4a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm-3 5a3 3 0 0 0 3 3M7 5h.01',
  },
  '厨房电器': {
    colors: PALETTES.appliance,
    path: 'M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zm3 12h12M9 2v3m6-3v3M7 10h4v4H7v-4z',
  },
  '清洁电器': {
    colors: PALETTES.appliance,
    path: 'M12 2v8m0 0-4 4v6h8v-6l-4-4zm-4 4H5m14 0h-3M8 16h8',
  },

  // === 运动户外 (Parent) ===
  '运动户外': {
    colors: PALETTES.sports,
    path: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 0v4m-4 4 4-4 4 4M6 4l-2 4m14-4 2 4',
  },
  '运动服饰': {
    colors: PALETTES.sports,
    path: 'M6.5 2 2 7l3.5 1L7 22h10l1.5-14 3.5-1L17.5 2C17.5 2 15 5 12 5S6.5 2 6.5 2z',
  },
  '健身器材': {
    colors: PALETTES.sports,
    path: 'M6.5 6.5a1.5 1.5 0 0 1 3 0v11a1.5 1.5 0 0 1-3 0v-11zm8 0a1.5 1.5 0 0 1 3 0v11a1.5 1.5 0 0 1-3 0v-11zM2 9.5h4.5m11 0H22M2 14.5h4.5m11 0H22M9.5 12h5',
  },
  '户外装备': {
    colors: PALETTES.sports,
    path: 'M12 2 3 20h18L12 2zm0 6v6m0 2h.01',
  },
  '骑行运动': {
    colors: PALETTES.sports,
    path: 'M5.5 17a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zm13 0a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM5.5 12.5l5.5-5 2 3 5.5-5',
  },
}

// ── Fallback icon (shopping bag) ──
const FALLBACK: CatIconDef = {
  colors: ['#6b7280', '#9ca3af'],
  path: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0',
}

/**
 * Returns icon definition for a category name.
 * Falls back to parent's palette if sub-category not found.
 */
export function useCategoryIcon() {
  function getIconDef(categoryName: string, parentName?: string): CatIconDef {
    if (ICONS[categoryName]) return ICONS[categoryName]
    if (parentName && ICONS[parentName]) {
      return { ...FALLBACK, colors: ICONS[parentName].colors }
    }
    return FALLBACK
  }

  /**
   * Generates an inline SVG data URI for use in <img> src or as background.
   */
  function getIconSvg(categoryName: string, parentName?: string): string {
    const def = getIconDef(categoryName, parentName)
    const [c1, c2] = def.colors
    const id = categoryName.replace(/[^a-zA-Z0-9]/g, '')
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
      <defs><linearGradient id="g${id}" x1="0" y1="0" x2="48" y2="48">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient></defs>
      <rect width="48" height="48" rx="14" fill="url(#g${id})"/>
      <g transform="translate(12,12)" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <path d="${def.path}"/>
      </g>
    </svg>`
    return `data:image/svg+xml,${encodeURIComponent(svg)}`
  }

  return { getIconDef, getIconSvg }
}
