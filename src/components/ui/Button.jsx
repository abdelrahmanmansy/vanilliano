import { useState } from 'react'
import { Loader2 } from 'lucide-react'

const variants = {
  primary:
    'bg-burgundy-700 text-white hover:bg-burgundy-800 shadow-sm shadow-burgundy-900/20',
  secondary:
    'bg-vanilla-100 text-burgundy-900 hover:bg-vanilla-200 border border-vanilla-200',
  outline:
    'border border-burgundy-700 text-burgundy-700 hover:bg-burgundy-50',
  ghost: 'text-burgundy-900 hover:bg-burgundy-50',
  light: 'bg-white text-burgundy-900 hover:bg-vanilla-50 shadow-sm',
  dark: 'bg-burgundy-950 text-white hover:bg-burgundy-900',
  success: 'bg-green-600 text-white hover:bg-green-700 shadow-sm shadow-green-900/20',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  className = '',
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
}) {
  const [pending, setPending] = useState(false)
  const isLoading = loading || pending

  const handleClick = async (event) => {
    if (isLoading || disabled) return
    const result = onClick?.(event)
    if (result instanceof Promise) {
      try {
        setPending(true)
        await result
      } finally {
        setPending(false)
      }
    }
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={isLoading || disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-300 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        Icon && <Icon className="h-4 w-4" />
      )}
      {children}
    </button>
  )
}