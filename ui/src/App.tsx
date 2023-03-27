import React, { type ReactElement } from "react";
import { v4 as uuidv4 } from "uuid";
import "./stylesheets/styles.scss";
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @keyframes fadeInDown {
    0% {
      opacity: 0;
      transform: translateY(-50px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .MuiTypography-root.MuiTypography-h1 {
    animation: fadeInDown 1s ease-in-out;
  }
`;

import {
	CreateQueueCommand,
	DeleteMessageCommand,
	ReceiveMessageCommand,
	ReceiveMessageResult
} from "@aws-sdk/client-sqs";

import { sqsClient } from "./libs/sqsClient";
import {Button, Container, Typography} from "@mui/material";
import Body from "./components/Body";

export default class App extends React.Component<Record<string, unknown>, { uuid: string }> {
	constructor (props: Record<string, unknown>) {
		super(props);
		this.state = {
			uuid: uuidv4()
		};
	}

	render (): ReactElement {
		return (
			<>
				<GlobalStyle/>
				<Container sx={{ background: '#0077c2', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
					<Typography variant="h1" sx={{ color: '#fff', fontSize: '3rem', textAlign: 'center', animation: '$fadeInDown 1s ease-in-out' }}>
						Welcome to My Website
					</Typography>
					<Button variant="contained" color="secondary" sx={{ fontSize: '1.5rem', padding: '10px 20px', marginTop: '40px', transition: 'all 0.3s ease-in-out', '&:hover': { transform: 'scale(1.05)' } }}>
						Enter
					</Button>

					<Body uuid={this.state.uuid}
						  createSQSQueue={async () => await createSQSQueue(this.state.uuid)}
						  getMessage={getMessage}
						  deleteMessage={deleteMessage}
					/>
				</Container>
			</>
		)
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

async function getMessage (queueURL: string | undefined): Promise<ReceiveMessageResult> {
	const params = {
		AttributeNames: ["SentTimestamp"],
		MaxNumberOfMessages: 1,
		MessageAttributeNames: ["All"],
		QueueUrl: queueURL,
		WaitTimeSeconds: 20
	};

	try {
		return await sqsClient.send(new ReceiveMessageCommand(params));
	} catch (err) { /* empty */ }
	return new class implements ReceiveMessageResult {

	};
}

async function deleteMessage (queueUrl: string | undefined, receiptHandle: string): Promise<void> {
	const params = {
		QueueUrl: queueUrl, ReceiptHandle: receiptHandle
	};

	try {
		await sqsClient.send(new DeleteMessageCommand(params));
	} catch (err) { /* empty */ }
}
