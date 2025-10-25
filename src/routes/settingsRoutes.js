import express from "express";
import { getSettings, upsertSettings } from "../controllers/settingsController.js";

const router = express.Router();

router.get("/", getSettings);
router.post("/", upsertSettings);

export default router;
