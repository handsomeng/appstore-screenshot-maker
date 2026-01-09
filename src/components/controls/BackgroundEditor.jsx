import { useCanvasStore } from '../../stores/canvasStore'
import { ColorPicker, Slider } from '../ui'
import { BACKGROUND_PRESETS } from '../../utils/presets'

export default function BackgroundEditor({ className = '' }) {
  const { background, setBackgroundColor, setBackgroundGradient, updateBackground } = useCanvasStore()

  const handlePresetClick = (preset) => {
    if (preset.type === 'solid') {
      setBackgroundColor(preset.color)
    } else if (preset.type === 'gradient') {
      setBackgroundGradient({
        type: preset.gradientType || 'linear',
        colors: preset.colors,
        angle: preset.angle || 180,
      })
    }
  }

  return (
    <div className={`p-4 space-y-4 ${className}`}>
      {/* 背景类型切换 */}
      <div>
        <label className="text-sm font-medium text-surface-700 mb-2 block">
          背景类型
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => updateBackground({ type: 'solid' })}
            className={`
              flex-1 py-2 px-3 text-sm rounded-lg border transition-colors
              ${background.type === 'solid'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-surface-200 hover:border-surface-300'
              }
            `}
          >
            纯色
          </button>
          <button
            onClick={() => updateBackground({ type: 'gradient' })}
            className={`
              flex-1 py-2 px-3 text-sm rounded-lg border transition-colors
              ${background.type === 'gradient'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-surface-200 hover:border-surface-300'
              }
            `}
          >
            渐变
          </button>
        </div>
      </div>

      {/* 纯色设置 */}
      {background.type === 'solid' && (
        <ColorPicker
          label="背景颜色"
          value={background.color}
          onChange={setBackgroundColor}
        />
      )}

      {/* 渐变设置 */}
      {background.type === 'gradient' && (
        <>
          <div className="space-y-3">
            <label className="text-sm font-medium text-surface-700 block">
              渐变颜色
            </label>
            <div className="flex gap-2">
              <ColorPicker
                value={background.gradient?.colors?.[0] || '#3b82f6'}
                onChange={(color) => {
                  const colors = [...(background.gradient?.colors || ['#3b82f6', '#8b5cf6'])]
                  colors[0] = color
                  setBackgroundGradient({ ...background.gradient, colors })
                }}
              />
              <ColorPicker
                value={background.gradient?.colors?.[1] || '#8b5cf6'}
                onChange={(color) => {
                  const colors = [...(background.gradient?.colors || ['#3b82f6', '#8b5cf6'])]
                  colors[1] = color
                  setBackgroundGradient({ ...background.gradient, colors })
                }}
              />
            </div>
          </div>

          <Slider
            label="渐变角度"
            value={background.gradient?.angle || 180}
            min={0}
            max={360}
            step={15}
            unit="°"
            onChange={(e) => {
              setBackgroundGradient({
                ...background.gradient,
                angle: parseInt(e.target.value, 10),
              })
            }}
          />
        </>
      )}

      {/* 预设背景 */}
      <div>
        <label className="text-sm font-medium text-surface-700 mb-2 block">
          预设背景
        </label>
        <div className="grid grid-cols-5 gap-2">
          {BACKGROUND_PRESETS.map((preset, index) => (
            <button
              key={index}
              onClick={() => handlePresetClick(preset)}
              title={preset.name}
              className="
                w-full aspect-square rounded-lg border border-surface-200
                hover:border-primary-500 hover:scale-105 transition-all
                overflow-hidden
              "
              style={{
                background: preset.type === 'solid'
                  ? preset.color
                  : `linear-gradient(${preset.angle || 180}deg, ${preset.colors.join(', ')})`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
