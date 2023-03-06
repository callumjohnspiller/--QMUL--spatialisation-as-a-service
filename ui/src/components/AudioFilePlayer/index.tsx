import React from "react";
import {Howl} from "howler";
import {Stack} from "@mui/material";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import sty from "./player.module.scss";

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
        <Stack className={sty.player}
            spacing={2}
        >
            <button onClick={() => playSound()}>
                {"Play"}
            </button>
            <div>
                {(sound.playing() ? <PlayArrowIcon/> : "")}
            </div>
            <button onClick={() => pauseSound()}>
                {"Pause"}
            </button>
        </Stack>
    );
}

export const MemoAudioFilePlayer = React.memo(AudioFilePlayer);
