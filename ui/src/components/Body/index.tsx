import React, {useEffect, useState} from 'react';
import Uploader from "../Upload";
import AudioFilePlayer from "../AudioFilePlayer";
import {CreateQueueResult, ReceiveMessageResult} from "@aws-sdk/client-sqs";
import {CircularProgress, Slider} from '@mui/material';

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
            while (!sqsMessage?.Messages) {
                setSQSMessage(await props.getMessage(sqsQueueUrl));
                if (!sqsMessage?.Messages) {
                    console.log("Still separating...");
                }
            }
        }

        if (sqsQueueUrl) {
            getMessageFromQueue().then(() => {
                console.log("Message fetched from queue")
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

    // Handles changes in the spatial parameters UI
    const handleChange = (event: Event, newValue: number | number[], label: string, dimension: string) => {
        setSpatialParams({
            ...spatialParams, [label]: {
                ...spatialParams[label], [dimension]: newValue
            }
        });
    }

    return (<div>
            <Uploader
                uuid={props.uuid}
                setUploadStatus={() => setUploadStatus(true)}
            />
            <div>
                {(uploadStatus && !fileUrls) ? <CircularProgress/> : <div/>}
            </div>

            <div>
                {(fileUrls) ? <ol>
                    {fileUrls.map((url, index) => {
                        return (<div>
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
                </ol> : <div>"stems appear here"</div>}
            </div>
        </div>)
}

export default Body;
