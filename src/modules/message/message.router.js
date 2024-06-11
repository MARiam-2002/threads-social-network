// routes/auth.js
import { Router } from "express";
import * as messageController from "./controller/message.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
const router = Router();
router.get(
  "/conversation",
  isAuthenticated,
  messageController.getConversations
);
router.get("/:otherUserId", isAuthenticated, messageController.getMessages);
router.post(
  "/send",
  isAuthenticated,
  fileUpload(filterObject.image).single("img"),
  messageController.sendMessage
);

export default router;
