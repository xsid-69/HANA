import 'dotenv/config'
import pg from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { users, companions, experiences, availabilities } from './schema.js'
import { eq } from 'drizzle-orm'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const db = drizzle(pool)

const COMPANIONS = [
  {
    email: 'priya.sharma@demo.hana.app',
    name: 'Priya Sharma',
    displayName: 'Priya',
    age: 24,
    city: 'Mumbai',
    district: 'Bandra',
    bio: 'Bollywood enthusiast and foodie from Bandra. I know every hidden café, street food stall, and sunset spot in Mumbai. Let me show you the city through a local\'s eyes!',
    languages: ['Hindi', 'English', 'Marathi'],
    tags: ['food', 'cafés', 'Bollywood', 'photography'],
    hourlyRate: 1200,
    photos: [
      'https://images.unsplash.com/photo-1610216705422-caa3fcb6d158?w=600&h=800&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&h=800&fit=crop&crop=face',
    ],
    experiences: [
      { name: 'Street Food Walk', emoji: '🍛' },
      { name: 'Café Hopping', emoji: '☕' },
      { name: 'Sunset at Marine Drive', emoji: '🌅' },
    ],
  },
  {
    email: 'ananya.iyer@demo.hana.app',
    name: 'Ananya Iyer',
    displayName: 'Ananya',
    age: 26,
    city: 'Bangalore',
    district: 'Koramangala',
    bio: 'Tech professional by day, art lover by evening. Bangalore\'s startup culture, craft beer scene, and live music venues are my playground. Let\'s explore together!',
    languages: ['Kannada', 'Tamil', 'English', 'Hindi'],
    tags: ['art', 'music', 'tech', 'craft beer'],
    hourlyRate: 1400,
    photos: [
      'https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?w=600&h=800&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=600&h=800&fit=crop&crop=face',
    ],
    experiences: [
      { name: 'Art Gallery Tour', emoji: '🎨' },
      { name: 'Live Music Night', emoji: '🎵' },
      { name: 'Brewery Hop', emoji: '🍺' },
    ],
  },
  {
    email: 'kavya.nair@demo.hana.app',
    name: 'Kavya Nair',
    displayName: 'Kavya',
    age: 23,
    city: 'Kochi',
    district: 'Fort Kochi',
    bio: 'Born in God\'s Own Country. I\'ll take you through spice markets, backwater sunsets, and authentic Kerala cuisine. Every moment with me is a postcard.',
    languages: ['Malayalam', 'English', 'Hindi'],
    tags: ['culture', 'backwaters', 'spices', 'cuisine'],
    hourlyRate: 900,
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800&fit=crop&crop=face',
    ],
    experiences: [
      { name: 'Spice Market Walk', emoji: '🌶️' },
      { name: 'Backwater Cruise', emoji: '🚣' },
      { name: 'Kerala Cuisine', emoji: '🍛' },
    ],
  },
  {
    email: 'meera.patel@demo.hana.app',
    name: 'Meera Patel',
    displayName: 'Meera',
    age: 27,
    city: 'Ahmedabad',
    district: 'Navrangpura',
    bio: 'Heritage walk guide and textile enthusiast. Ahmedabad\'s old city, pol houses, and vibrant fabric markets are my second home. UNESCO World Heritage, here we come!',
    languages: ['Gujarati', 'Hindi', 'English'],
    tags: ['heritage', 'textiles', 'history', 'architecture'],
    hourlyRate: 1000,
    photos: [
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop&crop=face',
    ],
    experiences: [
      { name: 'Heritage Walk', emoji: '🏛️' },
      { name: 'Textile Market', emoji: '🧵' },
      { name: 'Pol House Tour', emoji: '🏘️' },
    ],
  },
  {
    email: 'riya.singh@demo.hana.app',
    name: 'Riya Singh',
    displayName: 'Riya',
    age: 25,
    city: 'Delhi',
    district: 'Hauz Khas',
    bio: 'Delhi girl with a passion for history and street art. From Mughal monuments to Hauz Khas Village\'s indie cafés — I know every corner of this chaotic, beautiful city.',
    languages: ['Hindi', 'Punjabi', 'English'],
    tags: ['history', 'street art', 'cafés', 'monuments'],
    hourlyRate: 1300,
    photos: [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=800&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=800&fit=crop&crop=face',
    ],
    experiences: [
      { name: 'Monument Tour', emoji: '🕌' },
      { name: 'Street Art Walk', emoji: '🎭' },
      { name: 'Indie Café Crawl', emoji: '☕' },
    ],
  },
  {
    email: 'divya.krishnan@demo.hana.app',
    name: 'Divya Krishnan',
    displayName: 'Divya',
    age: 28,
    city: 'Chennai',
    district: 'Mylapore',
    bio: 'Classical Bharatanatyam dancer and Carnatic music lover. I\'ll introduce you to Chennai\'s rich cultural soul — temples, sabhas, filter coffee, and the Marina at dawn.',
    languages: ['Tamil', 'English', 'Telugu'],
    tags: ['classical dance', 'music', 'temples', 'culture'],
    hourlyRate: 1100,
    photos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=800&fit=crop&crop=face',
    ],
    experiences: [
      { name: 'Temple Walk', emoji: '🛕' },
      { name: 'Carnatic Concert', emoji: '🎶' },
      { name: 'Filter Coffee Tour', emoji: '☕' },
    ],
  },
  {
    email: 'sneha.desai@demo.hana.app',
    name: 'Sneha Desai',
    displayName: 'Sneha',
    age: 22,
    city: 'Pune',
    district: 'Koregaon Park',
    bio: 'Fitness coach and wellness enthusiast. Pune\'s hills, parks, and yoga studios are my playground. Let\'s start your day with a sunrise hike or a mindful morning walk!',
    languages: ['Marathi', 'Hindi', 'English'],
    tags: ['fitness', 'yoga', 'hiking', 'wellness'],
    hourlyRate: 950,
    photos: [
      'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&h=800&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=800&fit=crop&crop=face',
    ],
    experiences: [
      { name: 'Sunrise Hike', emoji: '🌄' },
      { name: 'Yoga Session', emoji: '🧘' },
      { name: 'Wellness Walk', emoji: '🌿' },
    ],
  },
  {
    email: 'aisha.khan@demo.hana.app',
    name: 'Aisha Khan',
    displayName: 'Aisha',
    age: 26,
    city: 'Hyderabad',
    district: 'Charminar',
    bio: 'Hyderabadi through and through. Biryani trails, pearl markets, Charminar evenings — I\'ll show you the Nizam\'s city in all its layered, fragrant glory.',
    languages: ['Urdu', 'Telugu', 'Hindi', 'English'],
    tags: ['biryani', 'pearls', 'history', 'food'],
    hourlyRate: 1050,
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop&crop=face',
    ],
    experiences: [
      { name: 'Biryani Trail', emoji: '🍚' },
      { name: 'Pearl Market', emoji: '💎' },
      { name: 'Charminar Evening', emoji: '🕌' },
    ],
  },
  {
    email: 'pooja.verma@demo.hana.app',
    name: 'Pooja Verma',
    displayName: 'Pooja',
    age: 29,
    city: 'Jaipur',
    district: 'Pink City',
    bio: 'Rajasthani royalty vibes, zero pretension. Palaces, block printing workshops, chai with a view — Jaipur is magical and I\'m your guide to every pink-walled secret.',
    languages: ['Rajasthani', 'Hindi', 'English'],
    tags: ['palaces', 'block printing', 'chai', 'royalty'],
    hourlyRate: 1150,
    photos: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop&crop=face',
    ],
    experiences: [
      { name: 'Palace Tour', emoji: '🏰' },
      { name: 'Block Print Workshop', emoji: '🖨️' },
      { name: 'Rooftop Chai', emoji: '🍵' },
    ],
  },
  {
    email: 'nisha.reddy@demo.hana.app',
    name: 'Nisha Reddy',
    displayName: 'Nisha',
    age: 24,
    city: 'Bangalore',
    district: 'Indiranagar',
    bio: 'Bookworm, coffee snob, and indie film lover. Bangalore\'s independent bookstores, specialty coffee roasters, and arthouse cinemas are my happy places.',
    languages: ['Telugu', 'Kannada', 'English', 'Hindi'],
    tags: ['books', 'coffee', 'indie films', 'art'],
    hourlyRate: 1250,
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=800&fit=crop&crop=face',
    ],
    experiences: [
      { name: 'Bookstore Crawl', emoji: '📚' },
      { name: 'Specialty Coffee', emoji: '☕' },
      { name: 'Arthouse Cinema', emoji: '🎬' },
    ],
  },
]

