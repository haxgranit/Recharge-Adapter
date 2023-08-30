import { i18nMixin, LoadTranslations } from "@/core/vue/plugins";
import { LoadSettings } from "./loader";
import { mapGetters } from "vuex";
import { requestMixin } from "@/core/utils";

export default {
    /**
     * Initializing the plugin.
     * @param {object} Vue - Vue instance.
     * @param {object} options - Options passed by the user, this time it'll refer to the vuex store.
     * @param {object} options.store The vuex store.
     * @param {object} options.pageSettings - The local settings of the store.
     * @param {object} options.clientLocales - The RCA_LOCALES object.
     */
    install: function (Vue, { store, pageSettings, clientLocales }) {
        const translationsObj = new LoadTranslations(clientLocales);
        const settingsObj = new LoadSettings({ pageSettings, translations: translationsObj });

        Vue.mixin({
            mixins: [requestMixin, i18nMixin(translationsObj)],
            computed: {
                ...mapGetters(["settings"]),
            },
            // eslint-disable-next-line jsdoc/require-jsdoc
            beforeCreate() {
                const app = this;
                Object.defineProperties(settingsObj, {
                    storeDomain: { get: () => app.$store_data.getStoreDomain() },
                    storeHash: { get: () => app.$store_data.getStoreHash() },
                });
                this.settingsLoader = settingsObj;
            },
            /**
             * Steps to take when plugin is created.
             */
            created() {
                const localSettings = settingsObj.getLocalAdapterSettings();
                store.commit("updateSettings", localSettings);
            },
        });
    },
};
