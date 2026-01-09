import { forwardRef } from 'react'

const Input = forwardRef(({ 
  label,
  error,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-surface-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full px-3 py-2 text-sm
          bg-white border border-surface-200 rounded-lg
          placeholder:text-surface-400
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          disabled:bg-surface-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
