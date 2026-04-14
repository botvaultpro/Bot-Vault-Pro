const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateRoomCode(length = 6) {
  let code = ''
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  for (let i = 0; i < length; i++) {
    code += CHARS[array[i] % CHARS.length]
  }
  return code
}

export function normalizeRoomCode(input) {
  return input.toUpperCase().replace(/\s/g, '').trim()
}

export function isValidRoomCode(code) {
  const normalized = normalizeRoomCode(code)
  return normalized.length === 6 && /^[A-Z0-9]+$/.test(normalized)
}