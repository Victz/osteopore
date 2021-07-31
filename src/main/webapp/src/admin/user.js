import React, {useEffect, useState} from "react";
import {useTranslation} from 'react-i18next';
import {Link, useHistory, useParams} from "react-router-dom";
import axios from "axios";
import Auth from "../module/Auth";

const User = (props) => {

    const {id} = useParams();
    const {t, i18n} = useTranslation('user', 'admin');
    const history = useHistory();

    const [values, setValues] = useState({
        loading: true,
        message: '',
        roles: []
    });

    const [model, setModel] = useState({
        id: '',
        name: '',
        username: '',
        email: '',
        phone: '',
        activated: false,
        roles: []
    });

    useEffect(() => {
        if (id) {
            axios.get("/api/admin/user/" + id, {headers: Auth.authHeader()}).then((response) => {
                    console.log(response);
                    for (const [name, value] of Object.entries(response.data)) {
                        if (name === 'roles') {
                            value.map(role => {
                                setModel((values) => ({
                                    ...values, roles: [...model.roles, role.id]
                                }));
                            });
                        } else if (model.hasOwnProperty(name)) {
                            setModel((values) => ({
                                ...values, [name]: value
                            }));
                        }
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
        loadRoles('');
        setValues((values) => ({
            ...values, loading: false
        }));
    }, []);

    const loadRoles = async (params) => {
        axios.get("/api/admin/roles" + params, {headers: Auth.authHeader()}).then((response) => {
                console.log(response);
                response.data.map(role => {
                    setValues((values) => ({
                        ...values, roles: [...values.roles, {id: role.id, name: role.name}]
                    }));
                });
            }, error => {
                console.log(error);
                setValues((values) => ({
                    ...values, loading: false, message: error.response.data.message
                }));
            }
        );
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
                event.target.nextSibling.nextSibling.classList.add("d-none");
            } else {
                event.target.classList.remove("border-success");
                event.target.classList.add('border-danger');
            }
        } else if (name === "email") {
            if (value.trim() !== "" && patternEmail.test(value.trim())) {
                event.target.classList.remove("border-danger");
                event.target.classList.add('border-success');
                event.target.nextSibling.nextSibling.classList.add("d-none");
            } else {
                event.target.classList.remove("border-success");
                event.target.classList.add('border-danger');
            }
        }
    };

    const isChecked = (role) => {
        console.log('ischecked: ' + role);
        let checked = false;
        model.roles.map(selectedRole => {
            if (selectedRole === role) checked = true;
        });
        return checked;
    }

    const handleCheckbox = (event) => {
        event.persist();
        let role = event.target.value;
        let index = model.roles.findIndex((element) => element === role);
        // model.roles.map((selectedRole, i) => {
        //     if (selectedRole === role) index = i;
        // });
        console.log('index: ' + index);
        if (index > -1) {
            model.roles.splice(index, 1);
        } else {
            model.roles.push(role);
        }
        console.log('model.roles: ' + model.roles.join());
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!(event.target.elements["name"].value.trim().length > 1)) {
            event.target.elements["name"].nextSibling.nextSibling.classList.remove("d-none");
            return false;
        }
        if (!(event.target.elements["email"].value.trim() !== "" && patternEmail.test(event.target.elements["email"].value.trim()))) {
            event.target.elements["email"].nextSibling.nextSibling.classList.remove("d-none");
            return false;
        }
        setValues((values) => ({
            ...values, loading: true
        }));

        if (model.id && model.id.trim().length > 0) {
            await axios.put("/api/admin/user", model, {headers:Auth.authHeader()}).then((response) => {
                    console.log(response);
                    history.push('/admin/users');
                }, error => {
                    console.log(error);
                    setValues((values) => ({
                        ...values, loading: false, message: error.response.data.message
                    }));
                }
            );
        } else {
            await axios.post("/api/admin/user", model, {headers: Auth.authHeader()}).then((response) => {
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
    }

    return (
        <>
            <ol className="breadcrumb mt-3 p-2 rounded-start">
                <li className="breadcrumb-item"><Link to="/admin"><i className="fas fa-tachometer-alt fa-lg fa-fw"></i> {t("admin:nav.dashboard")}</Link></li>
                <li className="breadcrumb-item"><Link to="/admin/users"><i className="fas fa-users fa-lg fa-fw"></i> {t("admin:nav.user")}</Link></li>
                <li className="breadcrumb-item active"><i className="far fa-edit fa-fw"></i> {t("admin:view.edit")}</li>
            </ol>
            <h1 className="h3 mt-5 text-muted">{t("title")}</h1>
            <form className="form-sm my-5" onSubmit={handleSubmit}>
                {values.message && (
                    <div className="mb-3">
                        <div className="alert alert-danger" role="alert">{values.message}</div>
                    </div>
                )}
                <div className="form-floating mb-3">
                    <input type="text" name="name" className="form-control" placeholder={t("name")}
                           value={model.name} onChange={handleChange} maxLength="50" required autoFocus/>
                    <label htmlFor="name">{t("name")}</label>
                    <div className="text-danger d-none"><i className='fa fa-exclamation-circle'></i> {t("nameValidate")}</div>
                </div>
                <div className="form-floating mb-3">
                    <input type="text" name="username" className="form-control" placeholder={t("username")}
                           value={model.username} onChange={handleChange} maxLength="50" required/>
                    <label htmlFor="username">{t("username")}</label>
                    <div className="text-danger d-none"><i className='fa fa-exclamation-circle'></i> {t("usernameValidate")}</div>
                </div>
                <div className="form-floating mb-3">
                    <input type="text" name="email" className="form-control" placeholder={t("email")}
                           value={model.email} onChange={handleChange} maxLength="50" required/>
                    <label htmlFor="email">{t("email")}</label>
                    <div className="text-danger d-none"><i className='fa fa-exclamation-circle'></i> {t("emailValidate")}</div>
                </div>
                <div className="form-floating mb-3">
                    <input type="text" name="phone" className="form-control" placeholder={t("phone")}
                           value={model.phone} onChange={handleChange} maxLength="50"/>
                    <label htmlFor="phone">{t("phone")}</label>
                </div>
                <div className="mt-4 mb-3">
                    {values.roles.map(role =>
                        <div className="form-check form-switch" key={role.id}>
                            <input className="form-check-input" type="checkbox" id={role.id} name="roles" value={role.id}
                                   onChange={handleCheckbox} defaultChecked={isChecked(role.id)}/>
                            <label className="form-check-label" htmlFor={role.id}>{role.name}</label>
                        </div>
                    )}
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

export default User;
