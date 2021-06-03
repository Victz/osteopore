import React from 'react';
import {Link} from 'react-router-dom';
import {useTranslation} from "react-i18next";

const Footer = (props) => {

    const {t, i18n} = useTranslation();
    const changeLanguage = (language) => {
        i18n.changeLanguage(language);
    }
    return (
        <footer className="container my-5">
            <hr/>
            <ul className="nav justify-content-center">
                <li className="nav-item">
                    <Link className="nav-link text-muted" to="/">
                        Osteopore.com &copy; {new Date().getFullYear()}
                    </Link>
                </li>
                <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle text-muted" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false">{t("footer.language")}</a>
                    <ul className="dropdown-menu">
                        <li>
                            <button className="dropdown-item" type="button" onClick={() => changeLanguage('en')}>English</button>
                        </li>
                        <li>
                            <button className="dropdown-item" type="button" onClick={() => changeLanguage('zh')}>中文</button>
                        </li>
                    </ul>
                </li>
            </ul>
        </footer>
    );
};

export default Footer;