import React from 'react';
import sty from "./header.module.scss";

type HeaderProps = {
    navPosition: "center" | "right" | "overlay";
}

const Header: React.FunctionComponent<HeaderProps> = ({navPosition}) => {

    return (
        <header id={"page-header"} className={sty.header}>Hello johan
        </header>
    );
};

export default Header;

Header.defaultProps = {
    navPosition: "center"
};