/**
 * @module This module is used for any helper functions or classes related to interacting with the
 * BigCommerce storefront.
 */

import { buildRequest, AdapterBackendHelper, recharge, CartHelper } from "@/core/utils";
import { PricingHelper, Currency } from "@/core/vue/mixins";
import { Logger } from "@/core/vue/plugins/logger";
import { isEmpty } from "lodash";

/**
 * @type {string} Default store host name.
 */
const _windowOrigin = window.location.origin;

/**
 * @type {Function} Default empty handler.
 */
const _nullHandler = () => [];

/**
 * @name subscriptionDataGetter
 * @function
 * @summary This type of function should get subscription data from storage and return it.
 * @returns {Array} An Array of subscription data from Vuex storage.
 */

/**
 * @class
 * @classdesc A class for interacting with the BigCommerce cart.
 */
export class BigcommerceCart {
    $logger = new Logger("BigcommerceCart");

    /**
     * @class
     * @param {object} [obj] - Anonymous object for constructing the object.
     * @param {string|null} [obj.storeURL] - The full url of the store without a path.
     * @param {subscriptionDataGetter} [obj.subscriptionDataGetter] - The function to call when.
     * @param {object} obj.rcaProductData Data of products.
     * @param {string} obj.domain Domain of the store.
     * @param {string} obj.cart_token Cart token.
     * @param {string} obj.subscriptionCheckoutURL URL for the checkout.
     * @param {string} obj.weightUnits Weight units of an item.
     * @param {object} [obj.themeObjectData] - RCA_store_objects for the store.
     * @param {boolean} obj.allCheckoutsOnRecharge - Should all checkouts go to ReCharge.
     * @param {object} obj.currencySettings - Settings for the Currency object.
     * Subscription data should be updated for the cart.
     */
    constructor({
        storeURL = _windowOrigin,
        subscriptionDataGetter = _nullHandler,
        rcaProductData,
        domain,
        cart_token,
        subscriptionCheckoutURL,
        weightUnits = "grams",
        themeObjectData = {},
        allCheckoutsOnRecharge = false,
        currencySettings = {},
    }) {
        this.storeURL = storeURL;
        this.cartId = themeObjectData.cart_id || null;
        this.checkoutData = null;
        this.rcaProductData = rcaProductData;
        this.currency = new Currency(0, currencySettings);
        this.pricing = new PricingHelper(this.currency);
        this.cartHelper = new CartHelper();
        const getCartToken = () => cart_token || this.cartId;
        this._rechargeArgs = { domain, subscriptionCheckoutURL, getCartToken };
        this.cartHelper.$logger = this.$logger;
        this._subscriptionDataGetter = subscriptionDataGetter;
        this.weightUnits = weightUnits;
        this.themeObjectData = themeObjectData;
        this.allCheckoutsOnRecharge = allCheckoutsOnRecharge;
    }

    /**
     * BigCommerce cart data from the Storefront API.
     *
     * @readonly
     * @returns {null | undefined | object}
     */
    get cartData() {
        return this.checkoutData.cart;
    }

    /**
     *@returns {object} The recharge object.
     */
    get recharge() {
        if (!this._rechargeArgs?.getCartToken()) {
            this._rechargeArgs.getCartToken = () => this.cartId;
        }
        return recharge(this._rechargeArgs);
    }

    /**
     * A request client for interacting with the Bigcommerce store.
     *
     * @readonly
     * @returns {buildRequest}
     */
    get client() {
        const baseURL = this.storeURL;
        return new buildRequest({ baseURL });
    }

