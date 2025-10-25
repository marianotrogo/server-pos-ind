import prisma from '../prismaClient.js';

// ✅ Crear producto
export const createProduct = async (req, res) => {
  try {
    const { code, description, price, cost, color, categoryId, variants } = req.body;

    const product = await prisma.product.create({
      data: {
        code,
        description,
        price: parseFloat(price),
        cost: cost ? parseFloat(cost) : null,
        color,
        categoryId: categoryId ? parseInt(categoryId) : null,
        variants: {
          create: variants?.map(v => ({
            size: v.size,
            stock: parseInt(v.stock),
            barcode: v.barcode || null,
          })) || [],
        },
      },
      include: { variants: true, category: true },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ message: 'Error al crear producto' });
  }
};

// ✅ Listar todos los productos
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { variants: true, category: true },
      orderBy: { id: 'desc' },
    });
    res.json(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

// ✅ Obtener producto por ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { variants: true, category: true },
    });

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ message: 'Error al obtener producto' });
  }
};

// ✅ Actualizar producto
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, description, price, cost, color, categoryId, variants } = req.body;

    // Primero borramos las variantes viejas y luego creamos las nuevas
    await prisma.variant.deleteMany({
      where: { productId: parseInt(id) },
    });

    const updated = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        code,
        description,
        price: parseFloat(price),
        cost: cost ? parseFloat(cost) : null,
        color,
        categoryId: categoryId ? parseInt(categoryId) : null,
        variants: {
          create: variants?.map(v => ({
            size: v.size,
            stock: parseInt(v.stock),
            barcode: v.barcode || null,
          })) || [],
        },
      },
      include: { variants: true, category: true },
    });

    res.json(updated);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
};

// ✅ Eliminar producto
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.variant.deleteMany({
      where: { productId: parseInt(id) },
    });

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
};


// ✅ Buscar productos por código o descripción
export const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.json([]); // si no hay query, devolvemos vacío
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { code: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      include: { variants: true },
      take: 30, // limitar resultados
    });

    res.json(products);
  } catch (error) {
    console.error("Error en búsqueda de productos:", error);
    res.status(500).json({ message: "Error al buscar productos" });
  }
};
