import express from "express";
import {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  cancelSale,
  deleteSale,
  getSalesReport,
  downloadSalesReport,
} from "../controllers/saleController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { permit } from "../middlewares/roleMiddleware.js";

const router = express.Router();


router.post("/", verifyToken, permit("CAJERO", "VENDEDOR", "ADMIN"), createSale);

router.get("/", verifyToken, permit("ADMIN", "CAJERO"), getSales);

router.get("/report", verifyToken, permit("ADMIN", "CAJERO"), getSalesReport);

router.get("/report/download", verifyToken, permit("ADMIN", "CAJERO"), downloadSalesReport);

router.get("/:id", verifyToken, permit("ADMIN", "CAJERO", "VENDEDOR"), getSaleById);

router.put("/:id", verifyToken, permit("ADMIN"), updateSale);

router.put("/:id/cancel", verifyToken, permit("ADMIN", "CAJERO"), cancelSale);

router.delete("/:id", verifyToken, permit("ADMIN"), deleteSale);

export default router;
