import React from "react";
import {Howl} from "howler";
import {Stack} from "@mui/material";
import sty from "./audioFilePlayer.module.scss";

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
            direction="column"
            justifyContent="center"
            alignItems="center"
        >
            <button onClick={() => playSound()}>
                {"Play"}
            </button>
            <button onClick={() => pauseSound()}>
                {"Pause"}
            </button>
        </Stack>
    );
}

export default AudioFilePlayer;
