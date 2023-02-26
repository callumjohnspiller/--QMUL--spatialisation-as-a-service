import React from "react";
import {HiArrowCircleDown, HiPlay} from "react-icons/hi";

interface AudioFilePlayerProps {
    filename: string,
    s3_url: string
}

const playFile = ({s3_url, state}: { s3_url: string, state: boolean }) => {

    let audio = new Audio(s3_url)

    if (state) {
        audio.play().then(r => console.log(r))
    } else {
        audio.pause()
    }

};

function AudioFilePlayer(props: AudioFilePlayerProps) {

    return (
        <div className="AudioFileListItem">
            <div className="AudioFileListElements">
                <a
                    href="javascript:void(0);"
                    onClick={() => playFile({s3_url: props.s3_url, state: true})}
                >
                    <span className="AudioFilePlayButton">
                        <HiPlay/>
                    </span>
                    <span className="AudioFilePlayButtonTitle">Play</span>
                </a>
                <a
                    href="javascript:void(0);"
                    // onClick={handleDownloadPlay(s3_url, true)}
                >
                    <span className="AudioFileDownloadButton">
                        <HiArrowCircleDown/>
                    </span>
                    <span className="AudioFileDownloadButtonTitle">
                        Download
                    </span>
                </a>
            </div>
        </div>
    );
}

export default AudioFilePlayer;