    /**
     * All BigCommerce Cart line items as a flat array.
     *
     * @readonly
     * @returns {Array}
     */
    get allLineItems() {
        let items = [];
        const currentSubscriptionData = this.subscriptionData || [];
        /** @type {bool} Prepaid products have a charge frequency greater than shipping frequency. */
        const isPrepaid = (subscription) =>
            (subscription?.charge_frequency || 0) > (subscription?.shipping_frequency || 0);
        /** @type {bool} Subscription products have a shipping frequency. */
        const isSubscription = (subscription) => !!subscription?.shipping_frequency;
        for (let itemType in this.cartData.lineItems) {
            for (let lineItem of this.cartData.lineItems[itemType]) {
                lineItem.subscription =
                    currentSubscriptionData.find((item) => item.line_item === lineItem.id) || {};
                lineItem.subscription.isPrepaid = isPrepaid(lineItem.subscription);
                lineItem.subscription.isSubscription = isSubscription(lineItem.subscription);

                lineItem.rcaData =
                    this.rcaProductData?.find((item) => item.id === lineItem.productId) || {};
                lineItem.variantData =
                    lineItem.rcaData.variants?.find(
                        (variant) => variant.id === lineItem.variantId
                    ) || {};
                items.push(lineItem);
            }
        }
        return items;
    }

    /**.
     * All BigCommerce Cart line item ids
     *
     * @readonly
     * @returns {object[]}
     */
    get allLineItemIds() {
        return this.allLineItems.map((e) => e.id);
    }

    /**
     * Indicates whether the current BigCommerce Cart is taxable or not.
     *
     * @readonly
     * @returns {boolean}
     */
    get isTaxable() {
        return this.checkoutData.taxes?.length > 0;
    }

    /**
     * This gets all data in the cart.
     *
     * @readonly
     * @returns {object[]}
     */
    get subscriptionData() {
        const allSubscriptionData = this._subscriptionDataGetter();
        this.$logger.debug("BigCommerce Cart Subscription Data", allSubscriptionData);
        return allSubscriptionData;
    }

    /**.
     * Get Cart Line item By Id
     *
     * @param {string} lineItemId Current product.
     * @returns {object[]}
     */
    getCartItemByLineItemId(lineItemId) {
        return this.allLineItems.filter((e) => e.id === lineItemId)?.[0];
    }
    /**
     * Indicates whether the current BigCommerce Cart has subscription items in it or not.
     *
     * @readonly
     * @returns {boolean}
     */
    get hasSubscription() {
        return this.subscriptionData.some((line) => line.discount_type || line.charge_frequency);
    }

    /**
     * @returns {boolean} Indicates if the cart should be sent to ReCharge or not.
     */
    get isRechargeCart() {
        return this.allCheckoutsOnRecharge || this.hasSubscription;
    }

    /**
     * @returns {boolean} Indicator if current BigCommerce cart has any discounts. This does not
     * include coupons.
     */
    get hasDiscount() {
        return (
            this.cartData?.discountAmount > 0 ||
            this.cartData?.discounts?.some(({ discountedAmount }) => discountedAmount > 0)
        );
    }

    /**
     * Calls the BigCommerce Storefront Cart API and sets the Cart ID.
     *
     * @returns {Promise<BigcommerceCart>}
     */
    async getCartId() {
        try {
            const request = this.client.request({
                url: "/api/storefront/carts",
                method: "get",
            });
            const response = await request.send();
            this.cartId = response[0].id;
            this.recharge.cart_token = this.cartId;
        } catch (e) {
            if (e.response?.status === 404) {
                this.$logger.warn(`BigCommerce storefront cart could not be called: ${e}`);
                this.cartId = null;
            }
        }
    }

