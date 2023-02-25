import React, {ChangeEvent, useState} from 'react';
import sty from "./upload.module.scss";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../../libs/s3Client";

interface UploaderProps {
    uuid: string
}

function Uploader(props:UploaderProps) {
    const [file, setFile] = useState<File>();
    const [hasUploaded, setUploaded] = useState<boolean>();

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
            const results = await s3Client.send(new PutObjectCommand(params));
            setUploaded(true);
            return results;
        } catch (err) {
            console.log("Error", err);
        }
    };

    return (
        <div className={sty.upload}>
            <input type="file" onChange={handleFileChange}/>
            <div>{file && `${file.name} - ${file.type}`}</div>
            <button onClick={handleUploadClick}>Upload</button>
            <div>
                {hasUploaded ? "file uploaded successfully" : "AWAITING FILE"}
            </div>
        </div>
    );
}

export default Uploader;
