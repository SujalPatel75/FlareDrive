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
import { fetchPath } from "./app/transfer"; // <-- Make sure this import exists

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
  const [existingFileNames, setExistingFileNames] = useState<string[]>([]);
  const uploadEnqueue = useUploadEnqueue();

  useEffect(() => {
    if (open) {
      fetchPath(cwd).then((files) => {
        const names = files.map((file) => file.key.split("/").pop() || "");
        setExistingFileNames(names);
      });
    }
  }, [open, cwd]);

  const generateUniqueFileName = (baseName: string): string => {
    const [name, ext] = baseName.split(/\.(?=[^\.]+$)/);
    let newName = baseName;
    let counter = 1;

    while (existingFileNames.includes(newName)) {
      newName = `${name}${counter}.${ext}`;
      counter++;
    }

    return newName;
  };

  const handleSaveNote = () => {
    const uniqueFileName = generateUniqueFileName(noteName);
    const fileBlob = new Blob([noteText], { type: "text/plain" });
    const file = new File([fileBlob], uniqueFileName, { type: "text/plain" });
    uploadEnqueue({ file, basedir: cwd });
    onUpload(); // Refresh file list
    setOpen(false);
    setNoteText("");
    setNoteName("note.txt");
  };

  return (
    <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
      <Box sx={{ width: 400, padding: 2, display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
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
          label="Write your note..."
          multiline
          rows={15}
          variant="outlined"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          fullWidth
        />

        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleSaveNote}
          disabled={!noteText.trim()}
        >
          Save & Upload Note
        </Button>
      </Box>
    </Drawer>
  );
};

export default TextPadDrawer;
