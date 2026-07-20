/**
 * 分类图标系统 —— 淡色底块 + 同色系 Phosphor 图标。
 *
 * 改造前的问题（两条，都已修）：
 * 1. 图标是手写的极简单 path（手机=圆角矩形+一个点），46px 下显得潦草；
 * 2. `getIconSvg` 给所有分类硬编码同一条金色渐变，下面这套 PALETTES 从未被使用 ——
 *    结果所有入口长得一模一样，只能靠底下小字区分，扫视时无法辨认。
 *
 * 现在改用项目已有的 @phosphor-icons/vue（tabbar 同款）：专业绘制、字重可调，
 * 不再手写 path；配色回到按品类分色，让用户一眼能认出品类。
 */
import {
  PhDeviceMobile, PhBatteryCharging, PhCamera, PhWatch, PhHeadphones,
  PhLaptop, PhDesktopTower, PhMonitor, PhKeyboard, PhPencilRuler,
  PhTShirt, PhCoatHanger, PhPants, PhSock,
  PhHandbag, PhSneaker, PhBackpack, PhSuitcaseRolling,
  PhSparkle, PhDrop, PhPaintBrush, PhHandSoap, PhFlowerLotus,
  PhForkKnife, PhCookie, PhCoffee, PhOrangeSlice, PhBowlFood,
  PhTelevision, PhFan, PhSnowflake, PhWashingMachine, PhCookingPot, PhBroom,
  PhBarbell, PhPersonSimpleRun, PhTent, PhBicycle,
  PhArmchair, PhBookOpen, PhBaby, PhSquaresFour,
} from '@phosphor-icons/vue'
import type { Component } from 'vue'

interface CatIconDef {
  /** [底块承色, 图标色]；底块低透明度铺色，图标用较亮的一档保证暗色模式对比度 */
  colors: [string, string]
  /** Phosphor 图标组件 */
  comp: Component
}

// ── 品类色板 ──
const PALETTES = {
  digital: ['#6366f1', '#818cf8'] as [string, string],   // 靛蓝
  computer: ['#3b82f6', '#60a5fa'] as [string, string],  // 蓝
  clothing: ['#f59e0b', '#fbbf24'] as [string, string],  // 琥珀
  shoes: ['#ec4899', '#f472b6'] as [string, string],     // 粉
  beauty: ['#e879a0', '#f0abcb'] as [string, string],    // 玫瑰
  food: ['#22c55e', '#4ade80'] as [string, string],      // 绿
  appliance: ['#0ea5e9', '#38bdf8'] as [string, string], // 天蓝
  sports: ['#f97316', '#fb923c'] as [string, string],    // 橙
}

const ICONS: Record<string, CatIconDef> = {
  // 手机数码
  '手机数码': { colors: PALETTES.digital, comp: PhDeviceMobile },
  '手机': { colors: PALETTES.digital, comp: PhDeviceMobile },
  '手机通讯': { colors: PALETTES.digital, comp: PhDeviceMobile },
  '电子数码': { colors: PALETTES.digital, comp: PhDeviceMobile },
  '手机配件': { colors: PALETTES.digital, comp: PhBatteryCharging },
  '摄影摄像': { colors: PALETTES.digital, comp: PhCamera },
  '智能设备': { colors: PALETTES.digital, comp: PhWatch },
  '影音娱乐': { colors: PALETTES.digital, comp: PhHeadphones },

  // 电脑办公
  '电脑办公': { colors: PALETTES.computer, comp: PhLaptop },
  '笔记本': { colors: PALETTES.computer, comp: PhLaptop },
  '台式机': { colors: PALETTES.computer, comp: PhDesktopTower },
  '显示器': { colors: PALETTES.computer, comp: PhMonitor },
  '键鼠外设': { colors: PALETTES.computer, comp: PhKeyboard },
  '办公文具': { colors: PALETTES.computer, comp: PhPencilRuler },
  '图书文教': { colors: PALETTES.computer, comp: PhBookOpen },

  // 服饰
  '服饰男装': { colors: PALETTES.clothing, comp: PhTShirt },
  '服装鞋包': { colors: PALETTES.clothing, comp: PhTShirt },
  'T恤衬衫': { colors: PALETTES.clothing, comp: PhTShirt },
  '外套夹克': { colors: PALETTES.clothing, comp: PhCoatHanger },
  '裤装': { colors: PALETTES.clothing, comp: PhPants },
  '内衣袜子': { colors: PALETTES.clothing, comp: PhSock },

  // 鞋靴箱包
  '鞋靴箱包': { colors: PALETTES.shoes, comp: PhHandbag },
  '运动鞋': { colors: PALETTES.shoes, comp: PhSneaker },
  '休闲鞋': { colors: PALETTES.shoes, comp: PhSneaker },
  '双肩包': { colors: PALETTES.shoes, comp: PhBackpack },
  '拉杆箱': { colors: PALETTES.shoes, comp: PhSuitcaseRolling },

  // 美妆个护
  '美妆护肤': { colors: PALETTES.beauty, comp: PhSparkle },
  '美妆个护': { colors: PALETTES.beauty, comp: PhSparkle },
  '面部护肤': { colors: PALETTES.beauty, comp: PhDrop },
  '彩妆': { colors: PALETTES.beauty, comp: PhPaintBrush },
  '洗护用品': { colors: PALETTES.beauty, comp: PhHandSoap },
  '香水': { colors: PALETTES.beauty, comp: PhFlowerLotus },
  '母婴玩具': { colors: PALETTES.beauty, comp: PhBaby },

  // 食品
  '食品生鲜': { colors: PALETTES.food, comp: PhForkKnife },
  '食品饮料': { colors: PALETTES.food, comp: PhForkKnife },
  '零食坚果': { colors: PALETTES.food, comp: PhCookie },
  '茶饮冲调': { colors: PALETTES.food, comp: PhCoffee },
  '生鲜水果': { colors: PALETTES.food, comp: PhOrangeSlice },
  '粮油调味': { colors: PALETTES.food, comp: PhBowlFood },

  // 家电家居
  '家用电器': { colors: PALETTES.appliance, comp: PhTelevision },
  '空调': { colors: PALETTES.appliance, comp: PhFan },
  '冰箱': { colors: PALETTES.appliance, comp: PhSnowflake },
  '洗衣机': { colors: PALETTES.appliance, comp: PhWashingMachine },
  '厨房电器': { colors: PALETTES.appliance, comp: PhCookingPot },
  '清洁电器': { colors: PALETTES.appliance, comp: PhBroom },
  '家居生活': { colors: PALETTES.appliance, comp: PhArmchair },

  // 运动户外
  '运动户外': { colors: PALETTES.sports, comp: PhBarbell },
  '运动服饰': { colors: PALETTES.sports, comp: PhPersonSimpleRun },
  '健身器材': { colors: PALETTES.sports, comp: PhBarbell },
  '户外装备': { colors: PALETTES.sports, comp: PhTent },
  '骑行运动': { colors: PALETTES.sports, comp: PhBicycle },
}

/** 未命中任何分类时的兜底：中性色 + 九宫格 */
const FALLBACK: CatIconDef = { colors: ['#8b8b93', '#a8a8b0'], comp: PhSquaresFour }

export function useCategoryIcon() {
  /**
   * 取分类图标定义。先按自身名精确命中；未命中则回退到父分类名；
   * 再不命中用中性兜底，保证新增分类不会渲染成空白。
   */
  function getIconDef(categoryName: string, parentName?: string): CatIconDef {
    return ICONS[categoryName] ?? (parentName ? ICONS[parentName] : undefined) ?? FALLBACK
  }

  return { getIconDef }
}
