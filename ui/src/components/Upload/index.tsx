import React, {ChangeEvent, useState} from 'react';
import sty from "./upload.module.scss";
import { v4 as uuidv4 } from 'uuid';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../../libs/s3Client";

type UploaderProps = {};

const Uploader: React.FunctionComponent<UploaderProps> = () => {
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

        const uploadId = uuidv4();

        const params = {
            Bucket: 'saas-deposit',
            Key: 'upload_' + uploadId,
            Body: file
        }

        try {
            const results = await s3Client.send(new PutObjectCommand(params));
            console.log(results)
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
        </div>
    );
}

export default Uploader;
