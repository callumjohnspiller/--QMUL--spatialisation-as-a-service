import {SQSClient} from "@aws-sdk/client-sqs";

const REGION = "eu-west-2";
const sqsClient = new SQSClient({
	region: REGION,
	apiVersion: "2012-11-05",
	credentials: {
		accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
		secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY
	}
});
export {sqsClient};