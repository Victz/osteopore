import '@fortawesome/fontawesome-free/css/all.min.css';
import './app.scss';
import 'react-image-lightbox/style.css';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import Main from "./layout/Main";
import React from "react";
import MainAdmin from "./layout/Admin";
import PrivateRoute from "./module/PrivateRoute";
import MainHome from "./layout/Home";
import AdminRoute from "./module/AdminRoute";

const App = (props) => {

    return (
        <Router>
            <Switch>
                <PrivateRoute path='/home/:path?' component={MainHome}/>
                <AdminRoute path='/admin/:path?' component={MainAdmin}/>
                <Route><Main/></Route>
            </Switch>
        </Router>
    );
}

export default App;
