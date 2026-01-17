import dotenv from  "dotenv"
dotenv.config(); // Load variables from .env file
import express from  "express"
import cors from "cors";
import { Server } from "socket.io";
import { connectDB } from  "./config/mongodb.js"
import { userRoutes } from  "./routes/userRoutes.js"
import { chatRoutes } from  "./routes/chatRoutes.js"
import { messageRoutes } from  "./routes/messageRoutes.js"
import { notFound, errorHandler } from "./middleware/errorMiddleware.js"

const app = express();
const PORT = process.env.PORT ;

// Database Connection
connectDB();

// Middleware
app.use(express.json());   // To accept json data , To parse JSON request bodies

// CORS Configuration Cross-Origin Resource Sharing
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://webrtc-project-gilt.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean);  // To allow requests from your frontend

app.use(cors({
  origin: function (origin, callback) {
    // 1. Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      // 2. Origin is in our whitelist
      callback(null, true);
    } else {
      // 3. Origin is blocked
      callback(new Error('CORS Policy: This origin is not allowed'));
    }
  },
  credentials: true
}));

// API Endpoints
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// Root Endpoint
app.get("/", (req, res) => {
  res.send(`API Running`);
});

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

// Server Initialization
const server = app.listen(
  PORT, () => {
    console.log(`Server running on PORT ${PORT}`)
  }
);

// Socket.io keeps a "pipe" open for instant two-way data flow.
const io = new Server(server, {
  pingTimeout: 60000, // Close connection after 60s of inactivity
  cors: {
    origin: allowedOrigins, // Re-use the same allowed origins list
    credentials: true,
  },
});

// 8. REAL-TIME LOGIC

io.on("connection", (socket) => {
  console.log("Connected to socket.io:", socket.id);

  // User joins their own private room based on their Database ID
  socket.on("setup", (userData) => {
    if (!userData || !userData._id) {
      console.log("Socket Setup Failed: User data not found");
      return;
    }
    socket.join(userData._id.toString());
    console.log("User Joined Setup Room: " + userData._id.toString());
    socket.emit("connected");
  });
  
  // Chat Room Logic , This is like entering a Conference Room. Everyone in that room can hear each other.
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  // Typing Indicators
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
  
  // Message Handling
  socket.on("new message", (newMessageRecieved) => {
    if (!newMessageRecieved || !newMessageRecieved.chat) return console.log("Invalid message data");
    var chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      // Logic: If the member is the one who sent the message, don't notify them.
      if (!newMessageRecieved.sender || !newMessageRecieved.sender._id) return;
      if (user._id.toString() == newMessageRecieved.sender._id.toString()) return;
      
      console.log(`Socket: Emitting "message recieved" to user ${user._id}`);
      socket.in(user._id.toString()).emit("message recieved", newMessageRecieved);
    });
  });

  // --- VIDEO CALL SIGNALING ---
  // --- RAW WEBRTC SIGNALING (User Request) ---
  // 'callUser' sends the WebRTC offer (signalData) to a specific user
  socket.on("callUser", (data) => {
      io.to(data.userToCall).emit("incomingCall", {
          signal: data.signalData,
          from: data.from,
          name: data.name
      });
  });

  // 'answerCall' sends the WebRTC answer back to the caller
  socket.on("answerCall", (data) => {
      io.to(data.to).emit("callAccepted", data.signal);
  });

  // ICE Candidates help peers find the best path to connect directly
  // Shortest path possible for a connection 
  socket.on("iceCandidate", (data) => {
      io.to(data.to).emit("iceCandidate", data.candidate);
  });

  socket.on("disconnect", () => {
    // Socket.io handles room leave auto, but we might want to notify execution
    console.log("USER DISCONNECTED", socket.id);
    // For mesh, the peer connection closes on 'close' event client side
  });
  
});
// Socket.io allows the server and the browser to talk to each other instantly without refreshing.

