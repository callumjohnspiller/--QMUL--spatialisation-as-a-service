import React, {Component, useState} from "react";
import {v4 as uuidv4} from "uuid";
import {
    CreateQueueCommand,
    DeleteMessageCommand,
    ReceiveMessageCommand,
    ReceiveMessageResult
} from "@aws-sdk/client-sqs";
import {sqsClient} from "./libs/sqsClient";
import Body from "./components/Body";
import WelcomeScreen from './components/WelcomeScreen/WelcomeScreen';
import { useSpring, animated } from '@react-spring/web';

export default function App() {
    const [siteEntered, setSiteEntered] = useState(false);
    const [uuid, setUuid] = useState("");

    const handleEntry = () => {
        setSiteEntered(true);
        setUuid(uuidv4());
    };

    const containerProps = useSpring({
        opacity: siteEntered ? 1 : 0,
        transform: siteEntered ? 'translateY(0)' : 'translateY(100px)',
    });


    return (
        <div className={"app"}>
            {!siteEntered && (
              <WelcomeScreen onClick={handleEntry} />
            )}
            {siteEntered && (
                <animated.div style={containerProps}>
                    <header>
                        <h1>Spatialisation As A Service</h1>
                    </header>
                    <main>
                        {
                          siteEntered
                          &&
                          <Body uuid={uuid!}
                                createSQSQueue={async () => await createSQSQueue(uuid!)}
                                getMessage={getMessage}
                                deleteMessage={deleteMessage}
                          />
                        }
                    </main>
                </animated.div>
            )}
        </div>
    )
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
