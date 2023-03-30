import Uploader from '../Upload';
import {Button, CircularProgress, FormControlLabel, FormGroup, Slider, Switch} from '@mui/material';
import { MemoAudioFilePlayer } from '../AudioFilePlayers';
import Scene from '../3dSpace/Scene';
import React, {useState} from 'react';
import { BodyProps } from './index';
import {MemoHowlerGroup} from "../AudioFilePlayers/Howler";

export function GetMain(
  uploadStatus: boolean,
  props: BodyProps,
  setUploadStatus: (value: (((prevState: boolean) => boolean) | boolean)) => void,
  stemCount: string | number,
  setStemCount: (value: (((prevState: (string | number)) => (string | number)) | string | number)) => void,
  fileUrls: string[] | undefined,
  submitted: boolean,
  outputUrl: string | undefined,
  fileLabels: string[],
  spatialParams: any,
  handleChange: (event: Event, newValue: (number | number[]), label: string, dimension: string) => void,
  taskToken: string | undefined, handleSubmit: () => void
) {
  const [mutedChannels, setMutedChannels] = useState<string[]>([]);
  const toggleMute = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event);
  };
  return (
    <main>
      {!uploadStatus && <Uploader uuid={props.uuid} setUploadStatus={() => setUploadStatus(true)} stemCount={stemCount}
                                  setStemCount={setStemCount} />
      }
      {(uploadStatus && !fileUrls) && <CircularProgress />}
      {(submitted && !outputUrl) && <CircularProgress />}
      {(fileUrls && !submitted) &&
          <div>
            <MemoHowlerGroup audioURLS={fileUrls} spatialParams={spatialParams} fileLabels={fileLabels}/>
            <ol style={{width: 500}}>
              {fileUrls.map((url, index) => {
                return (
                    <li key={index}>
                      <p>{fileLabels[index]}</p>
                      <FormGroup>
                        <FormControlLabel control={<Switch onChange={toggleMute} inputProps={{ 'aria-label': `${url}` }}/>} label={`Mute`} />
                      </FormGroup>
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
            </ol>
          </div>
      }
      {fileUrls && <Scene spatialParams={spatialParams} fileLabels={fileLabels} />}
      {outputUrl && <MemoAudioFilePlayer audioURL={outputUrl}/>}
    </main>
  );
}