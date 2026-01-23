// routes/llmRoutes.js
import express from "express";
import { getLlmSuggestions } from "../controllers/llmController.js";
import {protect} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/suggestions", protect, getLlmSuggestions);

export default router;
