import React from "react";
import backgroundImage from "./img/bg.jpg";

const Index = (props) => {

    return (
        <div className="container py-5">
            <div className="banner text-light my-3 text-center" style={{backgroundImage: `url(${backgroundImage})`}}>
                <h3>Welcome</h3>
            </div>
        </div>
    );
};

export default Index;