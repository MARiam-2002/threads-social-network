import { Router } from "express";
import * as postController from "./post.js";
// import postValidation from "./post.validation.js";
// import { isValidation } from "../../middleware/validation.middleware.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
const router = Router();

router.post(
  "/create",
  isAuthenticated,
  fileUpload(filterObject.image).single("img"),
  postController.createPost
);
router.get("/feed", isAuthenticated, postController.getFeedPosts);
router.get("/:id", postController.getPost);
router.delete("/:id", isAuthenticated, postController.deletePost);
router.put("/like/:id", isAuthenticated, postController.likeUnLikePost);
router.put("/reply/:id", isAuthenticated, postController.replyToPost);

export default router;
