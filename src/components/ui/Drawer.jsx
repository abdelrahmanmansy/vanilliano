import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  position = 'right',
}) {
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [open, onClose])

  if (!open) return null

  const panelClass =
    position === 'right'
      ? 'right-0 animate-slide-in-sheet'
      : 'left-0 animate-slide-in-panel'

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-burgundy-950/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <aside
        className={`absolute top-0 flex h-full w-full max-w-md flex-col bg-cream-50 shadow-2xl ${panelClass}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-vanilla-200 bg-white/80 px-6 py-4 backdrop-blur">
          <h2 className="text-lg font-black text-burgundy-950">{title}</h2>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-burgundy-50 text-burgundy-900 transition-colors hover:bg-burgundy-100"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="border-t border-vanilla-200 bg-white/70 px-6 py-4 backdrop-blur">
            {footer}
          </div>
        )}
      </aside>
    </div>,
    document.body,
  )
}