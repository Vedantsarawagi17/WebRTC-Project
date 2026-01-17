import asyncHandler from "express-async-handler"
import { User } from "../models/userModel.js"
import { generateToken } from "../config/jwtToken.js"

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  // Ensure all required fields are provided
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Feilds");
  }

  // See if user already exists in DB
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Creation: Create the new user record
  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  // Response: If successful, send user data , JWT token
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id), // Auto-login user after signup
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

export const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log("Login Attempt:", { email, password });

  // Search for the user by email
  const user = await User.findOne({ email });

  if (user) {
    const isMatch = await user.matchPassword(password);
    console.log("Password match result:", isMatch);
    if (isMatch) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        pic: user.pic,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error("Invalid Password");
    }
  } else {
    console.log("User NOT found in DB for email:", email);
    res.status(401);
    throw new Error("User with this email does not exist");
  }
});

export const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search // code checks if there is a search term in the URL
    ? { // If yes: It creates a MongoDB query object using $or. 
        // This tells the database: "Find users where the name matches OR the email matches."
        $or: [
          { name: { $regex: req.query.search, $options: "i" } }, // $regex: Allows for partial matching.
          { email: { $regex: req.query.search, $options: "i" } }, 
          // $options: "i": Stands for insensitive. It ignores uppercase and lowercase.
        ],
      }
    : {}; // If no: It sets keyword to an empty object {}, which would normally return all users.

  // Query the database: 
  // Filter by the keyword
  // Filter out the current logged-in user ($ne = Not Equal)
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });

  // Send the list of users back to the client
  res.send(users);
});