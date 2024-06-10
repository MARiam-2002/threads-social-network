import postModel from "../../../DB/models/post.model.js";
import userModel from "../../../DB/models/user.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import cloudinary from "../../utils/cloud.js";

export const createPost = asyncHandler(async (req, res, next) => {
  const { postedBy, text } = req.body;
  if (!postedBy || !text) {
    return next(new Error("postedBy and text is required", { cause: 404 }));
  }
  const user = await userModel.findById(postedBy);
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  if (user._id.toString() !== req.user._id.toString()) {
    return next(
      new Error("You are not authorized to create post", { cause: 401 })
    );
  }
  const max = 500;
  if (text.length > max) {
    return next(
      new Error(`Text length should be less than ${max}`, { cause: 400 })
    );
  }
  const post = await postModel.create({
    postedBy,
    text,
  });
  if (req.file) {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.FOLDER_CLOUDINARY}/post/${post.postedBy}`,
      }
    );
    post.img = {
      id: public_id,
      url: secure_url,
    };
    await post.save();
  }

  return res.status(201).json({ success: true, data: post });
});

export const getPost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const post = await postModel.findById(id);
  if (!post) {
    return next(new Error("Post not found", { cause: 404 }));
  }
  return res.status(200).json({ success: true, data: post });
});

export const deletePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const post = await postModel.findById(id);
  if (!post) {
    return next(new Error("Post not found", { cause: 404 }));
  }
  if (post.postedBy.toString() !== req.user._id.toString()) {
    return next(
      new Error("You are not authorized to delete this post", { cause: 401 })
    );
  }
  if (post.img) {
    await cloudinary.uploader.destroy(post.img.id);
  }
  await postModel.findByIdAndDelete(id);
  return res.status(200).json({ success: true, message: "Post deleted" });
});

export const likeUnLikePost = asyncHandler(async (req, res, next) => {
  const { id: postId } = req.params;
  const userId = req.user._id;
  const post = await postModel.findById(postId);
  if (!post) {
    return next(new Error("Post not found", { cause: 404 }));
  }
  const userLikedPost = post.likes.includes(userId);
  console.log(userLikedPost);
  if (userLikedPost) {
    //Unlike post
    await postModel.updateOne({ _id: postId }, { $pull: { likes: userId } });
    return res.status(200).json({ success: true, message: "Post unliked" });
  } else {
    //Like post
    await postModel.updateOne({ _id: postId }, { $push: { likes: userId } });
    return res.status(200).json({ success: true, message: "Post liked" });
  }
});

export const replyToPost = asyncHandler(async (req, res, next) => {
  const { id: postId } = req.params;
  const { text } = req.body;
  const userId = req.user._id;
  const profileImage = req.user.profileImage;
  const userName = req.user.userName;

  if (!text) {
    return next(new Error("Text is required", { cause: 400 }));
  }
  const post = await postModel.findById(postId);

  if (!post) {
    return next(new Error("Post not found", { cause: 404 }));
  }
  const reply = {
    text,
    userId,
    userProfilePic: profileImage.url,
    userName,
  };
  post.replies.push(reply);
  await post.save();
  return res
    .status(200)
    .json({ success: true, message: "Reply added successfully!", post });
});

export const getFeedPosts = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const user = await userModel.findById(userId);
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  const following = user.following;
  const feePosts = await postModel
    .find({ postedBy: { $in: following } })
    .sort({ createdAt: -1 });
  return res.status(200).json({ success: true, feePosts });
});

export const getUserPosts = asyncHandler(async (req, res, next) => {
  const { userName } = req.params;
  const user = await userModel.findOne({ userName });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  const posts = await postModel
    .find({ postedBy: user._id })
    .sort({ createdAt: -1 });
  return res.status(200).json({ success: true, posts });
});
