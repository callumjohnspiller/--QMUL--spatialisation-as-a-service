import React, {useEffect, useState} from 'react';
import Uploader from "../Upload";
import AudioFilePlayer from "../AudioFilePlayer";
import {sfnClient} from "../../libs/stepFunctionsClient";
import {SendTaskSuccessCommand} from "@aws-sdk/client-sfn";
import {CreateQueueResult, ReceiveMessageResult} from "@aws-sdk/client-sqs";
import {Button, CircularProgress, Slider} from '@mui/material';

interface BodyProps {
    uuid: string,
    createSQSQueue: Function,
    getMessage: Function,
    deleteMessage: Function
}

function Body(props: BodyProps) {
    const [uploadStatus, setUploadStatus] = useState<boolean>(false);
    const [sqsQueueUrl, setQueueUrl] = useState<string>();
    const [sqsMessage, setSQSMessage] = useState<ReceiveMessageResult>();
    const [sqsMessageJson, setSQSMessageJson] = useState<any>();
    const [fileLabels, setFileLabels] = useState<string[]>([]);
    const [fileUrls, setFileUrls] = useState<string[]>();
    const [taskToken, setTaskToken] = useState<string>();
    const [spatialParams, setSpatialParams] = useState<any>();

    // Sets SQS URL after file is uploaded
    useEffect(() => {
        async function createSqsQueue() {
            const result: CreateQueueResult = await props.createSQSQueue();
            setQueueUrl(result.QueueUrl);
            return result;
        }

        if (!sqsQueueUrl && uploadStatus) {
            createSqsQueue().then((result) => {
                console.log(result)
            });
        }

    }, [uploadStatus]);

    // Fetches message from SQS Queue
    useEffect(() => {
        async function getMessageFromQueue() {
            let message: ReceiveMessageResult = await props.getMessage(sqsQueueUrl);
            // Wait for separation to occur
            while (!message?.Messages) {
                console.log("Retrying...")
                message = await props.getMessage(sqsQueueUrl);
            }
            return message;
        }

        if (sqsQueueUrl) {
            getMessageFromQueue().then((message) => {
                setSQSMessage(message);
                console.log("Message fetched from queue");
                return message;
            }).then((message) => {
                const receiptHandle: string = (message?.Messages && message?.Messages[0].ReceiptHandle) ? message.Messages[0].ReceiptHandle : "";
                props.deleteMessage(sqsQueueUrl, receiptHandle);
                console.log("Message cleared from queue");
            });
        }
    }, [sqsQueueUrl])

    // Converts message body into JSON
    useEffect(() => {
        if (sqsMessage) {
            const str: string = (sqsMessage?.Messages && sqsMessage?.Messages[0].Body) ? sqsMessage.Messages[0].Body : "";
            if (str != "") {
                setSQSMessageJson(JSON.parse(str));
            }
        }
    }, [sqsMessage])

    // Creates file label array from JSON
    useEffect(() => {
        if (sqsMessageJson) {
            let pathArr: string[] = [];
            for (let path of sqsMessageJson["lambdaResult"]["Payload"]["output-paths"]) {
                pathArr.push(path);
            }
            setFileLabels(pathArr);
        }
    }, [sqsMessageJson])

    // Sets up spatial parameters object
    useEffect(() => {
        if (fileLabels.length > 0) {
            let spatialParamsSetup: any = {};
            for (let label of fileLabels) {
                spatialParamsSetup[label] = {"X": 50, "Y": 50, "Z": 50};
            }
            setSpatialParams(spatialParamsSetup);
        }
    }, [fileLabels])

    // Sets the urls for the separated files
    useEffect(() => {
        if (fileLabels.length > 0) {
            let arr: string[] = [];
            for (let path of fileLabels) {
                arr.push("https://" + sqsMessageJson["lambdaResult"]["Payload"]["output-bucket"] + ".s3.eu-west-2.amazonaws.com/" + sqsMessageJson["lambdaResult"]["Payload"]["output-folder"] + "/" + path)
            }
            setFileUrls(arr);
        }
    }, [fileLabels])

    // Fetches task id from state machine
    useEffect(() => {
        async function getTaskTokenMessage() {
            let message: ReceiveMessageResult = await props.getMessage(sqsQueueUrl);
            const bodyString: string = (message?.Messages && message?.Messages[0].Body) ? message.Messages[0].Body : "";
            setTaskToken(JSON.parse(bodyString).TaskToken);
            return;
        }

        if (!taskToken && fileUrls) {
            getTaskTokenMessage().then(() => {
                console.log("Task token fetched");
            });
        }
    }, [fileUrls])

    // Handles changes in the spatial parameters UI
    const handleChange = (event: Event, newValue: number | number[], label: string, dimension: string) => {
        setSpatialParams({
            ...spatialParams, [label]: {
                ...spatialParams[label], [dimension]: newValue
            }
        });
    }

    const handleSubmit = () => {
        async function sendSpatialParams() {
            let outputJson: any = JSON.parse(JSON.stringify(spatialParams)); // Escape strings so AWS can handle it
            const input: any = {
                output: outputJson,
                taskToken: taskToken
            }
            const command = new SendTaskSuccessCommand(input);
            return await sfnClient.send(command);
        }

        sendSpatialParams().then((response) => {
            console.log(response);
        });
    }

    return (
        <div>
            <div>
                {(!uploadStatus) ? <Uploader uuid={props.uuid} setUploadStatus={() => setUploadStatus(true)}/>
                    : ""
                }
            </div>

            <div>
                {(uploadStatus && !fileUrls) ? <CircularProgress/> : <div/>}
            </div>

            <div>
                {(fileUrls) ? <ol>
                    {fileUrls.map((url, index) => {
                        return (<li>
                            <p>{fileLabels[index]}</p>
                            <AudioFilePlayer audioURL={url}/>
                            <div>
                                <Slider size={'medium'} defaultValue={50} aria-label={fileLabels[index] + "_X"}
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
                        </li>)
                    })}
                    {(taskToken) ? <li>
                        <p>
                            Submit parameters
                        </p>
                        <Button variant={"contained"} onClick={() => {
                            handleSubmit()
                        }}>
                            Render 3D Audio
                        </Button>
                    </li> : <li>"Waiting for task token"</li>
                    }
                </ol> : <div>"stems appear here"</div>
                }
            </div>
        </div>
    )
}

export default Body;
