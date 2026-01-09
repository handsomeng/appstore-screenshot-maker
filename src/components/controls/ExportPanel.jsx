import { useState } from 'react'
import { useCanvasStore } from '../../stores/canvasStore'
import { Button, Input, Slider, Modal } from '../ui'
import { useToast } from '../ui/Toast'
import { getExportPresetList } from '../../utils/presets'
import { exportCanvas, downloadImage } from '../../utils/exportUtils'

export default function ExportPanel({ className = '' }) {
  const { exportSettings, updateExportSettings, screenshots } = useCanvasStore()
  const [isExporting, setIsExporting] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const toast = useToast()
  const presets = getExportPresetList()

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

  const handleExport = async () => {
    if (screenshots.length === 0) {
      toast.error('请先添加截图')
      return
    }

    setIsExporting(true)
    try {
      const dataUrl = await exportCanvas({
        width: exportSettings.width,
        height: exportSettings.height,
        format: exportSettings.format,
        quality: exportSettings.quality,
      })

      const filename = `screenshot_${Date.now()}.${exportSettings.format}`
      downloadImage(dataUrl, filename)
      toast.success('导出成功')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('导出失败，请重试')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className={`p-4 space-y-4 ${className}`}>
      {/* 尺寸预设 */}
      <div>
        <label className="text-sm font-medium text-surface-700 mb-1.5 block">
          导出尺寸
        </label>
        <select
          value={exportSettings.preset}
          onChange={handlePresetChange}
          className="
            w-full px-3 py-2 text-sm
            bg-white border border-surface-200 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-primary-500
          "
        >
          {presets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name} {preset.width > 0 && `(${preset.width}×${preset.height})`}
            </option>
          ))}
        </select>
        {exportSettings.preset !== 'custom' && (
          <p className="text-xs text-surface-500 mt-1">
            {presets.find(p => p.id === exportSettings.preset)?.description}
          </p>
        )}
      </div>

      {/* 自定义尺寸 */}
      {exportSettings.preset === 'custom' && (
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="宽度"
            type="number"
            value={exportSettings.width}
            min={100}
            max={4096}
            onChange={(e) => updateExportSettings({ width: parseInt(e.target.value, 10) || 0 })}
          />
          <Input
            label="高度"
            type="number"
            value={exportSettings.height}
            min={100}
            max={4096}
            onChange={(e) => updateExportSettings({ height: parseInt(e.target.value, 10) || 0 })}
          />
        </div>
      )}

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

      {/* 当前尺寸预览 */}
      <div className="p-3 bg-surface-50 rounded-lg">
        <p className="text-xs text-surface-500">导出尺寸</p>
        <p className="text-lg font-semibold text-surface-900">
          {exportSettings.width} × {exportSettings.height}
        </p>
      </div>

      {/* 导出按钮 */}
      <Button
        className="w-full"
        onClick={handleExport}
        disabled={isExporting || screenshots.length === 0}
      >
        {isExporting ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            导出中...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            导出图片
          </>
        )}
      </Button>

      {screenshots.length === 0 && (
        <p className="text-xs text-surface-500 text-center">
          请先上传截图后再导出
        </p>
      )}
    </div>
  )
}
