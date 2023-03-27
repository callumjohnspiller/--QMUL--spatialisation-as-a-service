import React, { type ReactElement } from "react";
import { v4 as uuidv4 } from "uuid";
import "./stylesheets/styles.scss";
import Body from "./components/Body";
import {
	CreateQueueCommand,
	DeleteMessageCommand,
	ReceiveMessageCommand,
	ReceiveMessageResult
} from "@aws-sdk/client-sqs";
import { sqsClient } from "./libs/sqsClient";
import {Button, Card, CardContent, Container, Slider, Typography} from "@mui/material";
import './app.module.scss';

export default class App extends React.Component<Record<string, unknown>, { uuid: string }> {
	constructor (props: Record<string, unknown>) {
		super(props);
		this.state = {
			uuid: uuidv4()
		};
	}

	render (): ReactElement {
		return (
			<div className="app">
				<Container maxWidth="md">
					<header className="app-header">
						<Typography variant="h4" component="h1">
							Welcome to our Spatial Audio Service
						</Typography>
					</header>
					<div className="slide-container">
						<div className="slide active">
							<Card>
								<CardContent>
									<Typography gutterBottom variant="h5" component="h2">
										Step 1
									</Typography>
									<Typography variant="body2" color="textSecondary" component="p">
										Upload your audio file.
									</Typography>
								</CardContent>
							</Card>
						</div>
						<div className="slide">
							<Card>
								<CardContent>
									<Typography gutterBottom variant="h5" component="h2">
										Step 2
									</Typography>
									<Typography variant="body2" color="textSecondary" component="p">
										Choose your desired spatial audio settings.
									</Typography>
									<Slider
										defaultValue={30}
										aria-labelledby="discrete-slider"
										valueLabelDisplay="auto"
										step={10}
										marks
										min={10}
										max={110}
									/>
								</CardContent>
							</Card>
						</div>
						<div className="slide">
							<Card>
								<CardContent>
									<Typography gutterBottom variant="h5" component="h2">
										Step 3
									</Typography>
									<Typography variant="body2" color="textSecondary" component="p">
										Download your newly created spatial audio file!
									</Typography>
									<Button variant="contained" color="primary">
										Download
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>

					<Body uuid={this.state.uuid}
						  createSQSQueue={async () => await createSQSQueue(this.state.uuid)}
						  getMessage={getMessage}
						  deleteMessage={deleteMessage}
					/>

				</Container>
			</div>
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
