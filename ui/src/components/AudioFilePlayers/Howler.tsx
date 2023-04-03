import React, {useEffect} from "react";
import {Howl} from "howler";
import {Button, ButtonGroup, Slider} from "@mui/material";

interface HowlerProps {
    audioURLS: string[],
    mutes: string[]
}
function HowlerGroup(props: HowlerProps) {
    const [playbackPosition, setPlaybackPosition] = React.useState<number>(0);
    const [fileLength, setFileLength] = React.useState<number>(0);

    // Load in audio files
    let howls: any = {};
    props.audioURLS.forEach(function(url) {
        howls[url] = new Howl({
            src: url
        });
    });

    useEffect(() => {
        return () => {
            console.log("dismounting");
            props.audioURLS.forEach(function(url) {
                howls[url].stop();
            });
        }
    }, [])

    useEffect(() => {
        console.log("mute change");
        props.audioURLS.forEach(function(url) {
            if (props.mutes.includes(url)) {
                howls[url].mute(true);
                console.log("file muted")
            } else {
                howls[url].mute(false);
                console.log("file unmuted")
            }
        });
    }, [props.mutes]);

    const handlePlay = () => {
        console.log("play press")
        if (!fileLength) {
            console.log("setting file length")
            setFileLength(howls[props.audioURLS[0]].duration())
            console.log(fileLength)
        }
        if (!howls[props.audioURLS[0]].playing()) {
            console.log("current stem playing")
            props.audioURLS.forEach(function(url) {
                console.log("playing stem")
                howls[url].play();
            });
        }
    }

    const handlePause = () => {
        props.audioURLS.forEach(function(url) {
            howls[url].pause();
            console.log("stopping stem")
        });
        let pos = howls[props.audioURLS[0]].seek();
        console.log("reseek to " + pos)
        props.audioURLS.forEach(function(url) {
            howls[url].seek(pos);
            console.log("seeked to " + pos)
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