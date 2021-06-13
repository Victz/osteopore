import i18n from "i18next";

class Utils {

    buildParams(params, key, value) {
        let index = params.lastIndexOf(key);
        if (index !== -1) {
            let paramName = params.substring(index + key.length);
            let next = paramName.indexOf("/");
            params = params.substring(0, index) + (next !== -1 ? paramName.substring(next) : "");
        }
        if (value.toString().trim().length > 0) {
            params += key + value.toString().trim();
        }
        return params;
    }

    buildSort(params, key, value) {
        let index = params.lastIndexOf(key);
        if (index !== -1) {
            let paramName = params.substring(index + key.length);
            let next = paramName.indexOf("/");
            params = params.substring(0, index) + (next !== -1 ? paramName.substring(next) : "");
        }
        if (value.toString().trim().length > 0) {
            params += key + "," + value.toString().trim();
        }
        return params;
    }

    localeHeader() {
        return {'Accept-Language': i18n.language || window.localStorage.i18nextLng};
    }
}

export default new Utils();