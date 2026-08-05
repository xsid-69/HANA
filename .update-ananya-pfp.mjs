import 'dotenv/config'
import pg from 'pg'

const imageUrl = 'https://i.pinimg.com/736x/3a/78/a2/3a78a22f637e8b155901548b9d5d1bd1.jpg'
const email = 'ananya.iyer@demo.hana.app'
const client = new pg.Client({ connectionString: process.env.DATABASE_URL })

try {
  await client.connect()
  await client.query('BEGIN')
  const result = await client.query(`
    SELECT u.id AS "userId", c.id AS "companionId", c.photos
    FROM users u
    JOIN companions c ON c."userId" = u.id
    WHERE u.email = $1
    FOR UPDATE
  `, [email])
  if (result.rowCount !== 1) throw new Error(`Expected one Ananya profile, found ${result.rowCount}`)
  const profile = result.rows[0]
  const photos = [imageUrl, ...(profile.photos || []).slice(1)]
  await client.query('UPDATE users SET image = $1, "updatedAt" = NOW() WHERE id = $2', [imageUrl, profile.userId])
  await client.query('UPDATE companions SET photos = $1, "updatedAt" = NOW() WHERE id = $2', [photos, profile.companionId])
  await client.query('COMMIT')
  console.log(`Updated Ananya profile image to ${imageUrl}`)
} catch (error) {
  await client.query('ROLLBACK').catch(() => {})
  throw error
} finally {
  await client.end()
}
