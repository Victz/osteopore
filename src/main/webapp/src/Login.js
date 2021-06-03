import React, {useState} from "react";
import backgroundImage from "./img/bg.jpg";
import {useTranslation} from "react-i18next";
import {Link, useHistory} from "react-router-dom";
import Auth from "./module/Auth";

const Login = (props) => {

    const {t, i18n} = useTranslation('login');
    const history = useHistory();

    const [values, setValues] = useState({
        loading: false,
        message: '',
        login: '',
        password: ''
    });

    const handleChange = (event) => {
        event.persist();
        let name = event.target.name;
        let value = event.target.value;
        setValues((values) => ({
            ...values, [name]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!(event.target.elements["login"].value.trim() !== "")) {
            event.target.elements["login"].nextSibling.classList.remove("d-none");
            return false;
        }
        if (!(event.target.elements["password"].value.trim().length > 7)) {
            event.target.elements["password"].nextSibling.classList.remove("d-none");
            return false;
        }
        setValues((values) => ({
            ...values, loading: true
        }));

        Auth.login(values.login, values.password, false).then((response) => {
                console.log(response);
                console.log(response.data);
                console.log(response.status);
                console.log(response.statusText);
                console.log(response.headers);
                console.log(response.config);
                history.push('/home');
            }, error => {
                console.log(error);
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.statusText);
                console.log(error.response.headers);
                console.log(error.response.config);
                setValues((values) => ({
                    ...values, loading: false, message: error.response.data.message
                }));
            }
        );
    }

    return (
        <div className="container">
            <div className="banner text-light my-3 text-center" style={{backgroundImage: `url(${backgroundImage})`}}>
                <h3>{t("title")}</h3>
            </div>
            <form className="my-5" onSubmit={handleSubmit}>
                {values.message && (
                    <div className="mb-3">
                        <div className="alert alert-danger" role="alert">{values.message}</div>
                    </div>
                )}
                <div className="mb-3">
                    <label htmlFor="login" className="col-form-label sr-only">{t("form.login")}</label>
                    <input type="text" name="login" className="form-control" placeholder={t("form.login")}
                           autoComplete="off" value={values.login} onChange={handleChange} required autoFocus/>
                    <div className="text-danger d-none"><i className='fa fa-exclamation-circle'></i> {t("form.loginValidate")}</div>
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="col-form-label sr-only">{t("form.password")}</label>
                    <input type="password" name="password" className="form-control" placeholder={t("form.password")}
                           value={values.password} onChange={handleChange} required/>
                    <div className="text-danger d-none"><i className='fa fa-exclamation-circle'></i> {t("form.passwordValidate")}</div>
                </div>
                <div className="mb-3 d-grid gap-2">
                    <button type="submit" className="btn btn-primary" disabled={values.loading}>
                        {values.loading ? <i className="fas fa-spinner fa-pulse"></i> : t("form.button")}
                    </button>
                </div>
                <div className="d-flex justify-content-between mt-5">
                    <Link className="btn btn-borderless" to="/register">{t("form.createId")}</Link>
                    <Link className="btn btn-borderless" to="/reset">{t("form.forgot")}</Link>
                </div>
            </form>
        </div>
    );
};

export default Login;