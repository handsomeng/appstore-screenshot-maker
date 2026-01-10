/**
 * [L3] 多画布并排视图 - 完整版
 * 
 * 功能清单：
 * 1. 所有画布并排显示
 * 2. Master 画布同步到 Slave
 * 3. 点击元素 → 立即显示 Transformer 手柄 + 右侧面板显示编辑器
 * 4. Shift+点击 或 框选 → 多选批量编辑
 * 5. 双击文字 → 编辑内容
 * 6. 拖拽时居中吸附
 */
import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Rect, Text, Image, Transformer, Line } from 'react-konva'
import { useCanvasStore } from '../../stores/canvasStore'
import { generatePlaceholderText } from '../../utils/syncManager'

const SNAP_THRESHOLD = 10

function snapToCenter(pos, canvasSize) {
  const centerX = 0.5, centerY = 0.5
  let snappedX = pos.x, snappedY = pos.y
  let snapLineX = null, snapLineY = null
  
  if (Math.abs(pos.x - centerX) * canvasSize.width < SNAP_THRESHOLD) {
    snappedX = centerX
    snapLineX = centerX
  }
  if (Math.abs(pos.y - centerY) * canvasSize.height < SNAP_THRESHOLD) {
    snappedY = centerY
    snapLineY = centerY
  }
  return { x: snappedX, y: snappedY, snapLineX, snapLineY }
}

function hasIntersection(r1, r2) {
  return !(r2.x > r1.x + r1.width || r2.x + r2.width < r1.x || 
           r2.y > r1.y + r1.height || r2.y + r2.height < r1.y)
}

