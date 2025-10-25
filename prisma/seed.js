// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordPlain = "admin123"; // ✅ Cambiá la contraseña que quieras
  const hashedPassword = await bcrypt.hash(passwordPlain, 10);

  // 🔹 Crear usuario ADMIN
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@pos.com" }, // si ya existe, lo actualiza
    update: {
      name: "Administrador",
      password: hashedPassword,
      role: "ADMIN",
    },
    create: {
      name: "Administrador",
      email: "admin@miempresa.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Usuario ADMIN creado o actualizado:", adminUser.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
