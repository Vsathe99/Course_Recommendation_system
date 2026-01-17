import express from "express";
import { getSavedItems } from "../controllers/userSavedResourses.js";
import { getLikedItems } from "../controllers/userLikedResourses.js";
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router();

router.get("/user/saved", protect, getSavedItems);
router.get("/user/liked", protect, getLikedItems);

export default router;
