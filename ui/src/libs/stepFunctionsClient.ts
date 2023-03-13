import {SFNClient} from "@aws-sdk/client-sfn";

const REGION = "eu-west-2";
const sfnClient = new SFNClient({
	region: REGION,
	credentials: {
		accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
		secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY
	}
});
export {sfnClient};

