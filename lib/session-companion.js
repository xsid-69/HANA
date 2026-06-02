// Saves the last viewed companion to sessionStorage so bookings page can pre-fill it
export function saveLastCompanion(companion) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem('hana_last_companion', JSON.stringify({
      id: companion.id,
      displayName: companion.displayName,
      age: companion.age,
      city: companion.city,
      district: companion.district,
      photos: companion.photos,
      averageRating: companion.averageRating,
      hourlyRate: companion.hourlyRate,
    }))
  } catch {}
}

export function getLastCompanion() {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem('hana_last_companion')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearLastCompanion() {
  if (typeof window === 'undefined') return
  try { sessionStorage.removeItem('hana_last_companion') } catch {}
}
