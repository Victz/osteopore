import React, {useEffect, useState} from "react";
import {useTranslation} from 'react-i18next';
import {Link, useHistory, useParams} from "react-router-dom";
import axios from "axios";
import Auth from "../module/Auth";
import SecurityUtils from "../module/SecurityUtils";
import Lightbox from "react-image-lightbox";
import {CKEditor} from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@victz/ckeditor5-build-classic';
import "@victz/ckeditor5-build-classic/build/translations/zh.js"

const Story = (props) => {

    const {id} = useParams();
    const {t, i18n} = useTranslation('story', 'admin');
    const history = useHistory();

    const [values, setValues] = useState({
        loading: true,
        message: ''
    });

    const [model, setModel] = useState({
        id: '',
        title: '',
        content: '',
        pictures: '',
        attachments: '',
        published: false
    });

    const [lightbox, setLightbox] = useState({
        pictures: [],
        isOpen: false,
        index: 1
    });

    const [pictures, setPictures] = useState({
        uploading: false,
        progress: 0
    });

    const [editor, setEditor] = useState();

    const [attachments, setAttachments] = useState({
        uploading: false,
        progress: 0
    });

    useEffect(() => {
        if (id) {
            axios.get("/api/admin/story/" + id, {headers: Auth.authHeader()})
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

    useEffect(() => {
        let pictureArray = [];
        model.pictures.split(",").map(picture => {
            pictureArray.push("/api/story/" + model.id + "/picture/" + picture);
        })
        setLightbox((values) => ({...values, pictures: pictureArray}))
    }, [model.pictures]);

    useEffect(() => {
        if (!id && model.id) {
            const timeOutId = setTimeout(() => {
                axios.put("/api/admin/story", model, {headers: Auth.authHeader()})
                    .then((response) => {
                            console.log(response);
                            history.push("/admin/story/" + model.id);
                            window.location.reload();
                        }, error => {
                            console.log(error);
                            setValues((values) => ({
                                ...values, message: error.response.data.message
                            }));
                        }
                    );
            }, 500);
            return () => clearTimeout(timeOutId);
        }
    }, [model.content, model.pictures, model.attachments]);

    const handleChange = (event) => {
        event.persist();
        let name = event.target.name;
        let value = event.target.value;
        setModel((values) => ({
            ...values, [name]: value
        }));
        if (name === "title") {
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

    const handleCheckbox = (event) => {
        event.persist();
        let name = event.target.name;
        let value = event.target.checked;
        setModel((values) => ({
            ...values, [name]: value
        }));
    }

    const loadPictureThumbnail = (picture) => {
        let index = picture.lastIndexOf(".");
        let fileNameExt = picture.substring(index);
        let fileNameWithoutExt = picture.substring(0, index);
        return "/api/story/" + model.id + "/picture/" + fileNameWithoutExt + "_thumbnail" + fileNameExt;
    }

    const handlePictures = async (event) => {
        event.persist();

        if (event.target.files.length > 10) {
            setValues((values) => ({
                ...values, message: t("uploadValidateLength")
            }));
            return;
        }

        let formData = new FormData();
        for (let i = 0; i < event.target.files.length; i++) {
            if (event.target.files[i].size > 1024 * 1024 * 100) {
                setValues((values) => ({
                    ...values, message: t("uploadValidateSize")
                }));
                continue;
            }
            formData.append(event.target.name, event.target.files[i]);
        }

        if (model.id) {
            formData.append("id", model.id);
        }

        setPictures((values) => ({
            ...values, uploading: true
        }));

        await axios.post("/api/admin/story/pictures", formData, {
            headers: {
                "Authorization": SecurityUtils.getBearerToken(),
                "Content-Type": "multipart/form-data"
            }, processData: false, contentType: false,
            onUploadProgress: progressEvent => console.log(progressEvent.loaded)
        }).then((response) => {
                console.log(response);
                setModel((values) => ({
                    ...values, id: response.data.id, pictures: response.data.pictures
                }));
            }, error => {
                console.log(error);
                setValues((values) => ({
                    ...values, message: error.response.data.message
                }));
            }
        ).finally(() => {
            setPictures((values) => ({
                ...values, uploading: false
            }));
        })
    }

    const handlePictureRemove = async (picture) => {
        setPictures((values) => ({
            ...values, uploading: true
        }));
        await axios.delete("/api/admin/story/" + model.id + "/picture/" + picture, {headers: Auth.authHeader()})
            .then((response) => {
                    console.log(response);
                    setModel((values) => ({
                        ...values, pictures: response.data.pictures
                    }));
                }, error => {
                    console.log(error);
                    setValues((values) => ({
                        ...values, message: error.response.data.message
                    }));
                }
            ).finally(() => {
                setPictures((values) => ({
                    ...values, uploading: false
                }));
            });
    };

    const handleAttachmentsUpload = async (event) => {
        event.persist();

        if (event.target.files.length > 10) {
            setValues((values) => ({
                ...values, message: t("uploadValidateLength")
            }));
            return;
        }

        let formData = new FormData();
        for (let i = 0; i < event.target.files.length; i++) {
            if (event.target.files[i].size > 1024 * 1024 * 100) {
                setValues((values) => ({
                    ...values, message: t("uploadValidateSize")
                }));
                continue;
            }
            formData.append(event.target.name, event.target.files[i]);
        }

        if (model.id) {
            formData.append("id", model.id);
        }

        setAttachments((values) => ({
            ...values, uploading: true
        }));

        await axios.post("/api/admin/story/attachments", formData, {
            headers: {
                "Authorization": SecurityUtils.getBearerToken(),
                "Content-Type": "multipart/form-data"
            }, processData: false, contentType: false,
            onUploadProgress: progressEvent => console.log(progressEvent.loaded)
        }).then((response) => {
                console.log(response);
                setModel((values) => ({
                    ...values, id: response.data.id, attachments: response.data.attachments
                }));
            }, error => {
                console.log(error);
                setValues((values) => ({
                    ...values, message: error.response.data.message
                }));
            }
        ).finally(() => {
            setAttachments((values) => ({
                ...values, uploading: false
            }));
        })
    }

    const handleAttachmentRemove = async (attachment) => {
        setAttachments((values) => ({
            ...values, uploading: true
        }));
        await axios.delete("/api/admin/story/" + model.id + "/attachment/" + attachment, {headers: Auth.authHeader()})
            .then((response) => {
                    console.log(response);
                    setModel((values) => ({
                        ...values, attachments: response.data.attachments
                    }));
                }, error => {
                    console.log(error);
                    setValues((values) => ({
                        ...values, message: error.response.data.message
                    }));
                }
            ).finally(() => {
                setAttachments((values) => ({
                    ...values, uploading: false
                }));
            });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!(event.target.elements["title"].value.trim().length > 1)) {
            event.target.elements["title"].nextSibling.nextSibling.classList.remove("d-none");
            return false;
        }
        setValues((values) => ({
            ...values, loading: true
        }));

        if (model.id && model.id.trim().length > 0) {
            await axios.put("/api/admin/story", model, {headers: Auth.authHeader()}).then((response) => {
                    console.log(response);
                    history.push('/admin/stories');
                }, error => {
                    console.log(error);
                    setValues((values) => ({
                        ...values, loading: false, message: error.response.data.message
                    }));
                }
            );
        } else {
            await axios.post("/api/admin/story", model, {headers: Auth.authHeader()}).then((response) => {
                    console.log(response);
                    history.push('/admin/stories');
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
                <li className="breadcrumb-item"><Link to="/admin/stories"><i className="fas fa-newspaper fa-lg fa-fw"></i> {t("admin:nav.story")}</Link></li>
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
                    <input type="text" name="title" className="form-control" placeholder={t("name")}
                           value={model.title} onChange={handleChange} maxLength="255" required autoFocus/>
                    <label htmlFor="title">{t("name")}</label>
                    <div className="text-danger d-none"><i className='fa fa-exclamation-circle'></i> {t("nameValidate")}</div>
                </div>
                <div className="mb-3">
                    <CKEditor id="editor" editor={ClassicEditor} data={model.content || ''} value=""
                              onReady={(editor) => {
                                  setEditor(editor);
                              }}
                              config={{
                                  language: i18n.language || window.localStorage.i18nextLng,
                                  simpleImageUpload: {
                                      onUpload: file => {
                                          return new Promise((resolve, reject) => {
                                              if (file.size > 1024 * 1024 * 100) {
                                                  setValues((values) => ({
                                                      ...values, message: t("uploadValidateSize")
                                                  }));
                                                  reject(t("uploadValidateSize"));
                                                  return;
                                              }
                                              let formData = new FormData();
                                              formData.append("pictures", file);
                                              if (id) {
                                                  formData.append("id", id);
                                              }
                                              setPictures((values) => ({
                                                  ...values, uploading: true
                                              }));

                                              axios.post("/api/admin/story/pictures", formData, {
                                                  headers: {
                                                      "Authorization": SecurityUtils.getBearerToken(),
                                                      "Content-Type": "multipart/form-data"
                                                  }, processData: false, contentType: false,
                                                  onUploadProgress: progressEvent => console.log(progressEvent.loaded)
                                              }).then((response) => {
                                                      console.log(response);
                                                      setModel((values) => ({
                                                          ...values, id: response.data.id, pictures: response.data.pictures
                                                      }));
                                                      resolve("/api/story/" + response.data.id + "/picture/" + file.name);
                                                  }, error => {
                                                      console.log(error);
                                                      setValues((values) => ({
                                                          ...values, message: error.response.data.message
                                                      }));
                                                      reject(t("uploadValidateSize"));
                                                      return;
                                                  }
                                              ).finally(() => {
                                                  setPictures((values) => ({
                                                      ...values, uploading: false
                                                  }));
                                              });
                                          });
                                      }
                                  }
                              }}
                              onChange={(event, editor) => {
                                  const data = editor.getData();
                                  setModel((values) => ({
                                      ...values, content: data
                                  }));
                              }}
                    />
                </div>
                <div className="mb-3">
                    <div className={"divInputFile btn btn-borderless btn-sm shadow " + (pictures.uploading ? "disabled" : "")}>
                        <span><i className="fas fa-camera fa-fw"/> {pictures.uploading ? <i className="fas fa-spinner fa-pulse"></i> : t("picture")}</span>
                        <input type="file" name="pictures" className="inputFile" accept="image/*" multiple onChange={handlePictures} disabled={pictures.uploading} value=""/>
                    </div>
                    {model.pictures && <div id="divPictures" className="panel-scroll my-1 p-1">
                        {model.pictures.split(",").map((picture, index) =>
                            <div className="col-4 col-sm-3 col-md-2 picture-wrapper" key={index}>
                                <img src={loadPictureThumbnail(picture)} onClick={() => setLightbox((values) => ({...values, isOpen: !lightbox.isOpen, index: index}))} alt='pictures'/>
                                <span className="picture-remover" onClick={() => handlePictureRemove(picture)}><i className="fas fa-minus-circle fa-lg"></i></span>
                            </div>
                        )}
                        {lightbox.isOpen && (
                            <Lightbox
                                mainSrc={lightbox.pictures[lightbox.index]}
                                nextSrc={lightbox.pictures[lightbox.index + 1 === lightbox.pictures.length ? 0 : (lightbox.index + 1)]}
                                prevSrc={lightbox.pictures[lightbox.index === 0 ? (lightbox.pictures.length - 1) : (lightbox.index - 1)]}
                                onCloseRequest={() => setLightbox((values) => ({...values, isOpen: !lightbox.isOpen}))}
                                onMoveNextRequest={() => setLightbox((values) => ({
                                    ...values,
                                    index: lightbox.index + 1 === lightbox.pictures.length ? 0 : (lightbox.index + 1)
                                }))}
                                onMovePrevRequest={() => setLightbox((values) => ({
                                    ...values,
                                    index: lightbox.index === 0 ? (lightbox.pictures.length - 1) : (lightbox.index - 1)
                                }))}
                            />
                        )}
                    </div>}
                </div>
                <div className="mb-3">
                    <div className={"divInputFile btn btn-borderless btn-sm shadow " + (attachments.uploading ? "disabled" : "")}>
                        <span><i className="fas fa-paperclip fa-fw"/> {attachments.uploading ? <i className="fas fa-spinner fa-pulse"></i> : t("attachment")}</span>
                        <input type="file" name="attachments" className="inputFile" multiple onChange={handleAttachmentsUpload} disabled={attachments.uploading} value=""/>
                    </div>
                    {model.attachments && <div id="divAttachments" className="panel-scroll my-1 p-3">
                        {model.attachments.split(",").map((attachment, index) =>
                            <p key={index}>
                                <i className="fas fa-minus-circle fa-lg text-danger me-2" onClick={() => handleAttachmentRemove(attachment)}/>
                                <a href={"/api/story/" + model.id + "/attachment/" + attachment} download>{attachment}</a>
                            </p>)}
                    </div>}
                </div>
                <div className="mt-4 mb-3">
                    <div className="form-check form-switch">
                        <input type="checkbox" name="published" className="form-check-input" checked={model.published} onChange={handleCheckbox} value=""/>
                        <label className="form-check-label" htmlFor="published">{t("public")}</label>
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
        </>
    );
};

export default Story;
