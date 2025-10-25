import prisma from '../prismaClient.js';

// ✅ Crear categoría
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
      return res.status(400).json({ message: "La categoría ya existe" });
    }

    const category = await prisma.category.create({
      data: { name: name.trim() },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("Error al crear categoría:", error);
    res.status(500).json({ message: "Error al crear categoría" });
  }
};

// ✅ Listar todas las categorías
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { products: true },
      orderBy: { name: "asc" },
    });
    res.json(categories);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({ message: "Error al obtener categorías" });
  }
};

// ✅ Obtener categoría por ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: { products: true },
    });

    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.json(category);
  } catch (error) {
    console.error("Error al obtener categoría:", error);
    res.status(500).json({ message: "Error al obtener categoría" });
  }
};

// ✅ Actualizar categoría
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name: name.trim() },
    });

    res.json(category);
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    res.status(500).json({ message: "Error al actualizar categoría" });
  }
};

// ✅ Eliminar categoría (solo si no tiene productos asociados)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const products = await prisma.product.findMany({
      where: { categoryId: parseInt(id) },
    });

    if (products.length > 0) {
      return res.status(400).json({
        message: "No se puede eliminar una categoría con productos asociados",
      });
    }

    await prisma.category.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Categoría eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    res.status(500).json({ message: "Error al eliminar categoría" });
  }
};
