import React, {useEffect, useState} from 'react';
import Uploader from "../Upload";
import AudioFilePlayer from "../AudioFilePlayer";

interface BodyProps {
    uuid: string,
    separatedStems: string[],
    createSQSQueue: Function,
    getMessage: Function,
    getSQSUrl: Function
}

function Body(props: BodyProps) {
    const [uploadStatus, setUploadStatus] = useState<boolean>(false);
    const [sqsQueueUrl, setQueueUrl] = useState<string>();
    const [originalFileUrl, setFileUrl] = useState<string>();

    useEffect(() => {
        if (uploadStatus && !sqsQueueUrl) {
            const data = props.createSQSQueue().then(() => {
                setQueueUrl(data.QueueUrl);
                }
            );
            console.log(sqsQueueUrl);
            const s3Message = props.getMessage(sqsQueueUrl).then(() => {
                setFileUrl("https://" + s3Message[1].detail.bucket.name + ".s3.eu-west-2.amazonaws.com/" + s3Message[1].detail.object.key);
            });

        }
    });

    return (
        <div>
            <Uploader
                uuid={props.uuid}
                setUploadStatus={() => setUploadStatus(true)}
            />
            <div>
                {(originalFileUrl)
                    ? <AudioFilePlayer audioURL={originalFileUrl}/>
                    : "player goes here"
                }
            </div>
        </div>
    )
}

export default Body;