function SingleCanvas({ canvas, isMaster, isActive, scale }) {
  const stageRef = useRef()
  const layerRef = useRef()
  const trRef = useRef()
  const imageRef = useRef()
  const textRefs = useRef({})
  
  const [image, setImage] = useState(null)
  const [snapLines, setSnapLines] = useState({ x: null, y: null })
  const [selRect, setSelRect] = useState({ visible: false, x: 0, y: 0, w: 0, h: 0 })
  const selStart = useRef(null)
  
  const store = useCanvasStore()
  const { 
    setActiveCanvas, updateCanvas, setActiveScreenshot, setActiveTextLayer,
    syncToSlaves, syncSettings, selectedTextLayerIds, activeScreenshotId,
  } = store
  
  const { background, screenshot, textLayers, canvasSize } = canvas

  // 加载图片
  useEffect(() => {
    if (!screenshot?.imageData) { setImage(null); return }
    const img = new window.Image()
    img.src = screenshot.imageData
    img.onload = () => setImage(img)
  }, [screenshot?.imageData])

  // 核心：更新 Transformer 选中的节点
  useEffect(() => {
    if (!trRef.current || !layerRef.current) return
    
    const nodes = []
    
    // 图片选中
    if (activeScreenshotId && screenshot?.id === activeScreenshotId && imageRef.current) {
      nodes.push(imageRef.current)
    }
    
    // 文字选中
    selectedTextLayerIds.forEach(id => {
      const ref = textRefs.current[id]
      if (ref) nodes.push(ref)
    })
    
    trRef.current.nodes(nodes)
    trRef.current.getLayer()?.batchDraw()
  }, [activeScreenshotId, selectedTextLayerIds, screenshot?.id])

  // 同步到 Slave
  const syncMaster = (prop, val) => { if (isMaster) syncToSlaves(prop, val) }

  const handleScreenshotChange = (updates) => {
    const newSS = { ...screenshot, ...updates }
    updateCanvas(canvas.index, { screenshot: newSS })
    if (isMaster && syncSettings.batchMode) {
      syncMaster('screenshot.position', { position: newSS.position, scale: newSS.scale })
    }
  }

  const handleTextChange = (layerId, layerIndex, updates) => {
    const newLayers = textLayers.map(t => t.id === layerId ? { ...t, ...updates } : t)
    updateCanvas(canvas.index, { textLayers: newLayers })
    if (isMaster) {
      if (updates.position || updates.fontSize || updates.color || updates.fontFamily || updates.align) {
        syncMaster('textLayer.style', { layerIndex, style: updates })
      }
      if (updates.text !== undefined) {
        syncMaster('textLayer.content', { layerIndex, placeholderText: generatePlaceholderText(updates.text) })
      }
    }
  }

  const handleDragMove = (e) => {
    const rawX = e.target.x() / canvasSize.width
    const rawY = e.target.y() / canvasSize.height
    const snapped = snapToCenter({ x: rawX, y: rawY }, canvasSize)
    e.target.x(snapped.x * canvasSize.width)
    e.target.y(snapped.y * canvasSize.height)
    setSnapLines({ x: snapped.snapLineX, y: snapped.snapLineY })
  }

  // 点击背景开始框选
  const onStageMouseDown = (e) => {
    if (e.target !== e.target.getStage() && e.target.name() !== 'bg') return
    setActiveCanvas(canvas.index)
    const pos = e.target.getStage().getPointerPosition()
    selStart.current = { x: pos.x / scale, y: pos.y / scale }
    setSelRect({ visible: true, x: pos.x / scale, y: pos.y / scale, w: 0, h: 0 })
    // 清除选择
    setActiveScreenshot(null)
    setActiveTextLayer(null)
    useCanvasStore.setState({ selectedTextLayerIds: [], activeTextLayerId: null })
  }

  const onStageMouseMove = (e) => {
    if (!selStart.current) return
    const pos = e.target.getStage().getPointerPosition()
    const x1 = selStart.current.x, y1 = selStart.current.y
    const x2 = pos.x / scale, y2 = pos.y / scale
    setSelRect({ visible: true, x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1) })
  }

  const onStageMouseUp = () => {
    if (!selStart.current) return
    selStart.current = null
    
    if (selRect.w < 5 && selRect.h < 5) {
      setSelRect({ visible: false, x: 0, y: 0, w: 0, h: 0 })
      return
    }
    
    // 找出框选区域内的元素
    const box = { x: selRect.x, y: selRect.y, width: selRect.w, height: selRect.h }
    const ids = []
    textLayers.forEach(layer => {
      const ref = textRefs.current[layer.id]
      if (ref) {
        const rect = ref.getClientRect({ relativeTo: layerRef.current })
        if (hasIntersection(box, rect)) ids.push(layer.id)
      }
    })
    
    if (ids.length > 0) {
      useCanvasStore.setState({ selectedTextLayerIds: ids, activeTextLayerId: ids[0] })
    }
    
    setTimeout(() => setSelRect({ visible: false, x: 0, y: 0, w: 0, h: 0 }), 10)
  }

  // 点击图片
  const onImageClick = (e) => {
    e.cancelBubble = true
    setActiveCanvas(canvas.index)
    setActiveScreenshot(screenshot.id)
    setActiveTextLayer(null)
    useCanvasStore.setState({ selectedTextLayerIds: [], activeTextLayerId: null })
  }

  // 点击文字
  const onTextClick = (e, layerId) => {
    e.cancelBubble = true
    setActiveCanvas(canvas.index)
    setActiveScreenshot(null)
    
    const meta = e.evt?.shiftKey || e.evt?.ctrlKey || e.evt?.metaKey
    const current = useCanvasStore.getState().selectedTextLayerIds
    const isSelected = current.includes(layerId)
    
    if (!meta && !isSelected) {
      useCanvasStore.setState({ selectedTextLayerIds: [layerId], activeTextLayerId: layerId })
    } else if (meta && isSelected) {
      const newIds = current.filter(i => i !== layerId)
      useCanvasStore.setState({ selectedTextLayerIds: newIds, activeTextLayerId: newIds[0] || null })
    } else if (meta && !isSelected) {
      useCanvasStore.setState({ selectedTextLayerIds: [...current, layerId], activeTextLayerId: layerId })
    }
  }

  // 双击编辑文字
  const onTextDblClick = (e, layer, idx) => {
    const node = e.target, stage = node.getStage()
    const box = stage.container().getBoundingClientRect()
    const pos = node.absolutePosition()
    
    const ta = document.createElement('textarea')
    document.body.appendChild(ta)
    ta.value = layer.text
    Object.assign(ta.style, {
      position: 'absolute',
      top: `${box.top + pos.y * scale - 10}px`,
      left: `${box.left + pos.x * scale - 50}px`,
      width: `${Math.max(200, node.width() * scale)}px`,
      height: `${Math.max(60, node.height() * scale + 20)}px`,
      fontSize: `${layer.fontSize * scale}px`,
      fontFamily: layer.fontFamily,
      color: layer.color,
      border: '2px solid #3b82f6',
      borderRadius: '4px',
      padding: '8px',
      outline: 'none',
      resize: 'none',
      background: 'white',
      zIndex: '1000',
      textAlign: layer.align,
    })
    ta.focus()
    ta.select()
    
    const done = () => {
      handleTextChange(layer.id, idx, { text: ta.value })
      document.body.removeChild(ta)
    }
    ta.addEventListener('blur', done)
    ta.addEventListener('keydown', (ev) => {
      if ((ev.key === 'Enter' && !ev.shiftKey) || ev.key === 'Escape') ta.blur()
    })
  }

  const bgFill = background.type === 'solid' ? background.color : '#ffffff'
  const imgScale = image ? Math.min((canvasSize.width * 0.8) / image.width, (canvasSize.height * 0.6) / image.height) * (screenshot?.scale || 1) : 1

  return (
    <div className={`relative flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${isActive ? 'ring-2 ring-blue-500 ring-offset-2' : 'ring-1 ring-gray-200 hover:ring-gray-300'}`}>
      {isMaster && <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-blue-500 text-white text-xs rounded shadow">模板</div>}
      <div className="absolute top-2 right-2 z-10 px-2 py-1 bg-black/50 text-white text-xs rounded">{canvas.index + 1}</div>

      <Stage
        ref={stageRef}
        width={canvasSize.width * scale}
        height={canvasSize.height * scale}
        scaleX={scale}
        scaleY={scale}
        onMouseDown={onStageMouseDown}
        onMouseMove={onStageMouseMove}
        onMouseUp={onStageMouseUp}
        onTouchStart={onStageMouseDown}
        onTouchMove={onStageMouseMove}
        onTouchEnd={onStageMouseUp}
      >
        <Layer ref={layerRef}>
          {/* 背景 */}
          <Rect name="bg" x={0} y={0} width={canvasSize.width} height={canvasSize.height} fill={bgFill} />
          {background.type === 'gradient' && background.gradient && (
            <Rect x={0} y={0} width={canvasSize.width} height={canvasSize.height}
              fillLinearGradientStartPoint={{ x: 0, y: 0 }}
              fillLinearGradientEndPoint={{ x: 0, y: canvasSize.height }}
              fillLinearGradientColorStops={background.gradient.colors.flatMap((c, i, arr) => [i / (arr.length - 1), c])}
              listening={false}
            />
          )}

          {/* 截图 */}
          {screenshot && image && (
            <Image
              ref={imageRef}
              name="screenshot"
              image={image}
              x={canvasSize.width * screenshot.position.x}
              y={canvasSize.height * screenshot.position.y}
              offsetX={image.width / 2}
              offsetY={image.height / 2}
              scaleX={imgScale}
              scaleY={imgScale}
              draggable
              onClick={onImageClick}
              onTap={onImageClick}
              onDragMove={handleDragMove}
              onDragEnd={(e) => {
                setSnapLines({ x: null, y: null })
                handleScreenshotChange({ position: { x: e.target.x() / canvasSize.width, y: e.target.y() / canvasSize.height } })
              }}
              onTransformEnd={() => {
                const node = imageRef.current
                const newScale = (screenshot.scale || 1) * node.scaleX() / imgScale
                handleScreenshotChange({ scale: newScale })
                node.scaleX(imgScale)
                node.scaleY(imgScale)
              }}
            />
          )}

          {/* 文字图层 */}
          {textLayers.map((layer, idx) => (
            <Text
              key={layer.id}
              ref={(ref) => { if (ref) textRefs.current[layer.id] = ref; else delete textRefs.current[layer.id] }}
              name="text"
              text={layer.text}
              x={canvasSize.width * layer.position.x}
              y={canvasSize.height * layer.position.y}
              fontSize={layer.fontSize}
              fontFamily={layer.fontFamily}
              fill={layer.color}
              align={layer.align}
              draggable
              onClick={(e) => onTextClick(e, layer.id)}
              onTap={(e) => onTextClick(e, layer.id)}
              onDblClick={(e) => onTextDblClick(e, layer, idx)}
              onDblTap={(e) => onTextDblClick(e, layer, idx)}
              onDragMove={handleDragMove}
              onDragEnd={(e) => {
                setSnapLines({ x: null, y: null })
                handleTextChange(layer.id, idx, { position: { x: e.target.x() / canvasSize.width, y: e.target.y() / canvasSize.height } })
              }}
              onTransformEnd={() => {
                const node = textRefs.current[layer.id]
                if (node) {
                  handleTextChange(layer.id, idx, { fontSize: Math.round(layer.fontSize * node.scaleY()) })
                  node.scaleX(1)
                  node.scaleY(1)
                }
              }}
            />
          ))}

          {/* 吸附辅助线 */}
          {snapLines.x !== null && <Line points={[canvasSize.width * snapLines.x, 0, canvasSize.width * snapLines.x, canvasSize.height]} stroke="#3b82f6" strokeWidth={1} dash={[4, 4]} listening={false} />}
          {snapLines.y !== null && <Line points={[0, canvasSize.height * snapLines.y, canvasSize.width, canvasSize.height * snapLines.y]} stroke="#3b82f6" strokeWidth={1} dash={[4, 4]} listening={false} />}

          {/* 框选矩形 */}
          {selRect.visible && <Rect x={selRect.x} y={selRect.y} width={selRect.w} height={selRect.h} fill="rgba(59,130,246,0.2)" stroke="#3b82f6" strokeWidth={1} listening={false} />}

          {/* Transformer */}
          <Transformer ref={trRef} keepRatio={true} boundBoxFunc={(old, box) => (box.width < 20 || box.height < 20) ? old : box} />
        </Layer>
      </Stage>
    </div>
  )
}

