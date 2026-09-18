const base = (import.meta.env?.BASE_URL || '/').replace(/\/$/, '')

export const asset = (path = '') => {
  if (!path || path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path
  if (base && path.startsWith(base + '/')) return path
  return base + (path.startsWith('/') ? path : '/' + path)
}