require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const companions = await prisma.companion.findMany({
    include: {
      experiences: true
    }
  });
  console.log('Companions count:', companions.length);
  for (const c of companions) {
    console.log(`ID: ${c.id}`);
    console.log(`  Name: ${c.displayName}`);
    console.log(`  Bio: ${c.bio}`);
    console.log(`  Tags: ${JSON.stringify(c.tags)}`);
    console.log(`  Experiences:`, c.experiences.map(e => `${e.name} ${e.emoji}`));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
