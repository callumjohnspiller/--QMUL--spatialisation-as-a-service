import React from "react";
import {v4 as uuidv4} from 'uuid';
import "./stylesheets/styles.scss";
import Header from "./components/Header";
import Body from "./components/Body";
import {CreateQueueCommand, ReceiveMessageCommand, DeleteMessageCommand} from "@aws-sdk/client-sqs";
import {sqsClient} from "./libs/sqsClient";

export default class App extends React.Component<{}, { uuid: string, separatedStems: string[] }> {
    constructor(props: {}) {
        super(props);
        this.state = {
            uuid: uuidv4(),
            separatedStems: []
        };
    }

    render() {
        return (
            <div id="react-app" className={"App"}>
                <Header/>
                <Body uuid={this.state.uuid}
                      separatedStems={this.state.separatedStems}
                      createSQSQueue={() => createSQSQueue(this.state.uuid)}
                      getMessage={getMessage}
                      deleteMessage={deleteMessage}
                />
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

async function getMessage(queueURL: string) {

    const params = {
        AttributeNames: ["SentTimestamp"],
        MaxNumberOfMessages: 1,
        MessageAttributeNames: ["All"],
        QueueUrl: queueURL,
        WaitTimeSeconds: 20,
    }

    try {
        const data = await sqsClient.send(new ReceiveMessageCommand(params));
        console.log("Success, ", data);
        return data; // For unit tests.
    } catch (err) {
        console.log("Error", err);
    }
}

async function deleteMessage(queueURL: string, receiptHandle: string) {
    const params = {
        QueueUrl: queueURL,
        ReceiptHandle: receiptHandle
    }

    try {
        const data = await sqsClient.send(new DeleteMessageCommand(params));
        console.log("Message deleted", data);
    } catch (err) {
        console.log("Error", err);
    }
}
