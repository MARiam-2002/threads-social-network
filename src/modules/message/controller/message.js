import conversationModel from "../../../../DB/models/conversation.model.js";
import messageModel from "../../../../DB/models/message.model.js";
// import { getRecipientSocketId, io } from "../../../../index.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

export const sendMessage = asyncHandler(async (req, res, next) => {
  const { recipientId, message } = req.body;
  const senderId = req.user._id;
  let conversation = await conversationModel.findOne({
    participants: { $all: [senderId, recipientId] },
  });
  if (!conversation) {
    conversation = await conversationModel.create({
      participants: [senderId, recipientId],
      lastMessage: {
        senderId,
        text: message,
      },
    });
  }
  const newMessage = await messageModel.create({
    conversationId: conversation._id,
    senderId,
    text: message,
  });
  conversation.lastMessage = {
    senderId,
    text: message,
  };
  await conversation.save();

  // const recipientSocketId = getRecipientSocketId(recipientId);
	// 	if (recipientSocketId) {
	// 		io.to(recipientSocketId).emit("newMessage", newMessage);
	// 	}


  return res.status(201).json({
    success: true,
    data: newMessage,
  });
});

export const getMessages = asyncHandler(async (req, res, next) => {
  const { otherUserId } = req.params;
  const userId = req.user._id;
  const conversation = await conversationModel.findOne({
    participants: { $all: [userId, otherUserId] },
  });
  if (!conversation) {
    return res
      .status(404)
      .json({ success: false, message: "No conversation found" });
  }
  const messages = await messageModel
    .find({
      conversationId: conversation._id,
    })
    .sort({ createdAt: 1 });
  return res.status(200).json({ success: true, messages });
});

export const getConversations = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const conversations = await conversationModel
    .find({ participants: userId })
    .populate({ path: "participants", select: "userName profileImage" });
  conversations.forEach((conversation) => {
    conversation.participants = conversation.participants.filter(
      (participant) => participant._id.toString() !== userId.toString()
    );
  });
  return res.status(200).json({ success: true, conversations });
});
