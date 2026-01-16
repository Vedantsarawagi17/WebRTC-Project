import asyncHandler from "express-async-handler"
import { Chat } from "../models/chatModel.js"
import { User } from "../models/userModel.js"

// Fetch-All-Chats
// The code starts by looking for all chats where the users array contains the ID of the current logged-in user (req.user._id).
export const fetchChats = asyncHandler(async (req, res) => {
  try {
    let results = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
    // Find's the logged-in user's ID through mongoDB
      .populate("users", "-password") // Get user details (no passwords),Replaces user IDs with their name/pic,
      .populate("groupAdmin", "-password")// Get admin details (no passwords),the person who created the group.
      .populate("latestMessage") // Get the content and timestamp of the very last message sent in that chat.
      .sort({ updatedAt: -1 }); // Sort by newest activity first

    results = await User.populate(results, {
      path: "latestMessage.sender",
      select: "name pic email",
    });
        // Return the fully populated list of chats
    res.status(200).send(results);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// One-to-One Chat
export const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  // Validation: Ensure the other user's ID is provided
  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  // Search for an existing 1-on-1 chat between these two users
  // Logic :- It uses the $and operator to find a chat where both the logged-in user (req.user._id) and the target user (userId) are present in the users array.
  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },  // Contains current user
      { users: { $elemMatch: { $eq: userId } } },        // Contains target user
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

    // Populate the sender of the latest message
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  // If chat exists, return it
  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    // If no chat exists, prepare data to create a new one
    var chatData = {
      chatName: "sender", // Default name, usually handled by frontend logic
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

// Group-Chat
export const createGroupChat = asyncHandler(async (req, res) => {
  // Verify required inputs exist, name of the group and the list of users were actually sent in the request.
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

    // Convert the stringified users array from the frontend into a JS Object
  var users = JSON.parse(req.body.users);

    // Ensure the group has enough members of atleat of 3 
  if (users.length < 2) {
    return res
      .status(400)
      .send({ message: "More than 2 users are required to form a group chat" });
  }

  // users.push(req.user): The list sent from the frontend usually only contains the invited guests. This line adds you (the logged-in creator) to the group.
  // Add the current logged-in user to the group members array
  users.push(req.user);

  try {
    // Create the group chat document in MongoDB
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user, // The creator becomes the admin of the group
    });

    // Fetch the newly created chat and "populate" user details to send back to UI
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// ReName-Group-Chat
export const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const chat = await Chat.findById(chatId); 
  if (!chat) {
    res.status(404);
    throw new Error("Chat Not Found");
  }

  // Only Admin can rename
  if (chat.groupAdmin.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Only admins can rename the group!");
  }

  // Update the document by ID
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName, // The new name to be set
    },
    {
      new: true, // Return the updated document instead of the original
    }
  )
    .populate("users", "-password")       // Fetch full user details
    .populate("groupAdmin", "-password");  // Fetch admin details

  // Error handling if the chat doesn't exist
  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    // Return the updated chat object to the client
    res.json(updatedChat);
  }
});

// Remove-User in GroupChat
export const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body; //userId (the person being kicked out or leaving)

  // Fetch the chat first to check who the admin is
  const chat = await Chat.findById(chatId);
  if (!chat) {
    res.status(404);
    throw new Error("Chat Not Found");
  }

  // Is the requester the admin OR Is the requester trying to remove themselves (leaving)?
  // Check if the person logged in is the Admin or not ?
  const isRequesterAdmin = chat.groupAdmin.toString() === req.user._id.toString();
  // Check if the person is just trying to remove themselves (Leaving)
  const isSelfRemoval = userId === req.user._id.toString();

  if (!isRequesterAdmin && !isSelfRemoval) {   
    res.status(403); // Forbidden
    throw new Error("Only admins can remove members!");
  }

  // Check if the requester is admin
  // Find the chat and remove the user from the 'users' array
  const removed = await Chat.findByIdAndUpdate(
    chatId,
    // $pull tells MongoDB to look into the users array and remove every instance of the specific userId.
    { $pull: { users: userId } },  // MongoDB operator to remove item from array 
    { new: true } // Return the updated document
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  // Handle Empty Group (If the last person leaves)
  if (removed.users.length === 0) {
    await Chat.findByIdAndDelete(chatId);
    return res.json({ message: "Group deleted because no members remain." });
  }

  // ADMIN SUCCESSION LOGIC
  // Check if the person who just left was the admin
  const wasAdmin = chat.groupAdmin.toString() === userId;

  if (wasAdmin) {
    const newAdminId = removed.users[0]._id; // Take the next person in line
    
    const chatWithNewAdmin = await Chat.findByIdAndUpdate(
      chatId,
      { groupAdmin: newAdminId },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res.json(chatWithNewAdmin);
  }

  // Check if the update was successful
  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    // Return the updated chat to the frontend
    res.json(removed);
  }
});

// Add-User in GroupChat
export const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // Fetch the chat to check who the admin is
  const chat = await Chat.findById(chatId);
  if (!chat) {
    res.status(404);
    throw new Error("Chat Not Found");
  }

  // Is the person making the request the Admin?
  if (chat.groupAdmin.toString() !== req.user._id.toString()) {
    res.status(403); // Forbidden
    throw new Error("Only admins can add new members to the group!");
  }

  // Check if the user is already in the group
  const userAlreadyInGroup = chat.users.find((u) => u.toString() === userId);
  if (userAlreadyInGroup) {
    res.status(400);
    throw new Error("User is already in the group!");
  }

  // Check if the requester is admin
  // Find the group and push the new user ID into the 'users' array
  const added = await Chat.findByIdAndUpdate(
    chatId,
    // $push simply appends the new userId to the end of the existing list.
    {
      $push: { users: userId },
    },
    {
      new: true, // By setting this to true, the server sends back the list including the new member.
    }
  )
    .populate("users", "-password")         // Fetch full details of all members
    .populate("groupAdmin", "-password");   // Fetch full details of the admin

  res.status(200).json(added);
});