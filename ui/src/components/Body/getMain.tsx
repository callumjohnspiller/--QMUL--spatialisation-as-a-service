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

  function handleMute(e: React.ChangeEvent<HTMLInputElement>, newValue: boolean | undefined) {
    if (newValue && !mutedChannels.includes(e!.target!.attributes!.item(2)!.value)) {
      let tmp = [...mutedChannels];
      tmp.push(e!.target!.attributes!.item(2)!.value);
      setMutedChannels(tmp);
    }
    if (!newValue) {
      setMutedChannels(mutedChannels.filter((val) => { return val !== e!.target!.attributes!.item(2)!.value}))
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      {!uploadStatus &&
        <div style={{position: 'absolute', top: "50%", left: "50%", height: "50vh", width: "50vw"}}>
          <Uploader
            uuid={props.uuid}
            setUploadStatus={() => setUploadStatus(true)}
            stemCount={stemCount}
            setStemCount={setStemCount}
          />
      </div>
      }
      {(uploadStatus && !fileUrls) && <CircularProgress sx={{position: 'absolute', top: "50%", left: "50%", height: "10vh", width: "10vw"}}/>}
      {(submitted && !outputUrl) && <CircularProgress sx={{position: 'absolute', top: "50%", left: "50%", height: "10vh", width: "10vw"}}/>}
      {(fileUrls && !submitted) &&
          <div style={{ position: 'absolute', top: 30, right: 20, zIndex: 1 }}>
            <MemoHowlerGroup audioURLS={fileUrls} mutes={mutedChannels}/>
            <ul style={{width: 500}}>
              {fileUrls.map((url, index) => {
                return (
                    <li>
                      <p>{fileLabels[index]}</p>
                      <FormGroup>
                        <FormControlLabel
                          control={
                          <Switch
                            onChange={(e, newValue) => {
                              handleMute(e, newValue)}
                            }
                            inputProps={{ 'aria-label': `${url}` }}/>}
                            label={`Mute`}
                        />
                      </FormGroup>
                      <div>
                        <Slider size={'medium'} min={-20} max={20} defaultValue={0} step={0.1}
                                aria-label={fileLabels[index] + '_Y'} valueLabelDisplay={'auto'}
                                value={spatialParams[fileLabels[index]]['Y']} onChange={(e, newValue) => {
                          handleChange(e, newValue, fileLabels[index], 'Y');
                        }} />
                      </div>
                  <div>
                    <Slider min={-20} max={20} defaultValue={0} step={0.1}
                            aria-label={fileLabels[index] + '_X'}
                            valueLabelDisplay={'auto'}
                            value={spatialParams[fileLabels[index]]['X']} onChange={(e, newValue) => {
                      handleChange(e, newValue, fileLabels[index], 'X');
                    }} />
                  </div>
                  <div>
                    <Slider min={-20} max={20} defaultValue={0} step={0.1}
                            aria-label={fileLabels[index] + '_Z'}
                            valueLabelDisplay='auto'
                            value={spatialParams[fileLabels[index]]['Z']} onChange={(e, newValue) => {
                      handleChange(e, newValue, fileLabels[index], 'Z');
                    }} />
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
            </ul>
          </div>
      }
      {fileUrls && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}><Scene spatialParams={spatialParams} fileLabels={fileLabels} /></div>}
      {outputUrl && <div style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 2 }}><MemoAudioFilePlayer audioURL={outputUrl}/></div>}
    </div>
  );
}