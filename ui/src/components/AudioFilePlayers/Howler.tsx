import React, { useEffect, useState } from 'react';
import {Howl} from "howler";
import { Button, ButtonGroup, Divider, Slider, Stack, Typography } from '@mui/material';

interface HowlerProps {
    audioURLS: string[],
    mutes: string[]
}
function HowlerGroup(props: HowlerProps) {
    const [howls, setHowls] = useState<any>({});
    const [duration, setDuration] = useState<number>();
    const [position, setPosition] = useState<number>(0);

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

        const interval = setInterval(() => {
            if (Object.keys(howls).length > 0) {
                updatePosition();
            }
        }, 1000);

        return () => {
            props.audioURLS.forEach(function(url) {
                howls[url].stop();
            });
            clearInterval(interval);
        }
    }, []);

    useEffect(() => {
        props.audioURLS.forEach(url => {
            if (props.mutes.includes(url)) {
                howls[url].mute(true);
            }
            if (!props.mutes.includes(url)) {
                howls[url].mute(false);
            }
        });
    }, [props.mutes]);

    const updatePosition = () => {
        setPosition(howls[props.audioURLS[0]].seek());
    }

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

    const handlePositionChange = (e: Event, newValue: number | number[]) => {
        if (e.type == "mousedown") {
            props.audioURLS.forEach(function(url) {
                howls[url].pause();
            });
            let pos = newValue;
            props.audioURLS.forEach(function(url) {
                howls[url].seek(pos);
            });
        }
    }

    return (
        <div style={{justifyContent: 'center'}}>
            <ButtonGroup sx={{}}>
                <Button onClick={handlePlay}>
                    Play
                </Button>
                <Button onClick={handlePause}>
                    Pause
                </Button>
            </ButtonGroup>
            {howls &&
              <Stack
                spacing={2}
                direction="row"
                alignItems="center"
                justifyContent="space-around"
                divider={<Divider orientation="vertical" flexItem />}
              >
                  <Typography variant="caption" noWrap={true}>
                      {`${Math.floor(position % 3600 / 60)}: ${Math.floor(position % 3600 % 60).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}`}
                  </Typography>
                  <Slider
                    size="small"
                    value={position}
                    min={0}
                    max={duration}
                    onChange={(e, newValue) => {handlePositionChange(e, newValue)}}
                  />
                  <Typography variant="caption" noWrap={true}>
                      {duration ? `${Math.floor(duration % 3600 / 60)}: ${Math.floor(duration % 3600 % 60)}`: ""}
                  </Typography>
              </Stack>
            }
        </div>
    );
}

export const MemoHowlerGroup = React.memo(HowlerGroup)