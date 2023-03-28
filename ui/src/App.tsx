import React, {Component} from "react";
import {v4 as uuidv4} from "uuid";
import {
    CreateQueueCommand,
    DeleteMessageCommand,
    ReceiveMessageCommand,
    ReceiveMessageResult
} from "@aws-sdk/client-sqs";
import {sqsClient} from "./libs/sqsClient";
import Body from "./components/Body";
import "./styles/app.css";
import {Button} from "@mui/material";

export default class App extends Component<{}, { uuid: string, showUpload: boolean }> {
    constructor(props: {}) {
        super(props);
        this.state = {
            uuid: uuidv4(),
            showUpload: false
        };
    }

    handleEntry = () => {
        this.setState({showUpload: true});
    };

    render() {
        return (
            <div>
                <h1>Spatialisation As A Service</h1>
                <Button onClick={this.handleEntry}>Enter</Button>
                {
                    this.state.showUpload
                    &&
                    <Body uuid={this.state.uuid}
                          createSQSQueue={async () => await createSQSQueue(this.state.uuid)}
                          getMessage={getMessage}
                          deleteMessage={deleteMessage}
                    />
                }
            </div>
        )
    }
}

async function createSQSQueue(uuid: string) {
    const params = {
        QueueName: "upload_" + uuid,
        Attributes: {
            DelaySeconds: "0", MessageRetentionPeriod: "86400"
        }
    };

    try {
        return await sqsClient.send(new CreateQueueCommand(params));
    } catch (err) { /* empty */
    }
}

async function getMessage(queueURL: string | undefined): Promise<ReceiveMessageResult> {
    const params = {
        AttributeNames: ["SentTimestamp"],
        MaxNumberOfMessages: 1,
        MessageAttributeNames: ["All"],
        QueueUrl: queueURL,
        WaitTimeSeconds: 20
    };

    try {
        return await sqsClient.send(new ReceiveMessageCommand(params));
    } catch (err) { /* empty */
    }
    return new class implements ReceiveMessageResult {

    };
}

async function deleteMessage(queueUrl: string | undefined, receiptHandle: string): Promise<void> {
    const params = {
        QueueUrl: queueUrl, ReceiptHandle: receiptHandle
    };

    try {
        await sqsClient.send(new DeleteMessageCommand(params));
    } catch (err) { /* empty */
    }
}
