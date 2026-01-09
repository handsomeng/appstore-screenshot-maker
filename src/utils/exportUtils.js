import { saveAs } from 'file-saver'

/**
 * 导出画布为图片
 * @param {object} options - 导出选项
 * @param {number} options.width - 导出宽度
 * @param {number} options.height - 导出高度
 * @param {string} options.format - 导出格式 ('png' | 'jpg')
 * @param {number} options.quality - JPG 质量 (0-1)
 * @returns {Promise<string>} - 图片的 data URL
 */
export async function exportCanvas({ width, height, format = 'png', quality = 0.9 }) {
  const stage = window.konvaStage
  if (!stage) {
    throw new Error('Canvas not initialized')
  }

  // 获取当前尺寸
  const originalWidth = stage.width()
  const originalHeight = stage.height()

  // 临时调整 stage 尺寸到目标尺寸
  stage.width(width)
  stage.height(height)
  
  // 缩放所有内容
  const scaleX = width / originalWidth
  const scaleY = height / originalHeight
  stage.scale({ x: scaleX, y: scaleY })

  // 导出
  const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png'
  const dataUrl = stage.toDataURL({
    mimeType,
    quality: format === 'jpg' ? quality : 1,
    pixelRatio: 1, // 使用 1:1 像素比，因为我们已经调整了尺寸
  })

  // 恢复原始尺寸
  stage.width(originalWidth)
  stage.height(originalHeight)
  stage.scale({ x: 1, y: 1 })

  return dataUrl
}

/**
 * 下载图片
 * @param {string} dataUrl - 图片的 data URL
 * @param {string} filename - 文件名
 */
export function downloadImage(dataUrl, filename) {
  // 将 data URL 转换为 Blob
  const arr = dataUrl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  const blob = new Blob([u8arr], { type: mime })

  // 使用 FileSaver 下载
  saveAs(blob, filename)
}

/**
 * 批量导出多个画布
 * @param {Array} canvasStates - 画布状态数组
 * @param {object} exportSettings - 导出设置
 * @returns {Promise<Array<{ filename: string, dataUrl: string }>>}
 */
export async function batchExport(canvasStates, exportSettings) {
  const results = []

  for (let i = 0; i < canvasStates.length; i++) {
    // 这里需要实现切换画布状态的逻辑
    // 暂时简化处理
    const dataUrl = await exportCanvas(exportSettings)
    results.push({
      filename: `screenshot_${i + 1}.${exportSettings.format}`,
      dataUrl,
    })
  }

  return results
}

/**
 * 验证导出尺寸是否有效
 * @param {number} width - 宽度
 * @param {number} height - 高度
 * @returns {boolean}
 */
export function isValidExportSize(width, height) {
  const MIN_SIZE = 100
  const MAX_SIZE = 4096

  return (
    typeof width === 'number' &&
    typeof height === 'number' &&
    width >= MIN_SIZE &&
    width <= MAX_SIZE &&
    height >= MIN_SIZE &&
    height <= MAX_SIZE
  )
}

/**
 * 获取导出图片的预估文件大小
 * @param {number} width - 宽度
 * @param {number} height - 高度
 * @param {string} format - 格式
 * @param {number} quality - 质量
 * @returns {string} - 预估大小字符串
 */
export function estimateFileSize(width, height, format, quality = 0.9) {
  // 粗略估算
  const pixels = width * height
  let bytesPerPixel

  if (format === 'png') {
    bytesPerPixel = 3 // PNG 压缩后大约 3 bytes/pixel
  } else {
    bytesPerPixel = 0.5 + (1.5 * quality) // JPG 根据质量变化
  }

  const bytes = pixels * bytesPerPixel
  
  if (bytes < 1024) {
    return `${bytes.toFixed(0)} B`
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
}
