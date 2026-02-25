import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Container, TextField, Button, Stack, Typography } from "@mui/material";

const socket = io("http://localhost:3000");

const GroupChat = () => {
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const joinRoom = () => {
    socket.emit("join-room", room);
  };

 const sendMessage = () => {
  if (!room || !message) return;

  socket.emit("group-message", { room, message });
  setMessage("");
};

  useEffect(() => {
    socket.on("receive-group-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });
  }, []);

  return (
    <Container>
      <Typography variant="h6">Group Chat</Typography>

      <Stack direction="row" spacing={2} mb={2}>
        <TextField label="Room" value={room} onChange={(e) => setRoom(e.target.value)} />
        <Button variant="contained" onClick={joinRoom}>Join</Button>
      </Stack>

      <Stack direction="row" spacing={2} mb={2}>
        <TextField fullWidth label="Message" value={message} onChange={(e) => setMessage(e.target.value)} />
        <Button variant="contained" onClick={sendMessage}>Send</Button>
      </Stack>

      {messages.map((msg, i) => (
        <Typography key={i}>{msg.sender} : {msg.message}</Typography>
      ))}
    </Container>
  );
};

export default GroupChat;