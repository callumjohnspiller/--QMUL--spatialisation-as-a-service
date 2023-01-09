import React from 'react';
import '../stylesheets/global.css';

class Body extends React.Component {
    constructor(props: {} | Readonly<{}>) {
        super(props);
    }

    render() {
        return (
            <header>
                This is my body
            </header>
        );
    }
}

export default Body;