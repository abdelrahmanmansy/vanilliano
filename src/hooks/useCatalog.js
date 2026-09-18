export function useCatalog(products) {
  const getById = (id) => products.find((p) => p.id === id)

  const byCategory = (categoryId) =>
    products.filter((p) => p.category === categoryId)

  const bestSellers = (limit = 8) =>
    products
      .filter((p) => p.badge === 'bestseller')
      .concat(products.filter((p) => p.badge !== 'bestseller').sort((a, b) => b.rating - a.rating))
      .slice(0, limit)

  const onSale = (limit) => {
    const list = products
      .filter((p) => p.discount > 0)
      .sort((a, b) => b.discount - a.discount)
    return limit ? list.slice(0, limit) : list
  }

  const newArrivals = (limit = 8) =>
    products
      .filter((p) => p.badge === 'new')
      .concat(products.filter((p) => p.badge !== 'new'))
      .slice(0, limit)

  const related = (product, limit = 4) =>
    products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, limit)

  return { getById, byCategory, bestSellers, onSale, newArrivals, related }
}