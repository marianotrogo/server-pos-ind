import express from "express";
import { register, login, getProfile } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", verifyToken, getProfile);

router.get("/ping", (req, res) => {
  res.status(200).json({ ok: true });
});

export default router;

