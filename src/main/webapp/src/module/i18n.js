import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import HttpApi from 'i18next-http-backend';
import LanguageDetector from "i18next-browser-languagedetector";

i18n.use(initReactI18next).use(HttpApi).use(LanguageDetector).init({
    supportedLngs: ['en', 'zh'],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false
    },
    // keySeparator: false, // we use content as keys
    debug: true
});

export default i18n;