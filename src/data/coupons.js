export const coupons = [
  {
    code: 'WELCOME10',
    type: 'percent',
    value: 10,
    minOrder: 100,
    description: 'خصم 10% على أول طلب',
    limit: 1,
  },
  {
    code: 'SALE15',
    type: 'percent',
    value: 15,
    minOrder: 200,
    description: 'خصم 15% على الطلبات فوق 200 جنيه',
    limit: 0,
  },
  {
    code: 'FREE20',
    type: 'fixed',
    value: 20,
    minOrder: 150,
    description: 'خصم 20 جنيهاً على الطلبات فوق 150 جنيه',
    limit: 0,
  },
]

export function validateCoupon(code, subtotal, usedCodes = []) {
  const coupon = coupons.find(
    (c) => c.code.toLowerCase() === code.trim().toLowerCase(),
  )
  if (!coupon) return { valid: false, message: 'كود الخصم غير صحيح' }
  const normalized = coupon.code.toLowerCase()
  if (coupon.limit > 0 && usedCodes.includes(normalized)) {
    return { valid: false, message: 'تم استخدام هذا الكود من قبل' }
  }
  if (subtotal < coupon.minOrder) {
    return {
      valid: false,
      message: `الكود يتطلب طلباً بقيمة ${coupon.minOrder} جنيه على الأقل`,
    }
  }
  const discountValue =
    coupon.type === 'percent'
      ? Math.round(subtotal * (coupon.value / 100))
      : coupon.value
  return {
    valid: true,
    coupon,
    discountValue: Math.min(discountValue, subtotal),
    message: `تم تطبيق الخصم بنجاح`,
  }
}