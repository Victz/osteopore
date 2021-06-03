import React, {useEffect, useState} from 'react';
import {Link, useHistory, useLocation} from 'react-router-dom';
import {useTranslation} from "react-i18next";
import Auth from "../module/Auth";
import axios from "axios";
import {DropdownItem, DropdownMenu, DropdownToggle, Modal, ModalBody, ModalFooter, ModalHeader, UncontrolledButtonDropdown} from "reactstrap";

const Users = (props) => {

        const {t, i18n} = useTranslation('user', 'admin');
        const location = useLocation();
        const history = useHistory();

        const [values, setValues] = useState({
            loading: true,
            message: '',
            page: undefined,
            modalConfirm: false,
            selectId: "",
            search: ""
        });

        useEffect(() => {
            loadUsers();
        }, [location.pathname]);

        const loadUsers = async () => {
            await axios.get("/api" + location.pathname, {headers: Auth.authHeader()}).then((response) => {
                    console.log(response);
                    setValues((values) => ({
                        ...values, loading: false, page: response.data
                    }));
                }, error => {
                    console.log(error);
                    setValues((values) => ({
                        ...values, loading: false, message: error.response.data.message
                    }));
                }
            );
        };

        const gotoPage = (number) => {
            let path = location.pathname;
            let index = path.lastIndexOf('/page/');
            if (index !== -1) {
                let params = path.substring(index + 6);
                let next = params.indexOf("/");
                path = path.substring(0, index) + (next !== -1 ? params.substring(next) : "");
            }
            path += "/page/" + number;
            history.push(path);
        };

        const modalConfirmToggle = () => {
            setValues((values) => ({
                ...values, modalConfirm: !values.modalConfirm
            }));
        };

        const modalConfirmOpen = (id) => {
            setValues((values) => ({
                ...values, modalConfirm: !values.modalConfirm, selectId: id
            }));
        };

        const modalConfirmDelete = async (id) => {
            setValues((values) => ({
                ...values, modalConfirm: !values.modalConfirm, loading: true
            }));
            await axios.delete("/api/admin/user/" + id, {headers: Auth.authHeader()}).then((response) => {
                    console.log(response);
                    loadUsers();
                }, error => {
                    console.log(error);
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
            setValues((values) => ({
                ...values, [name]: value,
            }));
        };

        return (
            <>
                <ol className="breadcrumb mt-3 p-2 rounded-start">
                    <li className="breadcrumb-item"><Link to="/admin"><i className="fas fa-tachometer-alt fa-lg fa-fw"></i> {t("admin:nav.dashboard")}</Link></li>
                    <li className="breadcrumb-item active"><i className="fas fa-users fa-lg fa-fw"></i> {t("admin:nav.user")}</li>
                </ol>
                <h1 className="h3 my-5 text-muted">{t("title")}</h1>

                <div className="btn-toolbar mt-3" role="toolbar" aria-label="Toolbar with button groups">
                    <a role="button" className="btn btn-primary btn-sm shadow me-2" href="/admin/user">
                        <i className="fas fa-plus fa-fw"></i> {t("admin:view.new")}
                    </a>
                    <button type="button" className="btn btn-borderless btn-sm shadow me-2">
                        <i className="fas fa-file-export fa-fw"></i> {t("admin:view.export")}
                    </button>
                    <button type="button" className="btn btn-borderless btn-sm shadow me-2" data-toggle="modal" data-target="#modalFilter">
                        <i className="fas fa-filter"></i> {t("admin:view.filter")}
                    </button>
                    <button type="button" className="btn btn-borderless btn-sm shadow me-2" data-toggle="modal" data-target="#modalSort">
                        <i className="fas fa-sort-alpha-down"></i> {t("admin:view.sort")}
                    </button>
                </div>
                <div className="search rounded-start mt-3">
                    <span className="icon"><i className="fa fa-search" aria-hidden="true"></i></span>
                    <input type="search" name="search" placeholder={t("search")} value={values.search} onChange={handleChange}/>
                </div>
                {values.message && (
                    <div className="mb-3">
                        <div className="alert alert-danger" role="alert">{values.message}</div>
                    </div>
                )}
                {values.loading && <i className="fas fa-spinner fa-pulse fa-2x justify-content-center my-5"></i>}
                {!values.loading && !values.page && <h3 className="text-muted text-center my-5"><i className="far fa-sticky-note"></i> {t("admin:view.empty")}</h3>}
                {values.page && values.page.content && values.page.content.map(user =>
                    <div className="d-flex my-3 py-3 px-1 shadow-sm rounded" key={user.id}>
                        <div className="px-3 w-75">
                            <p className="text-ellipsis"><a href="/admin/user/" target="_blank">{user.email}</a></p>
                            <p>
                                {user.activated ?
                                    <span className="badge bg-success rounded-pill"><i className="fas fa-user-check"></i> {t("verified")}</span>
                                    : <span className="badge bg-secondary rounded-pill"><i className="fas fa-user-slash"></i> {t("notVerified")}</span>
                                }
                            </p>
                            <small className="text-muted">Last Update {user.lastModifiedDate}</small>
                        </div>
                        <UncontrolledButtonDropdown className="align-self-center ms-auto">
                            <DropdownToggle className="btn-borderless">
                                <i className="fa fa-ellipsis-v fa-fw"></i>
                            </DropdownToggle>
                            <DropdownMenu className="dropdown-menu-right">
                                <DropdownItem><i className="far fa-edit fa-fw"></i> {t("admin:view.edit")}</DropdownItem>
                                <DropdownItem onClick={() => modalConfirmOpen(user.id)}>
                                    <i className="far fa-trash-alt fa-fw"></i> {t("admin:view.delete")}
                                </DropdownItem>
                            </DropdownMenu>
                        </UncontrolledButtonDropdown>
                    </div>
                )}

                {values.page && <>
                    <div className="clearfix"></div>
                    <p className="text-muted my-5">
                        Total {values.page.totalElements} Records, Page {values.page.number} of {values.page.totalPages}
                    </p>

                    <nav aria-label="Page navigation">
                        <ul className="pagination justify-content-center">
                            <li className={values.page.first ? "page-item disabled" : "page-item"}>
                                <Link className="page-link" aria-label="First" to="#" onClick={() => gotoPage(1)}>
                                    <span aria-hidden="true">&laquo;&laquo;</span>
                                </Link>
                            </li>
                            <li className={values.page.first ? "page-item disabled" : "page-item"}>
                                <Link className="page-link" aria-label="Previous" to="#" onClick={() => gotoPage(values.page.number - 1)}>
                                    <span aria-hidden="true">&laquo;</span>
                                </Link>
                            </li>
                            {[...Array(values.page.totalPages)].map((x, i) =>
                                <li className="page-item">
                                    <Link className="page-link" to="#" onClick={() => gotoPage(i + 1)}>{i + 1}</Link>
                                </li>
                            )}
                            <li className={values.page.last ? "page-item disabled" : "page-item"}>
                                <Link className="page-link" aria-label="Next" to="#" onClick={() => gotoPage(values.page.number + 1)}>
                                    <span aria-hidden="true">&raquo;</span>
                                </Link>
                            </li>
                            <li className={values.page.last ? "page-item disabled" : "page-item"}>
                                <Link className="page-link" aria-label="Last" to="#" onClick={() => gotoPage(values.page.totalPages)}>
                                    <span aria-hidden="true">&raquo;&raquo;</span>
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </>}
                <Modal className="modal-sm" isOpen={values.modalConfirm} toggle={modalConfirmToggle}>
                    <ModalHeader toggle={modalConfirmToggle}>{t("admin:view.confirm")}</ModalHeader>
                    <ModalBody>{t("admin:view.confirmDeleteTitle")}</ModalBody>
                    <ModalFooter>
                        <button type="button" className="btn btn-outline-secondary" onClick={modalConfirmToggle}>{t("admin:view.cancel")}</button>
                        <button type="button" className="btn btn-primary" onClick={() => modalConfirmDelete(values.selectId)}>{t("admin:view.confirm")}</button>
                    </ModalFooter>
                </Modal>
            </>
        );
    }
;

export default Users;