async function main() {
  console.log('Clearing old demo data...')
  await db.delete(experiences)
  await db.delete(availabilities)
  await db.delete(companions)
  await db.delete(users).where(
    eq(users.email, users.email) // we'll use a pattern below
  )

  // Delete demo users specifically
  for (const data of COMPANIONS) {
    await db.delete(users).where(eq(users.email, data.email))
  }

  console.log('Seeding 10 companions...')

  for (let i = 0; i < COMPANIONS.length; i++) {
    const data = COMPANIONS[i]

    const [user] = await db.insert(users).values({
      email: data.email,
      name: data.name,
      role: 'COMPANION',
      city: data.city,
      onboarded: true,
    }).onConflictDoNothing().returning()

    if (!user) {
      const [existing] = await db.select().from(users).where(eq(users.email, data.email)).limit(1)
      if (!existing) continue
      var userId = existing.id
    } else {
      var userId = user.id
    }

    const [companion] = await db.insert(companions).values({
      userId,
      displayName: data.displayName,
      age: data.age,
      city: data.city,
      district: data.district,
      bio: data.bio,
      languages: data.languages,
      photos: data.photos,
      tags: data.tags,
      hourlyRate: data.hourlyRate,
      isActive: true,
      isFeatured: i < 6,
      verificationStatus: 'VERIFIED',
      averageRating: +(4.2 + Math.random() * 0.75).toFixed(1),
      totalReviews: Math.floor(Math.random() * 30) + 8,
      totalBookings: Math.floor(Math.random() * 50) + 15,
    }).onConflictDoNothing().returning()

    if (!companion) continue

    for (const exp of data.experiences) {
      await db.insert(experiences).values({
        companionId: companion.id,
        name: exp.name,
        emoji: exp.emoji,
      })
    }

    for (let day = 1; day <= 6; day++) {
      await db.insert(availabilities).values({
        companionId: companion.id,
        dayOfWeek: day,
        startTime: '10:00',
        endTime: '21:00',
        isAvailable: true,
      }).onConflictDoNothing()
    }

    console.log(`  ✓ ${data.name} — ${data.city}`)
  }

  console.log('\nSeeding complete! 10 companions added.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => pool.end())
