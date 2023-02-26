import React from "react";
import {HiArrowCircleDown, HiPlay} from "react-icons/hi";
import {Howl} from "howler";

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
        <button onClick={() => playSound()}>
            {props.audioURL}
        </button>
    );
}

export default AudioFilePlayer;
