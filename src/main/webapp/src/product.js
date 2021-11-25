import React, {useEffect, useState} from "react";
import {useTranslation} from 'react-i18next';
import {useHistory, useParams} from "react-router-dom";
import axios from "axios";
import Auth from "./module/Auth";
import Lightbox from "react-image-lightbox";

const Product = (props) => {

    const {id} = useParams();
    const {t, i18n} = useTranslation('product', 'translation');
    const history = useHistory();

    const [values, setValues] = useState({
        loading: true,
        message: ''
    });

    const [model, setModel] = useState({
        id: '',
        name: '',
        code: '',
        price: '',
        description: '',
        pictures: '',
        attachments: '',
        sale: false
    });

    const [lightbox, setLightbox] = useState({
        pictures: [],
        isOpen: false,
        index: 1
    });

    useEffect(() => {
        if (id) {
            axios.get("/api/product/" + id, {headers: Auth.authHeader()})
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
            pictureArray.push("/api/product/" + model.id + "/picture/" + picture);
        })
        setLightbox((values) => ({...values, pictures: pictureArray}))
    }, [model.pictures]);

    const loadPictureThumbnail = (picture) => {
        let index = picture.lastIndexOf(".");
        let fileNameExt = picture.substring(index);
        let fileNameWithoutExt = picture.substring(0, index);
        return "/api/product/" + model.id + "/picture/" + fileNameWithoutExt + "_thumbnail" + fileNameExt;
    }

    return (
        <div className="container py-5">
            <h1 className="h3 mt-5 text-muted">{model.name}</h1>
            {model.code}
            {model.price}
            <div dangerouslySetInnerHTML={{__html: model.description}} />
            <div className="mb-3">
                {model.pictures && <div id="divPictures" className="panel-scroll my-1 p-1">
                    {model.pictures.split(",").map((picture, index) =>
                        <div className="col-4 col-sm-3 col-md-2 picture-wrapper" key={index}>
                            <img src={loadPictureThumbnail(picture)} onClick={() => setLightbox((values) => ({...values, isOpen: !lightbox.isOpen, index: index}))} alt="pictures"/>
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
                {model.attachments && <div id="divAttachments" className="panel-scroll my-1 p-3">
                    {model.attachments.split(",").map((attachment, index) =>
                        <p key={index}>
                            <a href={"/api/product/" + model.id + "/attachment/" + attachment} download>{attachment}</a>
                        </p>)}
                </div>}
            </div>
        </div>
    );
};

export default Product;
