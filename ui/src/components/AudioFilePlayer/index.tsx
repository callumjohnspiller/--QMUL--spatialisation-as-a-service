import React from "react";
import { createTheme } from '@material-ui/core/styles'
import { ThemeProvider } from '@material-ui/core';
import AudioPlayer from 'material-ui-audio-player';

interface AudioFilePlayerProps {
    audioURL: string
}

function AudioFilePlayer(props: AudioFilePlayerProps) {

    const uiTheme = createTheme({});

    return (
        <ThemeProvider theme={uiTheme}>
            <AudioPlayer
                src={props.audioURL}
                elevation={1}
                width="100%"
                variation="default"
                spacing={3}
                download={true}
            />
        </ThemeProvider>
    );
}

export default AudioFilePlayer;
