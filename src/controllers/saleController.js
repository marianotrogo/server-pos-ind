import { generateTicketPDF } from "../utils/ticketGenerator.js"; // ← ruta ajustala según tu estructura
import prisma from "../prismaClient.js";

export const createSale = async (req, res) => {
  const { clientId, subtotal, discount, surcharge, total, paymentType, items, paymentDetails } = req.body;
  const userId = req.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Debe incluir al menos un producto en la venta" });
  }

  try {
    const lastSale = await prisma.sale.findFirst({ orderBy: { id: "desc" } });
    const number = `V-${(lastSale?.id || 0) + 1}`.padStart(5, "0");

    const sale = await prisma.sale.create({
      data: {
        number,
        clientId,
        userId,
        subtotal,
        discount,
        surcharge,
        total,
        paymentType,
        isExchange: items.some(i => i.isReturn),
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            code: item.code,
            description: item.description,
            size: item.size,
            price: item.price,
            qty: item.qty,
            subtotal: item.subtotal,
            isReturn: item.isReturn || false,
          })),
        },
        payments: {
          create: paymentDetails?.map((p) => ({
            type: p.type,
            amount: p.amount,
          })) || [],
        },
      },
      include: { client: true, user: true, items: true, payments: true },
    });

    // 🔄 Actualizar stock según tipo (venta o cambio)
    for (const item of items) {
      if (!item.variantId) continue;

      const variant = await prisma.variant.findUnique({
        where: { id: item.variantId },
      });
      if (!variant) continue;

      // Si es devolución o cambio → sumar stock
      if (item.isReturn || item.isExchange) {
        await prisma.variant.update({
          where: { id: item.variantId },
          data: { stock: variant.stock + item.qty },
        });

        await prisma.stockMovement.create({
          data: {
            variantId: item.variantId,
            type: "RETURN",
            qty: item.qty,
            reason: `Cambio / Devolución en venta #${number}`,
            userId,
          },
        });
      } else {
        // Si es venta normal → restar stock
        if (variant.stock < item.qty) {
          return res.status(400).json({
            message: `Stock insuficiente para ${item.description} (${variant.size})`,
          });
        }

        await prisma.variant.update({
          where: { id: item.variantId },
          data: { stock: variant.stock - item.qty },
        });

        await prisma.stockMovement.create({
          data: {
            variantId: item.variantId,
            type: "OUT",
            qty: item.qty,
            reason: `Venta #${number}`,
            userId,
          },
        });
      }
    }

    if (paymentType === "CCA" && clientId) {
      await prisma.client.update({
        where: { id: clientId },
        data: {
          balance: { increment: total }, // suma el total a la cuenta deudora
        },
      });
    }



    // ✅ Responder solo con la venta (sin PDF)
    return res.status(200).json({ sale });
  } catch (error) {
    console.error("Error al crear venta:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};



// 📜 Obtener lista de ventas (solo si querés ver historial)
export const getSales = async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        client: true,
        user: true,
        items: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(sales);
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    res.status(500).json({ message: "Error al obtener ventas" });
  }
};
// 📋 Obtener todas las ventas


// 🔍 Obtener venta por ID
export const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await prisma.sale.findUnique({
      where: { id: parseInt(id) },
      include: {
        client: true,
        user: true,
        items: true,
        payments: true,
      },
    });

    if (!sale) return res.status(404).json({ message: "Venta no encontrada" });
    res.json(sale);
  } catch (error) {
    console.error("Error al obtener venta:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

//  Actualizar venta (por ejemplo, descuento, recargo o estado)
export const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, discount, surcharge } = req.body;

    const sale = await prisma.sale.update({
      where: { id: parseInt(id) },
      data: { status, discount, surcharge },
      include: {
        client: true,
        user: true,
        items: true,
        payments: true,
      },
    });

    res.json(sale);
  } catch (error) {
    console.error("Error al actualizar venta:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

//  Cancelar una venta (sin borrarla, restaurando stock)
export const cancelSale = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const sale = await prisma.sale.findUnique({
      where: { id: parseInt(id) },
      include: { items: true },
    });

    if (!sale) return res.status(404).json({ message: "Venta no encontrada" });
    if (sale.status === "CANCELLED") {
      return res.status(400).json({ message: "La venta ya está cancelada" });
    }

    // 🔄 Revertir stock
    for (const item of sale.items) {
      if (item.variantId) {
        await prisma.variant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.qty } },
        });

        await prisma.stockMovement.create({
          data: {
            variantId: item.variantId,
            type: "RETURN",
            qty: item.qty,
            reason: `Cancelación de venta #${sale.number}`,
            userId,
          },
        });
      }
    }

    // 🧾 Actualizar estado de la venta
    const updatedSale = await prisma.sale.update({
      where: { id: sale.id },
      data: { status: "CANCELLED" },
      include: { client: true, user: true, items: true },
    });

    res.json({
      message: "Venta cancelada correctamente y stock restaurado",
      sale: updatedSale,
    });
  } catch (error) {
    console.error("Error al cancelar venta:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// 🗑️ Eliminar venta (opcional, si querés permitirlo)
export const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await prisma.sale.findUnique({
      where: { id: parseInt(id) },
    });

    if (!sale) return res.status(404).json({ message: "Venta no encontrada" });

    await prisma.payment.deleteMany({ where: { saleId: sale.id } });
    await prisma.saleItem.deleteMany({ where: { saleId: sale.id } });
    await prisma.sale.delete({ where: { id: sale.id } });

    res.json({ message: "Venta eliminada permanentemente" });
  } catch (error) {
    console.error("Error al eliminar venta:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getSalesReport = async (req, res) => {
  try {
    const { from, to, userId, clientId, status } = req.query;

    const where = {};
    if (from || to) where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
    if (userId) where.userId = parseInt(userId);
    if (clientId) where.clientId = parseInt(clientId);
    if (status) where.status = status;

    const sales = await prisma.sale.findMany({
      where,
      include: { client: true, user: true, payments: true, items: true },
      orderBy: { createdAt: "desc" },
    });

    // Opcional: resumen de totales
    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    const totalItems = sales.reduce((sum, s) => sum + s.items.length, 0);

    res.json({ sales, totalSales, totalItems });
  } catch (error) {
    console.error("Error al generar reporte:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
