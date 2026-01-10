import { useState } from 'react'
import { useCanvasStore } from '../../stores/canvasStore'

const CANVAS_PRESETS = [
  { id: 'iphone-6.7', name: 'iPhone 6.7"', width: 430, height: 932 },
  { id: 'iphone-6.5', name: 'iPhone 6.5"', width: 428, height: 926 },
  { id: 'iphone-5.5', name: 'iPhone 5.5"', width: 414, height: 736 },
  { id: 'ipad-12.9', name: 'iPad 12.9"', width: 512, height: 683 },
  { id: 'ipad-11', name: 'iPad 11"', width: 417, height: 597 },
]

export default function CanvasSizeSelector({ className = '' }) {
  const { canvases, activeCanvasIndex, updateCanvas } = useCanvasStore()
  const currentCanvas = canvases[activeCanvasIndex]
  const canvasSize = currentCanvas?.canvasSize || { width: 430, height: 932 }
  
  const [showCustom, setShowCustom] = useState(false)
  const [customW, setCustomW] = useState(canvasSize.width)
  const [customH, setCustomH] = useState(canvasSize.height)

  const setCanvasSize = (size) => {
    updateCanvas(activeCanvasIndex, { canvasSize: size })
  }

  const handlePresetClick = (preset) => {
    setCanvasSize({ width: preset.width, height: preset.height })
    setShowCustom(false)
  }

  const handleCustomApply = () => {
    const w = Math.max(100, Math.min(1000, customW))
    const h = Math.max(100, Math.min(2000, customH))
    setCanvasSize({ width: w, height: h })
  }

  // 判断当前是否匹配某个预设
  const currentPresetId = CANVAS_PRESETS.find(
    p => p.width === canvasSize.width && p.height === canvasSize.height
  )?.id

  return (
    <div className={`space-y-1 ${className}`}>
      {/* 预设列表 - 紧凑显示 */}
      <div className="space-y-0.5">
        {CANVAS_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePresetClick(preset)}
            className={`
              w-full px-2 py-1 text-xs text-left rounded transition-colors
              flex justify-between items-center
              ${currentPresetId === preset.id 
                ? 'bg-primary-100 text-primary-700' 
                : 'hover:bg-surface-100 text-surface-600'
              }
            `}
          >
            <span>{preset.name}</span>
            <span className="text-surface-400 font-mono">{preset.width}×{preset.height}</span>
          </button>
        ))}
        
        {/* 自定义选项 */}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`
            w-full px-2 py-1 text-xs text-left rounded transition-colors
            flex justify-between items-center
            ${showCustom || !currentPresetId
              ? 'bg-primary-100 text-primary-700' 
              : 'hover:bg-surface-100 text-surface-600'
            }
          `}
        >
          <span>自定义</span>
          <span className="text-surface-400">{showCustom ? '▼' : '▶'}</span>
        </button>
      </div>

      {/* 自定义输入 */}
      {showCustom && (
        <div className="flex gap-1 items-center pt-1">
          <input
            type="number"
            value={customW}
            onChange={(e) => setCustomW(parseInt(e.target.value) || 100)}
            className="w-16 px-1.5 py-0.5 text-xs border border-surface-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
            min={100}
            max={1000}
          />
          <span className="text-surface-400 text-xs">×</span>
          <input
            type="number"
            value={customH}
            onChange={(e) => setCustomH(parseInt(e.target.value) || 100)}
            className="w-16 px-1.5 py-0.5 text-xs border border-surface-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
            min={100}
            max={2000}
          />
          <button
            onClick={handleCustomApply}
            className="px-2 py-0.5 text-xs bg-primary-500 text-white rounded hover:bg-primary-600"
          >
            应用
          </button>
        </div>
      )}

      {/* 当前尺寸（如果不匹配任何预设） */}
      {!currentPresetId && !showCustom && (
        <div className="text-xs text-surface-400 px-2">
          当前: {canvasSize.width}×{canvasSize.height}
        </div>
      )}
    </div>
  )
}
