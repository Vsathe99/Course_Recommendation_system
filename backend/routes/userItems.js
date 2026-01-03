import express from "express";
import { getSavedItems } from "../controllers/userSavedResourses.js";
import { getLikedItems } from "../controllers/userLikedResourses.js";

const router = express.Router();

router.get("/users/:userId/items/saved", getSavedItems);
router.get("/users/:userId/items/liked", getLikedItems);

export default router;
