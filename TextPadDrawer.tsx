// TextPadDrawer.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Drawer,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useUploadEnqueue } from "./app/transferQueue";
import { fetchPath } from "./app/transfer";

interface TextPadDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  cwd: string;
  onUpload: () => void;
}

const TextPadDrawer: React.FC<TextPadDrawerProps> = ({
  open,
  setOpen,
  cwd,
  onUpload,
}) => {
  const [noteText, setNoteText] = useState("");
  const [noteName, setNoteName] = useState("note.txt");
  const [existingNames, setExistingNames] = useState<string[]>([]);
  const uploadEnqueue = useUploadEnqueue();

  useEffect(() => {
    if (open) {
      fetchPath(cwd).then((files) => {
        const names = files.map((f) => f.key.split("/").pop()?.toLowerCase() || "");
        setExistingNames(names);
      });
    }
  }, [open, cwd]);

  const getUniqueName = (filename: string): string => {
    const dotIndex = filename.lastIndexOf(".");
    const base = dotIndex !== -1 ? filename.slice(0, dotIndex) : filename;
    const ext = dotIndex !== -1 ? filename.slice(dotIndex) : ".txt";

    let currentName = filename.toLowerCase();
    let counter = 1;

    if (!existingNames.includes(currentName)) {
      return filename;
    }

    while (true) {
      const newName = `${base}${counter}${ext}`;
      if (!existingNames.includes(newName.toLowerCase())) {
        return newName;
      }
      counter++;
    }
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) return;

    const uniqueName = getUniqueName(noteName);
    const file = new File([noteText], uniqueName, { type: "text/plain" });

    uploadEnqueue({ file, basedir: cwd });
    onUpload();
    setOpen(false);
    setNoteText("");
    setNoteName("note.txt");
  };

  return (
    <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
      <Box sx={{ width: 400, p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">TextPad</Typography>
          <IconButton onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <TextField
          label="File Name"
          value={noteName}
          onChange={(e) => setNoteName(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />

        <TextField
          label="Write your note"
          multiline
          rows={10}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          fullWidth
        />

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleSaveNote}
          disabled={!noteText.trim()}
        >
          Save & Upload
        </Button>
      </Box>
    </Drawer>
  );
};

export default TextPadDrawer;
