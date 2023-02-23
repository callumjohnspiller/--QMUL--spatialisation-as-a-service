import React from "react";
import "./stylesheets/styles.scss";

import Header from "./components/Header";
import UploadFile from "./components/Upload";

export default function App() {
    return (
        <div id="react-app" className={"App"}>
            <Header navPosition={"center"}/>
            <UploadFile/>
        </div>
    )
}