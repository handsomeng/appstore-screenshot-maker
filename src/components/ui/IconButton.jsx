import { forwardRef } from 'react'

const variants = {
  default: 'text-surface-600 hover:bg-surface-100 active:bg-surface-200',
  primary: 'text-primary-600 hover:bg-primary-50 active:bg-primary-100',
  ghost: 'text-surface-500 hover:text-surface-700 hover:bg-surface-100',
}

const sizes = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
}

const IconButton = forwardRef(({ 
  children, 
  variant = 'default', 
  size = 'md',
  active = false,
  disabled = false,
  tooltip,
  className = '',
  ...props 
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled}
      title={tooltip}
      className={`
        inline-flex items-center justify-center rounded-lg transition-colors
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${active ? 'bg-primary-50 text-primary-600' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
})

IconButton.displayName = 'IconButton'

export default IconButton
