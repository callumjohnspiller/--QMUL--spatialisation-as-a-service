import React, {useEffect, useState} from 'react';
import Uploader from "../Upload";
import AudioFilePlayer from "../AudioFilePlayer";
import {CreateQueueResult, ReceiveMessageResult} from "@aws-sdk/client-sqs";
import {CircularProgress} from '@mui/material';

interface BodyProps {
    uuid: string,
    separatedStems: string[],
    createSQSQueue: Function,
    getMessage: Function,
    deleteMessage: Function
}

function Body(props: BodyProps) {
    const [uploadStatus, setUploadStatus] = useState<boolean>(false);
    const [sqsQueueUrl, setQueueUrl] = useState<string>();
    const [fileUrls, setFileUrls] = useState<string[]>();

    // Sets SQS URL after file is uploaded
    useEffect(() => {
        async function createSqsQueue() {
            const result: CreateQueueResult = await props.createSQSQueue();
            setQueueUrl(result.QueueUrl);
            return result;
        }

        if (uploadStatus && !sqsQueueUrl) {
            createSqsQueue().then((result) => {
                console.log(result)
            });
        }
    }, [uploadStatus])

    // Stores the URL of the created files and deletes the received message from the SQS queue.
    useEffect(() => {
        async function setUploadedFileUrl() {
            let message: ReceiveMessageResult = await props.getMessage(sqsQueueUrl);
            // Wait for separation to occur
            while (!message?.Messages) {
                console.log("Retrying...")
                message = await props.getMessage(sqsQueueUrl);
            }
            // Parse json string from message
            const str: string = (message.Messages && message.Messages[0].Body) ? message.Messages[0].Body : "";
            const bodyJson: any = JSON.parse(str);
            // Create array of file paths
            let arr: string[] = [];
            for (let path in bodyJson["lambdaResult"]["Payload"]["output-paths"]) {
                arr.push("https://" + bodyJson["lambdaResult"]["Payload"]["output-bucket"] + ".s3.eu-west-2.amazonaws.com/" + bodyJson["lambdaResult"]["Payload"]["output-folder"] + "/" + path)
            }
            setFileUrls(arr);
            // Delete fetched message from queue
            if (message.Messages) {
                await props.deleteMessage(sqsQueueUrl, message.Messages[0].ReceiptHandle);
            }
        }

        if (sqsQueueUrl && !fileUrls) {
            setUploadedFileUrl().then((result) => {
                console.log(result);
            });
        }
    }, [sqsQueueUrl]);

    return (
        <div>
            <Uploader
                uuid={props.uuid}
                setUploadStatus={() => setUploadStatus(true)}
            />
            <div>
                {
                    (uploadStatus && !fileUrls)
                        ? <CircularProgress/> : null
                }
            </div>

            <div>
                {
                    (fileUrls)
                    ? <ol>
                            {fileUrls.map(url => (
                                <AudioFilePlayer audioURL={url}/>
                            ))}
                        </ol>
                        : "stems appear here"
                }
            </div>
        </div>
    )
}

export default Body;
