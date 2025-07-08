// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // 👤 Admin ve kullanıcı
  await prisma.user.createMany({
    data: [
      {
        name: "Admin",
        lastname: "User",
        email: "admin@example.com",
        phone: "5551112233",
        password: "admin123", // bcrypt ile hashlenmeli
        role: "admin",
      },
      {
        name: "Ali",
        lastname: "Kaya",
        email: "user@example.com",
        phone: "5552223344",
        password: "user123",
        role: "user",
      },
    ],
    skipDuplicates: true,
  });

  // 🏠 Odalar
  await prisma.room.createMany({
    data: [
      {
        name: "Zemin Kat",
        description: "Geniş ve ferah toplantı odası.",
        capacity: 10,
        floor: 0,
        status: "available",
      },
      {
        name: "1. Kat",
        description: "Bireysel çalışma alanı.",
        capacity: 4,
        floor: 1,
        status: "maintenance",
      },
    ],
    skipDuplicates: true,
  });

  // 📅 Haftalık rezervasyon saatleri
  const days = Array.from({ length: 5 }, (_, i) => i + 1); // Pazartesi–Cuma
  for (const day of days) {
    await prisma.reservationSettings.upsert({
      where: { dayOfWeek: day },
      update: {},
      create: {
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "16:00",
      },
    });
  }

  console.log("✅ Seed işlemi tamamlandı.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
