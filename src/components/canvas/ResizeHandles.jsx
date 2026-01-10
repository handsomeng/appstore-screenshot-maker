/**
 * [L3] 画布尺寸调整手柄
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * 
 * 8 个拖拽点（四角 + 四边中点），支持自由调整画布尺寸
 */
import { useState, useCallback } from 'react'

const MIN_SIZE = 200

// 手柄位置配置
const HANDLES = [
  { id: 'nw', cursor: 'nwse-resize', x: 0, y: 0, dx: -1, dy: -1 },
  { id: 'n', cursor: 'ns-resize', x: 0.5, y: 0, dx: 0, dy: -1 },
  { id: 'ne', cursor: 'nesw-resize', x: 1, y: 0, dx: 1, dy: -1 },
  { id: 'e', cursor: 'ew-resize', x: 1, y: 0.5, dx: 1, dy: 0 },
  { id: 'se', cursor: 'nwse-resize', x: 1, y: 1, dx: 1, dy: 1 },
  { id: 's', cursor: 'ns-resize', x: 0.5, y: 1, dx: 0, dy: 1 },
  { id: 'sw', cursor: 'nesw-resize', x: 0, y: 1, dx: -1, dy: 1 },
  { id: 'w', cursor: 'ew-resize', x: 0, y: 0.5, dx: -1, dy: 0 },
]

export default function ResizeHandles({ width, height, scale, onResize, onResizeEnd }) {
  const [isDragging, setIsDragging] = useState(false)
  const [showSize, setShowSize] = useState(false)

  const handleMouseDown = useCallback((e, handle) => {
    e.preventDefault()
    e.stopPropagation()
    
    const startX = e.clientX
    const startY = e.clientY
    const startWidth = width
    const startHeight = height
    
    setIsDragging(true)
    setShowSize(true)

    const handleMouseMove = (moveEvent) => {
      const deltaX = (moveEvent.clientX - startX) / scale
      const deltaY = (moveEvent.clientY - startY) / scale
      
      let newWidth = startWidth
      let newHeight = startHeight
      
      // 根据手柄方向计算新尺寸
      if (handle.dx !== 0) {
        newWidth = Math.max(MIN_SIZE, startWidth + deltaX * handle.dx)
      }
      if (handle.dy !== 0) {
        newHeight = Math.max(MIN_SIZE, startHeight + deltaY * handle.dy)
      }
      
      onResize(Math.round(newWidth), Math.round(newHeight))
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setShowSize(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      onResizeEnd?.()
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [width, height, scale, onResize, onResizeEnd])

  // 计算显示尺寸
  const displayWidth = width * scale
  const displayHeight = height * scale

  return (
    <>
      {/* 尺寸显示 */}
      {showSize && (
        <div 
          className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/75 text-white text-xs rounded whitespace-nowrap z-50"
        >
          {width} × {height}
        </div>
      )}
      
      {/* 8 个拖拽手柄 */}
      {HANDLES.map((handle) => (
        <div
          key={handle.id}
          className={`
            absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-sm
            hover:bg-blue-100 transition-colors
            ${isDragging ? 'pointer-events-none' : ''}
          `}
          style={{
            left: `${handle.x * 100}%`,
            top: `${handle.y * 100}%`,
            transform: 'translate(-50%, -50%)',
            cursor: handle.cursor,
          }}
          onMouseDown={(e) => handleMouseDown(e, handle)}
        />
      ))}
    </>
  )
}
