import React, {ChangeEvent, useState} from 'react';
import sty from "./upload.module.scss";
import {PutObjectCommand} from "@aws-sdk/client-s3";
import {s3Client} from "../../libs/s3Client";

interface UploaderProps {
    uuid: string,
    setUploadStatus: Function
}

function Uploader(props: UploaderProps) {
    const [file, setFile] = useState<File>();

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
        }
    };

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

        // Delay to allow SNS topic before subscribing
        setTimeout(function () {
            props.setUploadStatus(true);
        }, 500);
    };

    return (
        <div className={sty.upload}>
            <input type="file" onChange={handleFileChange}/>
            <div>{file && `${file.name} - ${file.type}`}</div>
            <button onClick={handleUploadClick}>Upload</button>
        </div>
    );
}

export default Uploader;
