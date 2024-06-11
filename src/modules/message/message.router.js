// routes/auth.js
import { Router } from "express";
import * as messageController from "./controller/message.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
const router = Router();
router.get("/conversation", isAuthenticated, messageController.getConversations);
router.get("/:otherUserId", isAuthenticated, messageController.getMessages);
router.post("/send", isAuthenticated, messageController.sendMessage);


export default router;
