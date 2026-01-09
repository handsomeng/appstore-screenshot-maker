/**
 * 设备框架配置
 * screenArea: 屏幕区域相对于框架的位置和尺寸（百分比）
 */
export const DEVICE_FRAMES = {
  'none': {
    id: 'none',
    name: '无框架',
    aspectRatio: 9 / 19.5,
    screenArea: { x: 0, y: 0, width: 1, height: 1 },
  },
  'iphone-15-pro': {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    aspectRatio: 393 / 852,
    screenArea: { x: 0.03, y: 0.02, width: 0.94, height: 0.96 },
    color: '#1a1a1a',
    borderRadius: 0.12,
  },
  'iphone-15': {
    id: 'iphone-15',
    name: 'iPhone 15',
    aspectRatio: 390 / 844,
    screenArea: { x: 0.03, y: 0.02, width: 0.94, height: 0.96 },
    color: '#f5f5f7',
    borderRadius: 0.12,
  },
  'iphone-se': {
    id: 'iphone-se',
    name: 'iPhone SE',
    aspectRatio: 375 / 667,
    screenArea: { x: 0.04, y: 0.1, width: 0.92, height: 0.8 },
    color: '#1a1a1a',
    borderRadius: 0.08,
  },
  'ipad-pro-12.9': {
    id: 'ipad-pro-12.9',
    name: 'iPad Pro 12.9"',
    aspectRatio: 2048 / 2732,
    screenArea: { x: 0.02, y: 0.02, width: 0.96, height: 0.96 },
    color: '#1a1a1a',
    borderRadius: 0.04,
  },
  'ipad-pro-11': {
    id: 'ipad-pro-11',
    name: 'iPad Pro 11"',
    aspectRatio: 1668 / 2388,
    screenArea: { x: 0.02, y: 0.02, width: 0.96, height: 0.96 },
    color: '#1a1a1a',
    borderRadius: 0.04,
  },
}

/**
 * 获取设备列表
 */
export function getDeviceList() {
  return Object.values(DEVICE_FRAMES)
}

/**
 * 根据 ID 获取设备配置
 */
export function getDeviceById(id) {
  return DEVICE_FRAMES[id] || DEVICE_FRAMES['none']
}

/**
 * 计算截图在设备框架内的适配尺寸
 * @param {number} imageWidth - 原始图片宽度
 * @param {number} imageHeight - 原始图片高度
 * @param {object} screenArea - 屏幕区域配置
 * @param {number} frameWidth - 框架宽度
 * @param {number} frameHeight - 框架高度
 * @returns {{ scale: number, x: number, y: number }}
 */
export function calculateImageFit(imageWidth, imageHeight, screenArea, frameWidth, frameHeight) {
  const screenWidth = frameWidth * screenArea.width
  const screenHeight = frameHeight * screenArea.height
  
  // 计算缩放比例，保持宽高比
  const scaleX = screenWidth / imageWidth
  const scaleY = screenHeight / imageHeight
  const scale = Math.min(scaleX, scaleY)
  
  // 计算居中位置
  const scaledWidth = imageWidth * scale
  const scaledHeight = imageHeight * scale
  const x = frameWidth * screenArea.x + (screenWidth - scaledWidth) / 2
  const y = frameHeight * screenArea.y + (screenHeight - scaledHeight) / 2
  
  return { scale, x, y }
}
