import { forwardRef } from 'react'

const Slider = forwardRef(({ 
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  showValue = true,
  unit = '',
  onChange,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-sm font-medium text-surface-700">
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-sm text-surface-500">
              {value}{unit}
            </span>
          )}
        </div>
      )}
      <input
        ref={ref}
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        className="
          w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:bg-primary-600
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:hover:scale-110
        "
        {...props}
      />
    </div>
  )
})

Slider.displayName = 'Slider'

export default Slider
