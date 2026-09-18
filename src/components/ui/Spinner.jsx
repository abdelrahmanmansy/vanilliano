export default function Spinner({ size = 'md', label = 'جاري التحميل...' }) {
  const sizeClass =
    size === 'sm' ? 'h-5 w-5 border-2' : size === 'lg' ? 'h-10 w-10 border-4' : 'h-7 w-7 border-[3px]'
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div
        className={`${sizeClass} animate-spin rounded-full border-burgundy-200 border-t-burgundy-700`}
      />
      {label && <p className="text-sm text-burgundy-900/50">{label}</p>}
    </div>
  )
}