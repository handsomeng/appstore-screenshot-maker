import { useState, useRef, useEffect } from 'react'

const presetColors = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', 
  '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
  '#6b7280', '#1f2937', '#fef3c7', '#dbeafe', '#fce7f3',
]

export default function ColorPicker({ 
  label,
  value = '#000000', 
  onChange,
  showPresets = true,
  className = '' 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const containerRef = useRef(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleColorChange = (color) => {
    setInputValue(color)
    onChange?.(color)
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setInputValue(newValue)
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange?.(newValue)
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-surface-700 mb-1.5">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-2 w-full px-3 py-2
          bg-white border border-surface-200 rounded-lg
          hover:border-surface-300 transition-colors
        "
      >
        <div 
          className="w-6 h-6 rounded border border-surface-200"
          style={{ backgroundColor: value }}
        />
        <span className="text-sm text-surface-700 uppercase">{value}</span>
      </button>

      {isOpen && (
        <div className="
          absolute z-50 mt-2 p-3 w-64
          bg-white rounded-lg shadow-lg border border-surface-200
        ">
          <input
            type="color"
            value={value}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-full h-32 cursor-pointer rounded"
          />
          
          <div className="mt-3">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="#000000"
              className="
                w-full px-3 py-2 text-sm
                border border-surface-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary-500
              "
            />
          </div>

          {showPresets && (
            <div className="mt-3">
              <p className="text-xs text-surface-500 mb-2">预设颜色</p>
              <div className="grid grid-cols-5 gap-2">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorChange(color)}
                    className={`
                      w-8 h-8 rounded border-2 transition-transform hover:scale-110
                      ${value === color ? 'border-primary-500' : 'border-surface-200'}
                    `}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
