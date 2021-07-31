import React, {useEffect, useState} from "react";
import {useTranslation} from 'react-i18next';
import {Link, useHistory, useParams} from "react-router-dom";
import axios from "axios";
import Auth from "../module/Auth";

const Case = (props) => {

    const {id} = useParams();
    const {t, i18n} = useTranslation('case', 'admin');
    const history = useHistory();

    const [values, setValues] = useState({
        loading: true,
        message: ''
    });

    const [model, setModel] = useState({
        id: '',
        name: '',
        number: '',
        description: '',
        remark: ''
    });

    useEffect(() => {
        if (id) {
            axios.get("/api/admin/case/" + id, {headers: Auth.authHeader()})
                .then((response) => {
                        console.log(response);
                        for (const [name, value] of Object.entries(response.data)) {
                            if (model.hasOwnProperty(name)) {
                                setModel((values) => ({
                                    ...values, [name]: value
                                }));
                            }
                        }
                    }, error => {
                        console.log(error);
                        setValues((values) => ({
                            ...values, message: error.response.data.message
                        }));
                    }
                );
        }
        setValues((values) => ({
            ...values, loading: false
        }));
    }, []);

    const handleChange = (event) => {
        event.persist();
        let name = event.target.name;
        let value = event.target.value;
        setModel((values) => ({
            ...values, [name]: value
        }));
        if (name === "name") {
            if (value.trim().length > 1) {
                event.target.classList.remove("border-danger");
                event.target.classList.add('border-success');
                event.target.nextSibling.nextSibling.classList.add("d-none");
            } else {
                event.target.classList.remove("border-success");
                event.target.classList.add('border-danger');
            }
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!(event.target.elements["name"].value.trim().length > 1)) {
            event.target.elements["name"].nextSibling.nextSibling.classList.remove("d-none");
            return false;
        }
        setValues((values) => ({
            ...values, loading: true
        }));

        if (model.id && model.id.trim().length > 0) {
            await axios.put("/api/admin/case", model, {headers: Auth.authHeader()}).then((response) => {
                    console.log(response);
                    history.push('/admin/cases');
                }, error => {
                    console.log(error);
                    setValues((values) => ({
                        ...values, loading: false, message: error.response.data.message
                    }));
                }
            );
        } else {
            await axios.post("/api/admin/case", model, {headers: Auth.authHeader()}).then((response) => {
                    console.log(response);
                    history.push('/admin/cases');
                }, error => {
                    console.log(error);
                    setValues((values) => ({
                        ...values, loading: false, message: error.response.data.message
                    }));
                }
            );
        }
    }

    return (
        <>
            <ol className="breadcrumb mt-3 p-2 rounded-start">
                <li className="breadcrumb-item"><Link to="/admin"><i className="fas fa-tachometer-alt fa-lg fa-fw"></i> {t("admin:nav.dashboard")}</Link></li>
                <li className="breadcrumb-item"><Link to="/admin/cases"><i className="fas fa-address-card fa-lg fa-fw"></i> {t("admin:nav.case")}</Link></li>
                <li className="breadcrumb-item active"><i className="far fa-edit fa-fw"></i> {t("admin:view.edit")}</li>
            </ol>
            <h1 className="h3 mt-5 text-muted">{t("title")}</h1>
            <form className="my-5" onSubmit={handleSubmit}>
                {values.message && (
                    <div className="mb-3">
                        <div className="alert alert-danger" role="alert">{values.message}</div>
                    </div>
                )}
                <div className="form-floating mb-3">
                    <input type="text" name="name" className="form-control" placeholder={t("name")}
                           value={model.name} onChange={handleChange} maxLength="255" required autoFocus/>
                    <label htmlFor="name">{t("name")}</label>
                    <div className="text-danger d-none"><i className='fa fa-exclamation-circle'></i> {t("nameValidate")}</div>
                </div>
                <div className="form-floating mb-3">
                    <input type="text" name="number" className="form-control" placeholder={t("number")}
                           value={model.number} onChange={handleChange} maxLength="255"/>
                    <label htmlFor="number">{t("number")}</label>
                </div>
                <div className="form-floating mb-3">
                    <textarea name="description" className="form-control" placeholder={t("description")}
                              value={model.description} onChange={handleChange} maxLength="5000" rows="3"/>
                    <label htmlFor="description">{t("description")}</label>
                </div>
                <div className="form-floating mb-3">
                    <textarea name="remark" className="form-control" placeholder={t("remark")}
                              value={model.remark} onChange={handleChange} maxLength="500" rows="3"/>
                    <label htmlFor="remark">{t("remark")}</label>
                </div>
                <div className="col-sm-5 ms-auto mb-3">
                    <div className="d-grid gap-2">
                        <button type="submit" className="btn btn-primary" disabled={values.loading}>
                            {values.loading ? <i className="fas fa-spinner fa-pulse"></i> : t("admin:view.save")}
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
};

export default Case;
