import React, {useEffect, useState} from 'react';
import Uploader from "../Upload";
import AudioFilePlayer from "../AudioFilePlayer";
import {CreateQueueResult, ReceiveMessageResult} from "@aws-sdk/client-sqs";
import {CircularProgress, Slider} from '@mui/material';

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
    const [fileLabels, setFileLabels] = useState<string[]>([]);
    const [spatialParams, setSpatialParams] = useState<any>({});

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

            // Set file labels and set up spatial params
            setFileLabels(bodyJson["lambdaResult"]["Payload"]["output-paths"]);
            fileLabels.forEach((label: string) => {
                let obj: any = {}
                obj[label]["X"] = 50;
                obj[label]["Y"] = 50;
                obj[label]["Z"] = 50;
                setSpatialParams(Object.assign(spatialParams, obj));
            });

            // Create array of file paths
            let arr: string[] = [];
            for (let path of bodyJson["lambdaResult"]["Payload"]["output-paths"]) {
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

    const handleChange = (event: Event, newValue: number | number[], label: string, dimension: string) => {
        let obj = spatialParams;
        obj[label][dimension] = newValue;
        setSpatialParams(obj);
    }

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
                            {fileUrls.map((url, index) => (
                                <div>
                                    <p>{fileLabels[index]}</p>
                                    <AudioFilePlayer audioURL={url}/>
                                    <div>
                                        <Slider defaultValue={50} aria-label={fileLabels[index] + "_X"}
                                                value={spatialParams[fileLabels[index]]["X"]} onChange={(e, newValue) => {
                                            handleChange(e, newValue, fileLabels[index], "X")
                                        }}/>
                                        Set Value for X
                                    </div>
                                    <div>
                                        <Slider defaultValue={50} aria-label={fileLabels[index] + "_Y"}
                                                value={spatialParams[fileLabels[index]]["Y"]} onChange={(e, newValue) => {
                                            handleChange(e, newValue, fileLabels[index], "Y")
                                        }}/>
                                        Set Value for Y
                                    </div>
                                    <div>
                                        <Slider defaultValue={50} aria-label={fileLabels[index] + "_Y"}
                                                value={spatialParams[fileLabels[index]]["Z"]} onChange={(e, newValue) => {
                                            handleChange(e, newValue, fileLabels[index], "Z")
                                        }}/>
                                        Set Value for Z
                                    </div>
                                </div>
                            ))}
                        </ol>
                        : "stems appear here"
                }
            </div>
        </div>
    )
}

export default Body;
