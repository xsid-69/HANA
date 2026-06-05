const listeners = new Map()

export function subscribe(userId, callback) {
  if (!listeners.has(userId)) {
    listeners.set(userId, new Set())
  }
  listeners.get(userId).add(callback)
  return () => {
    const set = listeners.get(userId)
    if (set) {
      set.delete(callback)
      if (set.size === 0) listeners.delete(userId)
    }
  }
}

export function publish(userId, event) {
  const set = listeners.get(userId)
  if (set) {
    for (const cb of set) {
      cb(event)
    }
  }
}
