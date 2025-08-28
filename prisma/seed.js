/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@tamilspicebazaar.com";
  const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!adminExists) {
    const hash = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        passwordHash: hash,
        role: "ADMIN",
      },
    });
    console.log("Seeded admin user (admin@tamilspicebazaar.com / admin123)");
  }

  const products = [
    { slug: "black-pepper", name: "Black Pepper", price: 29900, stock: 100, description: "Premium black pepper from Tamil Nadu.", images: JSON.stringify([]), affiliateCommission: 10 },
    { slug: "turmeric", name: "Turmeric", price: 19900, stock: 120, description: "Vibrant turmeric with high curcumin.", images: JSON.stringify([]), affiliateCommission: 10 },
    { slug: "chili-powder", name: "Chili Powder", price: 24900, stock: 80, description: "Fiery chili powder for bold flavors.", images: JSON.stringify([]), affiliateCommission: 12 },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }
  console.log("Seeded products");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
