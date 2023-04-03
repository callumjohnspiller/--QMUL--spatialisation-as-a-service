import React, {useEffect} from "react";
import {Howl} from "howler";
import {Button, ButtonGroup, Slider} from "@mui/material";

interface HowlerProps {
    audioURLS: string[],
    mutes: string[]
}
function HowlerGroup(props: HowlerProps) {
    const [playbackPosition, setPlaybackPosition] = React.useState<number>(0);
    const [fileLength, setFileLength] = React.useState<number>();

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
        handleMutes();
        console.log(props.mutes)
    }, [props.mutes])

    const handleMutes = () => {
        props.audioURLS.forEach(function(url) {
            if (props.mutes.includes(url)) {
                howls[url].mute(true);
            } else {
                howls[url].mute(false);
            }
        });
    }

    const handlePlay = () => {
        if (!fileLength) {
            setFileLength(howls[props.audioURLS[0]].duration())
        }
        if (!howls[props.audioURLS[0]].playing()) {
            props.audioURLS.forEach(function(url) {
                howls[url].play();
            });
        }
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
        console.log(howls[props.audioURLS[0]].seek());
        console.log(newValue);
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
            {
                fileLength !== 0
              &&
              <Slider
                size="small"
                min={0}
                max={fileLength}
                value={playbackPosition}
                onChange={handleChange}
                defaultValue={0}
                aria-label="Small"
              />
            }
        </div>
    );
}

export const MemoHowlerGroup = React.memo(HowlerGroup)