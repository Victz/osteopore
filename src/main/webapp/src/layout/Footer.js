import React from 'react';
import {useTranslation} from "react-i18next";
import {DropdownItem, DropdownMenu, DropdownToggle, Nav, NavItem, NavLink, UncontrolledDropdown} from "reactstrap";

const Footer = (props) => {

    const {t, i18n} = useTranslation();
    const changeLanguage = (language) => {
        i18n.changeLanguage(language);
    }
    return (
        <footer className="container my-5">
            <hr/>
            <Nav className="justify-content-center">
                <NavItem>
                    <NavLink href="/" className="text-muted">Osteopore.com &copy; {new Date().getFullYear()}</NavLink>
                </NavItem>
                <UncontrolledDropdown nav>
                    <DropdownToggle nav caret className="text-muted"><i className="fas fa-globe fa-fw"></i>{t("footer.language")}</DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem className="text-muted" onClick={() => changeLanguage('en')}>English</DropdownItem>
                        <DropdownItem className="text-muted" onClick={() => changeLanguage('zh')}>中文</DropdownItem>
                    </DropdownMenu>
                </UncontrolledDropdown>
            </Nav>
        </footer>
    );
};

export default Footer;