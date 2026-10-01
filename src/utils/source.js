export const SOURCE_LABELS = {
  wa: 'واتساب',
  ig: 'إنستغرام',
  fb: 'فيسبوك',
  search: 'بحث جوجل',
  site: 'مباشر',
  other: 'منصة أخرى',
}

export const detectOrderSource = () => {
  try {
    const p = new URLSearchParams(window.location.search)
    const ref = (p.get('src') || p.get('ref') || p.get('utm_source') || '')
      .trim()
      .toLowerCase()
    if (ref) {
      if (ref === 'whatsapp' || ref === 'wa') return 'wa'
      if (ref === 'instagram' || ref === 'ig') return 'ig'
      if (ref === 'facebook' || ref === 'fb') return 'fb'
      return ref.slice(0, 20)
    }
    const r = String(document.referrer || '').toLowerCase()
    if (!r) return 'site'
    if (r.includes('instagram')) return 'ig'
    if (r.includes('facebook') || r.includes('fb.me')) return 'fb'
    if (r.includes('whatsapp') || r.includes('wa.me')) return 'wa'
    if (r.includes('google') || r.includes('bing') || r.includes('yahoo')) return 'search'
    return 'other'
  } catch {
    return 'site'
  }
}

export const sourceLabel = (code) => SOURCE_LABELS[code] || code || '—'