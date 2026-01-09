import { useCanvasStore } from '../../stores/canvasStore'
import { Slider, ColorPicker, Button, IconButton } from '../ui'
import { clampFontSize } from '../../utils/textUtils'

const FONT_OPTIONS = [
  // 系统字体
  { value: 'system-ui', label: '系统字体', category: '系统' },
  
  // 中文字体 - Google Fonts 免费商用
  { value: '"Noto Sans SC"', label: '思源黑体', category: '中文' },
  { value: '"Noto Serif SC"', label: '思源宋体', category: '中文' },
  { value: '"ZCOOL KuaiLe"', label: '站酷快乐体', category: '中文艺术' },
  { value: '"ZCOOL QingKe HuangYou"', label: '站酷庆科黄油体', category: '中文艺术' },
  { value: '"ZCOOL XiaoWei"', label: '站酷小薇体', category: '中文艺术' },
  { value: '"Ma Shan Zheng"', label: '马善政楷体', category: '中文艺术' },
  { value: '"Liu Jian Mao Cao"', label: '流江毛草', category: '中文艺术' },
  { value: '"Long Cang"', label: '龙藏体', category: '中文艺术' },
  { value: '"Zhi Mang Xing"', label: '志莽行书', category: '中文艺术' },
  
  // 英文字体 - Google Fonts 免费商用
  { value: 'Poppins', label: 'Poppins', category: '英文现代' },
  { value: 'Montserrat', label: 'Montserrat', category: '英文现代' },
  { value: '"Playfair Display"', label: 'Playfair Display', category: '英文优雅' },
  { value: '"Bebas Neue"', label: 'Bebas Neue', category: '英文标题' },
  { value: 'Righteous', label: 'Righteous', category: '英文标题' },
  { value: 'Pacifico', label: 'Pacifico', category: '英文手写' },
  { value: '"Permanent Marker"', label: 'Permanent Marker', category: '英文手写' },
  { value: 'Bangers', label: 'Bangers', category: '英文趣味' },
]

const ALIGN_OPTIONS = [
  { value: 'left', icon: 'M4 6h16M4 12h10M4 18h16' },
  { value: 'center', icon: 'M4 6h16M7 12h10M4 18h16' },
  { value: 'right', icon: 'M4 6h16M10 12h10M4 18h16' },
]

export default function TextEditor({ className = '' }) {
  const { 
    textLayers, 
    activeTextLayerId, 
    selectedTextLayerIds,
    updateTextLayer, 
    updateSelectedTextLayers,
    removeTextLayer,
    setActiveTextLayer,
    toggleTextLayerSelection,
    clearTextLayerSelection,
  } = useCanvasStore()

  const activeLayer = textLayers.find(t => t.id === activeTextLayerId)
  const hasMultipleSelected = selectedTextLayerIds.length > 1

  if (textLayers.length === 0) {
    return (
      <div className={`p-4 ${className}`}>
        <p className="text-sm text-surface-500 text-center py-8">
          点击左侧"添加文字"按钮创建文字图层
        </p>
      </div>
    )
  }

  const handleFontSizeChange = (e) => {
    const size = clampFontSize(parseInt(e.target.value, 10))
    if (hasMultipleSelected) {
      updateSelectedTextLayers({ fontSize: size })
    } else if (activeLayer) {
      updateTextLayer(activeLayer.id, { fontSize: size })
    }
  }

  const handlePropertyChange = (property, value) => {
    if (hasMultipleSelected) {
      updateSelectedTextLayers({ [property]: value })
    } else if (activeLayer) {
      updateTextLayer(activeLayer.id, { [property]: value })
    }
  }

  return (
    <div className={`p-4 space-y-4 ${className}`}>
      {/* 图层列表 */}
      <div>
        <label className="text-sm font-medium text-surface-700 mb-2 block">
          文字图层 <span className="text-surface-400 font-normal">(Shift+点击多选)</span>
        </label>
        <div className="space-y-1">
          {textLayers.map((layer, index) => {
            const isActive = activeTextLayerId === layer.id
            const isSelected = selectedTextLayerIds.includes(layer.id)
            return (
            <div
              key={layer.id}
              onClick={(e) => toggleTextLayerSelection(layer.id, e.shiftKey)}
              className={`
                flex items-center gap-2 p-2 rounded-lg cursor-pointer
                ${isActive 
                  ? 'bg-primary-50 border border-primary-200' 
                  : isSelected
                    ? 'bg-primary-25 border border-primary-100'
                    : 'hover:bg-surface-50 border border-transparent'
                }
              `}
            >
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </IconButton>
            </div>
          )})}
        </div>
      </div>

      {activeLayer && (
        <>
          {/* 多选提示 */}
          {hasMultipleSelected && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-2 text-sm text-primary-700">
              已选中 {selectedTextLayerIds.length} 个文字图层，修改将应用到所有选中项
            </div>
          )}

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
                    <option 
                      key={font.value} 
                      value={font.value}
                      style={{ fontFamily: font.value }}
                    >
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
        </>
      )}
    </div>
  )
}
