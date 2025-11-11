import path from "path";
import { fileURLToPath } from "url";
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

// Manejo de errores global
process.on("uncaughtException", (err) => console.error("❌ Error no capturado:", err));
process.on("unhandledRejection", (reason) => console.error("⚠️ Promesa no manejada:", reason));
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("🧹 Prisma desconectado correctamente");
  process.exit(0);
});

// Middleware
app.use(cors());
app.use(express.json());



// Rutas
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";




app.use("/api/auth", authRoutes);
app.use("/api/productos", productRoutes);
app.use("/api/categorias", categoryRoutes);
app.use("/api/clientes", clientRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/admin", adminRoutes);

if (process.env.NODE_ENV === "production") {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  app.use(express.static(path.join(__dirname, "../client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}


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

// Iniciar servidor
async function startServer() {
  await ensureDefaultUser();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor en puerto ${PORT}`);
  });
}

startServer();
