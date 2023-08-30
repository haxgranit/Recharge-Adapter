import Vue from "vue";

import store from "@/core/vue/store";
import { mapActions, mapGetters } from "vuex";

/**
 * Create a Vue instance to interact with application components.
 *
 * @param {Class} cls The frontend component class to extend.
 * @param {object} opts Options to provide the Vue constructor.
 * @returns {Vue} Vue instance to interact with.
 */
export function makeVM(cls, opts) {
    const vm = new (Vue.extend(cls))(opts);
    vm.$destroy();
    return vm;
}

/**
 * Create a Vue instance to interact with the vuex store.
 *
 * @param {object} methods  Methods to add to the instance for interacting with the store (getters, actions).
 * @param {object} methods.getters Vuex getters.
 * @param {object} methods.actions Vuex actions.
 * @returns {Vue}
 */
export function makeStoreVM({ getters, actions }) {
    return new Vue({
        store,
        computed: { ...mapGetters(getters) },
        methods: { ...mapActions(actions) },
        template: "<div></div>",
    });
}

/**
 * Convert a string to camel.
 * @param {string} str String to be converted.
 * @returns {string}
 */
export function snakeToCamel(str) {
    return str.replace(/([-_][a-z])/g, (group) =>
        group.toUpperCase().replace("-", "").replace("_", "")
    );
}

export const interfaceConfig = (property) => window.RCAInterface.config[property];

export default { makeVM, makeStoreVM, snakeToCamel, interfaceConfig };
