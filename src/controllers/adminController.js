import prisma from "../prismaClient.js";

// 🔹 Resetear completamente la base de datos
export const resetDatabase = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "No tienes permiso para esta acción" });
    }

    await prisma.payment.deleteMany();
    await prisma.saleItem.deleteMany();
    await prisma.sale.deleteMany();
    await prisma.variant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.client.deleteMany();
    await prisma.stockMovement.deleteMany();
    await prisma.settings.deleteMany();

    await prisma.$executeRawUnsafe(`DELETE FROM sqlite_sequence;`);

    res.json({ message: "Base de datos reseteada correctamente ✅" });
  } catch (error) {
    console.error("Error al resetear la base de datos:", error);
    res.status(500).json({ message: "Error interno al resetear la base de datos" });
  }
};

// 🔹 Solo reiniciar tickets (no borra productos ni clientes)
export const resetTickets = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "No tienes permiso para esta acción" });
    }

    await prisma.payment.deleteMany();
    await prisma.saleItem.deleteMany();
    await prisma.sale.deleteMany();

    // Reiniciar autoincremento de SQLite solo para la tabla de ventas
    await prisma.$executeRawUnsafe(`DELETE FROM sqlite_sequence WHERE name = 'Sale';`);

    res.json({ message: "Tickets reinicializados correctamente ✅" });
  } catch (error) {
    console.error("Error al reinicializar tickets:", error);
    res.status(500).json({ message: "Error interno al reinicializar tickets" });
  }
};
