import React, { useState } from "react";
import PlayArrow from "@mui/icons-material/PlayArrowRounded";
import IconButton from "@mui/material/IconButton";
import Loop from "@mui/icons-material/RepeatRounded";
import Stop from "@mui/icons-material/StopRounded";
import MoreVert from "@mui/icons-material/MoreVertRounded";
import VolumeUp from "@mui/icons-material/VolumeUp";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import styled from "@mui/material/styles/styled";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import CardActionArea from "@mui/material/CardActionArea";
import useMediaQuery from "@mui/material/useMediaQuery";

import { Sound, removeSound, Soundboard, editSound } from "./soundboardsSlice";
import { useDispatch, useSelector } from "react-redux";
import { SoundSettings } from "./SoundSettings";
import { RootState } from "../../app/store";
import {backgrounds, isBackground} from "../../backgrounds";

type SoundItemProps = {
  id: string;
  soundboard: Soundboard;
  onPlay: (sound: Sound) => void;
  onStop: (id: string) => void;
};

const VolumeSlider = styled(Slider)({
  color: "#fff",
  "& .MuiSlider-track": {
    border: "none",
  },
  "& .MuiSlider-thumb": {
    width: 24,
    height: 24,
    backgroundColor: "#fff",
    "&:hover, &.Mui-focusVisible, &.Mui-active": {
      boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
    },
  },
});

export function SoundItem({ id, soundboard, onPlay, onStop }: SoundItemProps) {
  const sound = useSelector((state: RootState) => state.soundboards.sounds[id]);
  const playing = useSelector(
    (state: RootState) => sound.id in state.soundboardPlayback.playback
  );
  const dispatch = useDispatch();

  const [settingsOpen, setSettingsOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const image = isBackground(sound.background)
    ? backgrounds[sound.background]
    : sound.background;

  function handleMenuClick(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget);
  }
  function handleMenuClose() {
    setAnchorEl(null);
  }

  function handleEdit() {
    setSettingsOpen(true);
    handleMenuClose();
  }

  function handleCopyID() {
    navigator.clipboard.writeText(sound.id);
    handleMenuClose();
  }

  function handleDelete() {
    dispatch(removeSound({ soundId: sound.id, soundboardId: soundboard.id }));
    handleMenuClose();
  }

  function handlePlayStop() {
    if (playing) {
      onStop(sound.id);
    } else {
      onPlay(sound);
    }
  }

  function handleVolumeChange(_: Event, value: number | number[]) {
    dispatch(editSound({ id: sound.id, volume: value as number }));
  }

  function handleToggleLoop() {
    dispatch(editSound({ id: sound.id, loop: !sound.loop }));
  }

  const large = useMediaQuery("(min-width: 600px)");

  const loopToggle = (
    <IconButton
      aria-label={sound.loop ? "no loop" : "loop"}
      onClick={handleToggleLoop}
    >
      {sound.loop ? <Loop color="primary" /> : <Loop />}
    </IconButton>
  );

  const volumeSlider = (
    <>
      <Box height="24px">
        <VolumeUp sx={{ color: "rgba(255,255,255,0.4)" }} />
      </Box>
      <VolumeSlider
        aria-label="Volume"
        // Prevent drag and drop when using slider
        onPointerDown={(e) => e.stopPropagation()}
        onChange={handleVolumeChange}
        value={sound.volume}
        step={0.01}
        min={0}
        max={1}
      />
    </>
  );

  const playButton = (
    <IconButton aria-label={playing ? "stop" : "play"} onClick={handlePlayStop}>
      {playing ? (
        <Stop sx={{ fontSize: "3rem" }} />
      ) : (
        <PlayArrow sx={{ fontSize: "3rem" }} />
      )}
    </IconButton>
  );

  return (
    <>
      <Card
        sx={{
          display: "flex",
          flexDirection: "column",
          backgroundImage: `url("${image}")`,
          backgroundSize: "cover",
          height: large ? "150px" : "200px",
          position: "relative",
        }}
      >
        <CardActionArea
          sx={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }}
        />
        <CardContent>
          <Box sx={{ display: "flex" }}>
            <Typography variant="h5" noWrap sx={{ flexGrow: 1 }}>
              {sound.title}
            </Typography>
            <IconButton onClick={handleMenuClick}>
              <MoreVert />
            </IconButton>
          </Box>
        </CardContent>
        {large ? (
          <Box
            sx={{ display: "flex", gap: 2, alignItems: "center", px: 2, pb: 1 }}
          >
            {loopToggle}
            {volumeSlider}
            {playButton}
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              alignItems: "center",
              px: 2,
              pb: 1,
            }}
          >
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Box
                sx={{ position: "absolute", left: { xs: "12px", sm: "24px" } }}
              >
                {loopToggle}
              </Box>
              {playButton}
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                width: "100%",
                pr: 3,
                pb: 1,
              }}
            >
              {volumeSlider}
            </Box>
          </Box>
        )}
      </Card>
      <Menu
        id="soundboard-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        MenuListProps={{
          "aria-labelledby": "more-button",
        }}
      >
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleCopyID}>Copy ID</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
      <SoundSettings
        sound={sound}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
