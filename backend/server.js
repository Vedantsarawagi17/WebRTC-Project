import express from  "express"
import { connectDB } from  "./config/db.js"
import dotenv from  "dotenv"
import { userRoutes } from  "./routes/userRoutes.js"
import { chatRoutes } from  "./routes/chatRoutes.js"
import { messageRoutes } from  "./routes/messageRoutes.js"
import { notFound, errorHandler } from "./middleware/errorMiddleware.js"
// import path from "path"
import { Server } from "socket.io";

import cors from "cors";

dotenv.config();
connectDB();
const app = express();

app.use(express.json());   // to accept json data
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "https://webrtc-project-frontend.vercel.app"],
  credentials: true
}));

app.get("/", (req, res) => {
  res.send(`API Running on ${process.env.PORT}`);
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

const PORT = process.env.PORT;

const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}`)
);

// Socket.io keeps a "pipe" open for instant two-way data flow.
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173", "https://webrtc-project-frontend.vercel.app"],
    // credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    if (!userData || !userData._id) {
      console.log("Socket Setup Failed: User data not found");
      return;
    }
    socket.join(userData._id.toString());
    console.log("User Joined Setup Room: " + userData._id.toString());
    socket.emit("connected");
  });
  
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
  
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
  socket.on("callUser", (data) => {
      io.to(data.userToCall).emit("incomingCall", {
          signal: data.signalData,
          from: data.from,
          name: data.name
      });
  });

  socket.on("answerCall", (data) => {
      io.to(data.to).emit("callAccepted", data.signal);
  });

  socket.on("iceCandidate", (data) => {
      io.to(data.to).emit("iceCandidate", data.candidate);
  });

  socket.on("disconnect", () => {
    // Socket.io handles room leave auto, but we might want to notify execution
    console.log("USER DISCONNECTED", socket.id);
    // For mesh, the peer connection closes on 'close' event client side
  });
  
  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED");
  });
});
// Socket.io allows the server and the browser to talk to each other instantly without refreshing.


// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);