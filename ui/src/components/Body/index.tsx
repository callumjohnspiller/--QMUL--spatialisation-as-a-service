import React, {useEffect, useState} from 'react';
import Uploader from "../Upload";
import {MemoAudioFilePlayer} from "../AudioFilePlayer";
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
    const [stemCount, setStemCount] = useState<string | number>('');
    const [stemsSubmitted, setStemsSubmitted] = useState<boolean>(false);
    const [sqsQueueUrl, setQueueUrl] = useState<string>();
    const [sqsMessage, setSQSMessage] = useState<ReceiveMessageResult>();
    const [sqsMessageJson, setSQSMessageJson] = useState<any>();
    const [fileLabels, setFileLabels] = useState<string[]>([]);
    const [fileUrls, setFileUrls] = useState<string[]>();
    const [taskToken, setTaskToken] = useState<string>();
    const [stemTaskToken, setStemTaskToken] = useState<string>();
    const [spatialParams, setSpatialParams] = useState<any>();
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [outputUrl, setOutputUrl] = useState<string>();

    // Sets SQS URL after file is uploaded
    useEffect(() => {
        async function createSqsQueue() {
            const result: CreateQueueResult = await props.createSQSQueue();
            setQueueUrl(result.QueueUrl);
            return result;
        }

        if (!sqsQueueUrl && uploadStatus) {
            createSqsQueue().then((result) => {
            });
        }

    }, [uploadStatus]);

    useEffect(() => {
        async function getConfirmation() {
            let message: ReceiveMessageResult = await props.getMessage(sqsQueueUrl);
            while (!message?.Messages) {
                message = await props.getMessage(sqsQueueUrl);
            }
            return message;
        }

        if (submitted) {
            getConfirmation().then((message) => {
                return message;
            }).then((message) => {
                const str: string = (message?.Messages && message?.Messages[0].Body) ? message.Messages[0].Body : "";
                return str;
            }).then((str) => {
                let json: any = JSON.parse(str);
                setOutputUrl("https://saas-output.s3.eu-west-2.amazonaws.com/" + json["lambdaResult"]["Payload"]["output-folder"] + "_result.wav");
            });
        }
    }, [submitted])

    // Fetches message from SQS Queue
    useEffect(() => {
        async function getMessageFromQueue() {
            let message: ReceiveMessageResult = await props.getMessage(sqsQueueUrl);
            // Wait for separation to occur
            while (!message?.Messages) {
                message = await props.getMessage(sqsQueueUrl);
            }
            return message;
        }

        if (sqsQueueUrl && stemsSubmitted) {
            getMessageFromQueue().then((message) => {
                setSQSMessage(message);
                return message;
            }).then((message) => {
                const receiptHandle: string = (message?.Messages && message?.Messages[0].ReceiptHandle) ? message.Messages[0].ReceiptHandle : "";
                props.deleteMessage(sqsQueueUrl, receiptHandle);
            });
        }
    }, [stemsSubmitted])

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
        if (fileLabels.length > 0 && !fileUrls) {
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
            return message;
        }

        if (!taskToken && fileUrls) {
            getTaskTokenMessage().then((message) => {
                const receiptHandle: string = (message?.Messages && message?.Messages[0].ReceiptHandle) ? message.Messages[0].ReceiptHandle : "";
                props.deleteMessage(sqsQueueUrl, receiptHandle);
            });
        }
    }, [fileUrls])

    useEffect(() => {
        async function getTokenMessage() {
            let message: ReceiveMessageResult = await props.getMessage(sqsQueueUrl);
            const bodyString: string = (message?.Messages && message?.Messages[0].Body) ? message.Messages[0].Body : "";
            setStemTaskToken(JSON.parse(bodyString).TaskToken);
            return message;
        }

        if (typeof stemCount == 'number' && !stemTaskToken && sqsQueueUrl) {
            getTokenMessage().then((message) => {
                const receiptHandle: string = (message?.Messages && message?.Messages[0].ReceiptHandle) ? message.Messages[0].ReceiptHandle : "";
                props.deleteMessage(sqsQueueUrl, receiptHandle);
            });
        }

    }, [sqsQueueUrl])

    useEffect(() => {

        async function sendStemParams() {
            const input: any = {
                output: stemCount.toString(), taskToken: stemTaskToken
            }
            const command = new SendTaskSuccessCommand(input);
            return await sfnClient.send(command);
        }

        if (stemTaskToken) {
            sendStemParams().then(() => {
                setStemsSubmitted(true);
            });
        }

    }, [stemTaskToken])

    // Handles changes in the spatial parameters UI
    const handleChange = (event: Event, newValue: number | number[], label: string, dimension: string) => {
        setSpatialParams({
            ...spatialParams, [label]: {
                ...spatialParams[label], [dimension]: newValue
            }
        });
        console.log(spatialParams);
    }

    const handleSubmit = () => {
        async function sendSpatialParams() {
            const input: any = {
                output: JSON.stringify(spatialParams), taskToken: taskToken
            }
            console.log(input);
            const command = new SendTaskSuccessCommand(input);
            return await sfnClient.send(command);
        }

        sendSpatialParams().then((response) => {
            setSubmitted(true);
        });
    }

    return (<div>
        <div>
            {(!uploadStatus) ?
                <Uploader uuid={props.uuid} setUploadStatus={() => setUploadStatus(true)} stemCount={stemCount}
                          setStemCount={setStemCount}/> : <div></div>}
        </div>

        <div>
            {(uploadStatus && !fileUrls) ? <CircularProgress/> : <div/>}
        </div>

        <div>
            {(submitted && !outputUrl) ? <CircularProgress/> : <div/>}
        </div>

        <div>
            {(fileUrls && !submitted) ? <ol>
                {fileUrls.map((url, index) => {
                    return (<li>
                        <p>{fileLabels[index]}</p>
                        <MemoAudioFilePlayer audioURL={url}/>
                        <div>
                            <Slider size={'medium'} min={-20} max={20} defaultValue={0} step={0.1}
                                    aria-label={fileLabels[index] + "_X"} valueLabelDisplay={"on"}
                                    value={spatialParams[fileLabels[index]]["X"]} onChange={(e, newValue) => {
                                handleChange(e, newValue, fileLabels[index], "X")
                            }}/>
                            Set Value for forward/back
                        </div>
                        <div>
                            <Slider min={-20} max={20} defaultValue={0} step={0.1} aria-label={fileLabels[index] + "_Y"}
                                    valueLabelDisplay={"on"}
                                    value={spatialParams[fileLabels[index]]["Y"]} onChange={(e, newValue) => {
                                handleChange(e, newValue, fileLabels[index], "Y")
                            }}/>
                            Set Value for left/right
                        </div>
                        <div>
                            <Slider min={-20} max={20} defaultValue={0} step={0.1} aria-label={fileLabels[index] + "_Y"}
                                    valueLabelDisplay={"on"}
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
                </li> : <li>"Waiting for task token"</li>}
            </ol> : <div>stems appear here</div>}
        </div>

        <div>
            {(outputUrl) ? <MemoAudioFilePlayer audioURL={outputUrl}/> : <div></div>}
        </div>
    </div>)
}

export default Body;
