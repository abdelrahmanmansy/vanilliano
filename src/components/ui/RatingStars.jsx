import { Star, StarHalf } from 'lucide-react'

export default function RatingStars({ rating, size = 15, showValue = false }) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating - fullStars >= 0.4

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5" dir="ltr">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} size={size} className="fill-amber-400 text-amber-400" />
          }
          if (i === fullStars && hasHalf) {
            return (
              <span key={i} className="relative inline-flex">
                <Star size={size} className="text-amber-300" />
                <StarHalf
                  size={size}
                  className="absolute inset-0 fill-amber-400 text-amber-400"
                />
              </span>
            )
          }
          return <Star key={i} size={size} className="text-amber-300" />
        })}
      </div>
      {showValue && (
        <span className="text-xs font-bold text-burgundy-900">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}