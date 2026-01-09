import { useCallback, useRef } from 'react'
import { useCanvasStore } from '../../stores/canvasStore'
import { useToast } from '../ui/Toast'
import { validateFileFormat, validateFileSize } from '../../utils/fileValidation'

export default function ImageUploader({ className = '' }) {
  const inputRef = useRef(null)
  const { addScreenshot } = useCanvasStore()
  const toast = useToast()

  const handleFiles = useCallback((files) => {
    Array.from(files).forEach((file) => {
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
        addScreenshot({
          imageData: e.target.result,
          position: { x: 0.5, y: 0.65 }, // 中央偏下
          scale: 1,
        })
        toast.success('截图上传成功')
      }
      reader.onerror = () => {
        toast.error('文件读取失败，请重试')
      }
      reader.readAsDataURL(file)
    })
  }, [addScreenshot, toast])

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
    // 重置 input 以便可以重复上传同一文件
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
          <p className="text-xs text-surface-500 mt-1">支持 PNG、JPG、JPEG，最大 10MB</p>
        </div>
      </div>
    </div>
  )
}
