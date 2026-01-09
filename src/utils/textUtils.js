/**
 * 字体大小范围限制
 */
export const FONT_SIZE_MIN = 12
export const FONT_SIZE_MAX = 120

/**
 * 限制字体大小在有效范围内
 * @param {number} size - 输入的字体大小
 * @returns {number} - 限制后的字体大小
 */
export function clampFontSize(size) {
  if (typeof size !== 'number' || isNaN(size)) {
    return FONT_SIZE_MIN
  }
  
  if (size < FONT_SIZE_MIN) {
    return FONT_SIZE_MIN
  }
  
  if (size > FONT_SIZE_MAX) {
    return FONT_SIZE_MAX
  }
  
  return size
}

/**
 * 生成唯一的文字图层 ID
 * @returns {string}
 */
export function generateTextLayerId() {
  return `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 验证文字图层数据
 * @param {object} layer - 文字图层对象
 * @returns {boolean}
 */
export function isValidTextLayer(layer) {
  return (
    layer &&
    typeof layer.id === 'string' &&
    typeof layer.text === 'string' &&
    typeof layer.fontSize === 'number' &&
    typeof layer.color === 'string' &&
    layer.position &&
    typeof layer.position.x === 'number' &&
    typeof layer.position.y === 'number'
  )
}
