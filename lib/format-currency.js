const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const compactInrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function formatINR(value) {
  const amount = Number(value)
  return inrFormatter.format(Number.isFinite(amount) ? amount : 0)
}

export function formatSignedINR(value) {
  const amount = Number(value)
  const safeAmount = Number.isFinite(amount) ? amount : 0
  return `${safeAmount >= 0 ? '+' : '−'}${formatINR(Math.abs(safeAmount))}`
}

export function formatCompactINR(value) {
  const amount = Number(value)
  return compactInrFormatter.format(Number.isFinite(amount) ? amount : 0)
}