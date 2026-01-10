/**
 * [L3] 同步确认弹窗
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * 
 * Toast 样式的非侵入式确认弹窗，5 秒自动消失
 */
import { useState, useEffect, useCallback } from 'react'
import { useCanvasStore } from '../../stores/canvasStore'
import { getSyncPropertyLabel } from '../../utils/syncManager'

const AUTO_DISMISS_MS = 5000

export default function SyncConfirmation() {
  const { pendingSync, clearPendingSync, syncToSlaves, setRememberChoice, canvases } = useCanvasStore()
  const [remember, setRemember] = useState(false)
  const [timeLeft, setTimeLeft] = useState(AUTO_DISMISS_MS / 1000)

  // 自动消失计时器
  useEffect(() => {
    if (!pendingSync) return
    
    setTimeLeft(AUTO_DISMISS_MS / 1000)
    setRemember(false)
    
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearPendingSync() // 超时默认不同步
          return 0
        }
        return t - 1
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [pendingSync, clearPendingSync])

  const handleConfirm = useCallback(() => {
    if (!pendingSync) return
    
    // 执行同步
    syncToSlaves(pendingSync.property, pendingSync.value)
    
    // 记住选择
    if (remember) {
      setRememberChoice(pendingSync.propertyType, 'sync')
    }
    
    clearPendingSync()
  }, [pendingSync, remember, syncToSlaves, setRememberChoice, clearPendingSync])

  const handleDecline = useCallback(() => {
    if (!pendingSync) return
    
    // 记住选择
    if (remember) {
      setRememberChoice(pendingSync.propertyType, 'no-sync')
    }
    
    clearPendingSync()
  }, [pendingSync, remember, setRememberChoice, clearPendingSync])

  if (!pendingSync) return null

  const slaveCount = canvases.length - 1
  const propertyLabel = getSyncPropertyLabel(pendingSync.property)

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[320px]">
        {/* 标题 */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-gray-900">
            同步{propertyLabel}到其他画布？
          </span>
          <span className="text-xs text-gray-400">
            {timeLeft}s
          </span>
        </div>
        
        {/* 描述 */}
        <p className="text-sm text-gray-500 mb-3">
          将此修改应用到其他 {slaveCount} 个画布
        </p>
        
        {/* 记住选择 */}
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">记住我的选择</span>
        </label>
        
        {/* 按钮 */}
        <div className="flex gap-2">
          <button
            onClick={handleDecline}
            className="flex-1 px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            仅当前画布
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
          >
            同步全部
          </button>
        </div>
      </div>
    </div>
  )
}
