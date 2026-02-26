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

const users = {}; // socketId -> { id, name }

function getUsersList() {
  return Object.entries(users).map(([id, u]) => ({ id, name: u.name || null }));
}

function broadcastUsersList() {
  io.emit("users-list", getUsersList());
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  users[socket.id] = { id: socket.id, name: null };
  broadcastUsersList();

  // 🟢 GROUP CHAT
  socket.on("join-room", (room) => {
    socket.join(room);
  });

  socket.on("group-message", ({ room, message }) => {
    socket.to(room).emit("receive-group-message", {
      message,
      sender: socket.id,
    });
  });

  socket.on("set-name", (name) => {
    const trimmed = typeof name === "string" ? name.trim() : "";
    if (trimmed) {
      users[socket.id].name = trimmed;
      broadcastUsersList();
    }
  });

  // 🔵 SINGLE CHAT – private message only to receiver (not sender)
  socket.on("private-message", ({ targetId, message }) => {
    const senderName = users[socket.id]?.name || socket.id;
    io.to(targetId).emit("receive-private-message", {
      sender: socket.id,
      senderName,
      message,
    });
  });

  socket.on("request-users-list", () => {
    socket.emit("users-list", getUsersList());
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    broadcastUsersList();
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});