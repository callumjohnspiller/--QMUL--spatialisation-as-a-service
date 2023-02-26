import React from "react";
import {v4 as uuidv4} from 'uuid';
import "./stylesheets/styles.scss";
import Header from "./components/Header";
import Body from "./components/Body";
import { CreateQueueCommand } from  "@aws-sdk/client-sqs";
import {sqsClient} from "./libs/sqsClient";

export default class App extends React.Component<{}, { uuid: string, separatedStems: string[] }> {
    constructor(props: {}) {
        super(props);
        this.state = {
            uuid: uuidv4(),
            separatedStems: []
        };
        createSQSQueue(this.state.uuid).then(data => console.log(data))
    }

    render() {
        return (
            <div id="react-app" className={"App"}>
                <Header/>
                <Body uuid={this.state.uuid} separatedStems={this.state.separatedStems}/>
            </div>
        )
    }
}

async function createSQSQueue(uuid: string) {
    const params = {
        QueueName: "upload_" + uuid,
        Attributes: {
            DelaySeconds: "0",
            MessageRetentionPeriod: "86400"
        }
    };

    try {
        const data = await sqsClient.send(new CreateQueueCommand(params));
        console.log("Success", data);
        return data;
    } catch (err) {
        console.log("Error", err);
    }
}