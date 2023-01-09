import React from "react";
import "./stylesheets/styles.scss";

import Header from "./components/Header";

export default function App() {
    return (
        <div className={"App"}>
            <Header navPosition={"center"}/>
        </div>
    )
}