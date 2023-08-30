import { App } from "@/bigcommerce/pages";
import store from "@/core/vue/store";
import { RCAInterface } from "@/core/interfaces";
import version from "@config/version.json";
import { AppVue, initVueOptions } from "@/core/utils";

/* eslint-disable no-undef */
export const clientLocales =
    typeof RCA_LOCALES === "object" ? RCA_LOCALES : { lang: "en", locales: {} };
const pageSettings = typeof RCA_SETTINGS === "object" ? RCA_SETTINGS : {};
export const loggerEnabled = !["production"].includes(process.env.NODE_ENV);

window.RCAInterface = RCAInterface;
try {
    window.RCA_DATA = window.RCA_DATA || RCA_DATA;
} catch (e) {
    // pass
}

store.commit("version", version);

/* eslint-disable no-undef */
// Wait for RCA_DATA to be defined
let checkExist = setInterval(function () {
    if (window.RCA_DATA) {
        clearInterval(checkExist);
        try {
            window.RCA_store_objects = window.RCA_store_objects || RCA_store_objects;
        } catch (e) {
            window.RCA_store_objects = null;
        }
        initVueOptions({
            pageSettings,
            storeObjectsData: window.RCA_store_objects,
            storeData: window.RCA_DATA,
            useSentry: ["staging", "development"].includes(process.env.NODE_ENV),
            loggerEnabled,
            environment: process.env.NODE_ENV,
        });
        new AppVue({
            render: (h) => h(App),
        }).$mount();
    }
}, 20);

// Stop checking for RCA_DATA. It either loaded or clearly is not here.
setTimeout(clearInterval, 10000, checkExist);
