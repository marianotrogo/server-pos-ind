import prisma from "../prismaClient.js";

// ✅ Obtener configuración del negocio
export const getSettings = async (req, res) => {
  try {
    const settings = await prisma.settings.findFirst();
    if (!settings) {
      return res.status(404).json({ message: "No se encontró configuración" });
    }
    res.json(settings);
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ✅ Crear o actualizar configuración
export const upsertSettings = async (req, res) => {
  const {
    businessName,
    address,
    phone,
    cuit,
    ivaCondition,
    headerText,
    footerText,
    logoUrl,
    qrLink,
  } = req.body;

  try {
    const existing = await prisma.settings.findFirst();

    const settings = existing
      ? await prisma.settings.update({
          where: { id: existing.id },
          data: {
            businessName,
            address,
            phone,
            cuit,
            ivaCondition,
            headerText,
            footerText,
            logoUrl,
            qrLink,
          },
        })
      : await prisma.settings.create({
          data: {
            businessName,
            address,
            phone,
            cuit,
            ivaCondition,
            headerText,
            footerText,
            logoUrl,
            qrLink,
          },
        });

    res.json(settings);
  } catch (error) {
    console.error("Error al guardar configuración:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