    /**
     * Calls the BigCommerce Storefront Checkout API and sets the Checkout & Cart Data. This is an
     * enhanced version of the Storefront Cart API call.
     *
     * @param {boolean} [includeModifiers=true] - Should modifier data be included with the cart?
     * @param {boolean} [includePromotions=true] - Should promotions data be included with the cart?
     * @param {boolean} [includeCategoryNames=false] - Should category names be included with the cart?
     * @param {boolean} [includeCustomer=false] - Should customer data be included with the cart?
     * @param {boolean} [includeCustomerGroup=false] - Should the customer group be included with the cart?
     * @param {boolean} [includePayments=false] - Should payments data be included with the cart?
     * @param {boolean} [includeShippingOptions=false] - Should shipping options be included with the cart?
     * @returns {Promise<BigcommerceCart>}
     */
    async getCheckoutData(
        includeModifiers = true,
        includePromotions = true,
        includeCategoryNames = false,
        includeCustomer = false,
        includeCustomerGroup = true,
        includePayments = false,
        includeShippingOptions = false
    ) {
        if (!this.cartId) {
            await this.getCartId();
        }
        let request = this.client.request({
            url: `/api/storefront/checkout/${this.cartId}`,
            method: "get",
        });
        let includeMap = [
            {
                isIncluded: includeModifiers,
                value: "cart.lineItems.digitalItems.options,cart.lineItems.physicalItems.options",
            },
            { isIncluded: includePromotions, value: "promotions" },
            {
                isIncluded: includeCategoryNames,
                value: "cart.lineItems.digitalItems.categoryNames,cart.lineItems.physicalItems.categoryNames",
            },
            { isIncluded: includeCustomer, value: "customer" },
            { isIncluded: includeCustomerGroup, value: "customer.customerGroup" },
            { isIncluded: includePayments, value: "payments" },
            {
                isIncluded: includeShippingOptions,
                value: "consignments.availableShippingOptions",
            },
        ];
        let toInclude = includeMap.filter((i) => i.isIncluded);
        if (includeModifiers) {
            request.params = {
                include: toInclude.map((item) => item.value).join(","),
            };
        }
        try {
            this.checkoutData = await request.send();
        } catch (e) {
            this.$logger.warn(`BigCommerce checkout cart could not be called: ${e}`);
        }
        return this;
    }

    /**
     * Sets the checkout data with information of a bigcommerce or wordpress cart.
     * @param {object} cart Current cart.
     */
    setCheckoutData(cart) {
        this.checkoutData = { cart };
    }

    /**
     *@returns {object} The ReCharge checkout.
     */
    async getRechargeCheckout() {
        if (!this.checkoutData) {
            await this.getCheckoutData();
        }
        return this.createRechargeCheckout();
    }

    /**
     * @returns {object} The ReCharge checkout.
     */
    createRechargeCheckout() {
        const items = this.createRechargeItems();
        const discount_code = this.getRechargeDiscount();
        return this.recharge.checkout.create(items, {
            attributes: {
                customerGroup: this.customerGroupAttribute,
                cartId: this.cartId,
            },
            discount: discount_code,
        });
    }

    /**
     * @typedef {object} CustomerGroupAttribute - BigCommerce Customer Group data to use with
     * ReCharge Checkout.
     * @property {number} id - The BigCommerce ID of the customer group.
     * @property {string} name - The name of the BigCommerce Customer Group.
     * @returns {CustomerGroupAttribute|object}
     */
    get customerGroupAttribute() {
        if (this.themeObjectData?.customer?.customer_group_id) {
            return {
                id: this.themeObjectData?.customer?.customer_group_id,
                name: this.themeObjectData?.customer?.customer_group_name,
            };
        } else if (this.checkoutData?.customer?.customerGroup) {
            return {
                id: this.checkoutData.customer.customerGroup.id,
                name: this.checkoutData.customer.customerGroup.name,
            };
        }
        return {};
    }
    /**
     *@returns {string} Discount amount.
     */
    getRechargeDiscount() {
        try {
            const element = document.querySelector(".rca-cart-coupon-value strong").innerHTML;
            return element.match(/\((.*)\)/).pop();
        } catch {
            return "";
        }
    }

