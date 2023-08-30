import { decodeHtmlEntity } from "@/core/utils/dom-helper";
import { buildRequest } from "@/core/utils/url-helper";
import { PricingHelper } from "@/core/vue/mixins/pricing";
import { Logger } from "@/core/vue/plugins/logger";
// import { loggerEnabled as mainLoggerEnabled } from "@/bigcommerce/main";

/* eslint-disable jsdoc/require-property-description */
/**
 * Settings from the Recharge CDN file.
 *
 * @typedef {object} RechargeSettings
 * @property {object} widget_settings
 * @property {string} widget_settings.active_color
 * @property {string} widget_settings.background_color
 * @property {string} widget_settings.display_on
 * @property {string} widget_settings.first_option
 * @property {string} widget_settings.font_color
 * @property {string} widget_settings.how_it_works
 * @property {string} widget_settings.learnmore_url
 * @property {string} widget_settings.learnmore_verbiage
 * @property {string} widget_settings.onetime_message
 * @property {string} widget_settings.popup_background_color
 * @property {string} widget_settings.popup_link_color
 * @property {string} widget_settings.popup_text_color
 * @property {string} widget_settings.poweredby_url
 * @property {string} widget_settings.published
 * @property {string} widget_settings.select_subscription_first
 * @property {string} widget_settings.show_learnmore
 * @property {string} widget_settings.show_poweredby
 * @property {string} widget_settings.show_subscription_details
 * @property {string} widget_settings.show_subscription_details_icon
 * @property {string} widget_settings.subscribe_message
 * @property {string} widget_settings.subscribe_without_discount_message
 * @property {string} widget_settings.subscription_details_verbiage
 * @property {string} widget_settings.translations
 * @property {string} widget_settings.widget_deliver_every
 * @property {string} widget_settings.widget_icon
 */

/* eslint-enable */

/**
 *
 * @param {string} storeDomain - The ReCharge store domain for the merchant.
 * @param {boolean} isStaging - Is the store on the ReCharge staging or not.
 * @returns {RechargeSettings}
 */
export async function getRechargeCdnFile(storeDomain, isStaging = false) {
    const stagingUrlSnippet = isStaging ? ".staging" : "";
    const request = new buildRequest({
        url: `https://static${stagingUrlSnippet}.rechargecdn.com/store/${storeDomain}/2020-12/
        widget_settings.json`,
        params: { _ts: new Date().getTime() },
        method: "get",
    });
    const response = await request.send();
    return decodeHtmlEntity(response.widget_settings || {});
}

/**
 *
 */
export class RechargeSettingsHelper {
    baseUrl = "https://static.rechargecdn.com/store/";
    baseStageUrl = "https://static.staging.rechargecdn.com/store/";
    version = "2020-12";

    /**
     * @param {string} rechargeStoreDomain - Recharge Store Domain.
     * @param {boolean} loggerEnabled - Boolean indicating if the logger is enabled or disabled.
     */
    constructor({ rechargeStoreDomain = "", isStaging = false } = {}, loggerEnabled = false) {
        this.storeDomain = rechargeStoreDomain;
        this.logger = new Logger("RechargeSettings", {
            enabled: loggerEnabled || !["production"].includes(process.env.NODE_ENV),
        });
        this.client = new buildRequest(
            {
                baseURL: isStaging ? this.baseStageUrl : this.baseUrl,
            },
            this.logger
        );
    }

    /**
     * @param {object} params - Parameter object.
     * @returns {widget_settings} - Widget settings from json call.
     */
    async getWidgetSettings(params = {}) {
        const response = await this.client
            .request({
                url: `${this.storeDomain}/${this.version}/widget_settings.json`,
                params: params,
            })
            .send();
        try {
            return decodeHtmlEntity(response.widget_settings || {});
        } catch (e) {
            this.logger.error(e);
            return response?.widget_settings;
        }
    }
}

/**
 *A class for performing a checkout on Recharge.
 */
class RechargeCheckout {
    /**
     * @param {object} root0 The checkout class object.
     * @param {string} root0.domain The domain of the store.
     * @param {string} root0.subscriptionCheckoutURL The url for checking out on recharge.
     * @param {Function} root0.getCartToken Fetches the cart token.
     */
    constructor({
        domain,
        subscriptionCheckoutURL = "https://checkout.rechargeapps.com/r/checkout",
        getCartToken,
    }) {
        this.domain = domain || window.location.hostname;

        this.baseUrl = subscriptionCheckoutURL;
        this.pricing = new PricingHelper();
        this.$logger = new Logger("RechargeCheckout");
        // The token may not actually exist when the class is
        // instantiated so we need to getter for the cart token
        this.getCartToken = getCartToken;
    }

    /**
     *Get the client's URL.
     *@returns {string} The URL.
     */
    get url() {
        return this.client.url;
    }

    /**
     *Get the Client's domain and cart token.
     *@returns {object} An object containing the domain of the store and the cart token.
     */
    get client() {
        const cart_token = this.getCartToken();
        return new buildRequest({
            baseURL: this.baseUrl,
            params: { domain: this.domain, cart_token },
        });
    }

