import React from 'react';
import sty from "./header.module.scss";

interface HeaderProps {
}

function Header(props: HeaderProps) {
    return (<head>
            <meta name="viewport" content="initial-scale=1, width=device-width" />
        </head>
    );
}

export default Header;