import React from "react";
import {Howl} from "howler";
import {Button, Stack} from "@mui/material";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface AudioFilePlayerProps {
    audioURL: string
}

function AudioFilePlayer(props: AudioFilePlayerProps) {
    const sound = new Howl({
        src: [props.audioURL],
        html5: true
    });

    let playSound = () => {
        if (!sound.playing()) {
            sound.play();
        }
    }

    let pauseSound = () => {
        sound.pause();
    }

    return (
        <Stack
            spacing={2}
        >
            <Button onClick={() => playSound()}>
                {"Play"}
            </Button>
            <div>
                {(sound.playing() ? <PlayArrowIcon/> : "")}
            </div>
            <Button onClick={() => pauseSound()}>
                {"Pause"}
            </Button>
        </Stack>
    );
}

export const MemoAudioFilePlayer = React.memo(AudioFilePlayer);