    /**
     * @param {object} items The cart's Items.
     * @param {object} root0 The class object.
     * @param {string} root0.note .
     * @param {boolean} root0.requires_shipping Does the Item require's shipping?
     * @param {boolean} root0.discount Handoff discount to Recharge.
     * @param {string} root0.external_checkout_source The site where we make our petition to recharge.
     * @param {object} root0.attributes Other attributes.
     * @param {boolean} root0.is_taxable If product needs to have tax applied.
     * @returns {object} The Object's attributes.
     */
    create(
        /* exported object */
        items = [],
        {
            note = "",
            attributes = {},
            requires_shipping = true,
            discount = "",
            external_checkout_source = "bigcommerce",
            // eslint-disable-next-line no-unused-vars
            is_taxable = false,
        } = {}
    ) {
        const app = this;
        const totalPrice = items.reduce(
            (acc, cur) =>
                app.pricing
                    .calculateLinePrice({
                        item_price: cur.price,
                        item_quantity: cur.quantity,
                    })
                    .add(acc),
            0
        );
        items.map(app._createLine.bind(app));
        return {
            note,
            items,
            requires_shipping,
            attributes,
            external_checkout_source,
            discount,
            total_price: totalPrice,
            subtotal_price: totalPrice,
        };
    }

    /**
     * Create Line item.
     * @param {object} item The item we want to create.
     * @returns {object} The line item created.
     */
    _createLine(item) {
        item.line_price = this.pricing.calculateLinePrice({
            item_price: item.price,
            item_quantity: item.quantity,
            discount_amount: item.discount_amount,
            discount_type: item.discount_type,
        });
        delete item.discount_amount;
        delete item.discount_type;
        if (this._validateLine(item)) {
            return item;
        }
        return {};
    }

    /**
     * Validates an RC checkout item.
     * Current implementation only handles subscription flags.
     *
     * @param {object} line_item The line item we want to validate.
     * @returns {object} Line_item RC checkout payload item.
     */
    _validateLine(line_item) {
        let errorMessage;
        const shippingType = line_item.properties.shipping_interval_unit_type;
        const shippingFrequency = line_item.properties.shipping_interval_frequency;
        const chargeFrequency = line_item.charge_interval_frequency;
        const orderInterval = line_item.order_interval_unit;
        const purchaseOptions = line_item.storefront_purchase_options;

        const checks = [
            {
                msg: `Invalid shipping_interval_unit_type: ${shippingType}`,
                check: shippingType && !["day", "week", "month"].includes(shippingType),
            },
            {
                msg: `Invalid shipping_interval_frequency: ${shippingFrequency}`,
                check:
                    shippingFrequency &&
                    (typeof shippingFrequency !== "number" ||
                        !isFinite(shippingFrequency) ||
                        shippingFrequency < 1),
            },
            {
                msg: `Invalid charge_interval_frequency: ${chargeFrequency}`,
                check:
                    chargeFrequency &&
                    (typeof chargeFrequency !== "number" ||
                        !isFinite(chargeFrequency) ||
                        chargeFrequency < 1),
            },
            {
                msg: `Invalid order_interval_unit: ${orderInterval}`,
                check: orderInterval && !["day", "week", "month"].includes(orderInterval),
            },
            {
                msg: `Invalid storefront_purchase_options: ${purchaseOptions}`,
                check:
                    purchaseOptions &&
                    !["subscription_only", "subscription_and_onetime"].includes(purchaseOptions),
            },
        ];
        errorMessage = checks.find((item) => item.check)?.msg;
        if (errorMessage) {
            this.$logger.error(`Failed validate RC Checkout Line: ${errorMessage}`);
            return false;
        }
        return true;
    }
}

export const recharge = ({ domain, subscriptionCheckoutURL, getCartToken }) => {
    return {
        // The token may not actually exist yet when this call is made so
        // push through a getter so we can get the value when it's needed
        checkout: new RechargeCheckout({ domain, subscriptionCheckoutURL, getCartToken }),
        domain,
        subscriptionCheckoutURL,
    };
};

export const RechargeMixin = {
    computed: {
        /**
         *@returns {object} The URL to perform a checkout from recharge.
         */
        recharge() {
            const { baseURL, domain, getCartToken } = this.getRechargeCheckoutConfig();
            const subscriptionCheckoutURL = this.buildSubscriptionURL(baseURL);
            const ret = recharge({ subscriptionCheckoutURL, domain, getCartToken });
            return ret;
        },
    },
    methods: {
        /**
         *@returns {object}
         */
        getRechargeCheckoutConfig() {
            return {
                baseURL:
                    this.$store?.getters?.settings?.pages?.checkout?.checkout_url ||
                    this.baseUrl ||
                    window.origin,
                domain:
                    this.domain || this.$store_data.getStoreDomain() || window.location.hostname,
                getCartToken: () => this.cart_token || this.currentCartId,
            };
        },
        /**
         * @param {string} baseURL Base URL.
         * @returns {string}
         */
        buildSubscriptionURL(baseURL) {
            const subscriptionCheckout = new buildRequest({
                baseURL,
                url: "/r/checkout",
            });
            return subscriptionCheckout.url;
        },
    },
};
