/**
 * [L3] 导出面板
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * 
 * 支持单张导出和批量导出所有画布
 */
import { useState } from 'react'
import { useCanvasStore } from '../../stores/canvasStore'
import { Button, Input, Slider } from '../ui'
import { useToast } from '../ui/Toast'
import { getExportPresetList } from '../../utils/presets'
import { exportCanvas, downloadImage } from '../../utils/exportUtils'

export default function ExportPanel({ className = '' }) {
  const { canvases, activeCanvasIndex, exportSettings, updateExportSettings } = useCanvasStore()
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const toast = useToast()
  const presets = getExportPresetList()
  
  const currentCanvas = canvases[activeCanvasIndex]
  const hasScreenshot = !!currentCanvas?.screenshot
  const canvasCount = canvases.filter(c => c.screenshot).length

  const handlePresetChange = (e) => {
    const presetId = e.target.value
    const preset = presets.find(p => p.id === presetId)
    if (preset && preset.id !== 'custom') {
      updateExportSettings({
        preset: presetId,
        width: preset.width,
        height: preset.height,
      })
    } else {
      updateExportSettings({ preset: 'custom' })
    }
  }

  // 导出单张
  const handleExportSingle = async () => {
    if (!hasScreenshot) {
      toast.error('当前画布没有截图')
      return
    }

    setIsExporting(true)
    try {
      const dataUrl = await exportCanvas({
        width: currentCanvas.canvasSize.width,
        height: currentCanvas.canvasSize.height,
        format: exportSettings.format,
        quality: exportSettings.quality,
      })

      const filename = `screenshot_${activeCanvasIndex + 1}.${exportSettings.format}`
      downloadImage(dataUrl, filename)
      toast.success('导出成功')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('导出失败，请重试')
    } finally {
      setIsExporting(false)
    }
  }

  // 批量导出所有画布
  const handleExportAll = async () => {
    if (canvasCount === 0) {
      toast.error('没有可导出的画布')
      return
    }

    setIsExporting(true)
    setExportProgress(0)
    
    try {
      const originalIndex = activeCanvasIndex
      
      for (let i = 0; i < canvases.length; i++) {
        const canvas = canvases[i]
        if (!canvas.screenshot) continue
        
        // 切换到目标画布
        useCanvasStore.getState().setActiveCanvas(i)
        
        // 等待渲染
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // 导出
        const dataUrl = await exportCanvas({
          width: canvas.canvasSize.width,
          height: canvas.canvasSize.height,
          format: exportSettings.format,
          quality: exportSettings.quality,
        })

        const filename = `screenshot_${i + 1}.${exportSettings.format}`
        downloadImage(dataUrl, filename)
        
        setExportProgress(((i + 1) / canvasCount) * 100)
      }
      
      // 恢复原来的画布
      useCanvasStore.getState().setActiveCanvas(originalIndex)
      
      toast.success(`成功导出 ${canvasCount} 张图片`)
    } catch (error) {
      console.error('Batch export error:', error)
      toast.error('批量导出失败，请重试')
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  return (
    <div className={`p-4 space-y-4 ${className}`}>
      {/* 导出格式 */}
      <div>
        <label className="text-sm font-medium text-surface-700 mb-2 block">
          导出格式
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => updateExportSettings({ format: 'png' })}
            className={`
              flex-1 py-2 px-3 text-sm rounded-lg border transition-colors
              ${exportSettings.format === 'png'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-surface-200 hover:border-surface-300'
              }
            `}
          >
            PNG
          </button>
          <button
            onClick={() => updateExportSettings({ format: 'jpg' })}
            className={`
              flex-1 py-2 px-3 text-sm rounded-lg border transition-colors
              ${exportSettings.format === 'jpg'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-surface-200 hover:border-surface-300'
              }
            `}
          >
            JPG
          </button>
        </div>
      </div>

      {/* JPG 质量 */}
      {exportSettings.format === 'jpg' && (
        <Slider
          label="图片质量"
          value={Math.round(exportSettings.quality * 100)}
          min={10}
          max={100}
          step={5}
          unit="%"
          onChange={(e) => updateExportSettings({ quality: parseInt(e.target.value, 10) / 100 })}
        />
      )}

      {/* 画布信息 */}
      <div className="p-3 bg-surface-50 rounded-lg space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-surface-500">当前画布尺寸</span>
          <span className="font-medium">{currentCanvas?.canvasSize.width} × {currentCanvas?.canvasSize.height}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-surface-500">可导出画布</span>
          <span className="font-medium">{canvasCount} 张</span>
        </div>
      </div>

      {/* 导出进度 */}
      {isExporting && exportProgress > 0 && (
        <div className="space-y-1">
          <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
          <p className="text-xs text-surface-500 text-center">
            导出中... {Math.round(exportProgress)}%
          </p>
        </div>
      )}

      {/* 导出按钮 */}
      <div className="space-y-2">
        <Button
          className="w-full"
          onClick={handleExportSingle}
          disabled={isExporting || !hasScreenshot}
        >
          {isExporting ? '导出中...' : '导出当前画布'}
        </Button>
        
        {canvasCount > 1 && (
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleExportAll}
            disabled={isExporting}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            导出全部 ({canvasCount} 张)
          </Button>
        )}
      </div>

      {!hasScreenshot && (
        <p className="text-xs text-surface-500 text-center">
          当前画布没有截图
        </p>
      )}
    </div>
  )
}
