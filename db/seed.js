import 'dotenv/config'
import pg from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { users, companions, experiences, availabilities, bookings, reviews, savedCompanions, notifications } from './schema.js'
import { eq, inArray } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const db = drizzle(pool)

// Password for all demo accounts: sid123
const DEMO_PASSWORD = await bcrypt.hash('sid123', 12)

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
      'https://i.pinimg.com/736x/43/90/83/439083cbd18d63796d151d7f738b74cc.jpg',
      'https://i.pinimg.com/736x/43/90/83/439083cbd18d63796d151d7f738b74cc.jpg',
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
      'https://www.shutterstock.com/image-photo/close-portrait-beautiful-young-attractive-260nw-1381098305.jpg',
      'https://www.shutterstock.com/image-photo/close-portrait-beautiful-young-attractive-260nw-1381098305.jpg',
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
      'https://i.pinimg.com/736x/b8/9f/f7/b89ff7c39099d61f6ccfb4067c2e81d4.jpg',
      'https://i.pinimg.com/736x/b8/9f/f7/b89ff7c39099d61f6ccfb4067c2e81d4.jpg',
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
      'https://i.pinimg.com/736x/ec/84/82/ec84824afe18d0f13510f650277b3d75.jpg',
      'https://i.pinimg.com/736x/ec/84/82/ec84824afe18d0f13510f650277b3d75.jpg',
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
      'https://i.pinimg.com/736x/dc/44/d9/dc44d9e4393b07f59defb727fa0418fe.jpg',
      'https://i.pinimg.com/736x/dc/44/d9/dc44d9e4393b07f59defb727fa0418fe.jpg',
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
      'https://i.pinimg.com/736x/a4/15/26/a41526d0f18cb8651313d6d3f8147c68.jpg',
      'https://i.pinimg.com/736x/a4/15/26/a41526d0f18cb8651313d6d3f8147c68.jpg',
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
      'https://i.pinimg.com/736x/e9/18/88/e91888f77157b857540f9af729d5bb97.jpg',
      'https://i.pinimg.com/736x/e9/18/88/e91888f77157b857540f9af729d5bb97.jpg',
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
      'https://i.pinimg.com/736x/bd/46/8a/bd468ad4a4d4c4829947ecde625b2676.jpg',
      'https://i.pinimg.com/736x/bd/46/8a/bd468ad4a4d4c4829947ecde625b2676.jpg',
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
    age: 24,
    city: 'Jaipur',
    district: 'Pink City',
    bio: 'Rajasthani royalty vibes, zero pretension. Palaces, block printing workshops, chai with a view — Jaipur is magical and I\'m your guide to every pink-walled secret.',
    languages: ['Rajasthani', 'Hindi', 'English'],
    tags: ['palaces', 'block printing', 'chai', 'royalty'],
    hourlyRate: 1150,
    photos: [
      'https://i.pinimg.com/736x/15/9c/8e/159c8e026339a803795b9ad49a7b4a89.jpg',
      'https://i.pinimg.com/736x/15/9c/8e/159c8e026339a803795b9ad49a7b4a89.jpg',
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
      'https://i.pinimg.com/1200x/1c/79/39/1c79392d74dd091fff607ecb82125f83.jpg',
      'https://i.pinimg.com/1200x/1c/79/39/1c79392d74dd091fff607ecb82125f83.jpg',
    ],
    experiences: [
      { name: 'Bookstore Crawl', emoji: '📚' },
      { name: 'Specialty Coffee', emoji: '☕' },
      { name: 'Arthouse Cinema', emoji: '🎬' },
    ],
  },
  // --- Maharashtrian Companions (5) ---
  {
    email: 'sakshi.kulkarni@demo.hana.app',
    name: 'Sakshi Kulkarni',
    displayName: 'Sakshi',
    age: 25,
    city: 'Pune',
    district: 'Shivajinagar',
    bio: 'Puneri mulgi with a love for theatre and Marathi literature. From Bal Gandharva Rang Mandir to hidden bookshops on FC Road — I\'ll show you Pune\'s cultured soul.',
    languages: ['Marathi', 'Hindi', 'English'],
    tags: ['theatre', 'literature', 'culture', 'history'],
    hourlyRate: 1000,
    photos: [
      'https://www.shutterstock.com/image-photo/ultra-realistic-indian-ai-girl-260nw-2735385401.jpg',
      'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&h=800&fit=crop&crop=face',
    ],
    experiences: [
      { name: 'Marathi Theatre Night', emoji: '🎭' },
      { name: 'FC Road Walk', emoji: '🚶' },
      { name: 'Shaniwar Wada Tour', emoji: '🏰' },
    ],
  },
  {
    email: 'rutuja.patil@demo.hana.app',
    name: 'Rutuja Patil',
    displayName: 'Rutuja',
    age: 23,
    city: 'Mumbai',
    district: 'Dadar',
    bio: 'Marathi manoos and street food queen. Dadar\'s flower market at dawn, vada pav trails, and Shivaji Park sunsets — experience authentic Mumbai with a local touch.',
    languages: ['Marathi', 'Hindi', 'English'],
    tags: ['street food', 'markets', 'local culture', 'photography'],
    hourlyRate: 1100,
    photos: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHfbAlP8VmQZhP5zd2XGkepdvnX6akiOa39v1C28LreA&s',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop&crop=face',
    ],
    experiences: [
      { name: 'Dadar Flower Market', emoji: '🌺' },
      { name: 'Vada Pav Trail', emoji: '🍔' },
      { name: 'Shivaji Park Evening', emoji: '🌇' },
    ],
  },
  {
    email: 'tanvi.joshi@demo.hana.app',
    name: 'Tanvi Joshi',
    displayName: 'Tanvi',
    age: 26,
    city: 'Kolhapur',
    district: 'Mahalaxmi',
    bio: 'Kolhapuri girl with fire in her soul. Temples, tambda-pandhra rassa trails, and wrestling akharas — I\'ll show you the warrior spirit of Maharashtra.',
    languages: ['Marathi', 'Hindi', 'English'],
    tags: ['food', 'temples', 'wrestling', 'tradition'],
    hourlyRate: 850,
    photos: [
      'https://www.shutterstock.com/image-photo/indian-girl-extra-long-hair-260nw-2564831521.jpg',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=800&fit=crop&crop=face',
    ],
    experiences: [
      { name: 'Mahalaxmi Temple', emoji: '🛕' },
      { name: 'Kolhapuri Misal Trail', emoji: '🍛' },
      { name: 'Rankala Lake Walk', emoji: '🌊' },
    ],
  },
  {
    email: 'gauri.deshpande@demo.hana.app',
    name: 'Gauri Deshpande',
    displayName: 'Gauri',
    age: 27,
    city: 'Nashik',
    district: 'Panchavati',
    bio: 'Wine lover from India\'s wine capital. Vineyard tours, Godavari ghats at sunrise, and the spiritual calm of Trimbakeshwar — Nashik is more than you think.',
    languages: ['Marathi', 'Hindi', 'English'],
    tags: ['wine', 'vineyards', 'spirituality', 'nature'],
    hourlyRate: 1050,
    photos: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMnWOj2OpOY5oFRe0tRHp0zBJK2yK4ebOZ3XCPTvmrLw&s',
      'https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?w=600&h=800&fit=crop&crop=face',
    ],
    experiences: [
      { name: 'Vineyard Tour', emoji: '🍷' },
      { name: 'Godavari Ghat Walk', emoji: '🌅' },
      { name: 'Sula Tasting', emoji: '🥂' },
    ],
  },
  {
    email: 'shruti.bhosale@demo.hana.app',
    name: 'Shruti Bhosale',
    displayName: 'Shruti',
    age: 24,
    city: 'Aurangabad',
    district: 'CIDCO',
    bio: 'History nerd living next to Ajanta-Ellora. Ancient caves, Bibi Ka Maqbara by moonlight, and Aurangabad\'s Mughlai food scene — let\'s time travel together.',
    languages: ['Marathi', 'Hindi', 'Urdu', 'English'],
    tags: ['history', 'caves', 'architecture', 'Mughlai food'],
    hourlyRate: 900,
    photos: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjphxLqbFSNL9IsdenUuDvQ8KPxwnCBuMh3YTLL6ww2w&s',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&h=800&fit=crop&crop=face',
    ],
    experiences: [
      { name: 'Ellora Caves Trip', emoji: '🏛️' },
      { name: 'Bibi Ka Maqbara', emoji: '🕌' },
      { name: 'Mughlai Food Walk', emoji: '🍗' },
    ],
  },
  // --- Nagpur Companions (5) ---
  {
    email: 'vaishnavi.thakre@demo.hana.app',
    name: 'Vaishnavi Thakre',
    displayName: 'Vaishnavi',
    age: 20,
    city: 'Nagpur',
    district: 'Sadar',
    bio: 'Sadar bazaar enthusiast and chai addict. From the busiest markets to quiet Japanese Garden mornings — I know every mood Nagpur has to offer.',
    languages: ['Marathi', 'Hindi', 'English'],
    tags: ['shopping', 'chai', 'gardens', 'walks'],
    hourlyRate: 750,
    photos: [
      'https://i.pinimg.com/736x/33/ce/27/33ce272727f138d964fcaa8acd5c465c.jpg',
      'https://i.pinimg.com/736x/33/ce/27/33ce272727f138d964fcaa8acd5c465c.jpg',
    ],
    experiences: [
      { name: 'Sadar Bazaar Tour', emoji: '🛍️' },
      { name: 'Japanese Garden Walk', emoji: '🌸' },
      { name: 'Chai & Samosa Trail', emoji: '☕' },
    ],
  },
  {
    email: 'nikita.borkar@demo.hana.app',
    name: 'Nikita Borkar',
    displayName: 'Nikita',
    age: 21,
    city: 'Nagpur',
    district: 'Civil Lines',
    bio: 'Wildlife lover and weekend trekker. Pench Tiger Reserve, Ambazari garden trails, and Seminary Hills sunsets — Nagpur\'s green side is my happy place.',
    languages: ['Marathi', 'Hindi', 'English'],
    tags: ['wildlife', 'trekking', 'nature', 'photography'],
    hourlyRate: 900,
    photos: [
      'https://i.pinimg.com/736x/b3/3f/4c/b33f4ce45db9bdffa88f7d73aa0fd418.jpg',
      'https://i.pinimg.com/736x/b3/3f/4c/b33f4ce45db9bdffa88f7d73aa0fd418.jpg',
    ],
    experiences: [
      { name: 'Ambazari Nature Walk', emoji: '🌿' },
      { name: 'Seminary Hills Sunset', emoji: '🌄' },
      { name: 'Pench Safari Plan', emoji: '🐅' },
    ],
  },
  {
    email: 'aditi.raut@demo.hana.app',
    name: 'Aditi Raut',
    displayName: 'Aditi',
    age: 26,
    city: 'Nagpur',
    district: 'Sitabuldi',
    bio: 'Foodie and Nagpur history buff. Sitabuldi Fort stories, zero-mile marker visits, and saoji food adventures — every outing with me is spicy and memorable!',
    languages: ['Marathi', 'Hindi', 'English', 'Varhadi'],
    tags: ['food', 'history', 'spicy cuisine', 'heritage'],
    hourlyRate: 850,
    photos: [
      'https://i.pinimg.com/originals/1d/29/af/1d29af4da1b34a29bc65ac649a69f6ea.jpg',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=800&fit=crop&crop=face',
    ],
    experiences: [
      { name: 'Saoji Food Trail', emoji: '🌶️' },
      { name: 'Sitabuldi Fort Tour', emoji: '🏰' },
      { name: 'Zero Mile Walk', emoji: '📍' },
    ],
  },
  {
    email: 'palak.wankhede@demo.hana.app',
    name: 'Palak Wankhede',
    displayName: 'Palak',
    age: 22,
    city: 'Nagpur',
    district: 'Manewada',
    bio: 'Café hopper and sunset chaser. Nagpur\'s growing café culture, Gorewada lake, and chill evening drives — if you want good vibes and great company, I\'m your person.',
    languages: ['Marathi', 'Hindi', 'English'],
    tags: ['cafés', 'sunsets', 'drives', 'vibes'],
    hourlyRate: 700,
    photos: [
      'https://i.pinimg.com/1200x/97/15/23/9715234a92184376bddecb8164da817d.jpg',
      'https://i.pinimg.com/1200x/97/15/23/9715234a92184376bddecb8164da817d.jpg',
    ],
    experiences: [
      { name: 'Café Hopping', emoji: '☕' },
      { name: 'Gorewada Lake', emoji: '🦜' },
      { name: 'Sunset Drive', emoji: '🚗' },
    ],
  },
]

