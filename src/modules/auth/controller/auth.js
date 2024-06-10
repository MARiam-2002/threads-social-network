import userModel from "../../../../DB/models/user.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import bcryptjs from "bcryptjs";
import generateTokenAndSetCookie from "../../../utils/generateTokenAndSetCookie.js";
import cloudinary from "../../../utils/cloud.js";
import mongoose from "mongoose";
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
      bio: user.bio,
      profileImage: user.profileImage,
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
      bio: user.bio,
      profileImage: user.profileImage,
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
  if (req.file) {
    if (
      user.profileImage.id ==
      "ecommerceDefaults/user/png-clipart-user-profile-facebook-passport-miscellaneous-silhouette_aol7vc"
    ) {
      const { public_id, secure_url } = await cloudinary.uploader.upload(
        req.file.path,
        {
          folder: `${process.env.FOLDER_CLOUDINARY}/user/${user._id}`,
        }
      );
      user.profileImage.url = secure_url;
      user.profileImage.id = public_id;
    } else {
      const { public_id, secure_url } = await cloudinary.uploader.upload(
        req.file.path,
        {
          public_id: user.profileImage.id,
        }
      );
      user.profileImage.url = secure_url;
    }
  }
  user.name = name || user.name;
  user.email = email || user.email;
  user.userName = userName || user.userName;
  user.bio = bio || user.bio;
  user = await user.save();
  const userUpdated = await userModel.findById(user._id).select("-password");
  return res
    .status(200)
    .json({ message: "profile updated successfully!", userUpdated });
});

export const getProfile = asyncHandler(async (req, res, next) => {
  const { query } = req.params;
  let user;
  if (mongoose.Types.ObjectId.isValid(query)) {
    user = await userModel
      .findOne({ _id: query })
      .select("-password -createdAt");
  } else {
    user = await userModel
      .findOne({
        userName: query,
      })
      .select("-password -createdAt");
  }
  if (!user) {
    return next(new Error("User not found!", { cause: 404 }));
  }
  return res.status(200).json({ success: true, user });
});
