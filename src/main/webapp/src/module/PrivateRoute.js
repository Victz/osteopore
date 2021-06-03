import React from 'react'
import Auth from './Auth'
import {Redirect, Route} from 'react-router-dom'

const PrivateRoute = ({component: Component, ...rest}) => {

    const user = Auth.getCurrentUser();
    return (
        <Route {...rest} render={props => user ? (<Component {...props} />)
            : (<Redirect to={{pathname: '/login', state: {from: props.location}}}/>)}/>
    );
};

export default PrivateRoute;