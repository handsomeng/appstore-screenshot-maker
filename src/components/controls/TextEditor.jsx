/**
 * [L3] 文字编辑器
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * 
 * 支持多选批量修改样式
 */
import { useCanvasStore } from '../../stores/canvasStore'
import { Slider, ColorPicker, IconButton } from '../ui'
import { clampFontSize } from '../../utils/textUtils'

const FONT_OPTIONS = [
  { value: 'system-ui', label: '系统字体', category: '系统' },
  { value: '"Noto Sans SC"', label: '思源黑体', category: '中文' },
  { value: '"Noto Serif SC"', label: '思源宋体', category: '中文' },
  { value: '"ZCOOL KuaiLe"', label: '站酷快乐体', category: '中文艺术' },
  { value: '"ZCOOL QingKe HuangYou"', label: '站酷庆科黄油体', category: '中文艺术' },
  { value: '"Ma Shan Zheng"', label: '马善政楷体', category: '中文艺术' },
  { value: 'Poppins', label: 'Poppins', category: '英文' },
  { value: 'Montserrat', label: 'Montserrat', category: '英文' },
  { value: '"Playfair Display"', label: 'Playfair Display', category: '英文' },
]

const ALIGN_OPTIONS = [
  { value: 'left', icon: 'M4 6h16M4 12h10M4 18h16' },
  { value: 'center', icon: 'M4 6h16M7 12h10M4 18h16' },
  { value: 'right', icon: 'M4 6h16M10 12h10M4 18h16' },
]

