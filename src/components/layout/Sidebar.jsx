/**
 * [L3] 侧边栏布局
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import ImageUploader from '../controls/ImageUploader'
import DeviceSelector from '../controls/DeviceSelector'
import CanvasSizeSelector from '../controls/CanvasSizeSelector'
import { useCanvasStore } from '../../stores/canvasStore'
import { Button } from '../ui'
import { shouldTriggerSync, SyncPropertyType, generatePlaceholderText } from '../../utils/syncManager'

export default function Sidebar() {
  const { 
    canvases, 
    activeCanvasIndex, 
    syncSettings,
    addTextLayer, 
    setPendingSync,
    syncToSlaves,
  } = useCanvasStore()
  
  const currentCanvas = canvases[activeCanvasIndex]
  const isMaster = activeCanvasIndex === 0

  // 添加文字时处理同步
  const handleAddText = () => {
    const defaultText = '双击编辑文字'
    const id = addTextLayer(defaultText)
    
    if (isMaster && canvases.length > 1) {
      const { batchMode, rememberChoice } = syncSettings
      const result = shouldTriggerSync(activeCanvasIndex, batchMode, rememberChoice.textStyle)
      
      const newLayer = currentCanvas.textLayers.find(t => t.id === id) || {
        text: generatePlaceholderText(defaultText),
        position: { x: 0.5, y: 0.2 },
        fontFamily: 'system-ui',
        fontSize: 32,
        color: '#000000',
        align: 'center',
      }
      
      if (result.autoSync) {
        syncToSlaves(SyncPropertyType.TEXT_ADD, {
          ...newLayer,
          text: generatePlaceholderText(defaultText),
        })
      } else if (result.showConfirm) {
        setPendingSync({
          property: SyncPropertyType.TEXT_ADD,
          value: {
            ...newLayer,
            text: generatePlaceholderText(defaultText),
          },
          propertyType: 'textStyle',
        })
      }
    }
  }

  return (
    <aside className="w-64 bg-white border-r border-surface-200 flex flex-col">
      <div className="p-4 border-b border-surface-200">
        <h1 className="text-lg font-semibold text-surface-900">截图制作器</h1>
        <p className="text-xs text-surface-500 mt-1">App Store Screenshot Maker</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* 当前画布信息 */}
        <section className="bg-surface-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-surface-600">
              画布 {activeCanvasIndex + 1}/{canvases.length}
            </span>
            {isMaster && (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                模板
              </span>
            )}
          </div>
          <CanvasSizeSelector />
        </section>

        {/* 上传截图 */}
        <section>
          <h2 className="text-sm font-medium text-surface-700 mb-3">上传截图</h2>
          <ImageUploader />
        </section>

        {/* 设备框架 */}
        <section>
          <h2 className="text-sm font-medium text-surface-700 mb-3">设备框架</h2>
          <DeviceSelector />
        </section>

        {/* 添加文字 */}
        <section>
          <h2 className="text-sm font-medium text-surface-700 mb-3">文字图层</h2>
          <Button 
            variant="secondary" 
            className="w-full"
            onClick={handleAddText}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加文字
          </Button>
          {isMaster && canvases.length > 1 && (
            <p className="text-xs text-surface-400 mt-2">
              在模板画布添加文字可同步到其他画布
            </p>
          )}
          
          {/* 当前画布文字列表 */}
          {currentCanvas?.textLayers.length > 0 && (
            <div className="mt-3 space-y-2">
              {currentCanvas.textLayers.map((layer, index) => (
                <div 
                  key={layer.id}
                  className="flex items-center gap-2 p-2 bg-surface-50 rounded text-sm"
                >
                  <span className="w-5 h-5 bg-surface-200 rounded flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  <span className="flex-1 truncate text-surface-600">
                    {layer.text || '空文字'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </aside>
  )
}
