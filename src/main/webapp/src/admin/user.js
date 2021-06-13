import React, {useEffect, useState} from "react";
import {useTranslation} from 'react-i18next';
import {Link, useHistory, useParams} from "react-router-dom";
import axios from "axios";
import Auth from "../module/Auth";
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";

const User = (props) => {

    const {id} = useParams();
    const {t, i18n} = useTranslation('user', 'admin');
    const history = useHistory();

    const [values, setValues] = useState({
        loading: true,
        message: '',
        modal: false,
        roles: []
    });

    const [model, setModel] = useState({
        id: '',
        name: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        activated: false,
        roles: []
    });

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        if (id) {
            await axios.get("/api/admin/user/" + id, {headers: Auth.authHeader()}).then((response) => {
                    console.log(response);
                    for (const [name, value] of Object.entries(response.data)) {
                        setModel((values) => ({
                            ...values, [name]: value
                        }));
                    }
                }, error => {
                    console.log(error);
                    setValues((values) => ({
                        ...values, loading: false, message: error.response.data.message
                    }));
                    return;
                }
            );
        }
        await axios.get("/api/admin/roles", {headers: Auth.authHeader()}).then((response) => {
                console.log(response);
                setValues((values) => ({
                    ...values, roles: response.data
                }));
            }, error => {
                console.log(error);
                setValues((values) => ({
                    ...values, loading: false, message: error.response.data.message
                }));
            }
        );
        setValues((values) => ({
            ...values, loading: false
        }));
    };

    const patternEmail = /^[_A-Za-z0-9-\+]+(\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9]+)*(\.[A-Za-z]{2,})$/;
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
                event.target.nextSibling.classList.add("d-none");
            } else {
                event.target.classList.remove("border-success");
                event.target.classList.add('border-danger');
            }
        } else if (name === "email") {
            if (value.trim() !== "" && patternEmail.test(value.trim())) {
                event.target.classList.remove("border-danger");
                event.target.classList.add('border-success');
                event.target.nextSibling.classList.add("d-none");
            } else {
                event.target.classList.remove("border-success");
                event.target.classList.add('border-danger');
            }
        } else if (name === "password") {
            if (value.trim().length > 7) {
                event.target.classList.remove("border-danger");
                event.target.classList.add('border-success');
                event.target.nextSibling.classList.add("d-none");
            } else {
                event.target.classList.remove("border-success");
                event.target.classList.add('border-danger');
            }
        } else if (name === "passwordConfirm") {
            if (value.trim().length > 7 && value.trim() === model.password) {
                event.target.classList.remove("border-danger");
                event.target.classList.add('border-success');
                event.target.nextSibling.classList.add("d-none");
            } else {
                event.target.classList.remove("border-success");
                event.target.classList.add('border-danger');
            }
        }
    };

    const modalToggle = () => {
        setValues((values) => ({
            ...values, modal: !values.modal
        }));
    };

    const modalClass = (role) => {
        console.log("modalClass");
        let className = 'nav-link';
        model.roles.every(selectedRoles => {
            if (selectedRoles.id === role) {
                className += " active";
            }
        });
        return className;
    };

    const handleRoleChange = (role) => {
        console.log(role);
        console.log(model.roles);
        const index = model.roles.indexOf(role);
        if (index > -1) {
            model.roles.splice(index, 1);
        }else{
            model.roles.push(role);
        }
        console.log(model.roles);
    }

    const modalConfirm = (roles) => {
        setModel((values) => ({
            ...values, roles: roles
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!(event.target.elements["name"].value.trim().length > 1)) {
            event.target.elements["name"].nextSibling.classList.remove("d-none");
            return false;
        }
        if (!(event.target.elements["email"].value.trim() !== "" && patternEmail.test(event.target.elements["email"].value.trim()))) {
            event.target.elements["email"].nextSibling.classList.remove("d-none");
            return false;
        }
        if (!(event.target.elements["password"].value.trim().length > 7)) {
            event.target.elements["password"].nextSibling.classList.remove("d-none");
            return false;
        }
        if (!(event.target.elements["passwordConfirm"].value.trim().length > 7 && event.target.elements["passwordConfirm"].value.trim() === model.password)) {
            event.target.elements["passwordConfirm"].nextSibling.classList.remove("d-none");
            return false;
        }
        setValues((values) => ({
            ...values, loading: true
        }));

        await axios.post("/api/admin/user", model, {headers: Auth.authHeader()})
            .then((response) => {
                    console.log(response);
                    history.push('/admin/users');

                }, error => {
                    console.log(error);
                    setValues((values) => ({
                        ...values, loading: false, message: error.response.data.message
                    }));
                }
            );
    }

    return (
        <>
            <ol className="breadcrumb mt-3 p-2 rounded-start">
                <li className="breadcrumb-item"><Link to="/admin"><i className="fas fa-tachometer-alt fa-lg fa-fw"></i> {t("admin:nav.dashboard")}</Link></li>
                <li className="breadcrumb-item"><Link to="/admin/users"><i className="fas fa-users fa-lg fa-fw"></i> {t("admin:nav.user")}</Link></li>
                <li className="breadcrumb-item active"><i className="far fa-edit fa-fw"></i> {t("admin:view.edit")}</li>
            </ol>
            <h1 className="h3 mt-5 text-muted">{t("title")}</h1>
            <form className="my-5" onSubmit={handleSubmit}>
                {values.message && (
                    <div className="mb-3">
                        <div className="alert alert-danger" role="alert">{values.message}</div>
                    </div>
                )}
                <div className="mb-3">
                    <label htmlFor="name" className="col-form-label">{t("name")}</label>
                    <input type="text" name="name" className="form-control" placeholder={t("name")}
                           value={model.name} onChange={handleChange} maxLength="50" required autoFocus/>
                    <div className="text-danger d-none"><i className='fa fa-exclamation-circle'></i> {t("nameValidate")}</div>
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="col-form-label">{t("email")}</label>
                    <input type="text" name="email" className="form-control" placeholder={t("email")}
                           autoComplete="off" value={model.email} onChange={handleChange} maxLength="50" required/>
                    <div className="text-danger d-none"><i className='fa fa-exclamation-circle'></i> {t("emailValidate")}</div>
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="col-form-label">{t("password")}</label>
                    <input type="password" name="password" className="form-control" placeholder={t("password")}
                           value={model.password} onChange={handleChange} required/>
                    <div className="text-danger d-none"><i className='fa fa-exclamation-circle'></i> {t("passwordValidate")}</div>
                </div>
                <div className="mb-3">
                    <label htmlFor="passwordConfirm" className="col-form-label">{t("passwordConfirm")}</label>
                    <input type="password" name="passwordConfirm" className="form-control" placeholder={t("passwordConfirm")}
                           value={model.passwordConfirm} onChange={handleChange} required/>
                    <div className="text-danger d-none"><i className='fa fa-exclamation-circle'></i> {t("passwordConfirmValidate")}</div>
                </div>
                <div className="mb-3">
                    <label htmlFor="roles" className="control-label">{t("roles")}</label>
                    <div className="input-group">
                        <input type="text" className="form-control" placeholder={t("roles")} aria-label={t("roles")}/>
                        <button className="btn btn-outline-secondary" type="button" onClick={modalToggle}> {t("admin:view.select")}</button>
                    </div>
                </div>

                <div className="col-sm-5 ms-auto mb-3">
                    <div className="d-grid gap-2">
                        <button type="submit" className="btn btn-primary" disabled={values.loading}>
                            {values.loading ? <i className="fas fa-spinner fa-pulse"></i> : t("admin:view.save")}
                        </button>
                    </div>
                </div>
            </form>
            <Modal className="modal-sm" isOpen={values.modal} toggle={modalToggle}>
                <ModalHeader toggle={modalToggle}>{t("roles")}</ModalHeader>
                <ModalBody>
                    <nav className="nav nav-tabs flex-column">
                        {values.roles.map(role =>
                            <a className={modalClass(role.id)} key={role.id} href="#" onClick={() => handleRoleChange(role)}>
                                {role.name} <span className="badge bg-primary"><i className="fa fa-check"></i></span>
                            </a>
                        )}
                    </nav>
                </ModalBody>
                <ModalFooter>
                    <button type="button" className="btn btn-outline-secondary" onClick={modalToggle}>{t("admin:view.cancel")}</button>
                    <button type="button" className="btn btn-primary" onClick={modalConfirm}>{t("admin:view.confirm")}</button>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default User;