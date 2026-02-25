import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Container, TextField, Button, Stack, Typography } from "@mui/material";

const socket = io("http://localhost:3000");

const SingleChat = () => {
  const [myId, setMyId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  const sendMessage = () => {
    if (!targetId || !message) return;

    socket.emit("private-message", {
      targetId,
      message,
    });

    setMessage("");
  };

  useEffect(() => {
    // jab connect ho tab apna id set karo
    socket.on("connect", () => {
      setMyId(socket.id);
    });

    // users list server se lo
    socket.on("users-list", (allUsers) => {
      // apna id remove kar do list se
      const filtered = allUsers.filter((id) => id !== socket.id);
      setUsers(filtered);
    });

    // receive private message
    socket.on("receive-private-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("connect");
      socket.off("users-list");
      socket.off("receive-private-message");
    };
  }, []);

  return (
    <Container>
      <Typography variant="h6">Single Chat</Typography>

      <Typography variant="body1" sx={{ mt: 2 }}>
        <b>My ID:</b> {myId}
      </Typography>

      <Typography variant="body2" sx={{ mt: 2 }}>
        Available Users:
      </Typography>

      {users.map((id) => (
        <Typography
          key={id}
          sx={{ cursor: "pointer", color: "blue" }}
          onClick={() => setTargetId(id)}
        >
          {id}
        </Typography>
      ))}

      <Typography sx={{ mt: 1 }}>
        <b>Selected:</b> {targetId}
      </Typography>

      <Stack direction="row" spacing={2} mt={2}>
        <TextField
          fullWidth
          label="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button variant="contained" onClick={sendMessage}>
          Send
        </Button>
      </Stack>

      <div style={{ marginTop: "20px" }}>
        {messages.map((msg, i) => (
          <Typography key={i}>
            <b>{msg.sender}</b> : {msg.message}
          </Typography>
        ))}
      </div>
    </Container>
  );
};

export default SingleChat;