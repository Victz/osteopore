import React from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import {useTranslation} from "react-i18next";

const Home = (props) => {

    const {t, i18n} = useTranslation('home');
    const location = useLocation();
    const history = useHistory();

    return (
        <div>
            <h1 className="h3 my-5 text-muted">{t("nav.overview")}</h1>
            <div className="row">
                <div className="col-xl-4 col-md-6 mb-4">
                    <div className="card border-left-primary shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="font-weight-bold text-primary text-uppercase mb-1">{t("nav.inventory")}</div>
                                    <h5 className="font-weight-bold text-muted">40,000</h5>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-tasks fa-2x text-muted"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-4 col-md-6 mb-4">
                    <div className="card border-left-success shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="font-weight-bold text-success text-uppercase mb-1">{t("nav.order")}</div>
                                    <h5 className="font-weight-bold text-muted">8,000</h5>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-shipping-fast fa-2x text-muted"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-4 col-md-6 mb-4">
                    <div className="card border-left-info shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="font-weight-bold text-warning text-uppercase mb-1">{t("nav.case")}</div>
                                    <h5 className="font-weight-bold text-muted">3,000</h5>
                                </div>
                                <div className="col-auto">
                                    <i className="far fa-address-card fa-2x text-muted"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Home;