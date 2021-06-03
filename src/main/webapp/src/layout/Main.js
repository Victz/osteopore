import React from "react";
import {useTranslation} from 'react-i18next';
import {Link, NavLink, Route, Switch, useLocation} from "react-router-dom";
import Nav from "./Nav";
import Footer from "./Footer";
import Info from "../module/Info";
import Error from "../module/Error";
import Index from "../Welcome";
import Register from "../Register";
import Login from "../Login";
import Activate from "../Activate";
import Search from "../Search";

const Main = (props) => {

    const {t, i18n} = useTranslation();
    const location = useLocation();
    return (
        <div id="perspective" className="perspective effect-airbnb">
            <div className="perspective-wrapper">
                <div className="perspective-container">
                    <Nav/>
                    <Switch>
                        <Route path={["/", "/index"]} exact component={Index}/>
                        <Route path='/search/:query' exact component={Search}/>
                        <Route path='/register' exact component={Register}/>
                        <Route path='/info' exact component={Info}/>
                        <Route path='/activate/:key' exact component={Activate}/>
                        <Route path='/login' exact component={Login}/>
                        <Route path="*"><Error alert="alert alert-danger" summary={t("error.title")} details={t("error.404")}/></Route>
                    </Switch>
                    <Footer/>
                </div>
            </div>
            <nav className="outer-nav left vertical">
                <Link className={"nav-item nav-link" + (location.pathname === "/" || location.pathname === "/index" ? " active" : "")} to="/">{t("nav.home")}</Link>
                <NavLink className="nav-item nav-link" activeClassName="active" to="/product">{t("nav.product")}</NavLink>
                <NavLink className="nav-item nav-link" activeClassName="active" to="/story">{t("nav.story")}</NavLink>
                <NavLink className="nav-item nav-link" activeClassName="active" to="/contact">{t("nav.contactus")}</NavLink>
            </nav>
        </div>
    );
};

export default Main;