import React, { forwardRef, useCallback, useMemo } from "react";
import {
  Button,
  Card,
  Drawer,
  Fab,
  Grid,
  Typography,
} from "@mui/material";
import {
  Camera as CameraIcon,
  CreateNewFolder as CreateNewFolderIcon,
  Image as ImageIcon,
  Upload as UploadIcon,
} from "@mui/icons-material";
import { createFolder, fetchPath } from "./app/transfer";
import { useUploadEnqueue } from "./app/transferQueue";

function IconCaptionButton({
  icon,
  caption,
  onClick,
}: {
  icon: React.ReactNode;
  caption: string;
  onClick?: () => void;
}) {
  return (
    <Button
      color="inherit"
      sx={{ width: "100%", display: "flex", flexDirection: "column" }}
      onClick={onClick}
    >
      {icon}
      <Typography
        variant="caption"
        sx={{ textTransform: "none", textWrap: "nowrap" }}
      >
        {caption}
      </Typography>
    </Button>
  );
}

export const UploadFab = forwardRef<HTMLButtonElement, { onClick: () => void }>(
  function ({ onClick }, ref) {
    return (
      <Fab
        ref={ref}
        aria-label="Upload"
        variant="circular"
        color="primary"
        size="large"
        sx={{ position: "fixed", right: 16, bottom: 16, color: "white" }}
        onClick={onClick}
      >
        <UploadIcon fontSize="large" />
      </Fab>
    );
  }
);

function UploadDrawer({
  open,
  setOpen,
  cwd,
  onUpload,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  cwd: string;
  onUpload: () => void;
}) {
  const uploadEnqueue = useUploadEnqueue();

  const handleUpload = useCallback(
    (action: string) => async () => {
      const input = document.createElement("input");
      input.type = "file";

      switch (action) {
        case "photo":
          input.accept = "image/*";
          input.capture = "environment";
          break;
        case "image":
          input.accept = "image/*,video/*";
          break;
        case "file":
          input.accept = "*/*";
          break;
      }

      input.multiple = true;

      input.onchange = async () => {
        if (!input.files) return;

        const existingFiles = (await fetchPath(cwd)).map((f) =>
          f.key.split("/").pop()!
        );

        const getUniqueFileName = (filename: string, existing: string[]): string => {
          if (!existing.includes(filename)) return filename;

          const extIndex = filename.lastIndexOf(".");
          const base = extIndex === -1 ? filename : filename.slice(0, extIndex);
          const ext = extIndex === -1 ? "" : filename.slice(extIndex);

          let counter = 1;
          let newName = `${base} (${counter})${ext}`;
          
          while (existing.includes(newName)) {
            counter++;
            newName = `${base} (${counter})${ext}`;
          }

          return newName;
        };

        const files: File[] = [];

        for (const file of Array.from(input.files)) {
          const uniqueName = getUniqueFileName(file.name, existingFiles);
          const renamedFile = new File([file], uniqueName, { type: file.type });
          files.push(renamedFile);
          existingFiles.push(uniqueName);
        }

        uploadEnqueue(...files.map((file) => ({ file, basedir: cwd })));
        setOpen(false);
        onUpload();
      };

      input.click();
    },
    [cwd, onUpload, setOpen, uploadEnqueue]
  );

  const takePhoto = useMemo(() => handleUpload("photo"), [handleUpload]);
  const uploadImage = useMemo(() => handleUpload("image"), [handleUpload]);
  const uploadFile = useMemo(() => handleUpload("file"), [handleUpload]);

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={() => setOpen(false)}
      PaperProps={{ sx: { borderRadius: "16px 16px 0 0" } }}
    >
      <Card sx={{ padding: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <IconCaptionButton
              icon={<CameraIcon fontSize="large" />}
              caption="Camera"
              onClick={takePhoto}
            />
          </Grid>
          <Grid item xs={3}>
            <IconCaptionButton
              icon={<ImageIcon fontSize="large" />}
              caption="Image/Video"
              onClick={uploadImage}
            />
          </Grid>
          <Grid item xs={3}>
            <IconCaptionButton
              icon={<UploadIcon fontSize="large" />}
              caption="Upload"
              onClick={uploadFile}
            />
          </Grid>
          <Grid item xs={3}>
            <IconCaptionButton
              icon={<CreateNewFolderIcon fontSize="large" />}
              caption="Create Folder"
              onClick={async () => {
                setOpen(false);
                await createFolder(cwd);
                onUpload();
              }}
            />
          </Grid>
        </Grid>
      </Card>
    </Drawer>
  );
}

export default UploadDrawer;
