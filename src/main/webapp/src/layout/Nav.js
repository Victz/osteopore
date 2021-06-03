import './nav.css';
import React, {useEffect, useState} from 'react';
import {Link, NavLink, useHistory, useLocation} from 'react-router-dom';
import Auth from "../module/Auth";
import {useTranslation} from "react-i18next";

const Nav = (props) => {

    const {t, i18n} = useTranslation();
    const location = useLocation();
    const history = useHistory();
    const [values, setValues] = useState({
        user: undefined,
        query: ""
    });

    useEffect(() => {
        setValues((values) => ({
            ...values, user: Auth.getCurrentUser()
        }));
        initMenu();
    }, [values.user])

    const logout = () => {
        setValues((values) => ({
            ...values, user: undefined
        }));
        Auth.logout();
        history.push('/login');
        // window.location.reload();
    }

    const initMenu = () => {

        let docElem = window.document.documentElement;
        let transEndEventName = transitionEndEventName();
        let docscroll = 0;
        // click event (if mobile use touchstart)
        let clickevent = mobilecheck() ? 'touchstart' : 'click';

        let showMenu = document.getElementById('showMenu');
        let perspective = document.getElementById('perspective');
        let perspectiveWrapper = perspective.querySelector('.perspective-wrapper');
        let perspectiveContainer = perspectiveWrapper.querySelector('.perspective-container');

        showMenu.addEventListener(clickevent, function (ev) {
            ev.stopPropagation();
            ev.preventDefault();
            docscroll = window.pageYOffset || docElem.scrollTop;
            // change top of contentWrapper
            perspectiveContainer.style.top = docscroll * -1 + 'px';
            // mac chrome issue:
            document.body.scrollTop = document.documentElement.scrollTop = 0;
            // add modalview class
            perspective.classList.add('modalview');

            // animate..
            setTimeout(function () {
                perspective.classList.add('animate');
            }, 25);
        });

        perspective.addEventListener(clickevent, function (ev) {
            return false;
        });

        perspectiveWrapper.addEventListener(clickevent, function (ev) {
            if (perspective.classList.contains('animate')) {
                let onEndTransFn = function (ev) {
                    if ((ev.target.className !== 'perspective-wrapper' || ev.propertyName.indexOf('transform') === -1))
                        return;
                    this.removeEventListener(transEndEventName, onEndTransFn);
                    perspective.classList.remove('modalview');

                    // mac chrome issue:
                    document.body.scrollTop = document.documentElement.scrollTop = docscroll;
                    // change top of contentWrapper
                    perspectiveContainer.style.top = '0px';
                };
                perspective.addEventListener(transEndEventName, onEndTransFn);
                perspective.classList.remove('animate');
            }
        });
    };

    const mobilecheck = () => {
        var check = false;
        (function (a) {
            if (/(android|ipad|playbook|silk|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
                check = true
        })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    };

    const transitionEndEventName = () => {
        var i,
            undefined,
            el = document.createElement('div'),
            transitions = {
                'transition': 'transitionend',
                'OTransition': 'otransitionend',  // oTransitionEnd in very old Opera
                'MozTransition': 'transitionend',
                'WebkitTransition': 'webkitTransitionEnd'
            };

        for (i in transitions) {
            if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
                return transitions[i];
            }
        }
        //TODO: throw 'TransitionEnd event is not supported in this browser';
    }

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
            <nav className="navbar px-3">
                <span id="showMenu" className="d-block d-sm-none"><span></span></span>
                <Link className="navbar-brand me-auto" to="/">Osteopore</Link>
                <div className="nav-center">
                    <div className="nav-search d-none d-sm-block">
                        <span className="icon"><i className="fas fa-search"></i></span>
                        <input type="search" name="query" value={values.query} onChange={handleChange} placeholder={t("nav.search")}/>
                    </div>
                </div>
                <button type="button" id="btnSearch" className="btn btn-borderless d-inline-block d-sm-none">
                    <i className="fas fa-search fa-lg fa-fw"></i>
                </button>
                {values.user ? (
                    <div className="dropdown">
                        <button type="button" className="btn btn-borderless dropdown-toggle"
                                data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i className="far fa-user-circle fa-lg fa-fw"></i>
                            <span className="d-none d-sm-inline-block">{values.user.name}</span> <span className="caret"></span>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                            <li><Link className="dropdown-item" to="/home"><i className="far fa-user-circle fa-lg fa-fw"></i> {t("nav.account")}</Link></li>
                            {values.user.roles.includes("ROLE_ADMIN") ?
                                <li><Link className="dropdown-item" to="/admin"><i className="fas fa-tachometer-alt fa-lg fa-fw"></i> {t("nav.admin")}</Link></li> : ''}
                            <li>
                                <hr className="dropdown-divider"/>
                            </li>
                            <li><Link className="dropdown-item" to="#" onClick={logout}><i className="fas fa-sign-out-alt fa-lg fa-fw"></i> {t("nav.signout")}</Link></li>
                        </ul>
                    </div>
                ) : (
                    <Link className="btn btn-outline-secondary ml-auto" to="/login">{t("nav.signin")}</Link>
                )}
            </nav>
            <nav className="nav nav-underline nav-fill nav-justified shadow-sm">
                <Link className={"nav-item nav-link" + (location.pathname === "/" || location.pathname === "/index" ? " active" : "")} to="/">{t("nav.home")}</Link>
                <NavLink className="nav-item nav-link" activeClassName="active" to="/product">{t("nav.product")}</NavLink>
                <NavLink className="nav-item nav-link" activeClassName="active" to="/story">{t("nav.story")}</NavLink>
                <NavLink className="nav-item nav-link" activeClassName="active" to="/contact">{t("nav.contactus")}</NavLink>
            </nav>
            <nav className="nav nav-search-wrapper shadow-sm d-none">
                <div className="nav-search">
                    <span className="icon"><i className="fas fa-search" aria-hidden="true"></i></span>
                    <input type="search" placeholder={t("nav.search")}/>
                    <button type="button" className="close" aria-hidden="true">×</button>
                </div>
            </nav>
        </>
    );
};

export default Nav;