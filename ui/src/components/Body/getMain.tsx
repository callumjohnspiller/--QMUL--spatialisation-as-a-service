import Uploader from '../Upload';
import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  Slider,
  Stack,
  Switch,
  Typography
} from '@mui/material';
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
      {
        !uploadStatus &&
        <Uploader
          uuid={props.uuid}
          setUploadStatus={() => setUploadStatus(true)}
          stemCount={stemCount}
          setStemCount={setStemCount}
        />
      }
      {
        (uploadStatus && !fileUrls) &&
        <div style={{
          display: 'block',
          margin: 'auto',
          width: '60%',
          padding: 100,
          zIndex: 1,
        }}
        >
          <Stack spacing={3}>
            <CircularProgress
              sx={{
                display: 'block',
                margin: 'auto',
              }}
              size={60}
            />
            <Typography
              sx={{
                display: 'block',
                margin: 'auto',
                textAlign: 'center'
              }}
            fontSize={20}
            >
              Please be patient; separating the audio can take a couple of minutes!
            </Typography>
          </Stack>
        </div>
      }
      {(submitted && !outputUrl) &&
        <div style={{
          display: 'block',
          margin: 'auto',
          width: '60%',
          padding: 100,
          zIndex: 1
        }}
        >
          <CircularProgress
            sx={{
              display: 'block',
              margin: 'auto',
            }}
            size={60}
          />
        </div>
      }
      {(fileUrls && !submitted) &&
          <Card sx={{ position: 'absolute', margin: 2, top: 30, right: 10, zIndex: 1, backgroundColor: "papayawhip", opacity: 0.8, maxHeight: 800, overflow: 'auto' }}>
            <CardContent sx={{opacity: 1, justifyItems: 'center', maxHeight: 800, overflow: 'auto'}}>
              <MemoHowlerGroup audioURLS={fileUrls} mutes={mutedChannels}/>
              <div style={{width: 400, justifyContent: 'center'}}>
                {fileUrls.map((url, index) => {
                  return (
                    <Stack sx={{padding: 2, justifyItems: 'center'}} spacing={2}>
                      <Typography>{fileLabels[index]}</Typography>
                      <FormGroup>
                        <FormControlLabel
                          control={
                          <Switch
                            onChange={(e, newValue) => {
                              handleMute(e, newValue)
                              }
                            }
                            inputProps={{ 'aria-label': `${url}` }}/>}
                            label={`Mute`}
                          />
                      </FormGroup>
                      <Slider
                        min={-20} max={20} defaultValue={0} step={0.1}
                        aria-label={fileLabels[index] + '_X'}
                        valueLabelDisplay={'auto'}
                        value={spatialParams[fileLabels[index]]['X']}
                        onChange={(e, newValue) => {
                          handleChange(e, newValue, fileLabels[index], 'X');
                        }
                        }
                      />
                      <Slider
                        min={-20} max={20} defaultValue={0} step={0.1}
                        aria-label={fileLabels[index] + '_Y'} valueLabelDisplay={'auto'}
                        value={spatialParams[fileLabels[index]]['Y']}
                        onChange={(e, newValue) => {
                          handleChange(e, newValue, fileLabels[index], 'Y');
                          }
                        }
                      />
                      <Slider
                        min={-20} max={20} defaultValue={0} step={0.1}
                        aria-label={fileLabels[index] + '_Z'}
                        valueLabelDisplay='auto'
                        value={spatialParams[fileLabels[index]]['Z']}
                        onChange={(e, newValue) => {
                          handleChange(e, newValue, fileLabels[index], 'Z');
                        }
                      }
                      />
                    </Stack>
                  );
                })}

                {(taskToken) ?
                  <Button
                      variant={'contained'}
                      onClick={() => {
                        handleSubmit();
                      }}>
                    Render 3D Audio
                  </Button> : <p>Waiting for task token</p>}
              </div>
            </CardContent>
          </Card>
      }
      {fileUrls && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}><Scene spatialParams={spatialParams} fileLabels={fileLabels} /></div>}
      {outputUrl && <Card sx={{ position: 'absolute', margin: 10, top: 30, right: 20, zIndex: 1, backgroundColor: "papayawhip", opacity: 0.5 }}><CardContent><MemoAudioFilePlayer audioURL={outputUrl}/></CardContent></Card>}
    </div>
  );
}