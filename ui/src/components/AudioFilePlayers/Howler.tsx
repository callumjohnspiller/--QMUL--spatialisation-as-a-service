import React, {useEffect} from "react";
import {Howl} from "howler";
import {Button, ButtonGroup, Slider} from "@mui/material";

interface HowlerProps {
    audioURLS: string[],
    mutes: string[]
}
function HowlerGroup(props: HowlerProps) {
    const [playbackPosition, setPlaybackPosition] = React.useState<number>(0);
    let howls: any = {};
    props.audioURLS.forEach(function(url) {
        howls[url] = new Howl({
            src: url,
            preload: true
        });
    });

    useEffect(() => {
        return () => {
            props.audioURLS.forEach(function(url) {
                howls[url].stop();
            });
        }
    }, [])

    useEffect(() => {
        console.log("mute change recieved")
    }, [props.mutes])

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

    const handleChange = (event: Event, newValue: number | number[]) => {
        if(howls[props.audioURLS[0]].playing()) {
            handlePause();
            setPlaybackPosition(newValue as number);
            props.audioURLS.forEach(function(url) {
                howls[url].seek(playbackPosition);
            });
            handlePlay();
        } else {
            handlePause();
            setPlaybackPosition(newValue as number);
            props.audioURLS.forEach(function(url) {
                howls[url].seek(playbackPosition);
            });
        }
    };

    return (
        <div>
            <ButtonGroup>
                <Button onClick={handlePlay}>
                    Play
                </Button>
                <Button onClick={handlePause}>
                    Pause
                </Button>
            </ButtonGroup>
            <Slider
                size="small"
                min={0}
                max={howls[props.audioURLS[0]].duration()}
                value={playbackPosition}
                onChange={handleChange}
                defaultValue={0}
                aria-label="Small"
            />
        </div>
    );
}

export const MemoHowlerGroup = React.memo(HowlerGroup)