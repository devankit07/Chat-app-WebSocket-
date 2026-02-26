import { useEffect, useState } from "react";
import { Container, TextField, Button, Stack, Typography } from "@mui/material";
import { socket } from "../socket";

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
    <Container className="group-chat" sx={{ maxWidth: "720px" }}>
      <Typography variant="h6" className="group-chat-title">
        Group Chat
      </Typography>

      <Stack className="room-row" direction="row" spacing={2} mb={2}>
        <TextField className="room-input" label="Room" value={room} onChange={(e) => setRoom(e.target.value)} />
        <Button className="btn-join" variant="contained" onClick={joinRoom}>
          Join
        </Button>
      </Stack>

      <Stack className="message-input-row" direction="row" spacing={2} mb={2}>
        <TextField
          className="message-input"
          fullWidth
          label="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button className="btn-send-group" variant="contained" onClick={sendMessage}>
          Send
        </Button>
      </Stack>

      <div className="messages-area">
        {messages.map((msg, i) => (
          <div key={i} className="message-row-group">
            <div className="sender">{msg.sender}</div>
            <div className="body">{msg.message}</div>
          </div>
        ))}
      </div>
    </Container>
  );
};

export default GroupChat;