const stockLabels = {
  in: { label: 'متوفر', dot: 'bg-emerald-500', text: 'text-emerald-600' },
  low: { label: 'كمية محدودة', dot: 'bg-amber-500', text: 'text-amber-600' },
  out: { label: 'غير متوفر', dot: 'bg-red-500', text: 'text-red-600' },
}

export default function StockBadge({ stock, qty, className = '' }) {
  const soldOut = stock === 'out' || qty === 0
  const nearlyGone = !soldOut && typeof qty === 'number' && qty <= 5
  const key = soldOut ? 'out' : nearlyGone ? 'low' : stock
  const config = stockLabels[key] || stockLabels.in
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold ${config.text} ${className}`}
    >
      <span className={`h-2 w-2 rounded-full ${config.dot} animate-pulse`} />
      {config.label}
      {typeof qty === 'number' && !soldOut && qty <= 5 && ` (${qty})`}
    </span>
  )
}
