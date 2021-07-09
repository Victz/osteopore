import React from "react";
import {useLocation} from "react-router-dom";
import backgroundImage from "../img/bg.jpg";

const Info = (props) => {

    const location = useLocation();
    const {alert, summary, details} = (location.state) || {};

    return (
        <div className="container py-5">
            <div className="banner text-light my-3 text-center" style={{backgroundImage: `url(${backgroundImage})`}}>
                <h3>{summary}</h3>
            </div>
            <form className="form-sm my-5">
                <div className={alert} role="alert">
                    <p>{details}</p>
                </div>
            </form>
        </div>
    );
};

export default Info;
