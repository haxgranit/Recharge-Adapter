import { merge, pick } from "lodash";
import { defaultSettings } from "@/core/vue/plugins/settings/constants";

const state = {
    version: {},
    cartid: "",
    cartCurrency: "",
    selectionStatus: "", // of the adapter
    subdata: [], // subscription data for items in cart
    customerHash: "", // customer has for one click recharge login
    customerID: "", // id to get temporary token for one click recharge login
    appDisabledAt: 0,
    appDisabledTime: 60000, // milliseconds global app disable should last
    allCheckoutsOnRecharge: false,
    isStaging: false,
    settings: defaultSettings,
    initialAppLoadTimestamp: Date.now(),
    lastSettingsVersion: 0,
};

const getters = {
    cartID: (state) => {
        return state.cartid;
    },
    cartCurrency: (state) => {
        return state.cartCurrency;
    },
    subData: (state) => {
        return state.subdata;
    },
    // TODO this should be an action
    currentSubData: (state) => {
        return state.subdata.filter((item) => item.cartid === state.cartid);
    },
    customerHash: (state) => {
        return state.customerHash;
    },
    customerID: (state) => {
        return state.customerID;
    },
    appDisabledAt: (state) => {
        return state.appDisabledAt;
    },
    appDisabledTime: (state) => {
        return state.appDisabledTime;
    },
    allCheckoutsOnRecharge: (state) => {
        return state.allCheckoutsOnRecharge;
    },
    isStaging: (state) => {
        return state.isStaging;
    },
    subExists:
        (state) =>
        ({ cartid, line_item }) => {
            return state.subdata.some(
                (sub) => sub.cartid === cartid && sub.line_item === line_item
            );
        },
    settings: (state) => {
        return state.settings;
    },
    /**
     * @param {state} state The current state.
     * @returns {Date} The initial timestamp.
     */
    initialAppLoadTimestamp(state) {
        return state.initialAppLoadTimestamp;
    },
    /**
     * @param {state} state The current state.
     * @returns {number} The last version updated.
     */
    lastSettingsVersion(state) {
        return state.lastSettingsVersion;
    },
};

const mutations = {
    /**
     * @param {object} state  Store.
     * @param {object} payload Version data.
     */
    version(state, payload) {
        state.version = payload;
    },
    ADD_SUB_ITEM: (state, payload) => {
        //update cartid as soon as you have it
        if (payload.cartid) {
            state.cartid = payload.cartid;
        }

        //no duplicates in subdata
        let newSubData = state.subdata.filter((e) => e.line_item !== payload.line_item);
        newSubData.push(payload);

        //if any subdata is without cartid, update it.
        newSubData.forEach((e) => (e.cartid = payload.cartid));

        //replace current subdata with new subdata
        state.subdata = newSubData;
    },
    REMOVE_SUB_ITEM: (state, { line_id }) => {
        const newSubData = state.subdata.filter((e) => e.line_item !== line_id);
        state.subdata = newSubData;
    },
    /**
     *
     * @param {*} state The current subdata in vuex.
     * @param {*} payload The latest sub item details.
     */
    REPLACE_SUB_DATA: (state, payload) => {
        if (state?.cartid) {
            payload.cartid = state.cartid;
        }
        state.subdata = payload;
    },

    setAdapterBackendSettings: (state, { all_checkouts_on_recharge, is_rc_staging }) => {
        state.allCheckoutsOnRecharge = all_checkouts_on_recharge;
        state.isStaging = is_rc_staging;
    },
    setCartID: (state, payload) => {
        state.cartid = payload;
    },
    setCustomerHash: (state, payload) => {
        state.customerHash = payload;
    },
    setCustomerID: (state, payload) => {
        state.customerID = payload;
    },
    setAppDisabledAt: (state, payload) => {
        state.appDisabledAt = payload;
    },
    setCartCurrency: (state, payload) => {
        state.cartCurrency = payload;
    },
    setSettings: (state, payload) => {
        state.settings = payload;
    },
    updateSettings: (state, payload) => {
        state.settings = merge({}, state.settings, payload);
    },
    setLastSettingsVersion: (state, payload) => {
        state.lastSettingsVersion = payload;
    },
};

