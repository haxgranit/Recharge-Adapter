// import CryptoES from "crypto-es";
import CryptoJS from "crypto-js";

/**
 * @type {object} settings - Settings for this module.
 * @property {number} customerTTL - The number of minutes to keep a customer record before it expires.
 */
const settings = {
    customerTTL: 30, // minutes
    tokenTTL: 6, // hours
    encrypt: (customerData, key) => {
        try {
            const data = JSON.stringify(customerData);
            return CryptoJS.AES.encrypt(data, key).toString();
        } catch (e) {
            console.error(`Failed to encrypt the key - ${key}: ${e}`);
            return null;
        }
    },
    decrypt: (encryptedData, key) => {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, key);
            const data = bytes.toString(CryptoJS.enc.Utf8);
            if (data) {
                return JSON.parse(data);
            }
            return null;
        } catch (e) {
            console.error(`Failed to decrypt the key - ${key}: ${e}`);
            return null;
        }
    },
};

/**
 * --- State ---
 * -------------
 * https://vuex.vuejs.org/guide/state.html#single-state-tree
 * Vuex uses a single state tree - that is, this single object contains all your application level
 * state and serves as the "single source of truth." This also means usually you will have only one
 * store for each application.
 *
 * @typedef {object} savedCustomer
 * @property {string|number} id - The Platform Customer ID.
 * @property {string} email - The customer's email address.
 * @property {string} token - The ReCharge customer portal token.
 * @property {string} rechargeCustomerId - The ReCharge customer id.
 * @property {string} rechargeCustomerHash - The ReCharge customer hash.
 * @property {number} expiration - Unix time when records expires.
 * @property {number} tokenExpiration - Unix time when the token expires.
 * @property {string} portalUrl - The Recharge customer portal URL.
 */
const state = {
    customers: "",
};

/**
 * --- Getters ---
 * ---------------.
 * @example // begin
 https://vuex.vuejs.org/guide/getters.html#property-style-access
 Vuex allows us to define "getters" in the store. You can think of them as computed properties
 for stores. Like computed properties, a getter's result is cached based on its dependencies, and
 will only re-evaluate when some of its dependencies have changed.
 
 You can also pass arguments to getters by returning a function. This is particularly useful when
 you want to query an array in the store. For example,.
 
  ```.
     getters: {
        getTodoById: (state) => (id) => {
          return state.todos.find(todo => todo.id === id)
        },
       doneTodos: state => {
         return state.todos.filter(todo => todo.done)
       }
     }
  ```.
 // end
 */
const getters = {
    listCustomers: (state) => (key) => {
        return settings.decrypt(state.customers, key) || [];
    },
    getCustomer:
        (state, getters) =>
        ({ id = null, email = null, key }) => {
            const customers = getters.listCustomers(key);
            return customers.find((customer) => {
                return (
                    (customer.id && customer.id === id) ||
                    (customer.email && customer.email === email)
                );
            });
        },
};

/**
 * --- Mutations ---
 * -----------------.
 * @example // begin
 https://vuex.vuejs.org/guide/mutations.html
 The only way to actually change state in a Vuex store is by committing a mutation. You cannot
 directly call a mutation handler (which must be synchronous). To invoke a mutation handler, you
 need to call `store.commit` with its function name.
 
 Example:
 ```.
 increment (state, payload) {
    state.count += payload.amount
  }
  store.commit('increment', {
    amount: 10
  })
 ```.
 // end
 */
const mutations = {
    /**
     * @param {object} state State.
     * @param {object} obj Object.
     * @param {savedCustomer} obj.customerData Customer Data.
     * @param {string} obj.key Key.
     */
    removeCustomer(state, { customerData, key }) {
        const customers = settings.decrypt(state.customers, key);
        const index = customers.indexOf(customerData);
        if (index > -1) {
            customers.splice(index, 1);
            const data = settings.encrypt(customers, key);
            state.customers.push(data);
        }
    },
    /**
     * @param {object} state State.
     * @param {object} obj Object.
     * @param {savedCustomer} obj.customerData Customer Data.
     * @param {string} obj.key Key.
     */
    upsertCustomer(state, { customerData, key }) {
        const customers = settings.decrypt(state.customers, key) || [];
        const index = customers.findIndex((customer) => customer.id === customerData.id);
        if (index > -1) {
            customers[index] = customerData;
        } else {
            customers.push(customerData);
        }
        const data = settings.encrypt(customers, key);
        state.customers = data;
    },
    /**
     * @param {object} state State.
     * @param {object} root0 Object.
     * @param {object} root0.customers Customer.
     * @param {string} root0.key Key.
     */
    saveCustomerList(state, { customers, key }) {
        const data = settings.encrypt(customers, key);
        state.customers = data;
    },
};

/**
 * --- Actions ---
 * ---------------
 * https://vuex.vuejs.org/guide/actions.html#dispatching-actions
 * Actions are similar to mutations, the differences being that:
 * - Instead of mutating the state, actions commit mutations.
 * - Actions can contain arbitrary asynchronous operations.
 *
 * Actions are triggered with the `store.dispatch` with its function name.
 */
const actions = {
    /**
     * @param {object} root0 Object.
     * @param {*} root0.commit Commit.
     * @param {object} obj Object.
     * @param {savedCustomer} obj.customerData Customer Data.
     * @param {string} obj.key Key.
     */
    saveCustomer({ commit }, { customerData, key }) {
        commit("upsertCustomer", { customerData, key });
    },
    /**
     * @param {object} root0 Object.
     * @param {*} root0.commit Commit.
     * @param {object} root0.getters Getters.
     * @param {object} obj Object.
     * @param {string} obj.key Key.
     * @param {string} obj.customerId Customer Id.
     */
    removeCustomer({ commit, getters }, { customerId, key }) {
        const customers = getters.listCustomers(key);
        const newCustomerList = [];
        for (const customer of customers) {
            if (customer.id !== customerId) {
                newCustomerList.push(customer);
            }
        }
        commit("saveCustomerList", { customers: newCustomerList, key });
    },
    /**
     * @param {object} root0 Object.
     * @param {*} root0.commit Commit.
     * @param {object} root0.getters Getters.
     * @param {object} obj Object.
     * @param {string} obj.key Key.
     */
    clearExpiredCustomers({ commit, getters }, { key }) {
        const customers = getters.listCustomers(key);
        const newCustomerList = [];
        for (const customer of customers) {
            if (customer.expiration > Date.now()) {
                newCustomerList.push(customer);
            }
        }
        commit("saveCustomerList", { customers: newCustomerList, key });
    },
    /**
     * @param {object} root0 Object.
     * @param {object} root0.getters Getters.
     * @param {object} root1 Object.
     * @param {string} root1.key Key.
     * @param {string} root1.id Id.
     * @param {string} root1.email Email.
     * @returns {object}
     */
    getCustomer({ getters }, { id, email, key }) {
        return getters.getCustomer({ id, email, key });
    },
    /**
     * @param {object} root0 Object.
     * @param {object} root0.getters Getters.
     * @param {object} root1 Object.
     * @param {string} root1.key Key.
     * @returns {object}
     */
    listCustomers({ getters }, { key }) {
        return getters.listCustomers(key);
    },
};

export default {
    // https://vuex.vuejs.org/guide/modules.html#namespacing
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