const DEMO_EMAILS = COMPANIONS.map(c => c.email)

async function main() {
  console.log('Clearing old DEMO data only (preserving real user data)...')

  // Get demo companion IDs first
  const demoUsers = await db.select({ id: users.id })
    .from(users)
    .where(inArray(users.email, DEMO_EMAILS))

  const demoUserIds = demoUsers.map(u => u.id)

  if (demoUserIds.length > 0) {
    const demoCompanions = await db.select({ id: companions.id })
      .from(companions)
      .where(inArray(companions.userId, demoUserIds))

    const demoCompanionIds = demoCompanions.map(c => c.id)

    if (demoCompanionIds.length > 0) {
      // Delete only demo-related data
      await db.delete(reviews).where(inArray(reviews.companionId, demoCompanionIds))
      await db.delete(bookings).where(inArray(bookings.companionId, demoCompanionIds))
      await db.delete(savedCompanions).where(inArray(savedCompanions.companionId, demoCompanionIds))
      await db.delete(experiences).where(inArray(experiences.companionId, demoCompanionIds))
      await db.delete(availabilities).where(inArray(availabilities.companionId, demoCompanionIds))
      await db.delete(companions).where(inArray(companions.id, demoCompanionIds))
    }

    // Delete notifications for demo users
    await db.delete(notifications).where(inArray(notifications.userId, demoUserIds))

    // Delete demo users
    for (const email of DEMO_EMAILS) {
      await db.delete(users).where(eq(users.email, email))
    }
  }

  console.log('Seeding 19 companions...')

  for (let i = 0; i < COMPANIONS.length; i++) {
    const data = COMPANIONS[i]

    const [user] = await db.insert(users).values({
      email: data.email,
      name: data.name,
      image: data.photos[0], // Profile picture (pfp)
      password: DEMO_PASSWORD,
      role: 'COMPANION',
      city: data.city,
      onboarded: true,
      createdAt: new Date(),
      updatedAt: new Date(),
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
      createdAt: new Date(),
      updatedAt: new Date(),
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

  console.log('\nSeeding complete! 19 companions added.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => pool.end())
