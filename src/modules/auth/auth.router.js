import { Router } from "express";
// import * as Validators from "./auth.validation.js";
// import { isValidation } from "../../middleware/validation.middleware.js";
import * as userController from "./controller/auth.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
const router = Router();
router.get("/profile/:query", userController.getProfile);
router.get("/suggested",isAuthenticated, userController.getSuggestedUsers);
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
router.put("/freeze",isAuthenticated,userController.freezeAccount)

export default router;
