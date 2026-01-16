import express from "express"
import {
  accessChat,
  fetchChats,
  createGroupChat,
  removeFromGroup,
  addToGroup,
  renameGroup,
} from "../controllers/chatControllers.js"
import { protect } from "../middleware/authMiddleware.js"

export const chatRoutes = express.Router();

chatRoutes.route("/group").post(protect, createGroupChat);
chatRoutes.route("/").post(protect, accessChat);
chatRoutes.route("/").get(protect, fetchChats);
chatRoutes.put("/rename", protect, renameGroup);
chatRoutes.put("/groupremove", protect, removeFromGroup);
chatRoutes.put("/groupadd", protect, addToGroup);
