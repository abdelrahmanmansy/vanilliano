export default function SectionHeader({ title, subtitle, centered = false }) {
  return (
    <div className={`mb-10 ${centered ? 'text-center' : ''}`}>
      <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-vanilla-100 px-4 py-1 text-xs font-bold text-burgundy-700">
        <span className="h-1.5 w-1.5 rounded-full bg-burgundy-700" />
        فانيليانو
      </span>
      <h2 className="text-2xl font-black text-burgundy-950 md:text-3xl">
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-3 max-w-2xl text-sm leading-relaxed text-burgundy-900/60 ${
            centered ? 'mx-auto' : ''
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}