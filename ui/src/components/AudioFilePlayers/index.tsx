import React from 'react';
import { Howl } from 'howler';
import { Button, Stack } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface AudioFilePlayerProps {
  audioURL: string;
}

function AudioFilePlayer(props: AudioFilePlayerProps) {
  const sound = new Howl({
    src: [props.audioURL],
    html5: true
  });

  const playSound = () => {
    if (!sound.playing()) {
      sound.play();
    }
  };

  const pauseSound = () => {
    sound.pause();
  };

  const downloadFile = async () => {
    // file object
    const file = fetch(props.audioURL).then(response => response.blob()).then(blob => {
      return blob;
    });
    // anchor link
    const element = document.createElement('a');
    element.href = URL.createObjectURL(await file);
    element.download = 'output.wav';
    // simulate link click
    document.body.appendChild(element);
    // Required for this to work in FireFox
    element.click();
  };

  return (
    <Stack
      spacing={2}
    >
      <Button onClick={() => playSound()}>
        {'Play'}
      </Button>
      <div>
        {(sound.playing() ? <PlayArrowIcon /> : '')}
      </div>
      <Button onClick={() => pauseSound()}>
        {'Pause'}
      </Button>
      <Button onClick={() => downloadFile()}>
        {'Download'}
      </Button>
    </Stack>
  );
}

export const MemoAudioFilePlayer = React.memo(AudioFilePlayer);
