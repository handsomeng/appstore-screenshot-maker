/**
 * [L3] Konva 画布渲染组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * 
 * 核心职责：渲染当前画布的背景、截图、文字图层
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { Stage, Layer, Rect, Text, Image, Transformer } from 'react-konva'
import { useCanvasStore } from '../../stores/canvasStore'
import { shouldTriggerSync, SyncPropertyType } from '../../utils/syncManager'
import ResizeHandles from './ResizeHandles'

// 可编辑文字组件
function EditableText({ layer, isSelected, onSelect, onChange, canvasSize }) {
  const textRef = useRef()
  const trRef = useRef()
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (isSelected && trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current])
      trRef.current.getLayer().batchDraw()
    }
  }, [isSelected])

  const handleDblClick = () => {
    setIsEditing(true)
    const textNode = textRef.current
    const stage = textNode.getStage()
    const stageBox = stage.container().getBoundingClientRect()
    const textPosition = textNode.absolutePosition()

    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)

    textarea.value = layer.text
    textarea.style.position = 'absolute'
    textarea.style.top = `${stageBox.top + textPosition.y - textNode.height() / 2}px`
    textarea.style.left = `${stageBox.left + textPosition.x - textNode.width() / 2}px`
    textarea.style.width = `${textNode.width() * textNode.scaleX() + 20}px`
    textarea.style.height = `${textNode.height() * textNode.scaleY() + 20}px`
    textarea.style.fontSize = `${layer.fontSize}px`
    textarea.style.fontFamily = layer.fontFamily
    textarea.style.color = layer.color
    textarea.style.border = '2px solid #3b82f6'
    textarea.style.borderRadius = '4px'
    textarea.style.padding = '4px'
    textarea.style.outline = 'none'
    textarea.style.resize = 'none'
    textarea.style.background = 'white'
    textarea.style.zIndex = '1000'
    textarea.style.textAlign = layer.align

    textarea.focus()
    textarea.select()

    const handleBlur = () => {
      onChange({ text: textarea.value })
      document.body.removeChild(textarea)
      setIsEditing(false)
    }

    textarea.addEventListener('blur', handleBlur)
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) textarea.blur()
      if (e.key === 'Escape') textarea.blur()
    })
  }

  return (
    <>
      <Text
        ref={textRef}
        text={layer.text}
        x={canvasSize.width * layer.position.x}
        y={canvasSize.height * layer.position.y}
        fontSize={layer.fontSize}
        fontFamily={layer.fontFamily}
        fill={layer.color}
        align={layer.align}
        draggable
        visible={!isEditing}
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={handleDblClick}
        onDblTap={handleDblClick}
        onDragEnd={(e) => {
          onChange({
            position: {
              x: e.target.x() / canvasSize.width,
              y: e.target.y() / canvasSize.height,
            },
          })
        }}
        onTransformEnd={() => {
          const node = textRef.current
          onChange({ fontSize: Math.round(layer.fontSize * node.scaleY()) })
          node.scaleX(1)
          node.scaleY(1)
        }}
      />
      {isSelected && !isEditing && (
        <Transformer
          ref={trRef}
          enabledAnchors={['middle-left', 'middle-right']}
          boundBoxFunc={(oldBox, newBox) => newBox.width < 20 ? oldBox : newBox}
        />
      )}
    </>
  )
}

// 可拖拽图片组件
function DraggableImage({ screenshot, isSelected, onSelect, onChange, canvasSize }) {
  const imageRef = useRef()
  const trRef = useRef()
  const [image, setImage] = useState(null)

  useEffect(() => {
    const img = new window.Image()
    img.src = screenshot.imageData
    img.onload = () => setImage(img)
  }, [screenshot.imageData])

  useEffect(() => {
    if (isSelected && trRef.current && imageRef.current) {
      trRef.current.nodes([imageRef.current])
      trRef.current.getLayer().batchDraw()
    }
  }, [isSelected])

  if (!image) return null

  const scale = Math.min(
    (canvasSize.width * 0.8) / image.width,
    (canvasSize.height * 0.6) / image.height
  ) * screenshot.scale

  return (
    <>
      <Image
        ref={imageRef}
        image={image}
        x={canvasSize.width * screenshot.position.x}
        y={canvasSize.height * screenshot.position.y}
        offsetX={image.width / 2}
        offsetY={image.height / 2}
        scaleX={scale}
        scaleY={scale}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({
            position: {
              x: e.target.x() / canvasSize.width,
              y: e.target.y() / canvasSize.height,
            },
          })
        }}
        onTransformEnd={() => {
          const node = imageRef.current
          onChange({ scale: screenshot.scale * node.scaleX() / scale })
          node.scaleX(scale)
          node.scaleY(scale)
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          keepRatio={true}
          boundBoxFunc={(oldBox, newBox) => 
            (newBox.width < 20 || newBox.height < 20) ? oldBox : newBox
          }
        />
      )}
    </>
  )
}


export default function KonvaCanvas() {
  const containerRef = useRef(null)
  const stageRef = useRef(null)
  const [displayScale, setDisplayScale] = useState(1)
  const [selectedId, setSelectedId] = useState(null)
  const [showResizeHandles, setShowResizeHandles] = useState(false)

  const {
    canvases,
    activeCanvasIndex,
    syncSettings,
    updateScreenshot,
    updateTextLayer,
    setActiveScreenshot,
    setActiveTextLayer,
    toggleTextLayerSelection,
    clearTextLayerSelection,
    selectedTextLayerIds,
    setCanvasSize,
    setPendingSync,
  } = useCanvasStore()

  // 获取当前画布
  const currentCanvas = canvases[activeCanvasIndex]
  const { background, screenshot, textLayers, canvasSize } = currentCanvas
  const isMaster = activeCanvasIndex === 0

  // 响应容器尺寸变化
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return
      const container = containerRef.current
      const padding = 60
      const maxWidth = container.clientWidth - padding * 2
      const maxHeight = container.clientHeight - padding * 2
      const scaleX = maxWidth / canvasSize.width
      const scaleY = maxHeight / canvasSize.height
      setDisplayScale(Math.min(scaleX, scaleY, 1))
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [canvasSize])

  // Esc 键取消选择
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedId(null)
        clearTextLayerSelection()
        setActiveScreenshot(null)
        setShowResizeHandles(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [clearTextLayerSelection, setActiveScreenshot])

  // 点击空白处
  const handleStageClick = (e) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null)
      clearTextLayerSelection()
      setActiveScreenshot(null)
    }
  }

  // 处理同步逻辑
  const handleSyncCheck = useCallback((property, value) => {
    if (!isMaster) return // Slave 不触发同步
    
    const { batchMode, rememberChoice } = syncSettings
    const propertyType = property.split('.')[0]
    const result = shouldTriggerSync(activeCanvasIndex, batchMode, rememberChoice[propertyType])
    
    if (result.autoSync) {
      // 自动同步
      useCanvasStore.getState().syncToSlaves(property, value)
    } else if (result.showConfirm) {
      // 显示确认弹窗
      setPendingSync({ property, value, propertyType })
    }
  }, [isMaster, syncSettings, activeCanvasIndex, setPendingSync])

  // 获取背景填充
  const getBackgroundFill = useCallback(() => {
    return background.type === 'solid' ? background.color : '#ffffff'
  }, [background])

  // 暴露 stage 给导出功能
  useEffect(() => {
    window.konvaStage = stageRef.current
  }, [])

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center bg-surface-50 overflow-hidden p-8"
      onMouseEnter={() => setShowResizeHandles(true)}
      onMouseLeave={() => setShowResizeHandles(false)}
    >
      <div 
        className="relative bg-white rounded-lg shadow-xl overflow-visible"
        style={{
          transform: `scale(${displayScale})`,
          transformOrigin: 'center center',
        }}
      >
        {/* 画布尺寸调整手柄 */}
        {showResizeHandles && (
          <ResizeHandles
            width={canvasSize.width}
            height={canvasSize.height}
            scale={displayScale}
            onResize={(w, h) => setCanvasSize(w, h)}
            onResizeEnd={() => handleSyncCheck(SyncPropertyType.CANVAS_SIZE, { width: canvasSize.width, height: canvasSize.height })}
          />
        )}
        
        <Stage
          ref={stageRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onClick={handleStageClick}
          onTap={handleStageClick}
        >
          <Layer>
            {/* 背景 */}
            <Rect
              x={0}
              y={0}
              width={canvasSize.width}
              height={canvasSize.height}
              fill={getBackgroundFill()}
              listening={false}
            />

            {/* 渐变背景 */}
            {background.type === 'gradient' && background.gradient && (
              <Rect
                x={0}
                y={0}
                width={canvasSize.width}
                height={canvasSize.height}
                fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                fillLinearGradientEndPoint={{ x: 0, y: canvasSize.height }}
                fillLinearGradientColorStops={
                  background.gradient.colors.flatMap((color, i, arr) => [
                    i / (arr.length - 1),
                    color,
                  ])
                }
                listening={false}
              />
            )}

            {/* 截图 */}
            {screenshot && (
              <DraggableImage
                screenshot={screenshot}
                isSelected={selectedId === screenshot.id}
                canvasSize={canvasSize}
                onSelect={() => {
                  setSelectedId(screenshot.id)
                  setActiveScreenshot(screenshot.id)
                  setActiveTextLayer(null)
                }}
                onChange={(updates) => {
                  updateScreenshot(updates)
                  if (updates.position || updates.scale) {
                    handleSyncCheck(SyncPropertyType.SCREENSHOT_POSITION, {
                      position: updates.position || screenshot.position,
                      scale: updates.scale || screenshot.scale,
                    })
                  }
                }}
              />
            )}

            {/* 文字图层 */}
            {textLayers.map((layer, layerIndex) => (
              <EditableText
                key={layer.id}
                layer={layer}
                isSelected={selectedId === layer.id || selectedTextLayerIds.includes(layer.id)}
                canvasSize={canvasSize}
                onSelect={(e) => {
                  const isMultiSelect = e?.evt?.shiftKey
                  setSelectedId(layer.id)
                  toggleTextLayerSelection(layer.id, isMultiSelect)
                  setActiveScreenshot(null)
                }}
                onChange={(updates) => {
                  updateTextLayer(layer.id, updates)
                  if (updates.position || updates.fontSize || updates.color || updates.fontFamily) {
                    handleSyncCheck(SyncPropertyType.TEXT_STYLE, { layerIndex, style: updates })
                  }
                  if (updates.text !== undefined) {
                    handleSyncCheck(SyncPropertyType.TEXT_CONTENT, { 
                      layerIndex, 
                      placeholderText: '哈'.repeat(updates.text.length) 
                    })
                  }
                }}
              />
            ))}
          </Layer>
        </Stage>
        
        {/* Master 标识 */}
        {isMaster && (
          <div className="absolute -top-6 left-0 px-2 py-1 bg-blue-500 text-white text-xs rounded">
            模板画布
          </div>
        )}
      </div>
    </div>
  )
}
