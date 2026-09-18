const badgeStyles = {
  new: 'bg-emerald-500 text-white',
  bestseller: 'bg-burgundy-700 text-white',
  offer: 'bg-red-500 text-white',
}

export default function Badge({ type, children }) {
  const style = badgeStyles[type] || 'bg-vanilla-500 text-white'
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold shadow-sm ${style}`}
    >
      {children || BADGE_LABELS[type]}
    </span>
  )
}

export const BADGE_LABELS = {
  new: 'جديد',
  bestseller: 'الأكثر مبيعاً',
  offer: 'عرض',
}