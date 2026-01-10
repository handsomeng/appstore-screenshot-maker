/**
 * [L3] 画布区域布局
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import MultiCanvasView from '../canvas/MultiCanvasView'
import SyncConfirmation from '../ui/SyncConfirmation'
import { useCanvasStore } from '../../stores/canvasStore'

export default function CanvasArea() {
  const { syncSettings, toggleBatchMode } = useCanvasStore()

  return (
    <main className="flex-1 bg-surface-50 flex flex-col overflow-hidden">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div className="text-sm text-gray-500">
          拖动第一张画布的元素，其他画布会实时同步
        </div>
        
        {/* 批量模式开关 */}
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm text-gray-600">实时同步</span>
          <div className="relative">
            <input
              type="checkbox"
              checked={syncSettings.batchMode}
              onChange={toggleBatchMode}
              className="sr-only"
            />
            <div className={`
              w-10 h-6 rounded-full transition-colors
              ${syncSettings.batchMode ? 'bg-blue-500' : 'bg-gray-300'}
            `}>
              <div className={`
                absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform
                ${syncSettings.batchMode ? 'translate-x-5' : 'translate-x-1'}
              `} />
            </div>
          </div>
          {syncSettings.batchMode && (
            <span className="text-xs text-blue-500 font-medium">已开启</span>
          )}
        </label>
      </div>
      
      {/* 多画布并排视图 */}
      <MultiCanvasView />
      
      {/* 同步确认弹窗 */}
      <SyncConfirmation />
    </main>
  )
}
