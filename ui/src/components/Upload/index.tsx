import React, {ChangeEvent, useState} from 'react';
import sty from "./upload.module.scss";
import {PutObjectCommand} from "@aws-sdk/client-s3";
import {s3Client} from "../../libs/s3Client";
import {FormControl, InputLabel, MenuItem, Select, SelectChangeEvent} from "@mui/material";

interface UploaderProps {
    uuid: string,
    setUploadStatus: Function,
    stemCount: string | number,
    setStemCount: Function
}

function Uploader(props: UploaderProps) {
    const [file, setFile] = useState<File>();
    const [validFile, setValidFile] = useState<boolean>(true);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            console.log(event.target.files[0].type);
            switch (event.target.files[0].type) {
                case 'audio/wav':
                    setFile(event.target.files[0]);
                    break;
                case 'audio/mpeg':
                    setFile(event.target.files[0]);
                    break;
                default:
                    setValidFile(false);
            }

        }
    };

    const handleStemCountChange = (event: SelectChangeEvent<typeof props.stemCount>) => {
        props.setStemCount(event.target.value);
    }

    const handleUploadClick = async () => {
        if (!file) {
            return;
        }

        const params = {
            Bucket: 'saas-deposit',
            Key: 'upload_' + props.uuid,
            Body: file
        }

        try {
            await s3Client.send(new PutObjectCommand(params));
        } catch (err) {
            console.log("Error", err);
        }

        props.setUploadStatus(true);
    };

    return (
        <div className={sty.upload}>
            <input type="file" onChange={handleFileChange}/>
            {
                (!validFile) ? <div>Please upload either a .wav or .mp3 file</div> : <div></div>
            }
            <div>{file && `${file.name} - ${file.type}`}</div>
            {
                (validFile) ? <FormControl>
                    How many parts do you want this file separated into?
                        <InputLabel id="stem-count-select-label">Number of Stems</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={props.stemCount}
                            autoWidth
                            label="Number of Stems"
                            onChange={handleStemCountChange}
                        >
                            <MenuItem value={2}>Two</MenuItem>
                            <MenuItem value={4}>Four</MenuItem>
                            <MenuItem value={5}>Five</MenuItem>
                        </Select>
                </FormControl>
                    : <div></div>
            }
            <button onClick={handleUploadClick}>Upload</button>
        </div>
    );
}

export default Uploader;
