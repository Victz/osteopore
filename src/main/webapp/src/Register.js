import React, {useState} from "react";
import {useTranslation} from 'react-i18next';
import {useHistory} from "react-router-dom";
import backgroundImage from './img/bg.jpg';
import Auth from "./module/Auth";

const Register = (props) => {

    const {t, i18n} = useTranslation('register');
    const history = useHistory();
    const [values, setValues] = useState({
        loading: false,
        message: '',
        name: '',
        email: '',
        password: '',
        passwordConfirm: ''
    });

    const patternEmail = /^[_A-Za-z0-9-]+(\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9]+)*(\.[A-Za-z]{2,})$/;

    const handleChange = (event) => {
        event.persist();
        let name = event.target.name;
        let value = event.target.value;
        setValues((values) => ({
            ...values, [name]: value,
        }));
        if (name === "name") {
            if (value.trim().length > 1) {
                event.target.classList.remove("border-danger");
                event.target.classList.add('border-success');
                event.target.nextSibling.nextSibling.nextSibling.classList.add("d-none");
            } else {
                event.target.classList.remove("border-success");
                event.target.classList.add('border-danger');
            }
        } else if (name === "email") {
            if (value.trim() !== "" && patternEmail.test(value.trim())) {
                event.target.classList.remove("border-danger");
                event.target.classList.add('border-success');
                event.target.nextSibling.nextSibling.nextSibling.classList.add("d-none");
            } else {
                event.target.classList.remove("border-success");
                event.target.classList.add('border-danger');
            }
        } else if (name === "password") {
            if (value.trim().length > 7) {
                event.target.classList.remove("border-danger");
                event.target.classList.add('border-success');
                event.target.nextSibling.nextSibling.nextSibling.classList.add("d-none");
            } else {
                event.target.classList.remove("border-success");
                event.target.classList.add('border-danger');
            }
        } else if (name === "passwordConfirm") {
            if (value.trim().length > 7 && value.trim() === values.password) {
                event.target.classList.remove("border-danger");
                event.target.classList.add('border-success');
                event.target.nextSibling.nextSibling.nextSibling.classList.add("d-none");
            } else {
                event.target.classList.remove("border-success");
                event.target.classList.add('border-danger');
            }
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!(event.target.elements["name"].value.trim().length > 1)) {
            event.target.elements["name"].nextSibling.nextSibling.nextSibling.classList.remove("d-none");
            return false;
        }
        if (!(event.target.elements["email"].value.trim() !== "" && patternEmail.test(event.target.elements["email"].value.trim()))) {
            event.target.elements["email"].nextSibling.nextSibling.nextSibling.classList.remove("d-none");
            return false;
        }
        if (!(event.target.elements["password"].value.trim().length > 7)) {
            event.target.elements["password"].nextSibling.nextSibling.nextSibling.classList.remove("d-none");
            return false;
        }
        if (!(event.target.elements["passwordConfirm"].value.trim().length > 7 && event.target.elements["passwordConfirm"].value.trim() === values.password)) {
            event.target.elements["passwordConfirm"].nextSibling.nextSibling.nextSibling.classList.remove("d-none");
            return false;
        }
        setValues((values) => ({
            ...values, loading: true
        }));

        Auth.register(values.name, values.email, values.password).then((response) => {
                console.log(response);
                console.log(response.data);
                console.log(response.status);
                console.log(response.statusText);
                console.log(response.headers);
                console.log(response.config);
                history.push('/info', {
                    alert: "alert alert-success",
                    summary: t("messages.summary"),
                    details: t("messages.details")
                });

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
            <form className="form-sm my-5" onSubmit={handleSubmit}>
                {values.message && (
                    <div className="mb-3">
                        <div className="alert alert-danger" role="alert">{values.message}</div>
                    </div>
                )}
                <div className="form-floating mb-3">
                    <input type="text" name="name" className="form-control" placeholder={t("form.name")} aria-describedby="nameHelp"
                           autoComplete="off" value={values.name} onChange={handleChange} required autoFocus/>
                    <label htmlFor="name">{t("form.name")}</label>
                    <small id="nameHelp" className="form-text text-muted">{t("form.nameHelp")}</small>
                    <div className="text-danger d-none"><i className='fa fa-exclamation-circle'></i> {t("form.nameValidate")}</div>
                </div>
                <div className="form-floating mb-3">
                    <input type="text" name="email" className="form-control" placeholder={t("form.email")} aria-describedby="emailHelp"
                           autoComplete="off" value={values.email} onChange={handleChange} required/>
                    <label htmlFor="email">{t("form.email")}</label>
                    <small id="emailHelp" className="form-text text-muted">{t("form.emailHelp")}</small>
                    <div className="text-danger d-none"><i className='fa fa-exclamation-circle'></i> {t("form.emailValidate")}</div>
                </div>
                <div className="form-floating mb-3">
                    <input type="password" name="password" className="form-control" placeholder={t("form.password")} aria-describedby="passwordHelp"
                           value={values.password} onChange={handleChange} required/>
                    <label htmlFor="password">{t("form.password")}</label>
                    <small id="passwordHelp" className="form-text text-muted">{t("form.passwordHelp")}</small>
                    <div className="text-danger d-none"><i className='fa fa-exclamation-circle'></i> {t("form.passwordValidate")}</div>
                </div>
                <div className="form-floating mb-3">
                    <input type="password" name="passwordConfirm" className="form-control" placeholder={t("form.passwordConfirm")}
                           aria-describedby="passwordConfirmHelp" value={values.passwordConfirm} onChange={handleChange} required/>
                    <label htmlFor="passwordConfirm">{t("form.passwordConfirm")}</label>
                    <small id="passwordConfirmHelp" className="form-text text-muted">{t("form.passwordConfirmHelp")}</small>
                    <div className="text-danger d-none"><i className='fa fa-exclamation-circle'></i> {t("form.passwordConfirmValidate")}</div>
                </div>
                <div className="mb-3 d-grid gap-2">
                    <button type="submit" className="btn btn-primary" disabled={values.loading}>
                        {values.loading ? <i className="fas fa-spinner fa-pulse"></i> : t("form.button")}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Register;
