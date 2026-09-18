import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function Breadcrumbs({ items }) {
  return (
    <nav
      aria-label="مسار التنقل"
      className="mb-6 flex items-center gap-1.5 text-xs text-burgundy-900/50"
    >
      <Link to="/" className="transition-colors hover:text-burgundy-700">
        الرئيسية
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1.5">
          <ChevronLeft size={12} className="rtl:rotate-180" />
          {item.to ? (
            <Link
              to={item.to}
              className="transition-colors hover:text-burgundy-700"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-bold text-burgundy-900">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}