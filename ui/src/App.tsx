import React from "react";
import { v4 as uuidv4 } from 'uuid';
import "./stylesheets/styles.scss";
import Header from "./components/Header";
import Uploader from "./components/Upload";
import {SubscribeCommand} from "@aws-sdk/client-sns";
import {snsClient} from "./libs/snsClient";

export default class App extends React.Component<{}, { uuid: string, fileUploaded: boolean }> {
    constructor(props: {}) {
        super(props);
        this.state = {
            uuid: uuidv4(),
            fileUploaded: false
        };
    }

    render() {
        return (
            <div id="react-app" className={"App"}>
                <Header navPosition={"center"}/>
                <Uploader uuid={this.state.uuid}/>
            </div>
        )
    }
}