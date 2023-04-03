import React, { useEffect, useState } from 'react';
import {Howl} from "howler";
import {Button, ButtonGroup} from "@mui/material";

interface HowlerProps {
    audioURLS: string[],
    mutes: string[]
}
function HowlerGroup(props: HowlerProps) {
    const [howls, setHowls] = useState<any>({});
    const [duration, setDuration] = useState<number>();

    useEffect(() => {
        props.audioURLS.forEach(function(url) {
            let tmp = howls;
            tmp[url] = new Howl({
                src: url,
                onload: function() {
                    console.log("loaded file");
                    setDuration(tmp[url].duration());}
            });
            setHowls(tmp);
        });
        console.log("set duration to " + duration);

        return () => {
            props.audioURLS.forEach(function(url) {
                howls[url].stop();
            });
        }
    }, [])

    useEffect(() => {
        console.log("mute change");
        console.log(props.audioURLS);
        console.log(props.mutes);
        props.audioURLS.forEach(url => {
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
        if (!howls[props.audioURLS[0]].playing()) {
            props.audioURLS.forEach(url => {
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
        </div>
    );
}

export const MemoHowlerGroup = React.memo(HowlerGroup)