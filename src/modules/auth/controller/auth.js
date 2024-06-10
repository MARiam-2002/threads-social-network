import userModel from "../../../../DB/models/user.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import bcryptjs from "bcryptjs";
import generateTokenAndSetCookie from "../../../utils/generateTokenAndSetCookie.js";
// import jwt from "jsonwebtoken";
// import { sendEmail } from "../../../utils/sendEmails.js";
// import { resetPassword, signupTemp } from "../../../utils/generateHtml.js";
// import tokenModel from "../../../../DB/models/token.model.js";
// import randomstring from "randomstring";
// import cartModel from "../../../../DB/models/cart.model.js";

export const signup = asyncHandler(async (req, res, next) => {
  const { userName, email, password, name } = req.body;
  const isUser = await userModel.findOne({
    $or: [{ email }, { userName }],
  });
  if (isUser) {
    return next(new Error("User already exist", { cause: 400 }));
  }

  const hashPassword = bcryptjs.hashSync(
    password,
    Number(process.env.SALT_ROUND)
  );

  const user = await userModel.create({
    name,
    userName,
    email,
    password: hashPassword,
  });

  generateTokenAndSetCookie(user.id, res);
  return res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      userName: user.userName,
    },
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { userName, password } = req.body;
  const user = await userModel.findOne({ userName });

  const match = bcryptjs.compareSync(password, user?.password || "");
  if (!user || !match) {
    return next(new Error("Invalid userName or password", { cause: 400 }));
  }

  generateTokenAndSetCookie(user.id, res);
  return res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      userName: user.userName,
    },
  });
});

export const logout = asyncHandler(async (req, res, next) => {
  res.cookie("jwt", "", { maxAge: 1 });
  return res.status(200).json({ success: true, message: "Logged out!" });
});

export const followUnFollowUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userToModify = await userModel.findById(id);
  const currentUser = await userModel.findById(req.user._id);
  if (id.toString() === req.user._id.toString()) {
    return next(
      new Error("You can't follow/unfollow yourself!", { cause: 400 })
    );
  }
  if (!userToModify || !currentUser) {
    return next(new Error("User not found!", { cause: 404 }));
  }
  const isFollowing = currentUser.following.includes(id);
  if (isFollowing) {
    //unfollow user
    await userModel.findByIdAndUpdate(req.user._id, {
      $pull: { following: id },
    });
    await userModel.findByIdAndUpdate(id, {
      $pull: { followers: req.user._id },
    });
    return res
      .status(200)
      .json({ success: true, message: "User unfollowed successfully!" });
  } else {
    //follow user
    await userModel.findByIdAndUpdate(req.user._id, {
      $push: { following: id },
    });
    await userModel.findByIdAndUpdate(id, {
      $push: { followers: req.user._id },
    });
    return res
      .status(200)
      .json({ success: true, message: "User followed successfully!" });
  }
});

export const update = asyncHandler(async (req, res, next) => {
  const { name, email, password, userName, profileImage, bio } = req.body;
  const userId = req.user._id;
  let user = await userModel.findById(userId);
  if (!user) {
    return next(new Error("User not found!", { cause: 404 }));
  }
  if (req.params.id.toString() !== userId.toString()) {
    return next(
      new Error("You cannot update other user's profile ", { cause: 401 })
    );
  }
  if (password) {
    const hashPassword = bcryptjs.hashSync(
      password,
      Number(process.env.SALT_ROUND)
    );
    user.password = hashPassword;
  }
  user.name = name || user.name;
  user.email = email || user.email;
  user.userName = userName || user.userName;
  user.profileImage = profileImage || user.profileImage;
  user.bio = bio || user.bio;
  user = await user.save();
  return res
    .status(200)
    .json({ message: "profile updated successfully!", user });
});

export const getProfile = asyncHandler(async (req, res, next) => {
  const { userName } = req.params;
  const user = await userModel
    .findOne({ userName })
    .select("-password -updatedAt")
    .populate("followers", "name userName profileImage")
    .populate("following", "name userName profileImage");
  if (!user) {
    return next(new Error("User not found!", { cause: 404 }));
  }
  return res.status(200).json({ success: true, user });
});

