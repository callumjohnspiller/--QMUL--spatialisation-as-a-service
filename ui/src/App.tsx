import React, { type ReactElement } from "react";
import { v4 as uuidv4 } from "uuid";
import "./stylesheets/styles.scss";
import Body from "./components/Body";
import {
	CreateQueueCommand,
	DeleteMessageCommand,
	ReceiveMessageCommand,
} from "@aws-sdk/client-sqs";
import { sqsClient } from "./libs/sqsClient";
import { Container } from "@mui/material";

export default class App extends React.Component<Record<string, unknown>, { uuid: string }> {
	constructor (props: Record<string, unknown>) {
		super(props);
		this.state = {
			uuid: uuidv4()
		};
	}

	render (): ReactElement {
		return (
			<Container id={"app-container"}>
				<Body uuid={this.state.uuid}
					createSQSQueue={async () => await createSQSQueue(this.state.uuid)}
					getMessage={getMessage}
					deleteMessage={deleteMessage}
				/>
			</Container>
		);
	}
}

async function createSQSQueue (uuid: string) {
	const params = {
		QueueName: "upload_" + uuid,
		Attributes: {
			DelaySeconds: "0", MessageRetentionPeriod: "86400"
		}
	};

	try {
		return await sqsClient.send(new CreateQueueCommand(params));
	} catch (err) { /* empty */ }
}

async function getMessage (queueURL: string | undefined) {
	const params = {
		AttributeNames: ["SentTimestamp"],
		MaxNumberOfMessages: 1,
		MessageAttributeNames: ["All"],
		QueueUrl: queueURL,
		WaitTimeSeconds: 20
	};

	try {
		return await sqsClient.send(new ReceiveMessageCommand(params)); // For unit tests.
	} catch (err) { /* empty */ }
}

async function deleteMessage (queueURL: string, receiptHandle: string): Promise<void> {
	const params = {
		QueueUrl: queueURL, ReceiptHandle: receiptHandle
	};

	try {
		await sqsClient.send(new DeleteMessageCommand(params));
	} catch (err) { /* empty */ }
}
