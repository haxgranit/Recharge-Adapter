import Vue from "vue";
import store from "@/core/vue/store";
import { i18n, LoggerPlugin, SettingsPlugin } from "@/core/vue/plugins";
import VueResource from "vue-resource";
import { CustomClassesPlugin, BigcommercePlugin, HooksPlugin } from "@/bigcommerce/vue/plugins";
import PortalVue from "portal-vue";
import { jQuery as $ } from "@/core";
import lodash from "lodash";
import axios from "axios";
import { clientLocales } from "@/bigcommerce/main";

/**
 * @type {Vue} The Vue class with Vuex and I18n already set.
 */
export const AppVue = Vue.extend({
    store,
    i18n,
});

/**
 * Initializes Vue with configs, plugins, prototypes, etc.
 * This is used for main.js and also interfaces.
 * @param {object} root0 - The root object.
 * @param {object} root0.pageSettings - The RCA_SETTINGS object for the page.
 * @param {object} root0.storeObjectsData - The RCA_store_objects object.
 * @param {object} root0.storeData - The RCA_DATA for the store.
 * @param {boolean} root0.useSentry - Indicator if Sentry reporting should be used.
 * @param {boolean} root0.loggerEnabled - Indicator is logging should be used.
 * @param {'development'|'staging'|'production'} root0.environment - The current application
 * environment.
 * @param root0.vue
 */
export function initVueOptions({
    pageSettings,
    storeObjectsData,
    storeData,
    useSentry = false,
    loggerEnabled = true,
    environment = "development",
    vue = Vue,
}) {
    vue.config.productionTip = environment !== "production";
    vue.config.performance = environment !== "production";

    vue.use(LoggerPlugin, {
        useSentry: useSentry,
        useConsole: loggerEnabled,
    });

    vue.use(VueResource);
    vue.use(CustomClassesPlugin);

    vue.use(PortalVue);
    vue.prototype.$ = $;
    vue.prototype.$_ = lodash;
    vue.prototype.$axios = axios;
    vue.prototype.$store_data = storeData;
    vue.use(SettingsPlugin, { store, clientLocales, pageSettings });
    vue.use(BigcommercePlugin, {
        storeObjectsData: storeObjectsData,
    });
    vue.use(HooksPlugin);
}
