import React from "react";
import backgroundImage from "../img/bg.jpg";

const Error = (props) => {

    return (
        <div className="container py-5">
            <div className="banner text-light my-3 text-center" style={{backgroundImage: `url(${backgroundImage})`}}>
                <h3>{props.summary}</h3>
            </div>
            <form className="my-5">
                <div className={props.alert} role="alert">
                    <p>{props.details}</p>
                </div>
            </form>
        </div>
    );
};

export default Error;
