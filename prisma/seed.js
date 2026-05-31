import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const COMPANIONS = [
  {
    email: 'yuki@demo.hana.app',
    name: 'Yuki Tanaka',
    displayName: 'Yuki',
    age: 26,
    city: 'Tokyo',
    district: 'Harajuku',
    bio: 'Fashion-forward local guide who loves exploring hidden cafés and vintage shops. Let me show you the Tokyo you won\'t find in guidebooks!',
    languages: ['Japanese', 'English'],
    tags: ['fashion', 'cafés', 'shopping', 'photography'],
    hourlyRate: 5000,
    photos: [
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop&crop=face',
    ],
    experiences: [
      { name: 'Café Hopping', emoji: '☕' },
      { name: 'Vintage Shopping', emoji: '🛍️' },
      { name: 'Photo Walk', emoji: '📸' },
    ],
  },
  {
    email: 'kenji@demo.hana.app',
    name: 'Kenji Sato',
    displayName: 'Kenji',
    age: 30,
    city: 'Tokyo',
    district: 'Shibuya',
    bio: 'Food enthusiast and amateur chef. I know every ramen shop, izakaya, and hidden gem in the city. Let\'s eat our way through Tokyo!',
    languages: ['Japanese', 'English', 'Korean'],
    tags: ['food', 'ramen', 'nightlife', 'cooking'],
    hourlyRate: 6000,
    photos: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&crop=face',
    ],
    experiences: [
      { name: 'Ramen Tour', emoji: '🍜' },
      { name: 'Izakaya Night', emoji: '🍶' },
      { name: 'Cooking Class', emoji: '👨‍🍳' },
    ],
  },
  {
    email: 'mika@demo.hana.app',
    name: 'Mika Yoshida',
    displayName: 'Mika',
    age: 24,
    city: 'Tokyo',
    district: 'Asakusa',
    bio: 'History and culture lover. I specialize in temple visits, tea ceremonies, and traditional arts. Perfect for those seeking an authentic experience.',
    languages: ['Japanese', 'English', 'French'],
    tags: ['culture', 'history', 'temples', 'tea ceremony'],
    hourlyRate: 5500,
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800&fit=crop&crop=face',
    ],
    experiences: [
      { name: 'Temple Tour', emoji: '⛩️' },
      { name: 'Tea Ceremony', emoji: '🍵' },
      { name: 'Art Galleries', emoji: '🎨' },
    ],
  },
  {
    email: 'ren@demo.hana.app',
    name: 'Ren Nakamura',
    displayName: 'Ren',
    age: 28,
    city: 'Tokyo',
    district: 'Roppongi',
    bio: 'Fitness coach and outdoor enthusiast. Whether it\'s hiking, cycling, or just a morning jog through the parks, I\'ll keep you energized!',
    languages: ['Japanese', 'English'],
    tags: ['fitness', 'outdoors', 'hiking', 'sports'],
    hourlyRate: 4500,
    photos: [
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&h=800&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop&crop=face',
    ],
    experiences: [
      { name: 'Park Run', emoji: '🏃' },
      { name: 'Hiking Trip', emoji: '🥾' },
      { name: 'Cycling Tour', emoji: '🚴' },
    ],
  },
  {
    email: 'sora@demo.hana.app',
    name: 'Sora Kimura',
    displayName: 'Sora',
    age: 27,
    city: 'Tokyo',
    district: 'Akihabara',
    bio: 'Gamer, anime fan, and tech geek. I\'ll take you to the best arcades, manga shops, and tech stores. Let\'s explore otaku culture together!',
    languages: ['Japanese', 'English'],
    tags: ['gaming', 'anime', 'tech', 'arcades'],
    hourlyRate: 4000,
    photos: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&h=800&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&h=800&fit=crop&crop=face',
    ],
    experiences: [
      { name: 'Arcade Night', emoji: '🎮' },
      { name: 'Manga Shops', emoji: '📚' },
      { name: 'Tech Tour', emoji: '🤖' },
    ],
  },
  {
    email: 'hana@demo.hana.app',
    name: 'Hana Watanabe',
    displayName: 'Hana',
    age: 25,
    city: 'Osaka',
    district: 'Dotonbori',
    bio: 'Osaka local with a passion for street food and comedy. I\'ll show you why Osaka is Japan\'s kitchen and make you laugh along the way!',
    languages: ['Japanese', 'English'],
    tags: ['food', 'comedy', 'nightlife', 'street food'],
    hourlyRate: 4500,
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=800&fit=crop&crop=face',
    ],
    experiences: [
      { name: 'Street Food Tour', emoji: '🍢' },
      { name: 'Comedy Show', emoji: '😂' },
      { name: 'Night Market', emoji: '🌙' },
    ],
  },
  {
    email: 'takumi@demo.hana.app',
    name: 'Takumi Honda',
    displayName: 'Takumi',
    age: 32,
    city: 'Kyoto',
    district: 'Gion',
    bio: 'Born and raised in Kyoto. I know every garden, shrine, and secret spot. Experience the elegance of Japan\'s ancient capital with me.',
    languages: ['Japanese', 'English', 'Mandarin'],
    tags: ['culture', 'gardens', 'shrines', 'meditation'],
    hourlyRate: 7000,
    photos: [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=800&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=800&fit=crop&crop=face',
    ],
    experiences: [
      { name: 'Garden Walk', emoji: '🌸' },
      { name: 'Shrine Visit', emoji: '🙏' },
      { name: 'Meditation', emoji: '🧘' },
    ],
  },
  {
    email: 'mai@demo.hana.app',
    name: 'Mai Suzuki',
    displayName: 'Mai',
    age: 23,
    city: 'Tokyo',
    district: 'Shimokitazawa',
    bio: 'Music lover and vinyl collector. I\'ll take you to the best live houses, record shops, and underground music scenes in Tokyo.',
    languages: ['Japanese', 'English'],
    tags: ['music', 'vinyl', 'live music', 'nightlife'],
    hourlyRate: 4500,
    photos: [
      'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&h=800&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop&crop=face',
    ],
    experiences: [
      { name: 'Live House', emoji: '🎵' },
      { name: 'Record Shopping', emoji: '💿' },
      { name: 'Jazz Bar', emoji: '🎷' },
    ],
  },
  {
    email: 'daiki@demo.hana.app',
    name: 'Daiki Morimoto',
    displayName: 'Daiki',
    age: 29,
    city: 'Tokyo',
    district: 'Ginza',
    bio: 'Business professional by day, social butterfly by night. Perfect companion for formal events, business dinners, or upscale dining experiences.',
    languages: ['Japanese', 'English', 'Spanish'],
    tags: ['business', 'dining', 'events', 'wine'],
    hourlyRate: 8000,
    photos: [
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=800&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?w=600&h=800&fit=crop&crop=face',
    ],
    experiences: [
      { name: 'Fine Dining', emoji: '🍷' },
      { name: 'Business Event', emoji: '💼' },
      { name: 'Wine Tasting', emoji: '🥂' },
    ],
  },
  {
    email: 'aoi@demo.hana.app',
    name: 'Aoi Fujimoto',
    displayName: 'Aoi',
    age: 26,
    city: 'Tokyo',
    district: 'Daikanyama',
    bio: 'Creative director and art lover. Museums, galleries, design shops — I\'ll curate a visual journey through Tokyo\'s artistic side.',
    languages: ['Japanese', 'English', 'Italian'],
    tags: ['art', 'design', 'museums', 'creative'],
    hourlyRate: 6000,
    photos: [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=800&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=800&fit=crop&crop=face',
    ],
    experiences: [
      { name: 'Museum Tour', emoji: '🖼️' },
      { name: 'Design Walk', emoji: '✏️' },
      { name: 'Gallery Hop', emoji: '🎭' },
    ],
  },
]

