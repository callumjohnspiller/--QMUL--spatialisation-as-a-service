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
                onload: function() {console.log("loaded " + url)}
            });
            setHowls(tmp);
        });
        setDuration(howls[props.audioURLS[0]]._duration);
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
        console.log("play press")
        if (!howls[props.audioURLS[0]].playing()) {
            props.audioURLS.forEach(url => {
                console.log("playing stem" + url)
                howls[url].play();
            });
        }
        console.log("current stem playing did not start again")
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