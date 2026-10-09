import { calculateDiscount } from './format'

// يطبّق «خصم المنتج» على السعر الفعلي:
// - لو فيه «سعر قديم» أكبر من السعر => السعر الحالي بالفعل بعد الخصم (خصم تلقائي).
// - لو فيه نسبة خصم يدوية من اللوحة => ننزّل السعر بالنسبة، و«السعر القديم» يبقى هو السعر الأساسي.
// الدالة idempotent: تشغيلها أكتر من مرة مايغيّرش نتيجة (السعر القديم بيحميها).
export function normalizeProduct(product) {
  if (!product || typeof product !== 'object') return product

  const price = Number(product.price) || 0
  const oldPrice = Number(product.oldPrice) || 0
  const manual = Number(product.discount) || 0

  // خصم تلقائي محسوب من السعر القديم — السعر الحالي نهائي
  if (oldPrice > price) {
    return { ...product, price, oldPrice, discount: calculateDiscount(price, oldPrice) }
  }

  // خصم يدوي بنسبة على السعر الأساسي
  if (manual > 0) {
    const clamped = Math.min(Math.max(manual, 0), 100)
    const effective = Math.round(price * (1 - clamped / 100) * 100) / 100
    return { ...product, price: effective, oldPrice: price, discount: clamped }
  }

  return { ...product, price, discount: 0 }
}
