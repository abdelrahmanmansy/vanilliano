import Button from './Button'

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-vanilla-200 bg-cream-100/60 text-center ${
        compact ? 'p-8' : 'p-14'
      }`}
    >
      {Icon && (
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-vanilla-100">
          <Icon className="h-9 w-9 text-burgundy-700" />
        </div>
      )}
      <h3 className="mb-2 text-lg font-black text-burgundy-950">{title}</h3>
      {description && (
        <p className="mb-6 max-w-md text-sm leading-relaxed text-burgundy-900/60">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}