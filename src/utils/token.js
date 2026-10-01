// توكن شخصي للعميل = SHA-256 من رقم موبايله.
// نفس الحساب موجود في SQL (orders_by_token) عشان نقدر نجيب طلباته من غير ما يكتب أي حاجة.
const SALT = "vanilliano";

const digits = (value) => String(value || "").replace(/\D/g, "");

export async function phoneToken(phone) {
  const num = digits(phone);
  if (!num) return "";
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${SALT}|${num}`));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return "";
  }
}