async function main() {
  console.log('Clearing old data...')
  await prisma.experience.deleteMany()
  await prisma.availability.deleteMany()
  await prisma.companion.deleteMany()
  await prisma.user.deleteMany({ where: { email: { endsWith: '@demo.hana.app' } } })

  console.log('Seeding database...')

  for (const data of COMPANIONS) {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        name: data.name,
        role: 'COMPANION',
        city: data.city,
      }
    })

    const companion = await prisma.companion.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
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
        isFeatured: COMPANIONS.indexOf(data) < 5,
        verificationStatus: 'VERIFIED',
        averageRating: 4.0 + Math.random() * 0.9,
        totalReviews: Math.floor(Math.random() * 20) + 5,
        totalBookings: Math.floor(Math.random() * 30) + 10,
      }
    })

    for (const exp of data.experiences) {
      await prisma.experience.create({
        data: {
          companionId: companion.id,
          name: exp.name,
          emoji: exp.emoji,
        }
      })
    }

    for (let day = 0; day < 7; day++) {
      if (day === 0) continue
      await prisma.availability.upsert({
        where: { companionId_dayOfWeek: { companionId: companion.id, dayOfWeek: day } },
        update: {},
        create: {
          companionId: companion.id,
          dayOfWeek: day,
          startTime: '10:00',
          endTime: '20:00',
          isAvailable: true,
        }
      })
    }

    console.log(`  Seeded: ${data.name}`)
  }

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
