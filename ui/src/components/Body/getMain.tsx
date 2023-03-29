import Uploader from '../Upload';
import { Button, CircularProgress, Slider, Step, Stepper, StepLabel, Typography } from '@mui/material';
import { MemoAudioFilePlayer } from '../AudioFilePlayer';
import Scene from '../3dSpace/Scene';
import React, { useState } from 'react';
import { CreateQueueCommandOutput, ReceiveMessageResult } from '@aws-sdk/client-sqs';

interface BodyProps {
  uuid: string,
  createSQSQueue: () => Promise<CreateQueueCommandOutput | undefined>,
  getMessage: (queueURL: string | undefined) => Promise<ReceiveMessageResult>,
  deleteMessage: (sqsQueueUrl: string | undefined, receiptHandle: string) => void
}

const steps = ['Upload Audio File', 'Set Spatial Parameters', 'Results'];

export function GetMain(uploadStatus: boolean, props: BodyProps, setUploadStatus: (value: (((prevState: boolean) => boolean) | boolean)) => void, stemCount: string | number, setStemCount: (value: (((prevState: (string | number)) => (string | number)) | string | number)) => void, fileUrls: string[] | undefined, submitted: boolean, outputUrl: string | undefined, fileLabels: string[], spatialParams: any, handleChange: (event: Event, newValue: (number | number[]), label: string, dimension: string) => void, taskToken: string | undefined, handleSubmit: () => void) {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  function getDiv() {
    return <div>
      <div>
        {(!uploadStatus) ?
          <Uploader uuid={props.uuid} setUploadStatus={() => setUploadStatus(true)} stemCount={stemCount}
                    setStemCount={setStemCount} /> : <></>}
      </div>

      <div>
        {(uploadStatus && !fileUrls) ? <CircularProgress /> : <div />}
      </div>

      <div>
        {(submitted && !outputUrl) ? <CircularProgress /> : <div />}
      </div>

      <div>
        {(fileUrls && !submitted) ? <ol>
          {fileUrls.map((url, index) => {
            return (<li key={index}>
              <p>{fileLabels[index]}</p>
              <MemoAudioFilePlayer audioURL={url} />
              <div>
                <Slider size={'medium'} min={-20} max={20} defaultValue={0} step={0.1}
                        aria-label={fileLabels[index] + '_X'} valueLabelDisplay={'auto'}
                        value={spatialParams[fileLabels[index]]['X']} onChange={(e, newValue) => {
                  handleChange(e, newValue, fileLabels[index], 'X');
                }} />
                Set Value for forward/back
              </div>
              <div>
                <Slider min={-20} max={20} defaultValue={0} step={0.1}
                        aria-label={fileLabels[index] + '_Y'}
                        valueLabelDisplay={'auto'}
                        value={spatialParams[fileLabels[index]]['Y']} onChange={(e, newValue) => {
                  handleChange(e, newValue, fileLabels[index], 'Y');
                }} />
                Set Value for left/right
              </div>
              <div>
                <Slider min={-20} max={20} defaultValue={0} step={0.1}
                        aria-label={fileLabels[index] + '_Y'}
                        valueLabelDisplay='auto'
                        value={spatialParams[fileLabels[index]]['Z']} onChange={(e, newValue) => {
                  handleChange(e, newValue, fileLabels[index], 'Z');
                }} />
                Set Value for up/down
              </div>
            </li>);
          })}
          {(taskToken) ? <li>
            <p>
              Submit parameters
            </p>
            <Button
              variant={'contained'}
              onClick={() => {
                handleSubmit();
              }}>
              Render 3D Audio
            </Button>
          </li> : <li>Waiting for task token</li>}
        </ol> : <></>}
      </div>

      <div>
        <Scene spatialParams={spatialParams} fileLabels={fileLabels} />
      </div>

      <div>
        {(outputUrl) ? <MemoAudioFilePlayer audioURL={outputUrl} /> : <></>}
      </div>
    </div>;
  }

  return (
  <div style={{ display: 'flex', flexDirection: 'row'}}>
    <Stepper activeStep={activeStep}>
      {steps.map((label, index) => {
        const stepProps: { completed?: boolean } = {};
        const labelProps: {
          optional?: React.ReactNode;
        } = {};
        return (
          <Step key={label} {...stepProps}>
            <StepLabel {...labelProps}>{label}</StepLabel>
          </Step>
        );
      })}
    </Stepper>
    {activeStep === steps.length ? (
      <React.Fragment>
        <Typography sx={{ mt: 2, mb: 1 }}>
          All steps completed - you&apos;re finished
        </Typography>
        <div style={{ display: 'flex', flexDirection: 'row'}}>
          <div style={{ flex: '1 1 auto' }} />
        </div>
      </React.Fragment>
    ) : (
      <React.Fragment>
        <Typography sx={{ mt: 2, mb: 1 }}>Step {activeStep + 1}</Typography>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <div style={{ flex: '1 1 auto' }} />
          <Button onClick={handleNext}>
            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </div>
      </React.Fragment>
    )}
    {getDiv()}
  </div>
  );
}