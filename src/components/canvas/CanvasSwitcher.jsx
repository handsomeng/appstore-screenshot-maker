/**
 * [L3] 画布切换器组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * 
 * 底部水平排列的画布缩略图，支持切换、删除画布
 */
import { useRef, useEffect, useState } from 'react'
import { useCanvasStore } from '../../stores/canvasStore'

// 单个画布缩略图
function CanvasThumbnail({ canvas, isActive, isMaster, onSelect, onDelete, canDelete }) {
  const [thumbnail, setThumbnail] = useState(null)
  
  // 生成缩略图 (简化版，实际应该用 Konva toDataURL)
  useEffect(() => {
    // 创建简单的预览
    const preview = document.createElement('canvas')
    const ctx = preview.getContext('2d')
    preview.width = 80
    preview.height = 160
    
    // 绘制背景
    if (canvas.background.type === 'solid') {
      ctx.fillStyle = canvas.background.color
    } else {
      ctx.fillStyle = '#ffffff'
    }
    ctx.fillRect(0, 0, 80, 160)
    
    // 如果有截图，绘制占位符
    if (canvas.screenshot) {
      ctx.fillStyle = '#e5e7eb'
      ctx.fillRect(10, 60, 60, 80)
    }
    
    // 如果有文字，绘制占位符
    canvas.textLayers.forEach((layer, i) => {
      ctx.fillStyle = layer.color
      ctx.font = '8px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('文字', 40, 20 + i * 12)
    })
    
    setThumbnail(preview.toDataURL())
  }, [canvas])

  return (
    <div
      className={`
        relative flex-shrink-0 cursor-pointer rounded-lg overflow-hidden
        transition-all duration-200 group
        ${isActive 
          ? 'ring-2 ring-blue-500 ring-offset-2' 
          : 'ring-1 ring-gray-200 hover:ring-gray-300'
        }
      `}
      onClick={onSelect}
    >
      {/* 缩略图 */}
      <div className="w-16 h-28 bg-gray-100">
        {thumbnail && (
          <img src={thumbnail} alt={`画布 ${canvas.index + 1}`} className="w-full h-full object-cover" />
        )}
      </div>
      
      {/* Master 标签 */}
      {isMaster && (
        <div className="absolute top-1 left-1 px-1 py-0.5 bg-blue-500 text-white text-[10px] rounded">
          模板
        </div>
      )}
      
      {/* 画布编号 */}
      <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/50 text-white text-[10px] rounded">
        {canvas.index + 1}
      </div>
      
      {/* 删除按钮 */}
      {canDelete && (
        <button
          className="
            absolute top-1 right-1 w-4 h-4 
            bg-red-500 text-white rounded-full
            opacity-0 group-hover:opacity-100
            transition-opacity duration-200
            flex items-center justify-center
            text-xs leading-none
          "
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}

export default function CanvasSwitcher() {
  const { canvases, activeCanvasIndex, setActiveCanvas, removeCanvas, addCanvas } = useCanvasStore()
  const canDelete = canvases.length > 1
  const canAdd = canvases.length < 6

  return (
    <div className="flex items-center gap-3 p-3 bg-white border-t border-gray-200 overflow-x-auto">
      {/* 画布列表 */}
      {canvases.map((canvas) => (
        <CanvasThumbnail
          key={canvas.id}
          canvas={canvas}
          isActive={canvas.index === activeCanvasIndex}
          isMaster={canvas.index === 0}
          canDelete={canDelete}
          onSelect={() => setActiveCanvas(canvas.index)}
          onDelete={() => removeCanvas(canvas.index)}
        />
      ))}
      
      {/* 添加按钮 */}
      {canAdd && (
        <button
          className="
            flex-shrink-0 w-16 h-28 
            border-2 border-dashed border-gray-300 
            rounded-lg flex items-center justify-center
            text-gray-400 hover:text-gray-500 hover:border-gray-400
            transition-colors duration-200
          "
          onClick={() => addCanvas()}
        >
          <span className="text-2xl">+</span>
        </button>
      )}
    </div>
  )
}
