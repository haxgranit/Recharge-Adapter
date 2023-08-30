/**
 * @module This module contains helper functions and classes related to interacting with the
 * Recharge Adapter backend.
 */

import { buildRequest, requestMixin } from "./url-helper";
import { Logger } from "@/core/vue/plugins/logger";
import _ from "lodash";

/**
 *
 */
export class AdapterBackendHelper {
    /**
     * @param {boolean} loggerEnabled - Indicator if the class logger should be used.
     */
    constructor(loggerEnabled = true) {
        this.logger = new Logger("AdapterBackendHelper", { enabled: loggerEnabled });
        this.client = new buildRequest(
            {
                baseURL: process.env.BIGCOMMERCE_APP_URL,
                timeout: 0,
            },
            this.logger
        );
    }

    /**
     * @param {string} store_hash - The Store Hash for the merchant.
     * @param {object} params - Query parameters to use in the request.
     * @returns {object} - Store data from the adapter database.
     */
    async getStoreInfo(store_hash, params = {}) {
        const request = this.client.request({
            url: "/stores/query",
            params: { store_hash: store_hash, ...params },
            timeout: 10000,
        });
        const data = await request.send();
        if (typeof data !== "object" || _.isEmpty(data)) {
            this.logger.error(`Adapter Store Info returned bad data: ${data}`);
            return {};
        }
        return data;
    }

    /**
     * @param {object} root0 - The root object.
     * @param {string} root0.store_hash - The Store Hash for the merchant.
     * @param {string} [root0.customer_hash] - The Adapter Customer Hash for the customer.
     * @param {string} [root0.email] - The email address for the customer.
     * @param {string|number} [root0.platform_id] - The Platform ID for the customer
     * (ie BigCommerce Customer ID).
     * @param {string|number} [root0.recharge_id] - The ReCharge Customer ID.
     * @param {string} [root0.recharge_hash] - The ReCharge Customer Hash for the customer.
     * @returns {object} The customer data from the adapter database.
     */
    async searchCustomer({
        store_hash,
        customer_hash,
        email,
        platform_id,
        recharge_id,
        recharge_hash,
    }) {
        const request = this.client.request({
            url: "/customers/search",
            params: { store_hash, customer_hash, email, platform_id, recharge_id, recharge_hash },
        });
        try {
            return await request.send();
        } catch (e) {
            this.logger.error(`Error searching for customer.\n${e}`);
            return null;
        }
    }

    /**
     * @typedef {object} adapterCustomer
     * @property {string} created_at - When the customer record was created.
     * @property {string} customer_hash - The BigCommerce customer hash.
     * @property {string} email - The customer's email address.
     * @property {string} name - The customer's name.
     * @property {string} platform - The eCommerce platform of this record.
     * @property {string} platform_id - The customer's id for the eCommerce platform.
     * @property {string} rc_hash - The customer's hash on ReCharge.
     * @property {string} rc_id - The customer's ID on ReCharge.
     * @property {string} store_hash - The hash of the store for this record.
     * @property {string} store_id - The platform ID for the store of this record.
     */

    /**
     * @param {string} token - The JWT for the customer.
     * @returns {adapterCustomer|null}
     */
    async getAdapterCustomer(token) {
        const request = this.client.request({
            url: "/bigcommerce/customer",
            params: { token: token },
        });
        try {
            return await request.send();
        } catch (e) {
            this.logger.debug(e);
            return null;
        }
    }

    /**
     * @param {string|number} rechargeCustomerId - The customer's ID on ReCharge.
     * @param {string} store_hash - The hash of the store for this record.
     * @returns {string|null} The ReCharge token allowing the customer to access their ReCharge
     * Portal.
     */
    async getRechargePortalToken(rechargeCustomerId, store_hash) {
        const request = this.client.request({
            url: `/recharge/customers/${rechargeCustomerId}/portal_url`,
            params: { store_hash: store_hash },
        });
        try {
            const data = await request.send();
            return data.temp_token;
        } catch (e) {
            this.logger.debug(e);
            return null;
        }
    }

    /**
     * @param {string|number} rechargeCustomerId - The customer's ID on ReCharge.
     * @param {string} store_hash - The hash of the store for this record.
     * @returns {object} The ReCharge Portal data.
     */
    async getRechargePortalData(rechargeCustomerId, store_hash) {
        const request = this.client.request({
            url: `/recharge/customers/${rechargeCustomerId}/portal_url`,
            params: { store_hash: store_hash },
        });
        try {
            return await request.send();
        } catch (e) {
            this.logger.debug(e);
            return null;
        }
    }

    /**
     * Get promotions url for checkout.
     * @param {string} storeHash Store hash.
     * @param {string} cartID Cart id.
     * @returns {Promise<any|null>}
     */
    async getPromotionsCheckoutURL(storeHash, cartID) {
        const request = this.client.request({
            url: `/bigcommerce/promotions/${storeHash}/${cartID}`,
        });
        try {
            return await request.send();
        } catch (e) {
            this.logger.debug(e);
            return null;
        }
    }
}

/**
 * Vue Mixin object for this module.
 *
 * @mixin
 */
export const adapterBackendMixin = {
    mixins: [requestMixin],
    // eslint-disable-next-line jsdoc/require-jsdoc
    data() {
        return {
            adapterBackend: new AdapterBackendHelper(this.$logger.enabled),
        };
    },
};
