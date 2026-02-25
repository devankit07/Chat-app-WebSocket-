import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

const users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  users[socket.id] = socket.id;
  io.emit("all-users", Object.keys(users));

  // 🟢 GROUP CHAT
  socket.on("join-room", (room) => {
    socket.join(room);
  });

  socket.on("group-message", ({ room, message }) => {
    // Sender ko nahi jayega
    socket.to(room).emit("receive-group-message", {
      message,
      sender: socket.id,
    });
  });

  // 🔵 SINGLE CHAT
 io.on("connection", (socket) => {
  io.emit("users-list", Array.from(io.sockets.sockets.keys()));

  socket.on("private-message", ({ targetId, message }) => {
    io.to(targetId).emit("receive-private-message", {
      sender: socket.id,
      message,
    });
  });

  socket.on("disconnect", () => {
    io.emit("users-list", Array.from(io.sockets.sockets.keys()));
  });
});
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});