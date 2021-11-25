import React, {useEffect, useState} from "react";
import {useTranslation} from 'react-i18next';
import {Link, useHistory, useParams} from "react-router-dom";
import axios from "axios";
import Auth from "../module/Auth";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';

const Inventory = (props) => {

    const {id} = useParams();
    const {t, i18n} = useTranslation('inventory', 'admin');
    const history = useHistory();

    const [values, setValues] = useState({
        loading: true,
        message: '',
        products: [],
        users: []
    });

    const [model, setModel] = useState({
        id: '',
        product: '',
        serialNumber: '',
        manufacturingDate: '',
        expirationDate: '',
        remark: '',
        status: '',
        user: '',
        orderReference: ''
    });

    useEffect(() => {
        if (id) {
            axios.get("/api/admin/inventory/" + id, {headers: Auth.authHeader()})
                .then((response) => {
                        console.log(response);
                        for (const [name, value] of Object.entries(response.data)) {
                            if (!value) continue;
                            if (name === 'product') {
                                setModel((values) => ({
                                    ...values, product: value.id
                                }));
                            } else if (name === 'manufacturingDate' || name === 'expirationDate') {
                                setModel((values) => ({
                                    ...values, [name]: moment(value).toDate()
                                }));
                            } else if (model.hasOwnProperty(name)) {
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
        loadProducts('');
        loadUsers('');
        setValues((values) => ({
            ...values, loading: false
        }));
    }, []);

    const loadProducts = async (params) => {
        await axios.get("/api/admin/products" + params, {headers: Auth.authHeader()}).then((response) => {
                setValues((values) => ({
                    ...values, loading: false, products: response.data
                }));
            }, error => {
                setValues((values) => ({
                    ...values, loading: false, message: error.response.data.message
                }));
            }
        );
    };

    const loadUsers = async (params) => {
        await axios.get("/api/admin/users" + params, {headers: Auth.authHeader()}).then((response) => {
                setValues((values) => ({
                    ...values, loading: false, users: response.data
                }));
            }, error => {
                setValues((values) => ({
                    ...values, loading: false, message: error.response.data.message
                }));
            }
        );
    };

    const handleChange = (event) => {
        event.persist();
        let name = event.target.name;
        let value = event.target.value;
        setModel((values) => ({
            ...values, [name]: value
        }));
        if (name === "serialNumber") {
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
        if (!(event.target.elements["serialNumber"].value.trim().length > 1)) {
            event.target.elements["serialNumber"].nextSibling.nextSibling.classList.remove("d-none");
            return false;
        }
        setValues((values) => ({
            ...values, loading: true
        }));

        if (model.id && model.id.trim().length > 0) {
            await axios.put("/api/admin/inventory", model, {headers: Auth.authHeader()}).then((response) => {
                    console.log(response);
                    history.push('/admin/inventories');
                }, error => {
                    console.log(error);
                    setValues((values) => ({
                        ...values, loading: false, message: error.response.data.message
                    }));
                }
            );
        } else {
            await axios.post("/api/admin/inventory", model, {headers: Auth.authHeader()}).then((response) => {
                    console.log(response);
                    history.push('/admin/inventories');
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
                <li className="breadcrumb-item"><Link to="/admin/inventories"><i className="fas fa-tasks fa-lg fa-fw"></i> {t("admin:nav.inventory")}</Link></li>
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
                    <select name="product" className="form-select mb-3" onChange={handleChange} value={model.product}>
                        <option value=''>{t("admin:view.select")}</option>
                        {values.products && values.products.content && values.products.content.map(product =>
                            <option key={product.id} value={product.id}>{product.name}</option>
                        )}
                    </select>
                    <label htmlFor="product">{t("product")}</label>
                </div>
                <div className="form-floating mb-3">
                    <input type="text" name="serialNumber" className="form-control" placeholder={t("serialNumber")}
                           value={model.serialNumber} onChange={handleChange} maxLength="255" required autoFocus/>
                    <label htmlFor="serialNumber">{t("serialNumber")}</label>
                    <div className="text-danger d-none"><i className='fa fa-exclamation-circle'></i> {t("serialNumberValidate")}</div>
                </div>
                <div className="mb-3">
                    <DatePicker name="manufacturingDate" className="form-control" placeholderText={t("manufacturingDate")} selected={model.manufacturingDate}
                                dateFormat="yyyy-MM-dd" isClearable onChange={(date) => setModel((values) => ({...values, manufacturingDate: date}))}/>
                </div>
                <div className="mb-3">
                    <DatePicker name="expirationDate" className="form-control" placeholderText={t("expirationDate")} selected={model.expirationDate}
                                dateFormat="yyyy-MM-dd" isClearable onChange={(date) => setModel((values) => ({...values, expirationDate: date}))}/>
                </div>
                <div className="form-floating mb-3">
                    <select name="status" className="form-select mb-3" onChange={handleChange} value={model.status}>
                        <option value=''>{t("admin:view.select")}</option>
                        <option value="WAREHOUSE">Warehouse</option>
                        <option value="SOLD">Sold</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CONSUMED">Consumed</option>
                        <option value="EXPIRED">Expired</option>
                        <option value="REFUNDED">Refunded</option>
                    </select>
                    <label htmlFor="status">{t("status")}</label>
                </div>
                <div className="form-floating mb-3">
                    <select name="user" className="form-select mb-3" onChange={handleChange} value={model.user}>
                        <option value=''>{t("admin:view.select")}</option>
                        {values.users && values.users.content && values.users.content.map(user =>
                            <option key={user.id} value={user.id}>{user.name}</option>
                        )}
                    </select>
                    <label htmlFor="user">{t("owner")}</label>
                </div>
                <div className="form-floating mb-3">
                    <input type="text" name="orderReference" className="form-control" placeholder={t("orderReference")}
                           value={model.orderReference} onChange={handleChange}/>
                    <label htmlFor="status">{t("orderReference")}</label>
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

export default Inventory;
