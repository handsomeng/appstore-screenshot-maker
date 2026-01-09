import { useEffect, useRef, useState, useCallback } from 'react'
import { Stage, Layer, Rect, Text, Image, Transformer } from 'react-konva'
import { useCanvasStore } from '../../stores/canvasStore'

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
      if (e.key === 'Enter' && !e.shiftKey) {
        textarea.blur()
      }
      if (e.key === 'Escape') {
        textarea.blur()
      }
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
        offsetX={0}
        offsetY={0}
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
          onChange({
            fontSize: Math.round(layer.fontSize * node.scaleY()),
          })
          node.scaleX(1)
          node.scaleY(1)
        }}
      />
      {isSelected && !isEditing && (
        <Transformer
          ref={trRef}
          enabledAnchors={['middle-left', 'middle-right']}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20) {
              return oldBox
            }
            return newBox
          }}
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
          onChange({
            scale: screenshot.scale * node.scaleX() / scale,
          })
          node.scaleX(scale)
          node.scaleY(scale)
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          keepRatio={true}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox
            }
            return newBox
          }}
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

  const {
    background,
    screenshots,
    textLayers,
    canvasSize,
    updateScreenshot,
    updateTextLayer,
    setActiveScreenshot,
    setActiveTextLayer,
    toggleTextLayerSelection,
    clearTextLayerSelection,
    selectedTextLayerIds,
  } = useCanvasStore()

  // 响应容器尺寸变化，只调整显示缩放比例
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return

      const container = containerRef.current
      const padding = 60
      const maxWidth = container.clientWidth - padding * 2
      const maxHeight = container.clientHeight - padding * 2

      // 计算适合容器的缩放比例
      const scaleX = maxWidth / canvasSize.width
      const scaleY = maxHeight / canvasSize.height
      const scale = Math.min(scaleX, scaleY, 1) // 最大不超过 1

      setDisplayScale(scale)
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
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [clearTextLayerSelection, setActiveScreenshot])

  // 点击空白处取消选中
  const handleStageClick = (e) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null)
      clearTextLayerSelection()
      setActiveScreenshot(null)
    }
  }

  // 获取背景填充
  const getBackgroundFill = useCallback(() => {
    if (background.type === 'solid') {
      return background.color
    }
    return '#ffffff'
  }, [background])

  // 暴露 stage 给导出功能
  useEffect(() => {
    window.konvaStage = stageRef.current
  }, [])

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center bg-surface-50 overflow-hidden p-8"
    >
      <div 
        className="bg-white rounded-lg shadow-xl overflow-hidden"
        style={{
          transform: `scale(${displayScale})`,
          transformOrigin: 'center center',
        }}
      >
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
            {screenshots.map((screenshot) => (
              <DraggableImage
                key={screenshot.id}
                screenshot={screenshot}
                isSelected={selectedId === screenshot.id}
                canvasSize={canvasSize}
                onSelect={() => {
                  setSelectedId(screenshot.id)
                  setActiveScreenshot(screenshot.id)
                  setActiveTextLayer(null)
                }}
                onChange={(updates) => updateScreenshot(screenshot.id, updates)}
              />
            ))}

            {/* 文字图层 */}
            {textLayers.map((layer) => (
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
                onChange={(updates) => updateTextLayer(layer.id, updates)}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  )
}
