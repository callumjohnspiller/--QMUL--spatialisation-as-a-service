import React, {useState} from 'react';
import Uploader from "../Upload";
import AudioFilePlayer from "../AudioFilePlayer";

interface BodyProps {
    uuid: string
}

function Body(props: BodyProps) {
    const [uploadStatus, setUploadStatus] = useState<boolean>(false);

    return (
        <div>
            <Uploader
                uuid={props.uuid}
                setUploadStatus={() => setUploadStatus(true)}
            />
            <AudioFilePlayer filename={"test"}
                             s3_url={"https://saas-deposit.s3.eu-west-2.amazonaws.com/Bobby+Bare%2C+Jr+-+Sad+Smile.mp3"}/>
        </div>
    )
}

export default Body;
