import React from "react";
import {Howl} from "howler";
import {Stack} from "@mui/material";

interface AudioFilePlayerProps {
    audioURL: string
}

function AudioFilePlayer(props: AudioFilePlayerProps) {
    const sound = new Howl({
        src: [props.audioURL],
        html5: true
    });

    let playSound = () => {
        sound.play()
    }

    return (
        <Stack
            spacing={2}
            direction="column"
            justifyContent="center"
            alignItems="center"
        >
            <button onClick={() => playSound()}>
                {"Uploaded file"}
            </button>
        </Stack>
    );
}

export default AudioFilePlayer;
