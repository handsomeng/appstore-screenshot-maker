/**
 * 预设背景方案
 */
export const BACKGROUND_PRESETS = [
  // 纯色
  { name: '纯白', type: 'solid', color: '#ffffff' },
  { name: '纯黑', type: 'solid', color: '#000000' },
  { name: '深灰', type: 'solid', color: '#1f2937' },
  { name: '薄荷绿', type: 'solid', color: '#10b981' },
  { name: '天空蓝', type: 'solid', color: '#3b82f6' },
  
  // 渐变
  { name: '深空蓝', type: 'gradient', colors: ['#0f0c29', '#302b63', '#24243e'], angle: 180 },
  { name: '日落橙', type: 'gradient', colors: ['#ff6b6b', '#feca57'], angle: 135 },
  { name: '极光绿', type: 'gradient', colors: ['#11998e', '#38ef7d'], angle: 135 },
  { name: '紫罗兰', type: 'gradient', colors: ['#667eea', '#764ba2'], angle: 135 },
  { name: '蜜桃粉', type: 'gradient', colors: ['#ffecd2', '#fcb69f'], angle: 135 },
  { name: '海洋蓝', type: 'gradient', colors: ['#2193b0', '#6dd5ed'], angle: 180 },
  { name: '火焰红', type: 'gradient', colors: ['#f12711', '#f5af19'], angle: 135 },
  { name: '森林绿', type: 'gradient', colors: ['#134e5e', '#71b280'], angle: 180 },
  { name: '星空紫', type: 'gradient', colors: ['#4776e6', '#8e54e9'], angle: 135 },
  { name: '晨曦金', type: 'gradient', colors: ['#f093fb', '#f5576c'], angle: 135 },
]

/**
 * 导出尺寸预设
 */
export const EXPORT_PRESETS = {
  'iphone-6.7': { 
    name: 'iPhone 6.7"', 
    width: 1290, 
    height: 2796,
    description: 'iPhone 15 Pro Max, 14 Pro Max'
  },
  'iphone-6.5': { 
    name: 'iPhone 6.5"', 
    width: 1284, 
    height: 2778,
    description: 'iPhone 15 Plus, 14 Plus'
  },
  'iphone-5.5': { 
    name: 'iPhone 5.5"', 
    width: 1242, 
    height: 2208,
    description: 'iPhone 8 Plus, 7 Plus'
  },
  'ipad-12.9': { 
    name: 'iPad 12.9"', 
    width: 2048, 
    height: 2732,
    description: 'iPad Pro 12.9"'
  },
  'ipad-11': { 
    name: 'iPad 11"', 
    width: 1668, 
    height: 2388,
    description: 'iPad Pro 11", iPad Air'
  },
  'custom': { 
    name: '自定义尺寸', 
    width: 0, 
    height: 0,
    description: '自定义宽高'
  },
}

/**
 * 获取导出预设列表
 */
export function getExportPresetList() {
  return Object.entries(EXPORT_PRESETS).map(([id, preset]) => ({
    id,
    ...preset,
  }))
}

/**
 * 预设模板
 */
export const LAYOUT_TEMPLATES = [
  {
    id: 'simple',
    name: '简约风格',
    description: '纯色背景 + 居中文字',
    config: {
      background: { type: 'solid', color: '#ffffff' },
      textLayers: [
        { text: '应用名称', position: { x: 0.5, y: 0.15 }, fontSize: 48, color: '#000000', align: 'center' },
        { text: '一句话介绍', position: { x: 0.5, y: 0.22 }, fontSize: 24, color: '#666666', align: 'center' },
      ],
    },
  },
  {
    id: 'gradient',
    name: '渐变风格',
    description: '渐变背景 + 白色文字',
    config: {
      background: { type: 'gradient', gradient: { colors: ['#667eea', '#764ba2'], angle: 135 } },
      textLayers: [
        { text: '应用名称', position: { x: 0.5, y: 0.15 }, fontSize: 48, color: '#ffffff', align: 'center' },
        { text: '一句话介绍', position: { x: 0.5, y: 0.22 }, fontSize: 24, color: 'rgba(255,255,255,0.8)', align: 'center' },
      ],
    },
  },
  {
    id: 'dark',
    name: '深色风格',
    description: '深色背景 + 亮色文字',
    config: {
      background: { type: 'solid', color: '#1f2937' },
      textLayers: [
        { text: '应用名称', position: { x: 0.5, y: 0.15 }, fontSize: 48, color: '#ffffff', align: 'center' },
        { text: '一句话介绍', position: { x: 0.5, y: 0.22 }, fontSize: 24, color: '#9ca3af', align: 'center' },
      ],
    },
  },
  {
    id: 'minimal',
    name: '极简风格',
    description: '无文字，纯截图展示',
    config: {
      background: { type: 'solid', color: '#f5f5f7' },
      textLayers: [],
    },
  },
  {
    id: 'feature',
    name: '功能展示',
    description: '突出功能特点',
    config: {
      background: { type: 'gradient', gradient: { colors: ['#11998e', '#38ef7d'], angle: 180 } },
      textLayers: [
        { text: '核心功能', position: { x: 0.5, y: 0.12 }, fontSize: 36, color: '#ffffff', align: 'center' },
        { text: '功能描述文字', position: { x: 0.5, y: 0.18 }, fontSize: 20, color: 'rgba(255,255,255,0.9)', align: 'center' },
      ],
    },
  },
]
