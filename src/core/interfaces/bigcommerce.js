import { BigcommerceCart, BigcommerceCustomer } from "@/bigcommerce/utils/bigcommerce-helper";
import subscription from "./subscription";
import { buildRequest } from "@/core/utils/url-helper";
import { interfaceConfig, makeVM } from "./interface_utils";
import RechargeCheckoutForm from "@/core/vue/components/RechargeCheckoutForm";
import { snakeToCamel } from "./camel_snake_keys";
import { mapValues } from "lodash";

/**
 * @param {object} cart_data - The Wordpress cart data.
 *
 * @returns {object}
 */
function convertWordpressCart(cart_data) {
    if (cart_data.data) {
        cart_data = cart_data.data;
    }
    let newCart = { id: null, ...snakeToCamel(cart_data) };
    newCart.lineItems = mapValues(newCart.lineItems, (value) => {
        value.forEach((item) => {
            item.isShippingRequired = item.isRequireShipping;
            item.isTaxable = item.taxable;
            delete item.isRequireShipping;
            delete item.taxable;
            return item;
        });
        return value;
    });
    return newCart;
}

/**
 * @returns {object}
 */
function getWordpressCurrentCart() {
    return fetch(
        // eslint-disable-next-line no-undef
        `/wp-json/bc/v3/carts/${bigcommerce_config.cart.getCartID()}?include=line_items.physical_items.options,line_items.digital_items.options&_=${new Date().getTime()}`,
        { cache: "no-store" }
    )
        .then((response) => {
            return response.json().then((cartData) => {
                return convertWordpressCart(cartData.data);
            });
        })
        .catch((e) => {
            console.warn(e);
        });
}

const rca_data = () => (typeof RCA_DATA !== "undefined" ? RCA_DATA : window.RCA_DATA);

/**
 *
 */
class BigcommerceCartInterface extends BigcommerceCart {
    /**
     * @param {object} root0 - Root0.
     * @param {string} root0.storeURL - StoreURL.
     * @param {string} root0.rechargeDomain - RechargeDomain.
     * @param {string} root0.checkoutUrl - CheckoutUrl.
     */
    constructor({ storeURL, rechargeDomain, checkoutUrl }) {
        super({
            subscriptionDataGetter: subscription.currentSubscriptionData,
            rcaProductData: rca_data().RCA_PRODUCT_DATA,
            domain: rechargeDomain,
            subscriptionCheckoutURL: checkoutUrl,
            storeURL,
        });
        this.client.setInterceptorsGlobally();
        this.wordpressConfig = window.bigcommerce_config || {};
        this._wordpressClient = new buildRequest({ baseURL: window.origin });
    }

    /**
     * Helper function to refresh object cart data.
     * @param {boolean} force - Forde a reload of cart data.
     */
    async refreshCart(force) {
        if (!force && this.cartId) {
            return;
        }
        const wordpressCartData = await this.fromWordpress();
        if (!wordpressCartData) {
            await this.getCheckoutData();
        }
    }

    /**
     * @returns {string} - CardId.
     */
    get cartId() {
        return window.bigcommerce_config?.cart?.getCartID() || this._cartId;
    }

    /**
     *
     */
    set cartId(value) {
        this._cartId = value;
    }

    /**
     * @returns {object} Cart.
     */
    async fromWordpress() {
        try {
            const request = this._wordpressClient.request({
                url: `/wp-json/bc/v3/carts/${this.cartId}`,
                params: {
                    include: "line_items.physical_items.options,line_items.digital_items.options",
                    _: new Date().getTime(),
                },
            });

            const response = await request.send();
            const cart = snakeToCamel(response.data);

            cart.lineItems = mapValues(cart.lineItems, (value) => {
                value.forEach((item) => {
                    item.isShippingRequired = item.isRequireShipping;
                    item.isTaxable = item.taxable;
                    delete item.isRequireShipping, delete item.taxable;
                    return item;
                });
                return value;
            });
            this.checkoutData = { cart };
            return cart;
        } catch (e) {
            this.$logger.warn(`Failed to get cart dara from Wordpress client | ${e}`);
            return null;
        }
    }

    /**
     * @param {object} bigcommerceCart - BigcommerceCart.
     * @param {boolean} forceRechargeCheckout - ForceRechargeCheckout.
     */
    async submitCheckout(bigcommerceCart, forceRechargeCheckout = false) {
        if (bigcommerceCart) {
            this.checkoutData = { cart: bigcommerceCart };
        }
        if (this.hasSubscription || forceRechargeCheckout) {
            const cart = await this.getRechargeCheckout();
            const client = makeVM(RechargeCheckoutForm, {
                propsData: {
                    url: this.recharge.checkout.url,
                    cart_token: this.cartId,
                    cart,
                },
            });
            client.$mount();

            document.body.appendChild(client.$el);
            client.submit();
            client.$destroy();
        } else {
            this._submitBigcommerceCheckout();
        }
    }

    /**
     * @param {boolean} forceRechargeCheckout - ForceRechargeCheckout.
     * @returns {object}
     */
    async submitWordpressCheckout(forceRechargeCheckout = false) {
        if (!this.checkoutData) {
            let wpCart = await this.fromWordpress();
            return await this.submitCheckout(wpCart, forceRechargeCheckout);
        }
        return await this.submitCheckout(undefined, forceRechargeCheckout);
    }

