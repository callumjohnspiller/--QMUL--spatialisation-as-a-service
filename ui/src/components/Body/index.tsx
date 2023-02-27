import React, {useEffect, useState} from 'react';
import Uploader from "../Upload";
import AudioFilePlayer from "../AudioFilePlayer";
import {CreateQueueResult, ReceiveMessageResult} from "@aws-sdk/client-sqs";

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
            props.createSQSQueue().then((result: CreateQueueResult) => {
                setQueueUrl(result.QueueUrl);
                }
            );
            props.getMessage(sqsQueueUrl).then((s3Message: ReceiveMessageResult) => {
                console.log(s3Message);
                setFileUrl("https://" + s3Message.Messages + ".s3.eu-west-2.amazonaws.com/" + s3Message.Messages);
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
