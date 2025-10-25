import express from "express";
import {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  cancelSale,
  deleteSale,
} from "../controllers/saleController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { permit } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Crear venta → CAJERO, VENDEDOR, ADMIN
router.post("/", verifyToken, permit("CAJERO", "VENDEDOR", "ADMIN"), createSale);

// Listar todas las ventas → ADMIN, CAJERO
router.get("/", verifyToken, permit("ADMIN", "CAJERO"), getSales);

// Ver una venta → ADMIN, CAJERO, VENDEDOR
router.get("/:id", verifyToken, permit("ADMIN", "CAJERO", "VENDEDOR"), getSaleById);

// Actualizar venta (status o montos) → ADMIN
router.put("/:id", verifyToken, permit("ADMIN"), updateSale);

// Cancelar venta (devolver stock, marcar como CANCELLED) → ADMIN, CAJERO
router.put("/:id/cancel", verifyToken, permit("ADMIN", "CAJERO"), cancelSale);

// Eliminar venta (opcional, sólo ADMIN)
router.delete("/:id", verifyToken, permit("ADMIN"), deleteSale);

export default router;