export default function TextEditor({ className = '' }) {
  const { 
    canvases,
    activeCanvasIndex,
    activeTextLayerId, 
    selectedTextLayerIds,
    updateTextLayer, 
    removeTextLayer,
    toggleTextLayerSelection,
    updateCanvas,
    syncSettings,
    syncToSlaves,
  } = useCanvasStore()

  const currentCanvas = canvases[activeCanvasIndex]
  const textLayers = currentCanvas?.textLayers || []
  const isMaster = activeCanvasIndex === 0
  
  // 获取当前画布中被选中的文字图层
  const currentCanvasTextIds = textLayers.map(t => t.id)
  const selectedInCurrentCanvas = selectedTextLayerIds.filter(id => currentCanvasTextIds.includes(id))
  const selectedLayers = textLayers.filter(t => selectedInCurrentCanvas.includes(t.id))
  
  // 获取活动图层（优先用 activeTextLayerId，否则用选中的第一个）
  const activeLayer = textLayers.find(t => t.id === activeTextLayerId) || selectedLayers[0]
  const hasSelection = selectedLayers.length > 0 || activeLayer

  // 批量更新选中的文字图层，并同步到其他画布
  const updateSelectedLayers = (updates) => {
    const idsToUpdate = selectedInCurrentCanvas.length > 0 
      ? selectedInCurrentCanvas 
      : (activeTextLayerId && currentCanvasTextIds.includes(activeTextLayerId) ? [activeTextLayerId] : [])
    
    if (idsToUpdate.length === 0) return
    
    // 更新当前画布
    const newTextLayers = textLayers.map(t => 
      idsToUpdate.includes(t.id) ? { ...t, ...updates } : t
    )
    updateCanvas(activeCanvasIndex, { textLayers: newTextLayers })
    
    // 如果是 Master 画布，始终同步样式到所有 Slave
    if (isMaster) {
      idsToUpdate.forEach(id => {
        const layerIndex = textLayers.findIndex(t => t.id === id)
        if (layerIndex >= 0) {
          syncToSlaves('textLayer.style', { layerIndex, style: updates })
        }
      })
    }
  }

  const handleFontSizeChange = (e) => {
    const size = clampFontSize(parseInt(e.target.value, 10))
    updateSelectedLayers({ fontSize: size })
  }

  const handlePropertyChange = (property, value) => {
    updateSelectedLayers({ [property]: value })
  }

  const handleDeleteSelected = () => {
    const idsToDelete = selectedInCurrentCanvas.length > 0 
      ? selectedInCurrentCanvas 
      : (activeTextLayerId && currentCanvasTextIds.includes(activeTextLayerId) ? [activeTextLayerId] : [])
    
    const newTextLayers = textLayers.filter(t => !idsToDelete.includes(t.id))
    updateCanvas(activeCanvasIndex, { textLayers: newTextLayers })
  }

  return (
    <div className={`p-4 space-y-4 ${className}`}>
      {/* 图层列表 */}
      <div>
        <label className="text-sm font-medium text-surface-700 mb-2 block">
          文字图层 
          <span className="text-surface-400 font-normal ml-1">(Shift+点击多选)</span>
        </label>
        
        {textLayers.length === 0 ? (
          <p className="text-sm text-surface-500 py-4 text-center bg-surface-50 rounded-lg">
            点击左侧"添加文字"创建文字图层
          </p>
        ) : (
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {textLayers.map((layer, index) => {
              const isActive = activeTextLayerId === layer.id
              const isSelected = selectedInCurrentCanvas.includes(layer.id)
              return (
                <div
                  key={layer.id}
                  onClick={(e) => toggleTextLayerSelection(layer.id, e.shiftKey)}
                  className={`
                    flex items-center gap-2 p-2 rounded-lg cursor-pointer
                    ${isActive 
                      ? 'bg-primary-100 border border-primary-300' 
                      : isSelected
                        ? 'bg-primary-50 border border-primary-200'
                        : 'hover:bg-surface-50 border border-transparent'
                    }
                  `}
                >
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: layer.color }}
                  />
                  <span className="flex-1 text-sm truncate">
                    {layer.text || `文字 ${index + 1}`}
                  </span>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeTextLayer(layer.id)
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </IconButton>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 多选提示 */}
      {selectedInCurrentCanvas.length > 1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm text-blue-700">
          已选中 {selectedInCurrentCanvas.length} 个文字，修改将应用到所有选中项
        </div>
      )}

      {/* 样式编辑 - 有选中时显示 */}
      {hasSelection && activeLayer && (
        <>
          {/* 字体选择 */}
          <div>
            <label className="text-sm font-medium text-surface-700 mb-1.5 block">
              字体
            </label>
            <select
              value={activeLayer.fontFamily}
              onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
              className="
                w-full px-3 py-2 text-sm
                bg-white border border-surface-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary-500
              "
              style={{ fontFamily: activeLayer.fontFamily }}
            >
              {Object.entries(
                FONT_OPTIONS.reduce((acc, font) => {
                  if (!acc[font.category]) acc[font.category] = []
                  acc[font.category].push(font)
                  return acc
                }, {})
              ).map(([category, fonts]) => (
                <optgroup key={category} label={category}>
                  {fonts.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* 字体大小 */}
          <Slider
            label="字体大小"
            value={activeLayer.fontSize}
            min={12}
            max={120}
            step={1}
            unit="px"
            onChange={handleFontSizeChange}
          />

          {/* 文字颜色 */}
          <ColorPicker
            label="文字颜色"
            value={activeLayer.color}
            onChange={(color) => handlePropertyChange('color', color)}
          />

          {/* 对齐方式 */}
          <div>
            <label className="text-sm font-medium text-surface-700 mb-1.5 block">
              对齐方式
            </label>
            <div className="flex gap-1">
              {ALIGN_OPTIONS.map((align) => (
                <IconButton
                  key={align.value}
                  active={activeLayer.align === align.value}
                  onClick={() => handlePropertyChange('align', align.value)}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={align.icon} />
                  </svg>
                </IconButton>
              ))}
            </div>
          </div>

          {/* 删除按钮 */}
          <button
            onClick={handleDeleteSelected}
            className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            删除选中的文字 ({selectedInCurrentCanvas.length || 1})
          </button>
        </>
      )}

      {/* 无选中时的提示 */}
      {!hasSelection && textLayers.length > 0 && (
        <p className="text-sm text-surface-500 text-center py-4">
          点击画布上的文字进行编辑
        </p>
      )}
    </div>
  )
}
