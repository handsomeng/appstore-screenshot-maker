import ImageUploader from '../controls/ImageUploader'
import DeviceSelector from '../controls/DeviceSelector'
import CanvasSizeSelector from '../controls/CanvasSizeSelector'
import { useCanvasStore } from '../../stores/canvasStore'
import { Button, IconButton } from '../ui'

export default function Sidebar() {
  const { addTextLayer, screenshots, removeScreenshot } = useCanvasStore()

  return (
    <aside className="w-64 bg-white border-r border-surface-200 flex flex-col">
      <div className="p-4 border-b border-surface-200">
        <h1 className="text-lg font-semibold text-surface-900">截图制作器</h1>
        <p className="text-xs text-surface-500 mt-1">App Store Screenshot Maker</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* 画布尺寸 */}
        <section>
          <h2 className="text-sm font-medium text-surface-700 mb-3">画布尺寸</h2>
          <CanvasSizeSelector />
        </section>

        {/* 上传截图 */}
        <section>
          <h2 className="text-sm font-medium text-surface-700 mb-3">上传截图</h2>
          <ImageUploader />
        </section>

        {/* 已上传截图列表 */}
        {screenshots.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-surface-700 mb-3">
              已上传 ({screenshots.length})
            </h2>
            <div className="space-y-2">
              {screenshots.map((screenshot, index) => (
                <div 
                  key={screenshot.id}
                  className="flex items-center gap-2 p-2 bg-surface-50 rounded-lg"
                >
                  <img 
                    src={screenshot.imageData} 
                    alt={`截图 ${index + 1}`}
                    className="w-10 h-16 object-cover rounded"
                  />
                  <span className="flex-1 text-sm text-surface-700 truncate">
                    截图 {index + 1}
                  </span>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    onClick={() => removeScreenshot(screenshot.id)}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </IconButton>
                </div>
              ))}
            </div>
          </section>
        )}

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
            onClick={() => addTextLayer()}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加文字
          </Button>
        </section>
      </div>
    </aside>
  )
}
