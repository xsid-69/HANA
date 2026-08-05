const HOUR_MS = 60 * 60 * 1000
const configuredAcceleration = Number(process.env.NEXT_PUBLIC_SESSION_TIME_ACCELERATION)

export const SESSION_TIME_ACCELERATION = process.env.NODE_ENV === 'development'
  ? (Number.isFinite(configuredAcceleration) && configuredAcceleration > 0 ? configuredAcceleration : 24)
  : 1

export function scaleSessionDuration(durationMs) {
  return durationMs / SESSION_TIME_ACCELERATION
}

export function getSessionEndsAt(booking) {
  const startMs = new Date(booking?.verifiedAt).getTime()
  const durationHours = Number(booking?.durationHours)

  if (!Number.isFinite(startMs) || !Number.isFinite(durationHours) || durationHours <= 0) {
    return null
  }

  return new Date(startMs + scaleSessionDuration(durationHours * HOUR_MS))
}

export function getSessionClock(booking, serverNow = new Date()) {
  const sessionEndsAt = getSessionEndsAt(booking)
  return {
    sessionEndsAt: sessionEndsAt?.toISOString() ?? null,
    serverNow: serverNow.toISOString(),
  }
}

export function getClockOffset(serverNow) {
  const serverMs = new Date(serverNow).getTime()
  return Number.isFinite(serverMs) ? serverMs - Date.now() : 0
}
