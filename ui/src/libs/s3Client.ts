import {S3Client} from "@aws-sdk/client-s3";

const REGION = "eu-west-2";
const s3Client = new S3Client({
	region: REGION,
	credentials: {
		accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
		secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY
	}
});
export {s3Client};