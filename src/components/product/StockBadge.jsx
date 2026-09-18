const stockLabels = {
  in: { label: 'متوفر', dot: 'bg-emerald-500', text: 'text-emerald-600' },
  low: { label: 'كمية محدودة', dot: 'bg-amber-500', text: 'text-amber-600' },
  out: { label: 'غير متوفر', dot: 'bg-red-500', text: 'text-red-600' },
}

export default function StockBadge({ stock, className = '' }) {
  const config = stockLabels[stock] || stockLabels.in
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold ${config.text} ${className}`}
    >
      <span className={`h-2 w-2 rounded-full ${config.dot} animate-pulse`} />
      {config.label}
    </span>
  )
}