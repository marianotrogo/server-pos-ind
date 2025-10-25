import prisma from "../prismaClient.js";

// Obtener todos los clientes
export const getClientes = async (req, res) => {
  try {
    const clientes = await prisma.client.findMany({
      orderBy: { name: "asc" },
    });
    res.json(clientes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener clientes" });
  }
};

// Obtener un cliente por id
export const getClienteById = async (req, res) => {
  const { id } = req.params;
  try {
    const cliente = await prisma.client.findUnique({
      where: { id: parseInt(id) },
      include: {
        sales: { 
          where: { paymentType: "CCA" },
          orderBy: { createdAt: "desc" } 
        }
      },
    });
    if (!cliente) return res.status(404).json({ message: "Cliente no encontrado" });
    res.json(cliente);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener cliente" });
  }
};

// Crear un nuevo cliente
export const createCliente = async (req, res) => {
  const { name, dni, phone, email, balance } = req.body;

  if (!name) return res.status(400).json({ message: "El nombre es obligatorio" });

  try {
    const cliente = await prisma.client.create({
      data: {
        name,
        dni: dni || null,
        phone: phone || null,
        email: email || null,
        balance: balance || 0,
      },
    });
    res.status(201).json(cliente);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al crear cliente" });
  }
};

// Editar cliente
export const updateCliente = async (req, res) => {
  const { id } = req.params;
  const { name, dni, phone, email, balance } = req.body;

  try {
    const cliente = await prisma.client.update({
      where: { id: parseInt(id) },
      data: {
        name,
        dni: dni || null,
        phone: phone || null,
        email: email || null,
        balance: balance ?? undefined, // si no viene balance, no lo toca
      },
    });
    res.json(cliente);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al actualizar cliente" });
  }
};

// Eliminar cliente
export const deleteCliente = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.client.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Cliente eliminado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al eliminar cliente" });
  }
};

// Registrar pago (disminuir saldo)
export const registrarPago = async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ message: "Monto inválido" });
  }

  try {
    const cliente = await prisma.client.update({
      where: { id: parseInt(id) },
      data: { balance: { decrement: parseFloat(amount) } },
    });
    res.json(cliente);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al registrar pago" });
  }
};

// Historial de ventas CCA del cliente
export const historialCliente = async (req, res) => {
  const { id } = req.params;
  try {
    const ventas = await prisma.sale.findMany({
      where: { clientId: parseInt(id), paymentType: "CCA" },
      orderBy: { createdAt: "desc" },
    });
    res.json(ventas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener historial" });
  }
};
