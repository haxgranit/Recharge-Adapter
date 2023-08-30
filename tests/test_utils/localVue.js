import { createLocalVue, mount } from "@vue/test-utils";
import { defaultStoreObjectsData, defaultStoreData } from "./mock_bigcommerce";
import store from "@/core/vue/store";
import Vuex from "vuex";
import { i18n, LoggerPlugin, SettingsPlugin } from "@/core/vue/plugins";
import { BigcommercePlugin, CustomClassesPlugin, HooksPlugin } from "@/bigcommerce/vue/plugins";
import { jQuery as $ } from "@/core";
import lodash from "lodash";
import axios from "axios";
import spyObject from "jest-spy-object";

/**
 * @param {object} jest Root object.
 * @param {object} jest.storeObjectsData BigCommerce RCA_store_object_data.
 * @param {object} jest.pageSettings BigCommerce RCA_settings.
 * @param {object} jest.storeData BigCommerce RCA_store_data.
 * @returns {object}
 * @property {Vue} localVue Vue-test-utils localVue object.
 * @property {object} mountingOptions Object used when mounting a Vue component with Vue-test-utils.
 */
export function getLocalVue({
    storeObjectsData = defaultStoreObjectsData,
    pageSettings = {},
    storeData = defaultStoreData,
} = {}) {
    const localVue = createLocalVue();
    const clientLocales = { lang: "en", locales: {} };
    localVue.use(Vuex);
    localVue.use(LoggerPlugin, {
        useSentry: false,
        useConsole: true,
    });
    localVue.use(CustomClassesPlugin);
    localVue.prototype.$ = $;
    localVue.prototype.$_ = lodash;
    localVue.prototype.$axios = axios;
    localVue.prototype.$store_data = storeData;
    localVue.use(SettingsPlugin, { store, clientLocales, pageSettings });
    localVue.use(BigcommercePlugin, {
        storeObjectsData: storeObjectsData,
    });
    localVue.use(HooksPlugin);
    localVue.directive("$t", () => {});
    return { localVue, mountingOptions: { localVue, store, i18n } };
}

const lifecycleHooks = [
    "beforeCreate",
    "created",
    "beforeMount",
    "mounted",
    "beforeUpdate",
    "updated",
    "activated",
    "deactivated",
    "beforeDestroy",
    "destroyed",
    "errorCapture",
];

/**.
 *
 *
 * @typedef {object} mountOptions
 * @property {boolean} attachToDocument Boolean.
 * @property {Element | string} attachTo .
 * @property {VNodeData} context .
 * @property {Vue} localVue .
 * @property {object | false} mocks .
 * @property {Component} parentComponent .
 * @property {Object<string, Array<(Component | string)> | Component | string>} slots .
 * @property {Record<string, string | Function>} scopedSlots .
 * @property {Object<string, (Component | string | boolean)> | false} stubs ,.
 * @property {Record<string, string>} attrs?: .
 * @property {Record<string, Function | Array<Function>>} listener: .
 */

/**
 * Calls `mount` from `vue-test-utils` and places a jest spy on all methods, lifecycle hooks, prototypes, and most VNode methods.
 * @param {Component} component The Vue component to mount.
 * @param {object} config Configuration for the function.
 * @param {mountOptions} config.options Options to pass into `mount`.
 * @param {object} config.mockMethods Key/value pairs where the key is a method and the value is a function to mock it with.
 * @param {object} config.storeOptions Options to pass into `getLocalVue`.
 * @property {object} storeObjectsData BigCommerce RCA_store_object_data.
 * @property {object} pageSettings BigCommerce RCA_settings.
 * @property {object} storeData BigCommerce RCA_store_data.
 * @returns {Wrapper}
 */
export function mountLocalVue(
    component,
    { options = {}, storeOptions = {}, mockMethods = {} } = {}
) {
    Object.keys(component?.methods)?.forEach?.((method) => jest.spyOn(component.methods, method));
    lifecycleHooks.forEach((hook) => component[hook] && jest.spyOn(component, hook));
    const { mountingOptions } = getLocalVue(storeOptions);
    const wrapper = mount(component, { ...mountingOptions, ...options });
    Object.keys(component?.methods)?.forEach?.((method) => jest.spyOn(wrapper.vm, method));
    spyObject(wrapper.vm.$logger);
    Object.entries(mockMethods).forEach(([method, func]) => {
        wrapper.vm[method]?.mockImplementation?.(func);
    });
    return wrapper;
}
