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
    const [fileLabels, setFileLabels] = useState<string[]>();
    const [spatialParams, setSpatialParams] = useState<any>();

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
    }, [uploadStatus, sqsQueueUrl])

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
            const str: string = (message?.Messages && message?.Messages[0].Body) ? message.Messages[0].Body : "";
            const bodyJson: any = JSON.parse(str);

            console.log(bodyJson);
            console.log(bodyJson.lambdaResult.Payload["output-paths"]);

            let pathArr: string[] = [];

            for (let path of bodyJson["lambdaResult"]["Payload"]["output-paths"]) {
                pathArr.push(path)
            }

            setFileLabels(pathArr);

            console.log(fileLabels);

            let spatialParamsSetup: any = {};
            for (let label of fileLabels? fileLabels:[]) {
                spatialParamsSetup[label] = {"X": 50, "Y": 50, "Z": 50};
            }

            console.log(JSON.stringify(spatialParamsSetup));
            setSpatialParams(spatialParamsSetup);

            console.log(JSON.stringify(spatialParams));

            // Create an array of file paths
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
        setSpatialParams({
            ...spatialParams,
            [label]: {
                ...spatialParams[label],
                [dimension]: newValue
            }
        });
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
                        ? <CircularProgress/> : <div/>
                }
            </div>

            <div>
                {
                    (fileUrls)
                        ? <ol>
                            {fileUrls.map((url, index) => {
                                return(
                                <div>
                                    <p>{fileLabels[index]}</p>
                                    <AudioFilePlayer audioURL={url}/>
                                    <div>
                                        <Slider defaultValue={50} aria-label={fileLabels[index] + "_X"}
                                                value={spatialParams[fileLabels[index]]["X"]} onChange={(e, newValue) => {
                                            handleChange(e, newValue, fileLabels[index], "X")
                                        }}/>
                                        Set Value for forward/back
                                    </div>
                                    <div>
                                        <Slider defaultValue={50} aria-label={fileLabels[index] + "_Y"}
                                                value={spatialParams[fileLabels[index]]["Y"]} onChange={(e, newValue) => {
                                            handleChange(e, newValue, fileLabels[index], "Y")
                                        }}/>
                                        Set Value for left/right
                                    </div>
                                    <div>
                                        <Slider defaultValue={50} aria-label={fileLabels[index] + "_Y"}
                                                value={spatialParams[fileLabels[index]]["Z"]} onChange={(e, newValue) => {
                                            handleChange(e, newValue, fileLabels[index], "Z")
                                        }}/>
                                        Set Value for up/down
                                    </div>
                                </div>)
                            })}
                        </ol>
                        : <div>"stems appear here"</div>
                }
            </div>
        </div>
    )
}

export default Body;
