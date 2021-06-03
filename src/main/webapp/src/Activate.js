import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import backgroundImage from "./img/bg.jpg";
import axios from "axios";
import {useTranslation} from "react-i18next";

const Activate = (props) => {

    const {key} = useParams();
    const {t, i18n} = useTranslation('activate');
    const [values, setValues] = useState({
        alert: '',
        details: ''
    });

    useEffect(() => {
        axios.get("/api/activate/" + key).then((response) => {
                console.log(response);
                console.log(response.data);
                console.log(response.status);
                console.log(response.statusText);
                console.log(response.headers);
                console.log(response.config);
            setValues((values) => ({
                ...values, alert: "alert alert-success", details: 'Your account is activated successfully.'
            }));

            }, error => {
                console.log(error);
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.statusText);
                console.log(error.response.headers);
                console.log(error.response.config);
                setValues((values) => ({
                    ...values, alert: "alert alert-danger", details: error.response.data.message
                }));
            }
        );
    }, [])

    return (
        <div className="container py-5">
            <div className="banner text-light my-3 text-center" style={{backgroundImage: `url(${backgroundImage})`}}>
                <h3>{t("title")}</h3>
            </div>
            <form className="my-5">
                <div className={values.alert} role="alert">
                    <p>{values.details}</p>
                </div>
            </form>
        </div>
    );
};

export default Activate;