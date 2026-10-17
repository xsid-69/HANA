export const MIN_ADULT_AGE = 18
export const MAX_COMPANION_AGE = 25
export const MAX_AGE_DIFFERENCE = 2
export const MAX_ACCOUNT_AGE = 100

export function isAdultAge(age) {
  return Number.isInteger(age) && age >= MIN_ADULT_AGE && age <= MAX_ACCOUNT_AGE
}

export function isCompanionAge(age) {
  return isAdultAge(age) && age <= MAX_COMPANION_AGE
}

export function getCompanionAgeRange(clientAge) {
  if (!isAdultAge(clientAge)) return null

  const min = Math.max(MIN_ADULT_AGE, clientAge - MAX_AGE_DIFFERENCE)
  const max = Math.min(MAX_COMPANION_AGE, clientAge + MAX_AGE_DIFFERENCE)
  return min <= max ? { min, max } : null
}

export function areAgesCompatible(clientAge, companionAge) {
  return Boolean(
    isAdultAge(clientAge) &&
    isCompanionAge(companionAge) &&
    Math.abs(clientAge - companionAge) <= MAX_AGE_DIFFERENCE
  )
}
