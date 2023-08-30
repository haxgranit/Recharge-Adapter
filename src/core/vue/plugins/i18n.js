import Vue from "vue";
import VueI18n from "vue-i18n";
import _ from "lodash";
import store from "@/core/vue/store";

Vue.use(VueI18n);

/**
 *
 */
export class LoadTranslations {
    defaultLocale = "en";
    fallbackLocale = "en";
    clientLocales = {};

    /**
     * @param {object} clientLocales - The RCA_LOCALES object.
     */
    constructor(clientLocales) {
        this.clientLocales = clientLocales || {};
        this.defaultLocale = clientLocales?.defaultLocale || this.defaultLocale;
        this.fallbackLocale = clientLocales?.fallbackLocale || this.fallbackLocale;
    }

    /**
     * @returns {object} Translation messages for the currently active locale.
     */
    get currentLocaleTranslations() {
        return _.get(this.clientLocales, `locales.${this.locale}`, {});
    }

    /**
     * @returns {object} Translation messages for all supported locales.
     */
    get allLocaleTranslations() {
        return this.clientLocales?.locales || {};
    }

    /**
     *@returns {object}
     */
    get defaultMessages() {
        const defaultLocales = require.context("@/locales", true, /[A-Za-z0-9-_,\s]+\.json$/i);
        const regex = /([A-Za-z0-9-_,\s]+)\.json$/i;
        const messages = {};
        defaultLocales.keys().forEach((key) => {
            const locale = key.match(regex)[1];
            if (locale) {
                messages[locale] = defaultLocales(key);
            }
        });
        return messages;
    }

    /**
     *@returns {object}
     */
    get locale() {
        return this.clientLocales?.lang || this.defaultLocale;
    }
}

const loadedTranslations = new LoadTranslations();

export const i18n = new VueI18n({
    locale: loadedTranslations.locale,
    fallbackLocale: loadedTranslations.fallbackLocale,
    messages: loadedTranslations.defaultMessages,
});

let subscribed = false;

/**
 * @param {LoadTranslations} translationsObj - A LoadTranslations object.
 * @returns {object} The Vue mixin object.
 */
export function i18nMixin(translationsObj) {
    return {
        // eslint-disable-next-line jsdoc/require-jsdoc
        beforeCreate() {
            const app = this;
            this.translations = {
                /**
                 *
                 */
                refresh() {
                    const translations = {};
                    Object.assign(translations, {
                        [translationsObj.defaultLocale]: app.settings.translations,
                    });
                    _.merge(translations, translationsObj.allLocaleTranslations);
                    _.forIn(translations, (messages, locale) => {
                        app.$i18n.mergeLocaleMessage(locale, messages);
                    });
                    app.$i18n.locale = translationsObj.locale;
                },
                /**
                 *
                 */
                storeSubscribe() {
                    if (!subscribed) {
                        app.$logger.debug("Translations plugin subscribed to settings.");
                        subscribed = true;
                        store.subscribe((mutation) => {
                            if (
                                mutation.type === "updateSettings" &&
                                mutation.payload.translations
                            ) {
                                app.$logger.debug("Translation values updated.");
                                this.refresh();
                            }
                        });
                    }
                },
            };
        },
        // eslint-disable-next-line jsdoc/require-jsdoc
        mounted() {
            this.translations.refresh();
            this.translations.storeSubscribe();
        },
    };
}