    /**
     *
     */
    _submitBigcommerceCheckout() {
        window.location.assign(`/bigcommerce/checkout/${this.cartId}`);
    }

    /**
     * @param {number|string} productId - The BigCommerce Product ID.
     * @returns {object} RCA_PRODUCT_DATA for the target product.
     */
    findProductInRcaData(productId) {
        // eslint-disable-next-line eqeqeq
        return this.rcaProductData.find((item) => item.id == productId) || {};
    }

    /**
     * @param {number|string} productId - The BigCommerce Product ID.
     * @returns {object} Subscription data from RCA_PRODUCT_DATA for the target product.
     */
    getProductSubscriptionData(productId) {
        return this.findProductInRcaData(productId)?.subscriptions[0] || {};
    }

    /**
     * Adds a subscription to Vuex for the target Line Item with the selected frequency.
     * @param {object} lineItem - The Line Item from the BigCommerce Cart.
     * @param {number} selectedFrequency - The subscription frequency to use.
     * @param {boolean} refreshCart - Indicator to get new cart data or not.
     *
     * @returns {boolean} True if added/updated successfully.
     */
    async _addSubscriptionByLineItem(lineItem, selectedFrequency, refreshCart = true) {
        await this.refreshCart(refreshCart);

        const { productId, variantId, id, rcaData } = lineItem || {};
        if (!productId) {
            this.$logger.error(`Line Item could not be found in the cart.`);
            this.$logger.debug("Current Checkout Data", this.checkoutData);
            return false;
        }

        if (!(typeof selectedFrequency === "number" && selectedFrequency >= 0)) {
            this.$logger.error("A selectedFrequency is required to add a subscription.");
            this.$logger.debug("Current Checkout Data", this.checkoutData);
            return false;
        }

        if (
            !rcaData?.subscriptions?.find(({ order_interval_frequency_options: frequencies }) =>
                frequencies?.find((frequency) => frequency === String(selectedFrequency))
            )
        ) {
            this.$logger.error(
                `Selected Frequency ${selectedFrequency} could not be found in Line Item ${id}.`
            );
            this.$logger.debug("Current Checkout Data", this.checkoutData);
            return false;
        }

        const productSubData = this.getProductSubscriptionData(productId);
        await subscription.addProductToSubscriptions(
            productId,
            variantId,
            this.cartData,
            productSubData,
            true,
            selectedFrequency
        );
        this.$logger.debug(`Line Item ${id} saved as subscription.`);
        return true;
    }

    /**
     * Adds a subscription to Vuex for the target Line Item ID with the selected frequency.
     * @param {string} lineItemId - The Line Item ID from the BigCommerce Cart.
     * @param {number} selectedFrequency - The subscription frequency to use.
     * @param {boolean} refreshCart - Indicator to get new cart data or not.
     *
     * @returns {boolean} True if added/updated successfully.
     */
    async addSubscriptionByLineItemId(lineItemId, selectedFrequency, refreshCart = true) {
        await this.refreshCart(refreshCart);
        // eslint-disable-next-line no-return-await
        return await this._addSubscriptionByLineItem(
            this.allLineItems.find((item) => item.id === lineItemId),
            selectedFrequency,
            false
        );
    }

    /**
     * Adds a subscription to Vuex for the target Product/Variant combo with the selected frequency.
     * This selects the newest line if multiple are present with the same products.
     * @param {number} productId - The BigCommerce Product ID.
     * @param {number} variantId - The BigCommerce Variant ID.
     * @param {number} selectedFrequency - The subscription frequency to use.
     * @param {boolean} refreshCart - Indicator to get new cart data or not.
     *
     * @returns {boolean} True if added/updated successfully.
     */
    async addSubscriptionByProduct(productId, variantId, selectedFrequency, refreshCart = true) {
        await this.refreshCart(refreshCart);

        const lineItems = this.allLineItems;

        // iterate backwards to find the most recent matching item
        for (let i = lineItems.length - 1; i >= 0; i--) {
            const lineItem = lineItems[i];
            if (lineItem?.productId === productId && lineItem?.variantId === variantId) {
                // eslint-disable-next-line no-return-await
                return await this._addSubscriptionByLineItem(lineItem, selectedFrequency, false);
            }
        }
        this.$logger.error(
            `Product id ${productId} with variant id ${variantId} could not be found.`
        );
        this.$logger.debug("Current Checkout Data", this.checkoutData);
        return false;
    }
}

/* eslint-disable */
export default {
    convertWordpressCart: convertWordpressCart,
    getWordpressCurrentCart: getWordpressCurrentCart,
    customer: new BigcommerceCustomer({}),
    get cart() {
        const defaultBigcommerceUrl = window.bigcommerce_config?.store_domain
            ? `https://${window.bigcommerce_config?.store_domain}`
            : window.origin;
        return new BigcommerceCartInterface({
            storeURL: interfaceConfig("bigcommerceOrigin") || defaultBigcommerceUrl,
            rechargeDomain: interfaceConfig("rechargeDomain"),
            checkoutUrl: interfaceConfig("checkoutUrl"),
        });
    },
};
