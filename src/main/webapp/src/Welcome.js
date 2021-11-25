import React from "react";
import backgroundImage from "./img/bg.jpg";

const Index = (props) => {

    return (
        <div className="container py-5">
            <div className="banner text-light my-3 text-center" style={{backgroundImage: `url(${backgroundImage})`}}>
                <h3>Welcome</h3>
            </div>
            <h1 className="h3 my-5 text-muted">About us</h1>
            <p>
                Osteopore specialises in the production of 3D printed bioresorbable implants that are used in conjunction with surgical procedures to assist with the natural
                stages of bone healing. Osteopore's products are manufactured in-house using 3D printing technology that is precise and allows for customisation of shape and
                geometry. The unique 3D printed biomimetic micro architecture of the 3D scaffolding which is contained within the Osteopore products provides for infiltration
                of cells and blood vessels, both of which play key roles in wound healing and tissue repair. Osteopore products are made of a US FDA approved polymer called
                polycaprolactone (PCL). PCL is bioresorbable, malleable, slow-degrading and possesses mechanical strength similar to trabecular bone.
            </p>
        </div>
    );
};

export default Index;
