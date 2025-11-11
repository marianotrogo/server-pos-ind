// src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

// Inicialización
dotenv.config();
const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Importar rutas
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Configurar rutas
app.use("/api/auth", authRoutes);
app.use("/api/productos", productRoutes);
app.use("/api/categorias", categoryRoutes);
app.use("/api/clientes", clientRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/admin", adminRoutes);

// Crear admin por defecto si no existe
async function ensureDefaultUser() {
  try {
    const existingUser = await prisma.user.findFirst();
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash("1234", 10);
      await prisma.user.create({
        data: {
          name: "Administrador",
          email: "admin@admin.com",
          password: hashedPassword,
          role: "ADMIN",
        },
      });
      console.log("✅ Admin creado: admin@admin.com / 1234");
    }
  } catch (err) {
    console.error("❌ Error al crear/verificar admin:", err);
  }
}

// Levantar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  await ensureDefaultUser();
});
