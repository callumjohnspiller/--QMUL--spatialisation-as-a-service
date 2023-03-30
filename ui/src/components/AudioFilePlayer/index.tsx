import React, {useEffect} from "react";
import {Howl} from "howler";
import {Button, Checkbox, FormControlLabel, FormGroup, Switch, ToggleButton} from "@mui/material";

interface AudioFilePlayerProps {
    audioURL: string,
	playing: boolean,
	name?: string
}

function AudioFilePlayer(props: AudioFilePlayerProps) {
	const sound = new Howl({
		src: [props.audioURL],
		html5: true
	});

	const [muted, setMuted] = React.useState(false);
	const toggleMute = (event: React.ChangeEvent<HTMLInputElement>) => {
		setMuted(event.target.checked);
	};

	useEffect(() => {
		if (muted) {
			sound.volume(0)
		} else {
			sound.volume(1)
		}
	}, [muted])

	useEffect(() => {
		if (props.playing) {
			sound.play();
		} else {
			sound.pause();
		}
	}, [props.playing])

	return (
		<div>
			<p>{props.name}</p>
			<FormGroup>
				<FormControlLabel control={<Switch checked={muted} onChange={toggleMute} inputProps={{ 'aria-label': 'controlled' }}/>} label="Mute" />
			</FormGroup>
		</div>
	);
}

export const MemoAudioFilePlayer = React.memo(AudioFilePlayer);
