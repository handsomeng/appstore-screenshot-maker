/**
 * 验证文件格式是否为支持的图片格式
 * @param {string} filename - 文件名
 * @returns {boolean} - 是否为有效格式
 */
export function validateFileFormat(filename) {
  if (!filename || typeof filename !== 'string') {
    return false
  }
  
  const validExtensions = ['png', 'jpg', 'jpeg']
  const ext = filename.split('.').pop()?.toLowerCase()
  
  return validExtensions.includes(ext)
}

/**
 * 验证文件大小是否在限制范围内
 * @param {File} file - 文件对象
 * @param {number} maxSizeMB - 最大文件大小（MB）
 * @returns {boolean} - 是否在限制范围内
 */
export function validateFileSize(file, maxSizeMB = 10) {
  if (!file || !file.size) {
    return false
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

/**
 * 计算图片在画布上的位置（中央偏下）
 * @param {number} canvasWidth - 画布宽度
 * @param {number} canvasHeight - 画布高度
 * @returns {{ x: number, y: number }} - 相对位置（0-1）
 */
export function calculateCenterBottomPosition() {
  return {
    x: 0.5,  // 水平居中
    y: 0.65, // 垂直偏下（50%-80% 范围内）
  }
}

/**
 * 验证位置是否在中央偏下区域
 * @param {{ x: number, y: number }} position - 相对位置
 * @returns {boolean} - 是否在有效区域
 */
export function isValidCenterBottomPosition(position) {
  const { x, y } = position
  
  // 水平方向：40%-60%
  const isHorizontalValid = x >= 0.4 && x <= 0.6
  
  // 垂直方向：50%-80%
  const isVerticalValid = y >= 0.5 && y <= 0.8
  
  return isHorizontalValid && isVerticalValid
}
