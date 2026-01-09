import { useState } from 'react'
import { useCanvasStore } from '../../stores/canvasStore'
import { Input } from '../ui'

const CANVAS_PRESETS = [
  { id: 'iphone-6.7', name: 'iPhone 6.7"', width: 430, height: 932 },
  { id: 'iphone-6.5', name: 'iPhone 6.5"', width: 428, height: 926 },
  { id: 'iphone-5.5', name: 'iPhone 5.5"', width: 414, height: 736 },
  { id: 'ipad-12.9', name: 'iPad 12.9"', width: 512, height: 683 },
  { id: 'ipad-11', name: 'iPad 11"', width: 417, height: 597 },
  { id: 'square', name: '正方形', width: 500, height: 500 },
  { id: 'custom', name: '自定义', width: 0, height: 0 },
]

export default function CanvasSizeSelector({ className = '' }) {
  const { canvasSize, setCanvasSize } = useCanvasStore()
  const [selectedPreset, setSelectedPreset] = useState('iphone-6.7')
  const [customWidth, setCustomWidth] = useState(canvasSize.width)
  const [customHeight, setCustomHeight] = useState(canvasSize.height)

  const handlePresetChange = (presetId) => {
    setSelectedPreset(presetId)
    const preset = CANVAS_PRESETS.find(p => p.id === presetId)
    if (preset && preset.id !== 'custom') {
      setCanvasSize({ width: preset.width, height: preset.height })
      setCustomWidth(preset.width)
      setCustomHeight(preset.height)
    }
  }

  const handleCustomSizeChange = () => {
    const width = Math.max(100, Math.min(1000, customWidth))
    const height = Math.max(100, Math.min(2000, customHeight))
    setCanvasSize({ width, height })
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <select
        value={selectedPreset}
        onChange={(e) => handlePresetChange(e.target.value)}
        className="
          w-full px-3 py-2 text-sm
          bg-white border border-surface-200 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-primary-500
        "
      >
        {CANVAS_PRESETS.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.name} {preset.width > 0 && `(${preset.width}×${preset.height})`}
          </option>
        ))}
      </select>

      {selectedPreset === 'custom' && (
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-xs text-surface-500 mb-1 block">宽</label>
            <input
              type="number"
              value={customWidth}
              onChange={(e) => setCustomWidth(parseInt(e.target.value) || 100)}
              onBlur={handleCustomSizeChange}
              min={100}
              max={1000}
              className="
                w-full px-2 py-1.5 text-sm
                border border-surface-200 rounded
                focus:outline-none focus:ring-2 focus:ring-primary-500
              "
            />
          </div>
          <span className="text-surface-400 pb-2">×</span>
          <div className="flex-1">
            <label className="text-xs text-surface-500 mb-1 block">高</label>
            <input
              type="number"
              value={customHeight}
              onChange={(e) => setCustomHeight(parseInt(e.target.value) || 100)}
              onBlur={handleCustomSizeChange}
              min={100}
              max={2000}
              className="
                w-full px-2 py-1.5 text-sm
                border border-surface-200 rounded
                focus:outline-none focus:ring-2 focus:ring-primary-500
              "
            />
          </div>
        </div>
      )}

      <div className="text-xs text-surface-500">
        当前: {canvasSize.width} × {canvasSize.height}
      </div>
    </div>
  )
}
