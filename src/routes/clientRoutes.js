import express from "express";
import {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
  registrarPago,
  historialCliente
} from "../controllers/clientController.js";

const router = express.Router();

// CRUD Clientes
router.get("/", getClientes);
router.get("/:id", getClienteById);
router.post("/", createCliente);
router.put("/:id", updateCliente);
router.delete("/:id", deleteCliente);

// Cuenta corriente
router.get("/:id/historial", historialCliente); // historial de ventas CCA
router.post("/:id/pago", registrarPago); // registrar pago, decrementa balance

export default router;