// 剪贴板存储
let clipboard = { type: null, data: null }

export default function MultiCanvasView() {
  const containerRef = useRef()
  const [scale, setScale] = useState(0.3)
  const { 
    canvases, activeCanvasIndex, addCanvas, removeCanvas, 
    selectedTextLayerIds, clearTextLayerSelection, updateCanvas,
    activeScreenshotId, setActiveScreenshot,
  } = useCanvasStore()

  const currentCanvas = canvases[activeCanvasIndex]

  useEffect(() => {
    const update = () => {
      if (!containerRef.current || canvases.length === 0) return
      const c = containerRef.current
      const pad = 40, gap = 16
      const maxH = c.clientHeight - pad * 2
      const availW = c.clientWidth - pad * 2 - (canvases.length - 1) * gap
      const cs = canvases[0].canvasSize
      setScale(Math.min(maxH / cs.height, availW / canvases.length / cs.width, 0.5))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [canvases])

  // 键盘快捷键
  useEffect(() => {
    const onKey = (e) => {
      // 如果正在输入框中，不处理快捷键
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      
      const isMeta = e.metaKey || e.ctrlKey
      
      // Esc - 取消选择
      if (e.key === 'Escape') {
        clearTextLayerSelection()
        setActiveScreenshot(null)
        return
      }
      
      // Delete/Backspace - 删除选中元素
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // 删除选中的文字
        if (selectedTextLayerIds.length > 0) {
          const newLayers = currentCanvas.textLayers.filter(t => !selectedTextLayerIds.includes(t.id))
          updateCanvas(activeCanvasIndex, { textLayers: newLayers })
          clearTextLayerSelection()
          e.preventDefault()
          return
        }
        // 删除选中的图片
        if (activeScreenshotId && currentCanvas.screenshot?.id === activeScreenshotId) {
          updateCanvas(activeCanvasIndex, { screenshot: null })
          setActiveScreenshot(null)
          e.preventDefault()
          return
        }
        // Cmd/Ctrl + Delete - 删除当前画布
        if (isMeta && canvases.length > 1) {
          removeCanvas(activeCanvasIndex)
          e.preventDefault()
          return
        }
        return
      }
      
      if (!isMeta) return
      
      // Cmd/Ctrl + A - 全选
      if (e.key === 'a') {
        e.preventDefault()
        const allIds = currentCanvas.textLayers.map(t => t.id)
        useCanvasStore.setState({ 
          selectedTextLayerIds: allIds, 
          activeTextLayerId: allIds[0] || null 
        })
        return
      }
      
      // Cmd/Ctrl + C - 复制
      if (e.key === 'c') {
        if (selectedTextLayerIds.length > 0) {
          const layersToCopy = currentCanvas.textLayers.filter(t => selectedTextLayerIds.includes(t.id))
          clipboard = { type: 'textLayers', data: JSON.parse(JSON.stringify(layersToCopy)) }
          e.preventDefault()
        } else if (activeScreenshotId && currentCanvas.screenshot) {
          clipboard = { type: 'screenshot', data: JSON.parse(JSON.stringify(currentCanvas.screenshot)) }
          e.preventDefault()
        }
        return
      }
      
      // Cmd/Ctrl + X - 剪切
      if (e.key === 'x') {
        if (selectedTextLayerIds.length > 0) {
          const layersToCut = currentCanvas.textLayers.filter(t => selectedTextLayerIds.includes(t.id))
          clipboard = { type: 'textLayers', data: JSON.parse(JSON.stringify(layersToCut)) }
          const newLayers = currentCanvas.textLayers.filter(t => !selectedTextLayerIds.includes(t.id))
          updateCanvas(activeCanvasIndex, { textLayers: newLayers })
          clearTextLayerSelection()
          e.preventDefault()
        }
        return
      }
      
      // Cmd/Ctrl + V - 粘贴
      if (e.key === 'v') {
        if (clipboard.type === 'textLayers' && clipboard.data) {
          const newLayers = clipboard.data.map(layer => ({
            ...layer,
            id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            position: { x: layer.position.x + 0.02, y: layer.position.y + 0.02 }, // 稍微偏移
          }))
          updateCanvas(activeCanvasIndex, { 
            textLayers: [...currentCanvas.textLayers, ...newLayers] 
          })
          // 选中粘贴的元素
          useCanvasStore.setState({ 
            selectedTextLayerIds: newLayers.map(l => l.id),
            activeTextLayerId: newLayers[0]?.id || null,
          })
          e.preventDefault()
        }
        return
      }
    }
    
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [clearTextLayerSelection, selectedTextLayerIds, activeScreenshotId, currentCanvas, activeCanvasIndex, updateCanvas, setActiveScreenshot])

  return (
    <div ref={containerRef} className="flex-1 flex flex-col bg-surface-50 overflow-hidden">
      <div className="flex-1 flex items-center justify-center gap-4 p-6 overflow-x-auto">
        {canvases.map((c) => <SingleCanvas key={c.id} canvas={c} isMaster={c.index === 0} isActive={c.index === activeCanvasIndex} scale={scale} />)}
        {canvases.length < 6 && (
          <button onClick={() => addCanvas()} className="flex-shrink-0 w-32 h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-500 hover:border-gray-400 transition-colors">
            <span className="text-3xl">+</span>
            <span className="text-sm">添加画布</span>
          </button>
        )}
      </div>
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
        <div className="text-sm text-gray-500">
          画布 {canvases.length}/6 · 缩放 {Math.round(scale * 100)}%
          {selectedTextLayerIds.length > 1 && <span className="ml-2 text-blue-500">· 已选中 {selectedTextLayerIds.length} 个元素</span>}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400">⌘A全选 | ⌘C复制 | ⌘V粘贴 | Delete删除 | ⌘+Delete删除画布</span>
          {canvases.length > 1 && <button onClick={() => removeCanvas(activeCanvasIndex)} className="text-sm text-red-500 hover:text-red-600">删除当前画布</button>}
        </div>
      </div>
    </div>
  )
}
