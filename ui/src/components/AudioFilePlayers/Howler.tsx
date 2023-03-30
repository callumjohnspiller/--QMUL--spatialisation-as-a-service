import React from "react";
import {Howl} from "howler";
import {Button, ButtonGroup} from "@mui/material";

interface HowlerProps {
    audioURLS: string[]
}

function HowlerGroup(props: HowlerProps) {
    let howls: any = {};
    const fileLength = new Howl({
        src: props.audioURLS[0],
        preload: 'metadata'
    }).duration();
    console.log(fileLength);

    props.audioURLS.forEach(function(url) {
        howls[url] = new Howl({
            src: url
        })
    })

    const handlePlay = () => {
        props.audioURLS.forEach(function(url) {
            howls[url].play();
        });
    }

    const handlePause = () => {
        props.audioURLS.forEach(function(url) {
            howls[url].pause();
        });
        let pos = howls[props.audioURLS[0]].seek();
        props.audioURLS.forEach(function(url) {
            howls[url].seek(pos);
        });
    }

    return (
        <ButtonGroup>
            <Button onClick={handlePlay}>
                Play
            </Button>
            <Button onClick={handlePause}>
                Pause
            </Button>
        </ButtonGroup>
    );
}

export const MemoHowlerGroup = React.memo(HowlerGroup)