import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || "admin").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "kode-admin";

const img = (seed: string) =>
  `https://picsum.photos/seed/${seed}/800/1000`;

const TEE_CHART = {
  columns: ["Size", "Chest (in)", "Length (in)", "Sleeve (in)"],
  rows: [
    ["S", "38", "27", "8"],
    ["M", "40", "28", "8.5"],
    ["L", "42", "29", "9"],
    ["XL", "44", "30", "9.5"],
  ],
};

const TROUSER_CHART = {
  columns: ["Size", "Waist (in)", "Length (in)", "Hip (in)"],
  rows: [
    ["30", "30", "40", "38"],
    ["32", "32", "41", "40"],
    ["34", "34", "41.5", "42"],
    ["36", "36", "42", "44"],
  ],
};

async function main() {
  // ---- admin ----
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.admin.upsert({
    where: { username: ADMIN_USERNAME },
    update: { passwordHash },
    create: { username: ADMIN_USERNAME, passwordHash },
  });
  console.log(`Admin ready → username: ${ADMIN_USERNAME} / password: ${ADMIN_PASSWORD}`);

  // ---- settings ----
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      storeName: "KODE",
      deliveryInsideDhaka: 60,
      deliveryOutsideDhaka: 120,
      freeDeliveryThreshold: 2500,
    },
  });

  // ---- categories ----
  const categoryData = [
    { name: "T-Shirts", slug: "t-shirts", sortOrder: 1 },
    { name: "Shirts", slug: "shirts", sortOrder: 2 },
    { name: "Trousers", slug: "trousers", sortOrder: 3 },
    { name: "Outerwear", slug: "outerwear", sortOrder: 4 },
    { name: "Accessories", slug: "accessories", sortOrder: 5 },
  ];
  const cats: Record<string, number> = {};
  for (const c of categoryData) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, sortOrder: c.sortOrder },
      create: { ...c, imageUrl: img(`kode-cat-${c.slug}`) },
    });
    cats[c.slug] = row.id;
  }

  // ---- products ----
  const products = [
    {
      slug: "essential-oversized-tee",
      name: "Essential Oversized Tee",
      description:
        "A heavyweight 240 GSM cotton tee with a relaxed, boxy fit. Pre-shrunk and built to keep its shape wash after wash.",
      price: 1290,
      discountPercent: 15,
      featured: true,
      freeDelivery: false,
      category: "t-shirts",
      sizes: ["S", "M", "L", "XL"],
      sizeChart: TEE_CHART,
    },
    {
      slug: "core-crew-tee",
      name: "Core Crew Tee",
      description:
        "The everyday crew neck in soft combed cotton. Clean lines, no logos, just a perfect basic.",
      price: 950,
      discountPercent: 0,
      featured: true,
      freeDelivery: true,
      category: "t-shirts",
      sizes: ["S", "M", "L", "XL"],
      sizeChart: TEE_CHART,
    },
    {
      slug: "linen-blend-shirt",
      name: "Linen-Blend Shirt",
      description:
        "Breathable linen-cotton shirt with a soft collar and mother-of-pearl buttons. Made for Dhaka summers.",
      price: 2190,
      discountPercent: 10,
      featured: true,
      freeDelivery: false,
      category: "shirts",
      sizes: ["M", "L", "XL"],
      sizeChart: TEE_CHART,
    },
    {
      slug: "oxford-button-down",
      name: "Oxford Button-Down",
      description:
        "A timeless oxford shirt in mid-weight cotton. Smart enough for work, easy enough for weekends.",
      price: 2490,
      discountPercent: 0,
      featured: false,
      freeDelivery: false,
      category: "shirts",
      sizes: ["M", "L", "XL"],
      sizeChart: TEE_CHART,
    },
    {
      slug: "tapered-chino",
      name: "Tapered Chino",
      description:
        "Stretch-cotton chinos with a modern tapered leg. Comfortable all-day with a clean finish.",
      price: 2890,
      discountPercent: 20,
      featured: true,
      freeDelivery: false,
      category: "trousers",
      sizes: ["30", "32", "34", "36"],
      sizeChart: TROUSER_CHART,
    },
    {
      slug: "relaxed-cargo-pant",
      name: "Relaxed Cargo Pant",
      description:
        "Utility-inspired cargo with a relaxed fit and reinforced pockets. Durable ripstop cotton.",
      price: 3190,
      discountPercent: 0,
      featured: false,
      freeDelivery: false,
      category: "trousers",
      sizes: ["30", "32", "34", "36"],
      sizeChart: TROUSER_CHART,
    },
    {
      slug: "overshirt-jacket",
      name: "Overshirt Jacket",
      description:
        "A structured cotton-twill overshirt that layers over a tee or under a coat. Year-round versatility.",
      price: 3990,
      discountPercent: 0,
      featured: true,
      freeDelivery: true,
      category: "outerwear",
      sizes: ["M", "L", "XL"],
      sizeChart: TEE_CHART,
    },
    {
      slug: "ribbed-beanie",
      name: "Ribbed Beanie",
      description:
        "A soft, snug ribbed beanie in a fine acrylic-wool blend. One size, easy fit.",
      price: 690,
      discountPercent: 0,
      featured: false,
      freeDelivery: true,
      category: "accessories",
      sizes: [],
      sizeChart: null,
    },
  ];

  // Only seed products if there are none yet (idempotent-ish, avoids dupes)
  const existing = await prisma.product.count();
  if (existing === 0) {
    for (const p of products) {
      await prisma.product.create({
        data: {
          slug: p.slug,
          name: p.name,
          description: p.description,
          price: p.price,
          discountPercent: p.discountPercent,
          featured: p.featured,
          freeDelivery: p.freeDelivery,
          active: true,
          categoryId: cats[p.category],
          images: [img(`kode-${p.slug}-1`), img(`kode-${p.slug}-2`)],
          sizes: p.sizes,
          sizeChart: p.sizeChart ?? undefined,
        },
      });
    }
    console.log(`Seeded ${products.length} products.`);
  } else {
    console.log(`Skipped product seed (${existing} already exist).`);
  }

  // ---- expense categories ----
  const expenseCategoryData = [
    { name: "Factory", color: "#b7892f", sortOrder: 1 },
    { name: "Raw materials", color: "#15803d", sortOrder: 2 },
    { name: "Salaries", color: "#1d4ed8", sortOrder: 3 },
    { name: "Utilities", color: "#0891b2", sortOrder: 4 },
    { name: "Marketing", color: "#7c3aed", sortOrder: 5 },
    { name: "Logistics", color: "#c2410c", sortOrder: 6 },
  ];
  const exCats: Record<string, number> = {};
  for (const c of expenseCategoryData) {
    const row = await prisma.expenseCategory.upsert({
      where: { name: c.name },
      update: { color: c.color, sortOrder: c.sortOrder },
      create: c,
    });
    exCats[c.name] = row.id;
  }

  // ---- sample expenses ----
  const existingExpenses = await prisma.expense.count();
  if (existingExpenses === 0) {
    const t = new Date();
    const day = (offset: number) =>
      new Date(
        Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate() - offset)
      );
    const sample = [
      { o: 1, amount: 45000, description: "Fabric purchase — 300m cotton", spentBy: "Rahim", category: "Raw materials" },
      { o: 3, amount: 18000, description: "Sewing machine servicing", spentBy: "Karim", category: "Factory" },
      { o: 6, amount: 120000, description: "Monthly worker salaries", spentBy: "Admin", category: "Salaries" },
      { o: 9, amount: 8500, description: "Electricity bill", spentBy: "Admin", category: "Utilities" },
      { o: 14, amount: 22000, description: "Facebook & Instagram ads", spentBy: "Nadia", category: "Marketing" },
      { o: 20, amount: 13500, description: "Courier & delivery charges", spentBy: "Sohel", category: "Logistics" },
      { o: 33, amount: 52000, description: "Buttons, zippers & trims", spentBy: "Rahim", category: "Raw materials" },
      { o: 38, amount: 120000, description: "Monthly worker salaries", spentBy: "Admin", category: "Salaries" },
      { o: 45, amount: 9200, description: "Water & gas bill", spentBy: "Admin", category: "Utilities" },
      { o: 62, amount: 67000, description: "Industrial cutter (capex)", spentBy: "Karim", category: "Factory" },
      { o: 70, amount: 30000, description: "Photoshoot for new collection", spentBy: "Nadia", category: "Marketing" },
    ];
    for (const s of sample) {
      await prisma.expense.create({
        data: {
          date: day(s.o),
          amount: s.amount,
          description: s.description,
          spentBy: s.spentBy,
          categoryId: exCats[s.category] ?? null,
        },
      });
    }
    console.log(`Seeded ${sample.length} expenses.`);
  } else {
    console.log(`Skipped expense seed (${existingExpenses} already exist).`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
