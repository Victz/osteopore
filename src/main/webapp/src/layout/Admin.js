import './home.css';
import React, {useState} from "react";
import {useTranslation} from 'react-i18next';
import {Link, NavLink, Route, Switch, useHistory, useLocation} from "react-router-dom";
import Auth from "../module/Auth";
import Footer from "./Footer";
import Admin from "../admin";
import Users from "../admin/users";

const MainAdmin = (props) => {

    const {t, i18n} = useTranslation('admin');
    const location = useLocation();
    const history = useHistory();
    const [values, setValues] = useState({
        user: Auth.getCurrentUser()
    });

    const logout = () => {
        Auth.logout();
        history.push('/login');
    }

    const showMenu = () => {
        let showMenu = document.getElementById('showMenu');
        showMenu.classList.toggle("active");
        let wrapper = document.getElementById('wrapper');
        wrapper.classList.toggle("toggled");
    }

    return (
        <>
            <nav className="navbar px-3 shadow-sm">
                <span id="showMenu" onClick={showMenu}><span></span></span>
                <Link className="navbar-brand me-auto" to="/">Osteopore</Link>
                <div className="dropdown">
                    <button type="button" className="btn btn-borderless dropdown-toggle"
                            data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i className="far fa-user-circle fa-lg fa-fw"></i>
                        <span className="d-none d-sm-inline-block">{values.user.name}</span> <span className="caret"></span>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                        <li><Link className="dropdown-item" to="/home"><i className="far fa-user-circle fa-lg fa-fw"></i> {t("nav.account")}</Link></li>
                        {values.user.roles.includes("ROLE_ADMIN") ?
                            <li><Link className="dropdown-item" to="/admin"><i className="fas fa-tachometer-alt fa-lg fa-fw"></i> {t("nav.admin")}</Link></li> : ''}
                        <li>
                            <hr className="dropdown-divider"/>
                        </li>
                        <li><Link className="dropdown-item" to="#" onClick={logout}><i className="fas fa-sign-out-alt fa-lg fa-fw"></i> {t("nav.signout")}</Link></li>
                    </ul>
                </div>
            </nav>
            <div id="wrapper">
                <div id="sidebar-wrapper">
                    <nav className="nav flex-column nav-tabs">
                        <h6 className="dropdown-header">{t("nav.admin")}</h6>
                        <Link className={"nav-item nav-link" + (location.pathname === "/admin" ? " active" : "")} to="/admin">
                            <i className="fas fa-tachometer-alt fa-lg fa-fw"></i> {t("nav.dashboard")}
                        </Link>
                        <NavLink className="nav-item nav-link" activeClassName="active" to="/admin/products">
                            <i className="fas fa-boxes fa-lg fa-fw"></i> {t("nav.product")}
                        </NavLink>
                        <NavLink className="nav-item nav-link" activeClassName="active" to="/admin/inventories">
                            <i className="fas fa-tasks fa-lg fa-fw"></i> {t("nav.inventory")}
                        </NavLink>
                        <NavLink className="nav-item nav-link" activeClassName="active" to="/admin/orders">
                            <i className="fas fa-shipping-fast fa-lg fa-fw"></i> {t("nav.order")}
                        </NavLink>
                        <NavLink className="nav-item nav-link" activeClassName="active" to="/admin/cases">
                            <i className="far fa-address-card fa-lg fa-fw"></i> {t("nav.case")}
                        </NavLink>
                        <NavLink className="nav-item nav-link" activeClassName="active" to="/admin/stories">
                            <i className="far fa-newspaper fa-lg fa-fw"></i> {t("nav.story")}
                        </NavLink>
                        <NavLink className="nav-item nav-link" activeClassName="active" to="/admin/users">
                            <i className="fas fa-users fa-lg fa-fw"></i> {t("nav.user")}
                        </NavLink>
                        <Link className="dropdown-header" to="/"><i className="fa fa-chevron-left" aria-hidden="true"></i> {t("nav.returnHome")}</Link>
                    </nav>
                </div>
                <div id="content-wrapper">
                    <div className="container">
                        <Switch>
                            <Route path='/admin' exact component={Admin}/>
                            <Route path='/admin/users/(:path+)?' component={Users}/>
                        </Switch>
                        <Footer/>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MainAdmin;