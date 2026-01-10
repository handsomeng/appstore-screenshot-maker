/**
 * [L3] 同步管理器
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * 
 * 核心职责：
 * - 判断是否触发同步确认
 * - 生成占位符文字
 * - 同步逻辑辅助函数
 */

/**
 * 判断是否应该触发同步确认
 * @param {number} canvasIndex - 当前画布索引
 * @param {boolean} batchMode - 是否开启批量模式
 * @param {string|null} rememberChoice - 记住的选择
 * @returns {{ shouldSync: boolean, autoSync: boolean, showConfirm: boolean }}
 */
export function shouldTriggerSync(canvasIndex, batchMode, rememberChoice) {
  // Slave 画布不触发同步
  if (canvasIndex !== 0) {
    return { shouldSync: false, autoSync: false, showConfirm: false }
  }
  
  // 批量模式：自动同步，不显示确认
  if (batchMode) {
    return { shouldSync: true, autoSync: true, showConfirm: false }
  }
  
  // 有记住的选择：按选择执行，不显示确认
  if (rememberChoice === 'sync') {
    return { shouldSync: true, autoSync: true, showConfirm: false }
  }
  if (rememberChoice === 'no-sync') {
    return { shouldSync: false, autoSync: false, showConfirm: false }
  }
  
  // 默认：显示确认弹窗
  return { shouldSync: false, autoSync: false, showConfirm: true }
}

/**
 * 生成占位符文字，保持与原文相同的字符数
 * @param {string} originalText - 原始文字
 * @param {string} placeholder - 占位符字符，默认 "哈"
 * @returns {string} 占位符文字
 */
export function generatePlaceholderText(originalText, placeholder = '哈') {
  if (!originalText) return ''
  const charCount = originalText.length
  return placeholder.repeat(charCount)
}

/**
 * 将绝对位置转换为相对位置 (0-1)
 * @param {number} absolute - 绝对像素值
 * @param {number} canvasSize - 画布尺寸
 * @returns {number} 相对位置 (0-1)
 */
export function toRelativePosition(absolute, canvasSize) {
  if (canvasSize <= 0) return 0
  return Math.max(0, Math.min(1, absolute / canvasSize))
}

/**
 * 将相对位置转换为绝对位置
 * @param {number} relative - 相对位置 (0-1)
 * @param {number} canvasSize - 画布尺寸
 * @returns {number} 绝对像素值
 */
export function toAbsolutePosition(relative, canvasSize) {
  return relative * canvasSize
}

/**
 * 验证位置值是否在有效范围内
 * @param {{ x: number, y: number }} position - 位置对象
 * @returns {boolean} 是否有效
 */
export function isValidRelativePosition(position) {
  if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
    return false
  }
  return position.x >= 0 && position.x <= 1 && position.y >= 0 && position.y <= 1
}

/**
 * 同步属性类型
 */
export const SyncPropertyType = {
  BACKGROUND: 'background',
  CANVAS_SIZE: 'canvasSize',
  SCREENSHOT_POSITION: 'screenshot.position',
  TEXT_ADD: 'textLayer.add',
  TEXT_STYLE: 'textLayer.style',
  TEXT_CONTENT: 'textLayer.content',
  TEXT_DELETE: 'textLayer.delete',
}

/**
 * 获取同步属性的显示名称
 * @param {string} property - 同步属性类型
 * @returns {string} 显示名称
 */
export function getSyncPropertyLabel(property) {
  const labels = {
    [SyncPropertyType.BACKGROUND]: '背景',
    [SyncPropertyType.CANVAS_SIZE]: '画布尺寸',
    [SyncPropertyType.SCREENSHOT_POSITION]: '截图位置',
    [SyncPropertyType.TEXT_ADD]: '添加文字',
    [SyncPropertyType.TEXT_STYLE]: '文字样式',
    [SyncPropertyType.TEXT_CONTENT]: '文字内容',
    [SyncPropertyType.TEXT_DELETE]: '删除文字',
  }
  return labels[property] || property
}
