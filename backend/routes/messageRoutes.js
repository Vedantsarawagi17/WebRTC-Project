import express from "express"
import {
  allMessages,
  sendMessage,
} from "../controllers/messageControllers.js"
import { protect } from "../middleware/authMiddleware.js"

export const messageRoutes = express.Router();

messageRoutes.get("/:chatId", protect, allMessages);
messageRoutes.post("/", protect, sendMessage);