import React from 'react';
import '../stylesheets/global.css';

class Header extends React.Component {
    constructor(props: {} | Readonly<{}>) {
        super(props);
    }

    render() {
        return (
            <header>
                Hello, world
            </header>
        );
    }
}

export default Header;