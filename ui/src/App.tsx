import React from "react";
import "./stylesheets/styles.scss";

import Header from "./components/Header";
import Uploader from "./components/Upload";

export default function App() {
    return (
        <div id="react-app" className={"App"}>
            <Header navPosition={"center"}/>
            <Uploader/>
        </div>
    )
}