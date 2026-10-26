// Idempotent: safe to run on every container start.
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const img = (s, w = 800) => `https://picsum.photos/seed/${s}/${w}/500`;
const CATEGORIES = ['Food & Café', 'Retail', 'Home Services', 'Health & Wellness', 'Crafts & Gifts', 'Education'];
// Same sample businesses as the frontend's src/data/demo.js
const BUSINESSES = [
  ['b1', 'Chai & Chapters', 'Food & Café', 'Pune', 'Book café serving single-estate teas and fresh bakes.', 4.8],
  ['b2', 'Kaveri Handlooms', 'Retail', 'Pune', 'Handwoven sarees and cotton wear from family looms.', 4.6],
  ['b3', 'FixIt Home Care', 'Home Services', 'Mumbai', 'Plumbing, electrical and appliance repair within 24 hours.', 4.4],
  ['b4', 'Prana Studio', 'Health & Wellness', 'Pune', 'Small-batch yoga and breathwork classes.', 4.9],
  ['b5', 'Clay & Co.', 'Crafts & Gifts', 'Nashik', 'Wheel-thrown ceramics and custom gift sets.', 4.7],
  ['b6', 'BrightPath Tutors', 'Education', 'Mumbai', 'Maths and science tutoring for grades 6–12.', 4.5],
  ['b7', 'Green Basket Grocers', 'Retail', 'Nashik', 'Organic produce delivered from farms nearby.', 4.3],
];

async function main() {
  const rounds = Number(process.env.BCRYPT_ROUNDS) || 10;

  for (const name of CATEGORIES) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }

  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    await prisma.user.upsert({
      where: { email: ADMIN_EMAIL.toLowerCase() },
      update: {}, // never overwrite an existing admin's password
      create: {
        name: process.env.ADMIN_NAME || 'Site Admin', email: ADMIN_EMAIL.toLowerCase(),
        passwordHash: await bcrypt.hash(ADMIN_PASSWORD, rounds), role: 'ADMIN',
      },
    });
    console.log(`Admin ready: ${ADMIN_EMAIL.toLowerCase()}`);
  } else {
    console.log('ADMIN_EMAIL / ADMIN_PASSWORD not set: skipping admin user.');
  }

  if (process.env.SEED_DEMO_DATA !== 'true') return;

  const demoPw = await bcrypt.hash(process.env.SEED_DEMO_PASSWORD || 'Demo@12345', rounds);
  await prisma.user.upsert({
    where: { email: 'customer@localbizhub.example' }, update: {},
    create: { name: 'Demo Customer', email: 'customer@localbizhub.example', passwordHash: demoPw, role: 'CUSTOMER' },
  });

  for (const [i, [key, name, category, location, description, rating]] of BUSINESSES.entries()) {
    const owner = await prisma.user.upsert({
      where: { email: `owner${i + 1}@localbizhub.example` }, update: {},
      create: { name: `${name} Owner`, email: `owner${i + 1}@localbizhub.example`, passwordHash: demoPw, role: 'OWNER' },
    });
    const cat = await prisma.category.findUnique({ where: { name: category } });
    const data = {
      name, description, location, rating, categoryId: cat.id, status: 'APPROVED',
      image: img(key), email: `hello@${key}.example`, phone: `+91 98765 4321${i}`, hours: 'Mon–Sat, 9am–7pm',
    };
    const biz = await prisma.business.upsert({ where: { ownerId: owner.id }, update: {}, create: { ...data, ownerId: owner.id } });
    if ((await prisma.product.count({ where: { businessId: biz.id } })) === 0) {
      await prisma.product.createMany({
        data: [1, 2, 3].map((n) => ({
          businessId: biz.id, name: `${name} – Offer ${n}`, price: 199 * n + 100, image: img(`${key}p${n}`, 400),
        })),
      });
    }
  }
  console.log('Demo data ready (owner1..owner7@localbizhub.example, customer@localbizhub.example).');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
