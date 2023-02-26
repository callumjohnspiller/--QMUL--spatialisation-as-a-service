import {SNSClient} from "@aws-sdk/client-sns";

const REGION = "eu-west-2";
const snsClient = new SNSClient({
    region: REGION,
    credentials: {
        accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY
    }
});
export {snsClient};