import { useState } from "react";
import GroupChat from "./GroupChat";
import SingleChat from "./Singlechat";
import { Button, Stack } from "@mui/material";

const Chat = () => {
  const [mode, setMode] = useState("group");

  return (
    <>
      <Stack direction="row" spacing={2} justifyContent="center" mt={3}>
        <Button
          variant={mode === "group" ? "contained" : "outlined"}
          onClick={() => setMode("group")}
        >
          Group Chat
        </Button>

        <Button
          variant={mode === "single" ? "contained" : "outlined"}
          onClick={() => setMode("single")}
        >
          Single Chat
        </Button>
      </Stack>

      {mode === "group" ? <GroupChat /> : <SingleChat />}
    </>
  );
};

export default Chat;