const actions = {
    /**
     * Set a global disable state on the application and reload the page.
     * @param {object} context The frontend object context.
     */
    setAppDisabled: (context) => {
        context.commit("setAppDisabledAt", Date.now());
    },
    /**
     * Check if the current time in milliseconds is greater than the disabled expiration (disabledat + disabledtime).
     * @param {object} context The context frontend instance.
     * @returns {Promise} The resolved promise.
     */
    isAppDisabled: (context) => {
        return new Promise((resolve) => {
            const disabled_at = context.getters.appDisabledAt;
            const disabled_for = context.getters.appDisabledTime;
            if (disabled_at && disabled_for) {
                resolve(disabled_at + disabled_for > Date.now());
            } else {
                resolve(false);
            }
        });
    },
    /**
     * Gets subscriptions for a cart or a specific subscription for a cart and line. If no cart is specified returns.
     * Subscriptions for current cart.
     * @param {object} root0 An object containing The following attributes.
     * @param {object} root0.getters The store's getters.
     * @param {object} root1 An object containing the following Attributes.
     * @param {number} root1.cart_id The Id of the cart.
     * @param {number} root1.line_id The id of a line item.
     * @returns {Array} List of subscriptions in vuex store format.
     */
    getSubscriptions: ({ getters }, { cart_id, line_id }) => {
        if (cart_id && line_id) {
            return getters.subData.filter(
                (item) => item.cartid === cart_id && item.line_item === line_id
            );
        } else if (line_id) {
            return getters.subData.filter((item) => item.cartid === state.cartid);
        }
        return getters.currentSubData;
    },
    /**
     * Adds a subscription to store.
     * @param {object} commit Vuex store commit object.
     * @param {object} commit.commit Vuex store.
     * @param {object} subscription Subscription data.
     * @returns {Promise} Returns once the subscription has been saved.
     */
    addSubItem: ({ commit }, subscription) => {
        const subscription_data = {
            cartid: null,
            line_item: null,
            shipping_unit: null,
            shipping_frequency: null,
            charge_frequency: null,
            discount_type: null,
            discount_amount: null,
            storefront_purchase_options: null,
            productID: null,
            properties: null,
        };
        merge(subscription_data, pick(subscription, Object.keys(subscription_data)));
        // Make shipping_frequency a whole number if present.
        if (subscription_data.shipping_frequency !== null) {
            const number_value = Number(subscription_data.shipping_frequency);
            subscription_data.shipping_frequency = isNaN(number_value)
                ? null
                : Math.floor(number_value);
        }
        return new Promise((resolve, reject) => {
            if (subscription_data.line_item) {
                commit("ADD_SUB_ITEM", subscription_data);
                resolve();
            } else {
                /*eslint-disable-next-line prefer-promise-reject-errors*/
                reject("Missing line_item or cartid.");
            }
        });
    },
    /**
     * Remove sub item from store state.
     *
     * @param {object} getters -  Vuex store getters object.
     * @param {object} getters.getters - Getters.
     * @param {string} getters.commit - Commit.
     * @param {string} commit - Commit action.
     * @returns {Promise}
     */
    removeSubItem: ({ getters, commit }, { line_id, cart_id }) => {
        return new Promise((resolve, reject) => {
            if (getters?.subExists({ line_item: line_id, cartid: cart_id })) {
                commit("REMOVE_SUB_ITEM", { line_id: line_id });
                resolve();
            } else {
                /*eslint-disable-next-line prefer-promise-reject-errors*/
                reject(`Subscription not found for cart:${cart_id}, line: ${line_id}`);
            }
        });
    },

    /**.
     * Update all cartids for all lineitems in the subdata
     *
     * @param {object} vuexMethods -  Vuex store getters object.
     * @param {object} vuexMethods.getters - Getters.
     * @param {string} vuexMethods.commit - Commit.
     * @param {string} cart_id - current cart id
     * @returns {Promise}
     */

    /* eslint-disable require-await */
    updateSubDataCartIds: async ({ getters, commit }, cart_id) => {
        const subData = getters?.subData;
        const newSubData = subData.map((e) => {
            if (!e.cartid) e.cartid = cart_id;
            return e;
        });
        commit("REPLACE_SUB_DATA", newSubData);
    },
    /**
     *
     * @param {*} obj Commit action.
     * @param {*} newSubData Latest sub data.
     * @returns {Promise}
     */
    replaceSubData: ({ commit }, newSubData) => {
        return new Promise((resolve, reject) => {
            if (newSubData.length > 0) {
                commit("REPLACE_SUB_DATA", newSubData);
                resolve();
            } else {
                // eslint-disable-next-line prefer-promise-reject-errors
                reject("There is no sub data to replace");
            }
        });
    },
    /**
     * Setting adapter backend Settings to store state.
     *
     * @param {object} commit - Vuex store commit object.
     * @param {string} commit.commit - Commit action.
     * @param {object} settings - Object settings.
     * @returns {object} Settings.
     */
    setAdapterBackendSettings: ({ commit }, settings) => {
        delete settings["store_id"];
        commit("setAdapterBackendSettings", settings);
        return settings;
    },
};

export default {
    namespaced: false,
    state,
    getters,
    mutations,
    actions,
};