    /**
     * @returns {object} The items with a recharge discount.
     */
    createRechargeItems() {
        const app = this;
        return this.allLineItems.map((item) => {
            const subscriptionData = item.subscription || {};
            const modifiers = item?.options?.reduce((acc, option) => {
                return { ...acc, [option.nameId]: option.valueId || option.value };
            }, {});

            const itemPrice = this.pricing.calculateItemPrice({
                item_price: item.salePrice,
                ...item.subscription,
            });
            const originalPrice = this.currency.newValue(item.listPrice);
            const cartItem = {
                id: item.productId,
                properties: {
                    shipping_interval_unit_type: subscriptionData.shipping_unit || undefined,
                    shipping_interval_frequency: subscriptionData.shipping_frequency || undefined,
                    modifiers,
                },
                charge_interval_frequency: subscriptionData.charge_frequency,
                order_interval_unit: subscriptionData.shipping_unit,
                quantity: item.quantity,
                variant_id: item.variantId,
                title: item.name,
                price: itemPrice.asCents,
                original_price: originalPrice.asCents,
                sku: item.sku,
                grams: app.cartHelper.weightToGrams(
                    item.variantData.weight || item.rcaData.weight,
                    app.weightUnits
                ),
                vendor: item.brand,
                product_id: item.productId,
                image: item.imageUrl,
                requires_shipping: item.isShippingRequired,
                product_type: item.type,
                product_title: item.name,
                variant_title: item.options
                    .map((option) => `${option.name}: ${option.value}`)
                    .join(", "),
                variant_options: [],
                taxable: item.isTaxable,
                tax_code: item.variantData.tax_code || item.rcaData.tax_code,
                storefront_purchase_options: subscriptionData.storefront_purchase_options,
                discount_type: subscriptionData.discount_type,
                discount_amount: subscriptionData.discount_type,
            };

            if (!isEmpty(subscriptionData.properties)) {
                const subscriptionDataPropertiesKeys = Object.keys(subscriptionData.properties);
                subscriptionDataPropertiesKeys.forEach((el) => {
                    cartItem.properties[el] = subscriptionData.properties[el];
                });
            }

            return cartItem;
        });
    }
}

/**
 * @typedef {object} StorefrontCustomer
 * @property {number} id - Unique numeric ID of the customer.
 * @property {string} email - Email address of the customer.
 * @property {string} group_id - The group to which the customer belongs.
 *
 * @typedef {object} getCurrentCustomerResponse
 * @property {StorefrontCustomer} customer - The Storefront Customer object.
 * @property {string} iss - Indicates the token’s issuer. This is your application’s client ID, which is obtained during application registration in Developer Portal.
 * @property {string} sub - The subject of the JWT - same as `store_hash`.
 * @property {number} iat - Time when the token was generated. This is a numeric value indicating the number of seconds since the Unix epoch.
 * @property {number} exp - Time when the token expires. The token usually expires after 15 minutes. This is a numeric value indicating the number of seconds since the Unix epoch.
 * @property {number} version - Version of the Current Customer JWT.
 * @property {string} aud - The “aud” (audience) claim identifies the recipients that the JWT is intended for. This should match the App Client ID and the `application_id`.
 * @property {string} application_id - The client ID created when the token was generated.
 * @property {string} store_hash - Store hash identifying the store you are logging into.
 * @property {string} operation - Must contain the string “current_customer”.
 */

/**
 *
 */
export class BigcommerceCustomer {
    /**
     * @param {object} [obj] - Anonymous object for constructor.
     * @param {string|null} [obj.storeURL] - The full url of the store without a path.
     * @param {string|null} [obj.app_client_id] - The Client ID of the app making the customer call.
     */
    constructor({ storeURL = _windowOrigin, app_client_id = null }) {
        this.storeURL = storeURL;
        this.app_client_id = app_client_id;
    }

    /**
     * A request client for interacting with the Bigcommerce store.
     *
     * @readonly
     * @returns {buildRequest}
     */
    get client() {
        const baseURL = this.storeURL;
        return new buildRequest({ baseURL });
    }

    /**
     *
     */
    create() {}

    /**
     * @typedef { AdapterBackendHelper.adapterCustomer} adapterCustomer
     *
     * @param {string|null} app_client_id - The Client ID of the app making the customer call.
     * @returns {adapterCustomer|null}
     */
    async get_current(app_client_id = null) {
        const request = this.client.request({
            url: "/customer/current.jwt",
            baseURL: this.storeURL,
            params: { app_client_id: app_client_id || this.app_client_id },
        });
        try {
            const response = await request.send();
            const token = response.token;
            const helper = new AdapterBackendHelper();
            return await helper.getAdapterCustomer(token);
        } catch (e) {
            return null;
        }
    }
}
