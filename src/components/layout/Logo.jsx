import { Link } from 'react-router-dom'

function LogoMark({ size = 38 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="31" fill="#8e273d" />
      <circle cx="32" cy="32" r="31" fill="url(#grad)" />
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="#c47325" />
          <stop offset="100%" stopColor="#a93349" />
        </linearGradient>
      </defs>
      <g transform="rotate(-28 32 32)">
        <circle cx="32" cy="32" r="15" fill="#fdf6f0" />
        <circle cx="32" cy="32" r="7" fill="#db8c33" />
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * 45 * Math.PI) / 180
          const x = 32 + Math.cos(a) * 15
          const y = 32 + Math.sin(a) * 15
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="6.5"
              fill="#fdf6f0"
              stroke="#8e273d"
              strokeWidth="1"
            />
          )
        })}
      </g>
    </svg>
  )
}

export default function Logo({ size = 38, showTagline = true, to = '/' }) {
  return (
    <Link to={to} className="group flex items-center gap-2.5" aria-label="فانيليانو - الرئيسية">
      <span className="transition-transform duration-300 group-hover:rotate-12">
        <LogoMark size={size} />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className="font-black tracking-tight text-burgundy-950"
          style={{ fontSize: size * 0.62, fontFamily: 'Cairo, sans-serif' }}
        >
          Vanilliano
        </span>
        {showTagline && (
          <span
            className="font-bold text-burgundy-700/70"
            style={{ fontSize: size * 0.26 }}
          >
            فانيليانو · بيت الحلويات
          </span>
        )}
      </span>
    </Link>
  )
}