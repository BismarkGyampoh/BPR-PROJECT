/* eslint-disable */
/* FreshCrate seed script.
   Run: npm run seed  (after `npx prisma generate && npx prisma db push`)
   CommonJS so it runs with plain `node` and picks up DATABASE_URL from .env. */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const path = require("path");

const dotenvPath = path.resolve(__dirname, "..", ".env");

// Ensure a DB url exists even when run without `prisma db push`'s env loading.
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

const prisma = new PrismaClient();

async function main() {
  // ---- Farms (BPR §3: partner farms across Greater Accra) ----
  const greenAcres = await prisma.farm.upsert({
    where: { id: "farm_green_acres" },
    update: {},
    create: {
      id: "farm_green_acres",
      name: "Green Acres Farm",
      contactPerson: "Ama Odo",
      phone: "+233200000001",
      location: "Sogakope outskirts",
      region: "Volta (Greater Accra supply)",
      certification: "GlobalGAP",
    },
  });

  const sunnyPatch = await prisma.farm.upsert({
    where: { id: "farm_sunny_patch" },
    update: {},
    create: {
      id: "farm_sunny_patch",
      name: "Sunny Patch Growers",
      contactPerson: "Yaw Boateng",
      phone: "+233200000002",
      location: "Krobol Square",
      region: "Eastern (Greater Accra supply)",
      certification: "Organic",
    },
  });

  // ---- Produce items (seasonal mix) ----
  const items = await Promise.all(
    [
      { name: "Tomatoes", category: "VEGETABLE", unit: "kg", unitPrice: 12.0 },
      { name: "Kale", category: "VEGETABLE", unit: "bunch", unitPrice: 5.0 },
      { name: "Carrots", category: "VEGETABLE", unit: "bunch", unitPrice: 4.0 },
      { name: "Red Onions", category: "VEGETABLE", unit: "kg", unitPrice: 6.0 },
      { name: "Mangoes", category: "FRUIT", unit: "pcs", unitPrice: 3.5 },
      { name: "Plantain", category: "FRUIT", unit: "hand", unitPrice: 5.0 },
      { name: "Bell Peppers", category: "VEGETABLE", unit: "bunch", unitPrice: 5.0 },
      { name: "Lettuce", category: "VEGETABLE", unit: "head", unitPrice: 3.0 },
      { name: "Coriander", category: "HERB", unit: "bunch", unitPrice: 2.0 },
      { name: "Free-range Eggs", category: "ADDON", unit: "tray", unitPrice: 30.0 },
      { name: "Wild Forest Honey", category: "ADDON", unit: "jar", unitPrice: 45.0 },
    ].map((p) =>
      prisma.produceItem.upsert({
        where: { name: p.name },
        update: { unitPrice: p.unitPrice, unit: p.unit, category: p.category, isActive: true },
        create: p,
      }),
    ),
  );
  const find = (n) => items.find((i) => i.name === n);

  // ---- Crate plans (BPR §4.4 pricing) ----
  const plans = await Promise.all(
    [
      {
        name: "SMALL",
        description: "1-2 person household (GH₵ 180–220)",
        basePrice: 200,
        maxItems: 6,
        items: [
          { produce: find("Tomatoes"), defaultQty: 2, isOptional: false },
          { produce: find("Kale"), defaultQty: 1, isOptional: false },
          { produce: find("Carrots"), defaultQty: 1, isOptional: true },
          { produce: find("Red Onions"), defaultQty: 1, isOptional: true },
          { produce: find("Mangoes"), defaultQty: 2, isOptional: true },
          { produce: find("Free-range Eggs"), defaultQty: 1, isOptional: true },
        ],
      },
      {
        name: "FAMILY",
        description: "3-5 person household (GH₵ 250–300)",
        basePrice: 275,
        maxItems: 10,
        items: [
          { produce: find("Tomatoes"), defaultQty: 3, isOptional: false },
          { produce: find("Kale"), defaultQty: 2, isOptional: false },
          { produce: find("Carrots"), defaultQty: 2, isOptional: false },
          { produce: find("Red Onions"), defaultQty: 1, isOptional: false },
          { produce: find("Mangoes"), defaultQty: 3, isOptional: true },
          { produce: find("Plantain"), defaultQty: 1, isOptional: true },
          { produce: find("Bell Peppers"), defaultQty: 1, isOptional: true },
          { produce: find("Lettuce"), defaultQty: 1, isOptional: true },
          { produce: find("Free-range Eggs"), defaultQty: 2, isOptional: true },
          { produce: find("Wild Forest Honey"), defaultQty: 1, isOptional: true },
        ],
      },
      {
        name: "PREMIUM",
        description: "Customisable selection (GH₵ 280–350)",
        basePrice: 310,
        maxItems: 12,
        items: [
          { produce: find("Tomatoes"), defaultQty: 3, isOptional: false },
          { produce: find("Kale"), defaultQty: 2, isOptional: false },
          { produce: find("Carrots"), defaultQty: 2, isOptional: false },
          { produce: find("Red Onions"), defaultQty: 2, isOptional: false },
          { produce: find("Mangoes"), defaultQty: 3, isOptional: false },
          { produce: find("Plantain"), defaultQty: 2, isOptional: false },
          { produce: find("Bell Peppers"), defaultQty: 1, isOptional: true },
          { produce: find("Lettuce"), defaultQty: 1, isOptional: true },
          { produce: find("Coriander"), defaultQty: 1, isOptional: true },
          { produce: find("Free-range Eggs"), defaultQty: 2, isOptional: true },
          { produce: find("Wild Forest Honey"), defaultQty: 1, isOptional: true },
        ],
      },
      {
        name: "RESTAURANT",
        description: "Bulk standardised crates for small restaurants",
        basePrice: 800,
        maxItems: 20,
        items: [
          { produce: find("Tomatoes"), defaultQty: 10, isOptional: false },
          { produce: find("Red Onions"), defaultQty: 5, isOptional: false },
          { produce: find("Carrots"), defaultQty: 8, isOptional: false },
          { produce: find("Bell Peppers"), defaultQty: 5, isOptional: false },
          { produce: find("Lettuce"), defaultQty: 4, isOptional: false },
          { produce: find("Free-range Eggs"), defaultQty: 6, isOptional: true },
        ],
      },
    ].map((p) =>
      prisma.cratePlan.upsert({
        where: { name: p.name },
        update: { description: p.description, basePrice: p.basePrice, maxItems: p.maxItems },
        create: {
          name: p.name,
          description: p.description,
          basePrice: p.basePrice,
          maxItems: p.maxItems,
          items: {
            create: p.items.map((i) => ({
              produceItem: { connect: { id: i.produce.id } },
              defaultQty: i.defaultQty,
              isOptional: i.isOptional,
            })),
          },
        },
      }),
    ),
  );

  // Link a couple of produce items to farms (farmer traceability, §8.2)
  await prisma.produceItem.update({ where: { name: "Tomatoes" }, data: { farmer: { connect: { id: greenAcres.id } } } });
  await prisma.produceItem.update({ where: { name: "Mangoes" }, data: { farmer: { connect: { id: sunnyPatch.id } } } });

  // ---- Users ----
  const adminPassword = await bcrypt.hash("admin1234", 12);
  await prisma.user.upsert({
    where: { phone: "+233240000000" },
    update: { password: adminPassword, role: "ADMIN" },
    create: {
      id: "usr_admin_seed",
      name: "FreshCrate Admin",
      phone: "+233240000000",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const custPassword = await bcrypt.hash("cust1234", 12);
  await prisma.user.upsert({
    where: { phone: "+233240000001" },
    update: { password: custPassword, role: "CUSTOMER" },
    create: {
      id: "usr_cust_seed",
      name: "Kwame Asante",
      phone: "+233240000001",
      password: custPassword,
      role: "CUSTOMER",
      address: {
        line1: "12 Osu Street",
        area: "Airport Residential",
        landmark: "Near British Consulate",
      },
    },
  });

  console.log("✅ FreshCrate seeded");
  console.log(`  - ${plans.length} crate plans`);
  console.log(`  - ${items.length} produce items`);
  console.log("  - admin: +233240000000 / admin1234");
  console.log("  - customer: +233240000001 / cust1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
