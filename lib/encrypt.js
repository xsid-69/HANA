import { createCipheriv, randomBytes } from 'node:crypto'

const ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 16

function getEncryptionKey() {
  const value = process.env.ENCRYPTION_KEY

  if (!value) {
    throw new Error('ENCRYPTION_KEY is not configured')
  }

  const key = Buffer.from(value, 'utf8')
  if (key.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 UTF-8 bytes')
  }

  return key
}

export function encrypt(plainText) {
  if (typeof plainText !== 'string') {
    throw new TypeError('encrypt expects a string')
  }

  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv)
  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ])

  return `v1:${iv.toString('hex')}:${encrypted.toString('hex')}`
}
