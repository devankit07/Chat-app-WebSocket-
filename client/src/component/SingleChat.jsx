import { useEffect, useState } from "react";
import { Container, TextField, Button, Stack, Typography } from "@mui/material";
import { socket } from "../socket";

const SingleChat = ({ myName = "" }) => {
  const [myId, setMyId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [targetName, setTargetName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]); // [{ id, name }, ...]

  const sendMessage = () => {
    if (!targetId || !message) return;

    socket.emit("private-message", {
      targetId,
      message,
    });

    setMessage("");
  };

  useEffect(() => {
    const onConnect = () => {
      setMyId(socket.id || "");
      socket.emit("request-users-list");
    };

    socket.on("connect", onConnect);

    // If already connected (e.g. component mounted after connect), set ID and request list
    if (socket.connected && socket.id) {
      setMyId(socket.id);
      socket.emit("request-users-list");
    }

    socket.on("users-list", (list) => {
      const items = Array.isArray(list) ? list : [];
      const filtered = items
        .filter((u) => u && u.id !== socket.id && u.name)
        .map((u) => ({ id: u.id, name: u.name }));
      setUsers(filtered);
    });

    // Only receiver gets this event; never add sent messages on sender side
    socket.on("receive-private-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("users-list");
      socket.off("receive-private-message");
    };
  }, []);

  const selectUser = (id, name) => {
    setTargetId(id);
    setTargetName(name || id);
  };

  return (
    <Container className="single-chat" sx={{ maxWidth: "720px" }}>
      <Typography variant="h6" className="single-chat-title">
        Single Chat
      </Typography>

      <Typography variant="body1" className="you-label" sx={{ mt: 2 }}>
        <b>You:</b> {myName || "(set your name above)"}
      </Typography>

      <Typography variant="body2" className="available-label" sx={{ mt: 2 }}>
        <b>Available users:</b> {users.length === 0 && myId ? " (none yet)" : ""}
      </Typography>
      <Stack className="user-pills" direction="row" flexWrap="wrap" gap={1} sx={{ mt: 0.5 }}>
        {users.map((u) => (
          <span
            key={u.id}
            className={`user-pill ${targetId === u.id ? "selected" : ""}`}
            onClick={() => selectUser(u.id, u.name)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && selectUser(u.id, u.name)}
          >
            {u.name}
          </span>
        ))}
      </Stack>

      <Typography className="chatting-with" sx={{ mt: 1 }}>
        <b>Chatting with:</b> {targetName || "(select a user above)"}
      </Typography>

      <Stack direction="row" spacing={2} mt={2}>
        <TextField
          className="message-input"
          fullWidth
          label="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button className="btn-send" variant="contained" onClick={sendMessage}>
          Send
        </Button>
      </Stack>

      <div className="messages-area">
        {messages
          .filter((msg) => msg.sender !== socket.id)
          .map((msg, i) => (
            <div key={i} className="message-row">
              <div className="sender">{msg.senderName ?? msg.sender}</div>
              <div className="body">{msg.message}</div>
            </div>
          ))}
      </div>
    </Container>
  );
};

export default SingleChat;