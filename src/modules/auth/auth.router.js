import { Router } from "express";
// import * as Validators from "./auth.validation.js";
// import { isValidation } from "../../middleware/validation.middleware.js";
import * as userController from "./controller/auth.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
const router = Router();
router.get("/profile/:userName", userController.getProfile);
router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/logout", userController.logout);
router.post("/follow/:id", isAuthenticated, userController.followUnFollowUser);
router.put(
  "/update/:id",
  isAuthenticated,
  fileUpload(filterObject.image).single("imageProfile"),
  userController.update
);

export default router;
