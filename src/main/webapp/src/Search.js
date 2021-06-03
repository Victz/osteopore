import React, {useState} from "react";
import backgroundImage from "./img/bg.jpg";
import {useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";

const Search = (props) => {

    const {query} = useParams();
    const {t, i18n} = useTranslation();
    const [values, setValues] = useState({
        loading: true
    });

    return (
        <div className="container py-5">
            <div className="banner text-light my-3 text-center" style={{backgroundImage: `url(${backgroundImage})`}}>
                <h3>{t("search")}</h3>
            </div>
        </div>
    );
};

export default Search;