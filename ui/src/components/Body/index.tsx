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
        async function createSqsQueue() {
            const result: CreateQueueResult = await props.createSQSQueue();
            console.log(result);
            setQueueUrl(result.QueueUrl);
        }
        async function setUploadedFileUrl() {
            const message: ReceiveMessageResult = await props.getMessage(sqsQueueUrl);
            console.log(message);
            setFileUrl("https://" + message.Messages + ".s3.eu-west-2.amazonaws.com/" + message.Messages);
        }
        if (uploadStatus && !sqsQueueUrl) {
            createSqsQueue().then();
            setUploadedFileUrl().then();
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
