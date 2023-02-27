import React, {useState} from 'react';
import Uploader from "../Upload";
import AudioFilePlayer from "../AudioFilePlayer";

interface BodyProps {
    uuid: string,
    separatedStems: string[],
    createSQSQueue: Function
}

function Body(props: BodyProps) {
    const [uploadStatus, setUploadStatus] = useState<boolean>(false);
    const [sqsQueueURL, setQueueURL] = useState<string>();

    if (uploadStatus && !sqsQueueURL) {
        setQueueURL(props.createSQSQueue(props.uuid));
    }

    return (
        <div>
            <Uploader
                uuid={props.uuid}
                setUploadStatus={() => setUploadStatus(true)}
            />
            <div>
                {uploadStatus
                    ? <AudioFilePlayer audioURL = {"https://saas-deposit.s3.eu-west-2.amazonaws.com/upload_" + props.uuid}/>
                    : "player goes here"
                }
            </div>
        </div>
    )
}

export default Body;
