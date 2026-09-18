import { Minus, Plus } from 'lucide-react'

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
}) {
  const btnClass =
    size === 'sm'
      ? 'h-7 w-7'
      : size === 'lg'
        ? 'h-10 w-10'
        : 'h-8 w-8'

  return (
    <div
      className={`inline-flex items-center overflow-hidden rounded-full border border-vanilla-200 bg-white ${size === 'sm' ? 'text-sm' : size === 'lg' ? '' : ''}`}
    >
      <button
        type="button"
        aria-label="تقليل الكمية"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        className={`${btnClass} flex items-center justify-center text-burgundy-900 transition-colors hover:bg-burgundy-50 disabled:opacity-30`}
      >
        <Minus size={14} />
      </button>
      <span className="min-w-10 text-center text-sm font-black text-burgundy-950">
        {value}
      </span>
      <button
        type="button"
        aria-label="زيادة الكمية"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        className={`${btnClass} flex items-center justify-center text-burgundy-900 transition-colors hover:bg-burgundy-50 disabled:opacity-30`}
      >
        <Plus size={14} />
      </button>
    </div>
  )
}