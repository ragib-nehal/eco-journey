/** "7:58 AM" from minutes after midnight. */
export function formatTime(totalMin: number): string {
  const hours24 = Math.floor(totalMin / 60) % 24
  const minutes = totalMin % 60
  const suffix = hours24 >= 12 ? 'PM' : 'AM'
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12
  return `${hours12}:${String(minutes).padStart(2, '0')} ${suffix}`
}

/** "$11.99" from integer cents. Whole dollars drop the cents: "$12". */
export function formatMoney(cents: number): string {
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  const dollars = Math.floor(abs / 100)
  const rest = abs % 100
  return `${sign}$${dollars}${rest === 0 ? '' : `.${String(rest).padStart(2, '0')}`}`
}

/** "+3" / "-2" style signed number. */
export function signed(value: number): string {
  return value > 0 ? `+${value}` : String(value)
}
