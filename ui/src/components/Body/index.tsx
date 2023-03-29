import React, { useEffect, useState } from 'react';
import { sfnClient } from '../../libs/stepFunctionsClient';
import { SendTaskSuccessCommand } from '@aws-sdk/client-sfn';
import { CreateQueueCommandOutput, ReceiveMessageResult } from '@aws-sdk/client-sqs';
import { GetMain } from './getMain';
import Slideshow from './Slideshow';

interface BodyProps {
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
  const [onBoarded, setOnBoarded] = useState<boolean>(false);

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
        const receiptHandle: string = (message?.Messages && message?.Messages[0].ReceiptHandle) ? message.Messages[0].ReceiptHandle : '';
        props.deleteMessage(sqsQueueUrl, receiptHandle);
      });
    }
  }, [stemsSubmitted]);

  // Converts message body into JSON
  useEffect(() => {
    if (sqsMessage) {
      const str: string = (sqsMessage?.Messages && sqsMessage?.Messages[0].Body) ? sqsMessage.Messages[0].Body : '';
      if (str != '') {
        setSQSMessageJson(JSON.parse(str));
      }
    }
  }, [sqsMessage]);

  // Creates file label array from JSON
  useEffect(() => {
    if (sqsMessageJson) {
      const pathArr: string[] = [];
      for (const path of sqsMessageJson['lambdaResult']['Payload']['output-paths']) {
        pathArr.push(path);
      }
      setFileLabels(pathArr);
    }
  }, [sqsMessageJson]);

  // Sets up spatial parameters object
  useEffect(() => {
    if (fileLabels.length > 0) {
      const spatialParamsSetup: any = {};
      for (const label of fileLabels) {
        spatialParamsSetup[label] = { 'X': 0, 'Y': 0, 'Z': 0 };
      }
      setSpatialParams(spatialParamsSetup);
    }
  }, [fileLabels]);

  // Sets the urls for the separated files
  useEffect(() => {
    if (fileLabels.length > 0 && !fileUrls) {
      const arr: string[] = [];
      for (const path of fileLabels) {
        arr.push('https://' + sqsMessageJson['lambdaResult']['Payload']['output-bucket'] + '.s3.eu-west-2.amazonaws.com/' + sqsMessageJson['lambdaResult']['Payload']['output-folder'] + '/' + path);
      }
      setFileUrls(arr);
    }
  }, [fileLabels]);

  // Fetches task id from state machine
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
    console.log(spatialParams);
  };

  const handleSubmit = () => {
    async function sendSpatialParams() {
      const input: any = {
        output: JSON.stringify(spatialParams), taskToken: taskToken
      };
      console.log(input);
      const command = new SendTaskSuccessCommand(input);
      return await sfnClient.send(command);
    }

    sendSpatialParams().then(() => {
      setSubmitted(true);
    });
  };

  const slides = [
    {
      title: 'Welcome!',
      content: 'This app is designed to demonstrate the capabilities of spatial audio!',
    },
    {
      title: 'But what is spatial audio?',
      content: 'Hopefully by now you are wearing your headphones (if not, I suggest grabbing your nearest pair!)\n\nWhen we listen to music through headphones, sound is being projected out of two speakers (one for each ear) and directly into our ears.\n\nWhen we listen to music in this manner, we can call this stereo audio.',
    },
    {
      title: 'Stereo vs Spatial pt.1',
      content: 'Stereo is great because it allows us to record music in a way that can position (or pan) sounds left and right by increasing or decreasing the volume in each ear. However, when we hear things in “real life”, lots of other factors are in play.\nSound never comes at us from just a left or right direction, but from all around us! Left, right, up, down, forwards, backwards, and every degree in between!\nIn addition, our human physiology comes into play; our head and ears actually block and shape sounds before they are picked up by our ear drums and brain.\nThis is why music can sound different coming through headphones compared to actually being in the room with musicians.',
    },
    {
      title: 'Stereo vs Spatial pt.2',
      content: 'Sound never comes at us from only a left or right direction, but from all around us! Left, right, up, down, forwards, backwards, and every degree in between!\n\nIn addition, our human physiology matters; our head and ears actually block and shape sounds before they are picked up by our ear drums and brain.\n\nThis is why music can sound different coming through headphones compared to actually being in a room with musicians.',
    },
    {
      title: 'So what?',
      content: 'Spatial audio technology is an attempt to recreate this `real-world` listening experience by adding `locality` to sound sources, positioning them around us!\n\nCinema surround sound systems can do this by using lots of different speakers in a theatre, and playing sounds out of each one.\n\nHowever, what this app will show you is that we can also do this virtually, using only a single pair of headphones.',
    },
    {
      title: 'Cool!',
      content: 'Right? This kind of technology is especially useful in areas like virtual reality (VR) and video games, where being able to hear `where` sounds are coming from in a game or simulation is important. Spatial audio technology can help our perception of game events or notifications, while also increasing the immersion factor of those experiences.',
    },
    {
      title: 'So what is next?',
      content: 'In this app, you are going to make your own 3D sound world, using your favourite piece of music!\n\nYou will upload a music file, then the app will separate that file into instruments, which you can then position around your listening position; like making your own concert hall where you choose where all the musicians sit!\n\nHave your music file at the ready, and we can begin!',
    },
  ];

  return (
    <div>
      {!onBoarded ?
        <Slideshow slides={slides} onNavigateToApp={() => setOnBoarded(true)} />
        : GetMain(uploadStatus, props, setUploadStatus, stemCount, setStemCount, fileUrls, submitted, outputUrl, fileLabels, spatialParams, handleChange, taskToken, handleSubmit)}
    </div>
  );
}

export default Body;
