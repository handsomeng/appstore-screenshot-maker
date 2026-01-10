/**
 * [L3] 图片上传组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * 
 * 支持多画布模式：上传截图时创建新画布或添加到当前画布
 */
import { useCallback, useRef } from 'react'
import { useCanvasStore } from '../../stores/canvasStore'
import { useToast } from '../ui/Toast'
import { validateFileFormat, validateFileSize } from '../../utils/fileValidation'

export default function ImageUploader({ className = '' }) {
  const inputRef = useRef(null)
  const { canvases, activeCanvasIndex, addCanvas, setScreenshot } = useCanvasStore()
  const toast = useToast()
  
  const currentCanvas = canvases[activeCanvasIndex]
  const hasScreenshot = !!currentCanvas?.screenshot
  const canAddCanvas = canvases.length < 6

  const handleFiles = useCallback((files) => {
    Array.from(files).forEach((file, index) => {
      // 验证文件格式
      if (!validateFileFormat(file.name)) {
        toast.error('仅支持 PNG、JPG、JPEG 格式')
        return
      }

      // 验证文件大小
      if (!validateFileSize(file, 10)) {
        toast.error('文件大小不能超过 10MB')
        return
      }

      // 读取文件
      const reader = new FileReader()
      reader.onload = (e) => {
        const screenshot = {
          imageData: e.target.result,
          position: { x: 0.5, y: 0.65 },
          scale: 1,
        }
        
        // 如果当前画布没有截图，添加到当前画布
        // 否则创建新画布
        if (!hasScreenshot && index === 0) {
          setScreenshot(screenshot)
          toast.success('截图已添加到当前画布')
        } else if (canAddCanvas) {
          const result = addCanvas(screenshot)
          if (result.success) {
            toast.success(`已创建画布 ${result.index + 1}`)
          } else {
            toast.error('已达到最大画布数量 (6)')
          }
        } else {
          toast.error('已达到最大画布数量 (6)')
        }
      }
      reader.onerror = () => {
        toast.error('文件读取失败，请重试')
      }
      reader.readAsDataURL(file)
    })
  }, [hasScreenshot, canAddCanvas, setScreenshot, addCanvas, toast])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer?.files
    if (files?.length) {
      handleFiles(files)
    }
  }, [handleFiles])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleInputChange = (e) => {
    const files = e.target.files
    if (files?.length) {
      handleFiles(files)
    }
    e.target.value = ''
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg"
        multiple
        onChange={handleInputChange}
        className="hidden"
      />
      
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="
          border-2 border-dashed border-surface-300 rounded-lg p-6
          flex flex-col items-center justify-center gap-3
          cursor-pointer transition-colors
          hover:border-primary-500 hover:bg-primary-50/50
        "
      >
        <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-surface-700">点击或拖拽上传截图</p>
          <p className="text-xs text-surface-500 mt-1">
            {hasScreenshot 
              ? '上传新截图将创建新画布' 
              : '上传截图到当前画布'
            }
          </p>
          <p className="text-xs text-surface-400 mt-1">
            画布 {canvases.length}/6 · 支持 PNG、JPG
          </p>
        </div>
      </div>
    </div>
  )
}
