import asyncHandler from "express-async-handler"
import { Message } from "../models/messageModel.js"
import { User } from "../models/userModel.js"
import { Chat } from "../models/chatModel.js"

export const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId }) // All the messages collection where chat matches the id
    // .populate("who","where")
      .populate("sender", "name pic email")  // Get sender details (specifically name, pic, email)
      .populate("chat");  // Get full chat details
    // Return the array of messages to the frontend
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    // Create the message in the database
    var message = await Message.create(newMessage);

    // Populate details so the UI can display it.
    await message.populate("sender", "name pic"); // Adds the sender's name and avatar.
    await message.populate("chat"); // Adds the full chat object.
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });
    // It goes inside the chat we just fetched and grabs the details of all users in that chat. This is necessary so the frontend knows who to notify via Sockets.

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message }); //updates the latestMessage

    // Return the full message object
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});