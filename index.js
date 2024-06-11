import express from "express";
import dotenv from "dotenv";
import { bootstrap } from "./src/index.router.js";
import { connectDB } from "./DB/connection.js";
// import { asyncHandler } from "./src/utils/asyncHandler.js";
// import { Server } from "socket.io";
// import messageModel from "./DB/models/message.model.js";
// import conversationModel from "./DB/models/conversation.model.js";

dotenv.config();
const app = express();
const port = process.env.PORT;

connectDB();
bootstrap(app, express);
app.get("/", (req, res) => res.send("Hello World!"));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
// export const io = new Server(server, { cors: "*" });

// export const getRecipientSocketId = (recipientId) => {
//   return userSocketMap[recipientId];
// };

// const userSocketMap = {}; // userId: socketId

// io.on("connection", (socket) => {
//   console.log("user connected", socket.id);
//   const userId = socket.handshake.query.userId;

//   if (userId != "undefined") userSocketMap[userId] = socket.id;
//   io.emit("getOnlineUsers", Object.keys(userSocketMap));

//   socket.on(
//     "markMessagesAsSeen",
//     asyncHandler(async ({ conversationId, userId }) => {
//       await messageModel.updateMany(
//         { conversationId: conversationId, seen: false },
//         { $set: { seen: true } }
//       );
//       await conversationModel.updateOne(
//         { _id: conversationId },
//         { $set: { "lastMessage.seen": true } }
//       );
//       io.to(userSocketMap[userId]).emit("messagesSeen", { conversationId });
//     })
//   );

//   socket.on("disconnect", () => {
//     console.log("user disconnected");
//     delete userSocketMap[userId];
//     io.emit("getOnlineUsers", Object.keys(userSocketMap));
//   });
// });
