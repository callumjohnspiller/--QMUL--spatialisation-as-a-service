import React from 'react';
import sty from "./header.module.scss";

interface HeaderProps {
}

function Header(props: HeaderProps) {
    return (
        <header id={"page-header"} className={sty.header}>
        </header>
    );
}

export default Header;