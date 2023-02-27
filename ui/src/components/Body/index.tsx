import React, {useEffect, useState} from 'react';
import Uploader from "../Upload";
import AudioFilePlayer from "../AudioFilePlayer";
import {CreateQueueResult, ReceiveMessageResult} from "@aws-sdk/client-sqs";

interface BodyProps {
    uuid: string,
    separatedStems: string[],
    createSQSQueue: Function,
    getMessage: Function
}

function Body(props: BodyProps) {
    const [uploadStatus, setUploadStatus] = useState<boolean>(false);
    const [sqsQueueUrl, setQueueUrl] = useState<string>();
    const [originalFileUrl, setFileUrl] = useState<string>();

    useEffect(() => {
        async function createSqsQueue() {
            const result: CreateQueueResult = await props.createSQSQueue();
            setQueueUrl(result.QueueUrl);
            return result;
        }
        async function setUploadedFileUrl() {
            const message: ReceiveMessageResult = await props.getMessage(sqsQueueUrl);
            const str: string = (message.Messages && message.Messages[0].Body) ? message.Messages[0].Body : "";
            const bodyJson = JSON.parse(str);
            setFileUrl("https://" + bodyJson.detail.bucket.name + ".s3.eu-west-2.amazonaws.com/" + bodyJson.detail.object.key);
        }
        if (uploadStatus && !sqsQueueUrl) {
            createSqsQueue().then((result) => {console.log(result)});
        }
        if (sqsQueueUrl && !originalFileUrl) {
            setUploadedFileUrl().then((result) => {console.log(result)});
        }
    }, [uploadStatus, sqsQueueUrl]);

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
