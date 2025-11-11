import express from "express";
import { resetDatabase, resetTickets } from "../controllers/adminController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

// 🔒 Requieren login de admin
router.post("/reset-db", verifyToken, resetDatabase);
router.post("/reset-tickets", verifyToken, resetTickets);

export default router;
