import React, {useState} from 'react';
import Uploader from "../Upload";
import AudioFilePlayer from "../AudioFilePlayer";

interface BodyProps {
    uuid: string,
    separatedStems: string[]
}

function Body(props: BodyProps) {
    const [uploadStatus, setUploadStatus] = useState<boolean>(false);

    return (
        <div>
            <Uploader
                uuid={props.uuid}
                setUploadStatus={() => setUploadStatus(true)}
            />
            {uploadStatus
                ? <AudioFilePlayer audioURL = {"https://saas-deposit.s3.eu-west-2.amazonaws.com/upload+" + props.uuid}/>
                : <div/>
            }

        </div>
    )
}

export default Body;
