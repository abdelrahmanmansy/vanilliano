const base = (import.meta.env?.BASE_URL || '/').replace(/\/$/, '')

export const asset = (path = '') => {
  if (!path || path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path
  if (base && path.startsWith(base + '/')) return path
  return base + (path.startsWith('/') ? path : '/' + path)
}

// رابط كامل للموقع (الموقع منشور على /vanilliano/ فـ window.location.origin لوحده مش كافي)
export const siteUrl = (path = '') => {
  const suffix = String(path || '').replace(/^\//, '')
  return `${window.location.origin}${base}${suffix ? '/' + suffix : ''}`
}