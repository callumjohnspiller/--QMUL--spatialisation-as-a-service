import React, {useState} from 'react';
import Uploader from "../Upload";
import {SubscribeCommand} from "@aws-sdk/client-sns";
import {snsClient} from "../../libs/snsClient";

interface BodyProps {
    uuid: string
}

function Body(props:BodyProps) {
    const [hasUploaded, setUploaded] = useState<boolean>(false);

    return (
        <div>
            <Uploader
                uuid={props.uuid}
                hasUploaded={hasUploaded}
                setUpload={() => setUploaded(true)}
            />
            <div>{hasUploaded ? "state passed successfully" : "you can do it!"}</div>
        </div>
    )
}

export default Body;
