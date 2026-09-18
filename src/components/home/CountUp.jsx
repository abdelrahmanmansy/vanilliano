import { useEffect, useRef, useState } from 'react'

export default function CountUp({ end, duration = 1500, decimal = 0 }) {
  const [value, setValue] = useState(0)
  const rafRef = useRef()

  useEffect(() => {
    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(end * eased)
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [end, duration])

  return <>{value.toFixed(decimal)}</>
}