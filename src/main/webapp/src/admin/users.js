import React, {useEffect, useState} from 'react';
import {Link, useHistory, useLocation} from 'react-router-dom';
import {useTranslation} from "react-i18next";
import Auth from "../module/Auth";
import Utils from "../module/Utils";
import axios from "axios";
import {DropdownItem, DropdownMenu, DropdownToggle, Modal, ModalBody, ModalFooter, ModalHeader, UncontrolledButtonDropdown} from "reactstrap";

const Users = (props) => {

    const {t, i18n} = useTranslation('user', 'admin');
    const location = useLocation();
    const history = useHistory();

    const [values, setValues] = useState({
        loading: true,
        message: '',
        params: '',
        page: undefined,
        id: "",
        modal: false
    });

    useEffect(() => {
        loadPage(location.pathname);
        setValues((values) => ({
            ...values, params: location.pathname
        }));
    }, [location.pathname]);

    const loadPage = async (params) => {
        await axios.get("/api" + params, {headers: Auth.authHeader()}).then((response) => {
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
        let params = values.params;
        params = Utils.buildParams(params, "/page/", number);
        console.log(params);
        history.push(params);
    };

    const modalConfirmToggle = () => {
        setValues((values) => ({
            ...values, modal: !values.modal
        }));
    };

    const modalConfirmOpen = (id) => {
        setValues((values) => ({
            ...values, modal: !values.modal, id: id
        }));
    };

    const modalConfirmDelete = async (id) => {
        setValues((values) => ({
            ...values, modal: !values.modal, loading: true
        }));
        await axios.delete("/api/admin/user/" + id, {headers: Auth.authHeader()}).then((response) => {
                console.log(response);
                loadPage(values.params);
            }, error => {
                console.log(error);
                setValues((values) => ({
                    ...values, loading: false, message: error.response.data.message
                }));
            }
        );
    };

    const [filter, setFilter] = useState({
        modal: false,
        name: "",
        username: '',
        email: '',
        phone: '',
        activated: ''
    })


    const handleFilterChange = (event) => {
        event.persist();
        let name = event.target.name;
        let value = event.target.value;
        setFilter((values) => ({
            ...values, [name]: value,
        }));
    };

    useEffect(() => {
        if (!values.params) return;
        const timeOutId = setTimeout(() => {
            let params = values.params;
            params = Utils.buildParams(params, "/name/", filter.name);
            loadPage(params);
            setValues((values) => ({
                ...values, params: params
            }));
        }, 500);
        return () => clearTimeout(timeOutId);
    }, [filter.name]);


    const modalFilterToggle = () => {
        setFilter((values) => ({
            ...values, modal: !filter.modal
        }));
    };

    const handleFilter = () => {
        let params = values.params;
        params = Utils.buildParams(params, "/username/", filter.username);
        params = Utils.buildParams(params, "/email/", filter.email);
        params = Utils.buildParams(params, "/phone/", filter.phone);
        params = Utils.buildParams(params, "/activated/", filter.activated)
        setFilter((values) => ({
            ...values, modal: !filter.modal
        }));
        setValues((values) => ({
            ...values, params: params, loading: true
        }));
        loadPage(params);
    };

    const [sort, setSort] = useState({
        modal: false,
        name: '',
        username: '',
        email: '',
        phone: '',
        createdDate: '',
        lastModifiedDate: ''
    })

    const modalSortToggle = () => {
        setSort((values) => ({
            ...values, modal: !sort.modal
        }));
    };

    const handleSortChange = (event) => {
        event.persist();
        let name = event.target.name;
        let value = event.target.value;
        setSort((values) => ({
            ...values, [name]: value
        }));
    };

    const handleSort = () => {
        let params = values.params;
        params = Utils.buildSort(params, "/sort/name", sort.name);
        params = Utils.buildSort(params, "/sort/username", sort.username);
        params = Utils.buildSort(params, "/sort/email", sort.email);
        params = Utils.buildSort(params, "/sort/phone", sort.phone);
        params = Utils.buildSort(params, "/sort/createdDate", sort.createdDate);
        params = Utils.buildSort(params, "/sort/lastModifiedDate", sort.lastModifiedDate);
        setSort((values) => ({
            ...values, modal: !sort.modal
        }));
        setValues((values) => ({
            ...values, params: params, loading: true
        }));
        loadPage(params);
    };

    return (
        <>
            <ol className="breadcrumb mt-3 p-2 rounded-start">
                <li className="breadcrumb-item"><Link to="/admin"><i className="fas fa-tachometer-alt fa-lg fa-fw"></i> {t("admin:nav.dashboard")}</Link></li>
                <li className="breadcrumb-item active"><i className="fas fa-users fa-lg fa-fw"></i> {t("admin:nav.user")}</li>
            </ol>
            <h1 className="h3 mt-5 text-muted">{t("title")}</h1>
            <div className="btn-toolbar mt-5 justify-content-end" role="toolbar">
                <Link className="btn btn-primary btn-sm shadow ms-2" to="/admin/user">
                    <i className="fas fa-plus fa-fw"> </i><span className="d-none d-sm-inline-block">{t("admin:view.new")}</span>
                </Link>
                <button type="button" className="btn btn-borderless btn-sm shadow ms-2" onClick={modalFilterToggle}>
                    <i className="fas fa-filter"></i> <span className="d-none d-sm-inline-block">{t("admin:view.filter")}</span>
                </button>
                <button type="button" className="btn btn-borderless btn-sm shadow ms-2" onClick={modalSortToggle}>
                    <i className="fas fa-sort-alpha-down"></i> <span className="d-none d-sm-inline-block">{t("admin:view.sort")}</span>
                </button>
                <button type="button" className="btn btn-borderless btn-sm shadow ms-2">
                    <i className="fas fa-file-export fa-fw"></i> <span className="d-none d-sm-inline-block">{t("admin:view.export")}</span>
                </button>
            </div>
            <div className="search rounded-start mt-3">
                <span className="icon"><i className="fa fa-search" aria-hidden="true"></i></span>
                <input type="search" name="name" placeholder={t("search")} value={filter.name} onChange={handleFilterChange}/>
            </div>
            {values.message && (
                <div className="mt-3">
                    <div className="alert alert-danger" role="alert">{values.message}</div>
                </div>
            )}
            {values.loading && <i className="fas fa-spinner fa-pulse fa-2x justify-content-center my-5"></i>}
            {!values.loading && values.page.totalElements === 0 && <h3 className="text-muted text-center my-5"><i className="far fa-sticky-note"></i> {t("admin:view.empty")}</h3>}
            {values.page && values.page.content && values.page.content.map(user =>
                <div className="d-flex my-3 py-3 px-1 shadow-sm rounded" key={user.id}>
                    <div className="px-3 w-75">
                        <p className="text-ellipsis"><Link to="/admin/user/"><i className="far fa-user-circle fa-fw fa-lg"></i> {user.name}</Link></p>
                        <p className="text-muted">
                            <i className="far fa-envelope fa-fw fa-lg"></i> {user.email} <br/>
                            {user.phone && (<> <i className="fas fa-phone" fa-fw fa-lg></i> {user.phone} <br/></>)}
                            <i className="fas fa-sign-in-alt fa-fw fa-lg"></i> {user.username} <br/>
                        </p>
                        <p>
                            {user.activated ?
                                <span className="badge bg-success rounded-pill"><i className="fas fa-user-check"></i> {t("verified")}</span>
                                : <span className="badge bg-secondary rounded-pill"><i className="fas fa-user-slash"></i> {t("notVerified")}</span>
                            }
                        </p>
                        <small className="text-muted">{user.lastModifiedDate}</small>
                    </div>
                    <UncontrolledButtonDropdown className="align-self-center ms-auto">
                        <DropdownToggle className="btn-borderless">
                            <i className="fa fa-ellipsis-v fa-fw"></i>
                        </DropdownToggle>
                        <DropdownMenu className="dropdown-menu-end">
                            <DropdownItem tag={Link} to={"/admin/user/" + user.id}><i className="far fa-edit fa-fw"></i> {t("admin:view.edit")}</DropdownItem>
                            <DropdownItem onClick={() => modalConfirmOpen(user.id)}>
                                <i className="far fa-trash-alt fa-fw"></i> {t("admin:view.delete")}
                            </DropdownItem>
                        </DropdownMenu>
                    </UncontrolledButtonDropdown>
                </div>
            )}

            {values.page && values.page.totalElements !== 0 && <>
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
                            <li className={values.page.number === i + 1 ? "page-item active" : "page-item"} key={i}>
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
            <Modal className="modal-sm" isOpen={values.modal} toggle={modalConfirmToggle}>
                <ModalHeader toggle={modalConfirmToggle}>{t("admin:view.confirm")}</ModalHeader>
                <ModalBody>{t("admin:view.confirmDeleteTitle")}</ModalBody>
                <ModalFooter>
                    <button type="button" className="btn btn-outline-secondary" onClick={modalConfirmToggle}>{t("admin:view.cancel")}</button>
                    <button type="button" className="btn btn-primary" onClick={() => modalConfirmDelete(values.id)}>{t("admin:view.confirm")}</button>
                </ModalFooter>
            </Modal>
            <Modal isOpen={filter.modal} toggle={modalFilterToggle}>
                <ModalHeader toggle={modalFilterToggle}>{t("admin:view.filter")}</ModalHeader>
                <ModalBody>
                    <div className="mb-3">
                        <label htmlFor="username" className="col-form-label sr-only">{t("username")}</label>
                        <input type="text" name="username" className="form-control" placeholder={t("username")} value={filter.username} onChange={handleFilterChange}/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="email" className="col-form-label sr-only">{t("email")}</label>
                        <input type="text" name="email" className="form-control" placeholder={t("email")} value={filter.email} onChange={handleFilterChange}/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="phone" className="col-form-label sr-only">{t("phone")}</label>
                        <input type="text" name="phone" className="form-control" placeholder={t("phone")} value={filter.phone} onChange={handleFilterChange}/>
                    </div>
                    <div className="btn-group mb-3" role="group">
                        <input type="radio" className="btn-check" id="filterActivated" name="activated" value="" checked={filter.activated === ''} onChange={handleFilterChange}/>
                        <label className="btn btn-outline-primary" htmlFor="filterActivated">{t("all")}</label>
                        <input type="radio" className="btn-check" id="filterVerified" name="activated" value="true" checked={filter.activated === 'true'}
                               onChange={handleFilterChange}/>
                        <label className="btn btn-outline-primary" htmlFor="filterVerified">{t("verified")}</label>
                        <input type="radio" className="btn-check" id="filterNovVerified" name="activated" value="false" checked={filter.activated === 'false'}
                               onChange={handleFilterChange}/>
                        <label className="btn btn-outline-primary" htmlFor="filterNovVerified">{t("notVerified")}</label>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <button type="button" className="btn btn-outline-secondary" onClick={modalFilterToggle}>{t("admin:view.cancel")}</button>
                    <button type="button" className="btn btn-primary" onClick={handleFilter}>{t("admin:view.confirm")}</button>
                </ModalFooter>
            </Modal>
            <Modal isOpen={sort.modal} toggle={modalSortToggle} className="modal-lg">
                <ModalHeader toggle={modalSortToggle}>{t("admin:view.sort")}</ModalHeader>
                <ModalBody>
                    <div className="row mb-3 align-items-center">
                        <div className="col-4 col-sm-3">
                            <label htmlFor="name" className="col-form-label">{t("name")}</label>
                        </div>
                        <div className="col-auto">
                            <div className="btn-group" role="group">
                                <input type="radio" className="btn-check" id="sortName" name="name" value="" checked={sort.name === ''} onChange={handleSortChange}/>
                                <label className="btn btn-outline-primary" htmlFor="sortName">
                                    <i className="fas fa-sort fa-fw"></i> <span className="d-none d-sm-inline-block">{t("admin:view.notSorted")}</span>
                                </label>
                                <input type="radio" className="btn-check" id="sortNameAsc" name="name" value="asc" checked={sort.name === 'asc'} onChange={handleSortChange}/>
                                <label className="btn btn-outline-primary" htmlFor="sortNameAsc">
                                    <i className="fas fa-sort-alpha-down fa-fw"></i> <span className="d-none d-sm-inline-block">{t("admin:view.ascending")}</span>
                                </label>
                                <input type="radio" className="btn-check" id="sortNameDesc" name="name" value="desc" checked={sort.name === 'desc'} onChange={handleSortChange}/>
                                <label className="btn btn-outline-primary" htmlFor="sortNameDesc">
                                    <i className="fas fa-sort-alpha-up fa-fw"></i> <span className="d-none d-sm-inline-block">{t("admin:view.descending")}</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="row mb-3 align-items-center">
                        <div className="col-4 col-sm-3">
                            <label htmlFor="username" className="col-form-label">{t("username")}</label>
                        </div>
                        <div className="col-auto">
                            <div className="btn-group" role="group">
                                <input type="radio" className="btn-check" id="sortUsername" name="username" value="" checked={sort.username === ''} onChange={handleSortChange}/>
                                <label className="btn btn-outline-primary" htmlFor="sortUsername">
                                    <i className="fas fa-sort fa-fw"></i> <span className="d-none d-sm-inline-block">{t("admin:view.notSorted")}</span>
                                </label>
                                <input type="radio" className="btn-check" id="sortUsernameAsc" name="username" value="asc" checked={sort.username === 'asc'}
                                       onChange={handleSortChange}/>
                                <label className="btn btn-outline-primary" htmlFor="sortUsernameAsc">
                                    <i className="fas fa-sort-alpha-down fa-fw"></i> <span className="d-none d-sm-inline-block">{t("admin:view.ascending")}</span>
                                </label>
                                <input type="radio" className="btn-check" id="sortUsernameDesc" name="username" value="desc" checked={sort.username === 'desc'}
                                       onChange={handleSortChange}/>
                                <label className="btn btn-outline-primary" htmlFor="sortUsernameDesc">
                                    <i className="fas fa-sort-alpha-up fa-fw"></i> <span className="d-none d-sm-inline-block">{t("admin:view.descending")}</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="row mb-3 align-items-center">
                        <div className="col-4 col-sm-3">
                            <label htmlFor="email" className="col-form-label">{t("email")}</label>
                        </div>
                        <div className="col-auto">
                            <div className="btn-group" role="group">
                                <input type="radio" className="btn-check" id="sortEmail" name="email" value="" checked={sort.email === ''} onChange={handleSortChange}/>
                                <label className="btn btn-outline-primary" htmlFor="sortEmail">
                                    <i className="fas fa-sort fa-fw"></i> <span className="d-none d-sm-inline-block">{t("admin:view.notSorted")}</span>
                                </label>
                                <input type="radio" className="btn-check" id="sortEmailAsc" name="email" value="asc" checked={sort.email === 'asc'}
                                       onChange={handleSortChange}/>
                                <label className="btn btn-outline-primary" htmlFor="sortEmailAsc">
                                    <i className="fas fa-sort-alpha-down fa-fw"></i> <span className="d-none d-sm-inline-block">{t("admin:view.ascending")}</span>
                                </label>
                                <input type="radio" className="btn-check" id="sortEmailDesc" name="email" value="desc" checked={sort.email === 'desc'}
                                       onChange={handleSortChange}/>
                                <label className="btn btn-outline-primary" htmlFor="sortEmailDesc">
                                    <i className="fas fa-sort-alpha-up fa-fw"></i> <span className="d-none d-sm-inline-block">{t("admin:view.descending")}</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="row mb-3 align-items-center">
                        <div className="col-4 col-sm-3">
                            <label htmlFor="phone" className="col-form-label">{t("phone")}</label>
                        </div>
                        <div className="col-auto">
                            <div className="btn-group" role="group">
                                <input type="radio" className="btn-check" id="sortPhone" name="phone" value="" checked={sort.phone === ''} onChange={handleSortChange}/>
                                <label className="btn btn-outline-primary" htmlFor="sortPhone">
                                    <i className="fas fa-sort fa-fw"></i> <span className="d-none d-sm-inline-block">{t("admin:view.notSorted")}</span>
                                </label>
                                <input type="radio" className="btn-check" id="sortPhoneAsc" name="email" value="asc" checked={sort.phone === 'asc'}
                                       onChange={handleSortChange}/>
                                <label className="btn btn-outline-primary" htmlFor="sortPhoneAsc">
                                    <i className="fas fa-sort-alpha-down fa-fw"></i> <span className="d-none d-sm-inline-block">{t("admin:view.ascending")}</span>
                                </label>
                                <input type="radio" className="btn-check" id="sortPhoneDesc" name="email" value="desc" checked={sort.phone === 'desc'}
                                       onChange={handleSortChange}/>
                                <label className="btn btn-outline-primary" htmlFor="sortPhoneDesc">
                                    <i className="fas fa-sort-alpha-up fa-fw"></i> <span className="d-none d-sm-inline-block">{t("admin:view.descending")}</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="row mb-3 align-items-center">
                        <div className="col-4 col-sm-3">
                            <label htmlFor="createdDate" className="col-form-label">{t("admin:view.createdDate")}</label>
                        </div>
                        <div className="col-auto">
                            <div className="btn-group" role="group">
                                <input type="radio" className="btn-check" id="sortCreatedDate" name="createdDate" value="" checked={sort.createdDate === ''}
                                       onChange={handleSortChange}/>
                                <label className="btn btn-outline-primary" htmlFor="sortCreatedDate">
                                    <i className="fas fa-sort fa-fw"></i> <span className="d-none d-sm-inline-block">{t("admin:view.notSorted")}</span>
                                </label>
                                <input type="radio" className="btn-check" id="sortCreatedDateAsc" name="createdDate" value="asc" checked={sort.createdDate === 'asc'}
                                       onChange={handleSortChange}/>
                                <label className="btn btn-outline-primary" htmlFor="sortCreatedDateAsc">
                                    <i className="fas fa-sort-alpha-down fa-fw"></i> <span className="d-none d-sm-inline-block">{t("admin:view.ascending")}</span>
                                </label>
                                <input type="radio" className="btn-check" id="sortCreatedDateDesc" name="createdDate" value="desc" checked={sort.createdDate === 'desc'}
                                       onChange={handleSortChange}/>
                                <label className="btn btn-outline-primary" htmlFor="sortCreatedDateDesc">
                                    <i className="fas fa-sort-alpha-up fa-fw"></i> <span className="d-none d-sm-inline-block">{t("admin:view.descending")}</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="row mb-3 align-items-center">
                        <div className="col-4 col-sm-3">
                            <label htmlFor="lastModifiedDate" className="col-form-label">{t("admin:view.lastModifiedDate")}</label>
                        </div>
                        <div className="col-auto">
                            <div className="btn-group" role="group">
                                <input type="radio" className="btn-check" id="sortLastModifiedDate" name="lastModifiedDate" value="" checked={sort.lastModifiedDate === ''}
                                       onChange={handleSortChange}/>
                                <label className="btn btn-outline-primary" htmlFor="sortLastModifiedDate">
                                    <i className="fas fa-sort fa-fw"></i> <span className="d-none d-sm-inline-block">{t("admin:view.notSorted")}</span>
                                </label>
                                <input type="radio" className="btn-check" id="sortLastModifiedDateAsc" name="lastModifiedDate" value="asc" checked={sort.lastModifiedDate === 'asc'}
                                       onChange={handleSortChange}/>
                                <label className="btn btn-outline-primary" htmlFor="sortLastModifiedDateAsc">
                                    <i className="fas fa-sort-alpha-down fa-fw"></i> <span className="d-none d-sm-inline-block">{t("admin:view.ascending")}</span>
                                </label>
                                <input type="radio" className="btn-check" id="sortLastModifiedDateDesc" name="lastModifiedDate" value="desc"
                                       checked={sort.lastModifiedDate === 'desc'}
                                       onChange={handleSortChange}/>
                                <label className="btn btn-outline-primary" htmlFor="sortLastModifiedDateDesc">
                                    <i className="fas fa-sort-alpha-up fa-fw"></i> <span className="d-none d-sm-inline-block">{t("admin:view.descending")}</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <button type="button" className="btn btn-outline-secondary" onClick={modalSortToggle}>{t("admin:view.cancel")}</button>
                    <button type="button" className="btn btn-primary" onClick={handleSort}>{t("admin:view.confirm")}</button>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default Users;