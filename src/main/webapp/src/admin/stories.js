import React, {useEffect, useState} from 'react';
import {Link, useHistory, useLocation} from 'react-router-dom';
import {useTranslation} from "react-i18next";
import Auth from "../module/Auth";
import Utils from "../module/Utils";
import axios from "axios";
import {DropdownItem, DropdownMenu, DropdownToggle, Modal, ModalBody, ModalFooter, ModalHeader, UncontrolledButtonDropdown} from "reactstrap";

const Stories = (props) => {

    const {t, i18n} = useTranslation('story', 'admin');
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
        await axios.delete("/api/admin/story/" + id, {headers: Auth.authHeader()}).then((response) => {
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
        title: "",
        published: ""
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
            params = Utils.buildParams(params, "/title/", filter.title);
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
        params = Utils.buildParams(params, "/published/", filter.published);
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
        title: '',
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
        params = Utils.buildSort(params, "/sort/title", sort.title);
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
                <li className="breadcrumb-item active"><i className="fas fa-newspaper fa-lg fa-fw"></i> {t("admin:nav.story")}</li>
            </ol>
            <h1 className="h3 mt-5 text-muted">{t("title")}</h1>
            <div className="btn-toolbar mt-5 justify-content-end" role="toolbar">
                <Link className="btn btn-primary btn-sm shadow ms-2" to="/admin/story">
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
                <input type="search" name="name" placeholder={t("search")} value={filter.title} onChange={handleFilterChange}/>
            </div>
            {values.message && (
                <div className="mt-3">
                    <div className="alert alert-danger" role="alert">{values.message}</div>
                </div>
            )}
            {values.loading && <i className="fas fa-spinner fa-pulse fa-2x justify-content-center my-5"></i>}
            {!values.loading && values.page.totalElements === 0 && <h3 className="text-muted text-center my-5"><i className="far fa-sticky-note"></i> {t("admin:view.empty")}</h3>}
            {values.page && values.page.content && values.page.content.map(story =>
                <div className="d-flex my-3 p-1 shadow-sm rounded" key={story.id}>
                    {story.pictures && <Link to={"/admin/story/" + story.id} className="rounded w-25">
                        <div className="rounded w-100 h-100"
                             style={{backgroundImage: "url(/api/story/" + story.id + "/picture/" + (story.pictures.split(',')[0]).replace('.', '_thumbnail.') + ")"}}>
                        </div>
                    </Link>}
                    <div className="px-3 w-75">
                        <p className="text-ellipsis"><Link to={"/admin/story/" + story.id}>{story.title}</Link></p>
                        <p>
                            {story.published ?
                                <span className="badge bg-success rounded-pill"><i className="far fa-eye fa-fw"></i> {t("public")}</span>
                                : <span className="badge bg-secondary rounded-pill"><i className="far fa-eye-slash fa-fw"></i> {t("private")}</span>
                            }
                        </p>
                        <small className="text-muted">{story.lastModifiedDate}</small>
                    </div>
                    <UncontrolledButtonDropdown className="align-self-center ms-auto">
                        <DropdownToggle className="btn-borderless">
                            <i className="fa fa-ellipsis-v fa-fw"></i>
                        </DropdownToggle>
                        <DropdownMenu className="dropdown-menu-end">
                            <DropdownItem tag={Link} to={"/admin/story/" + story.id}><i className="far fa-edit fa-fw"></i> {t("admin:view.edit")}</DropdownItem>
                            <DropdownItem onClick={() => modalConfirmOpen(story.id)}>
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
                    <div className="btn-group mb-3" role="group">
                        <input type="radio" className="btn-check" id="filterPublishedAll" name="published" value="" checked={filter.published === ''}
                               onChange={handleFilterChange}/>
                        <label className="btn btn-outline-primary" htmlFor="filterPublishedAll">{t("admin:view.all")}</label>
                        <input type="radio" className="btn-check" id="filterPublic" name="published" value="true" checked={filter.published === 'true'}
                               onChange={handleFilterChange}/>
                        <label className="btn btn-outline-primary" htmlFor="filterPublic">{t("public")}</label>
                        <input type="radio" className="btn-check" id="filterPrivate" name="published" value="false" checked={filter.published === 'false'}
                               onChange={handleFilterChange}/>
                        <label className="btn btn-outline-primary" htmlFor="filterPrivate">{t("private")}</label>
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
                            <label htmlFor="title" className="col-form-label">{t("name")}</label>
                        </div>
                        <div className="col-auto">
                            <div className="btn-group" role="group">
                                <input type="radio" className="btn-check" id="sortTitle" name="title" value="" checked={sort.title === ''} onChange={handleSortChange}/>
                                <label className="btn btn-outline-primary" htmlFor="sortTitle">
                                    <i className="fas fa-sort fa-fw"></i> <span className="d-none d-sm-inline-block">{t("admin:view.notSorted")}</span>
                                </label>
                                <input type="radio" className="btn-check" id="sortTitleAsc" name="title" value="asc" checked={sort.title === 'asc'} onChange={handleSortChange}/>
                                <label className="btn btn-outline-primary" htmlFor="sortTitleAsc">
                                    <i className="fas fa-sort-alpha-down fa-fw"></i> <span className="d-none d-sm-inline-block">{t("admin:view.ascending")}</span>
                                </label>
                                <input type="radio" className="btn-check" id="sortTitleDesc" name="title" value="desc" checked={sort.title === 'desc'} onChange={handleSortChange}/>
                                <label className="btn btn-outline-primary" htmlFor="sortTitleDesc">
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
}

export default Stories;
