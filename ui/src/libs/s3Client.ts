import {S3Client} from "@aws-sdk/client-s3";
import {creds} from './creds';

const REGION = "eu-west-2";
const s3Client = new S3Client({region: REGION, credentials: creds});
export {s3Client};