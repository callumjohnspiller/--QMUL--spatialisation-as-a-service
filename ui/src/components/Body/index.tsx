import React, { useEffect, useState } from 'react';
import { sfnClient } from '../../libs/stepFunctionsClient';
import { SendTaskSuccessCommand } from '@aws-sdk/client-sfn';
import { CreateQueueCommandOutput, ReceiveMessageResult } from '@aws-sdk/client-sqs';
import { GetMain } from './getMain';

export interface BodyProps {
  uuid: string,
  createSQSQueue: () => Promise<CreateQueueCommandOutput | undefined>,
  getMessage: (queueURL: string | undefined) => Promise<ReceiveMessageResult>,
  deleteMessage: (sqsQueueUrl: string | undefined, receiptHandle: string) => void
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
      const result: CreateQueueCommandOutput | undefined = await props.createSQSQueue();
      setQueueUrl(result ? result.QueueUrl : '');
      return;
    }

    if (!sqsQueueUrl && uploadStatus) {
      createSqsQueue().then(() => {
        return;
      });
    }

  }, [uploadStatus]);

  // Waits for a final file to be rendered and sets output URL

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
        return (message?.Messages && message?.Messages[0].Body) ? message.Messages[0].Body : '';
      }).then((str) => {
        const json: any = JSON.parse(str);
        setOutputUrl('https://saas-output.s3.eu-west-2.amazonaws.com/' + json['lambdaResult']['Payload']['output-folder'] + '_result.wav');
      });
    }
  }, [submitted]);

  // Wait for source separation confirmation SQS message then delete from queue

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
        const receiptHandle: string = (message?.Messages && message?.Messages[0].ReceiptHandle) ? message.Messages[0].ReceiptHandle : '';
        props.deleteMessage(sqsQueueUrl, receiptHandle);
      });
    }
  }, [stemsSubmitted]);

  // Converts SQS message body into JSON once received from queue
  useEffect(() => {
    if (sqsMessage) {
      const str: string = (sqsMessage?.Messages && sqsMessage?.Messages[0].Body) ? sqsMessage.Messages[0].Body : '';
      if (str != '') {
        setSQSMessageJson(JSON.parse(str));
      }
    }
  }, [sqsMessage]);

  // Creates a file label array from JSON SQS message
  useEffect(() => {
    if (sqsMessageJson) {
      const pathArr: string[] = [];
      for (const path of sqsMessageJson['lambdaResult']['Payload']['output-paths']) {
        pathArr.push(path);
      }
      setFileLabels(pathArr);
    }
  }, [sqsMessageJson]);

  // Creates spatial parameters object
  useEffect(() => {
    if (fileLabels.length > 0) {
      const spatialParamsSetup: any = {};
      for (const label of fileLabels) {
        spatialParamsSetup[label] = { 'X': 0, 'Y': 0, 'Z': 0 };
      }
      setSpatialParams(spatialParamsSetup);
    }
  }, [fileLabels]);

  // Sets the URLs for the separated file stems
  useEffect(() => {
    if (fileLabels.length > 0 && !fileUrls) {
      const arr: string[] = [];
      for (const path of fileLabels) {
        arr.push('https://' + sqsMessageJson['lambdaResult']['Payload']['output-bucket'] + '.s3.eu-west-2.amazonaws.com/' + sqsMessageJson['lambdaResult']['Payload']['output-folder'] + '/' + path);
      }
      setFileUrls(arr);
    }
  }, [fileLabels]);

  // Fetches task ID from Amazon Step Function once sources are separated.
  useEffect(() => {
    async function getTaskTokenMessage() {
      const message: ReceiveMessageResult = await props.getMessage(sqsQueueUrl);
      const bodyString: string = (message?.Messages && message?.Messages[0].Body) ? message.Messages[0].Body : '';
      setTaskToken(JSON.parse(bodyString).TaskToken);
      return message;
    }

    if (!taskToken && fileUrls) {
      getTaskTokenMessage().then((message) => {
        const receiptHandle: string = (message?.Messages && message?.Messages[0].ReceiptHandle) ? message.Messages[0].ReceiptHandle : '';
        props.deleteMessage(sqsQueueUrl, receiptHandle);
      });
    }
  }, [fileUrls]);

  //
  useEffect(() => {
    async function getTokenMessage() {
      const message: ReceiveMessageResult = await props.getMessage(sqsQueueUrl);
      const bodyString: string = (message?.Messages && message?.Messages[0].Body) ? message.Messages[0].Body : '';
      setStemTaskToken(JSON.parse(bodyString).TaskToken);
      return message;
    }

    if (typeof stemCount == 'number' && !stemTaskToken && sqsQueueUrl) {
      getTokenMessage().then((message) => {
        const receiptHandle: string = (message?.Messages && message?.Messages[0].ReceiptHandle) ? message.Messages[0].ReceiptHandle : '';
        props.deleteMessage(sqsQueueUrl, receiptHandle);
      });
    }

  }, [sqsQueueUrl]);

  // Callback function to Amazon Step Function confirming number of stems to separate uploaded file into.
  useEffect(() => {

    async function sendStemParams() {
      const input: any = {
        output: stemCount.toString(), taskToken: stemTaskToken
      };
      const command = new SendTaskSuccessCommand(input);
      return await sfnClient.send(command);
    }

    if (stemTaskToken) {
      sendStemParams().then(() => {
        setStemsSubmitted(true);
      });
    }

  }, [stemTaskToken]);

  // Handles changes in the spatial parameters UI
  const handleChange = (event: Event, newValue: number | number[], label: string, dimension: string) => {
    setSpatialParams({
      ...spatialParams, [label]: {
        ...spatialParams[label], [dimension]: newValue
      }
    });
  };

  // Function to handle confirmation of final spatial parameters.
  const handleSubmit = () => {
    async function sendSpatialParams() {
      const input: any = {
        output: JSON.stringify(spatialParams), taskToken: taskToken
      };
      const command = new SendTaskSuccessCommand(input);
      return await sfnClient.send(command);
    }

    sendSpatialParams().then(() => {
      setSubmitted(true);
    });
  };

  return (
    <div>
      {
        GetMain(
          uploadStatus,
          props,
          setUploadStatus,
          stemCount,
          setStemCount,
          fileUrls,
          submitted,
          outputUrl,
          fileLabels,
          spatialParams,
          handleChange,
          taskToken,
          handleSubmit
        )
      }
    </div>
  );
}

export default Body;
