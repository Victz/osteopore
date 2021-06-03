import React from 'react'
import Auth from './Auth'
import {Redirect, Route} from 'react-router-dom'
import {useTranslation} from "react-i18next";

const AdminRoute = ({component: Component, ...rest}) => {

    const {t, i18n} = useTranslation();
    const user = Auth.getCurrentUser();
    return (
        <Route {...rest} render={props => user && user.roles.includes("ROLE_ADMIN") ? (<Component {...props} />)
            : (<Redirect to={{
                pathname: '/info', state: {
                    alert: "alert alert-danger",
                    summary: t("error.title"),
                    details: t("error.403")
                }
            }}/>)}/>
    );
};

export default AdminRoute;