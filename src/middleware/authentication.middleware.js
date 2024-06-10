import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import userModel from "../../DB/models/user.model.js";
export const isAuthenticated = asyncHandler(async (req, res, next) => {
  let token = req.cookies.jwt;

  if (!token) {
    return next(new Error("valid token is required"));
  }

  const decode = jwt.verify(token, process.env.TOKEN_KEY);
  if (!decode) {
    return next(new Error("Invalid-token"));
  }

  const user = await userModel.findById(decode.userId).select("-password");

  if (!user) {
    return next(new Error("user not found!"));
  }

  req.user = user;
  return next();
});
