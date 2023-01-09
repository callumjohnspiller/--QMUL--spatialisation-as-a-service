import React from "react";
import "./stylesheets/styles.scss";

import Header from "./components/Header";

export default function App() {
    return (
        <div id="react-app" className={"App"}>
            <Header navPosition={"center"}/>
        </div>
    )
}