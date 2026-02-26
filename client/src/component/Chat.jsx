import { useState, useEffect } from "react";
import GroupChat from "./GroupChat";
import SingleChat from "./Singlechat";
import { Button, Stack, TextField, Typography, Box } from "@mui/material";
import { socket } from "../socket";

const NAME_KEY = "chat-display-name";

const Chat = () => {
  const [mode, setMode] = useState("group");
  const [myName, setMyName] = useState(() => localStorage.getItem(NAME_KEY) || "");
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    if (!myName) return;
    const sendName = () => socket.emit("set-name", myName);
    sendName();
    socket.on("connect", sendName);
    return () => socket.off("connect", sendName);
  }, [myName]);

  useEffect(() => {
    setNameInput(myName);
  }, [myName]);

  const handleSetName = () => {
    const trimmed = nameInput.trim();
    if (trimmed) {
      setMyName(trimmed);
      localStorage.setItem(NAME_KEY, trimmed);
      if (socket.connected) socket.emit("set-name", trimmed);
    }
  };

  return (
    <div className="chat-app">
      <Box className="name-section" sx={{ mb: 2 }}>
        <Typography variant="subtitle2" className="name-label" gutterBottom>
          Your display name (used in Single Chat)
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={1}>
          <TextField
            className="name-input"
            size="small"
            placeholder="Enter your name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSetName()}
            sx={{ maxWidth: 220 }}
          />
          <Button className="btn-set-name" variant="outlined" size="small" onClick={handleSetName}>
            Set name
          </Button>
          {myName && (
            <Typography variant="body2" className="showing-as">
              Showing as: <strong>{myName}</strong>
            </Typography>
          )}
        </Stack>
      </Box>

      <Stack className="mode-tabs" direction="row" spacing={2} justifyContent="center" mt={3}>
        <Button
          className={`btn-mode ${mode === "group" ? "contained" : "outlined"}`}
          variant={mode === "group" ? "contained" : "outlined"}
          onClick={() => setMode("group")}
        >
          Group Chat
        </Button>

        <Button
          className={`btn-mode ${mode === "single" ? "contained" : "outlined"}`}
          variant={mode === "single" ? "contained" : "outlined"}
          onClick={() => setMode("single")}
        >
          Single Chat
        </Button>
      </Stack>

      {mode === "group" ? <GroupChat /> : <SingleChat myName={myName} />}
    </div>
  );
};

export default Chat;