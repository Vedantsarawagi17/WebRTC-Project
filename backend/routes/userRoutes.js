import express from "express"
import {
  registerUser,
  authUser,
  allUsers,
} from "../controllers/userControllers.js"
import { protect } from "../middleware/authMiddleware.js"

export const userRoutes = express.Router();

userRoutes.get("/", protect, allUsers);
userRoutes.post("/", registerUser);
userRoutes.post("/login", authUser);