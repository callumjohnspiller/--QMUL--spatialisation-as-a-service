import React, {useState} from 'react';
import Uploader from "../Upload";
import {SubscribeCommand} from "@aws-sdk/client-sns";
import {snsClient} from "../../libs/snsClient";

interface BodyProps {
    uuid: string
}

const [hasUploaded, setUploaded] = useState<boolean>(false);

function Body(props:BodyProps) {
    return (
        <div>
            <Uploader uuid={props.uuid} hasUploaded={hasUploaded} setUpload={() => setUploaded(true)}></Uploader>
            <div>{hasUploaded ? "state passed successfully" : "you can do it!"}</div>
        </div>
    )
}

export default Body;
