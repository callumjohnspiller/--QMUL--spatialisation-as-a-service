import React from "react";
import {v4 as uuidv4} from 'uuid';
import "./stylesheets/styles.scss";
import Header from "./components/Header";
import Body from "./components/Body";

export default class App extends React.Component<{}, { uuid: string }> {
    constructor(props: {}) {
        super(props);
        this.state = {
            uuid: uuidv4()
        };
    }

    render() {
        return (
            <div id="react-app" className={"App"}>
                <Header/>
                <Body uuid={this.state.uuid}/>
            </div>
        )
    }
}