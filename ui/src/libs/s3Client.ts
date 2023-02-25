import {S3Client} from "@aws-sdk/client-s3";

const REGION = "eu-west-2";
const s3Client = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
    }
});
export {s3Client};