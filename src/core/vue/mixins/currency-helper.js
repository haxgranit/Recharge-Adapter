import currencies from "@config/currencies";
import { merge } from "lodash";
import currency from "currency.js";
import { mapGetters } from "vuex";

/**
 *
 */
export class Currency extends currency {
    /**
     * @param {number} value The value.
     * @param {object} extra Extra configurations.
     * @param {string} extra.currencyCode The code of the current used in a store.
     * @param {string} extra.defaultCurrencyCode The default currency code.
     * @param {object} extra.opts Extra options.
     */
    constructor(value = 0, { opts = {}, currencyCode, defaultCurrencyCode } = {}) {
        const mergedOpts = Currency._getOpts({
            cartCurrencyOpts: opts,
            currencyCode,
            defaultCurrencyCode,
        });
        super(value, mergedOpts);
        this.settings = this.s;
    }

    /**
     * @param {object} root0 An object containing the next attributes.
     * @param {string} root0.currencyCode The currency code.
     * @param {object} root0.cartCurrencyOpts The currentcy options if available.
     * @param {string} root0.defaultCurrencyCode The default currency code.
     * @returns {object} An object with all the currency settings merged.
     */
    static _getOpts({ cartCurrencyOpts = {}, currencyCode = "USD", defaultCurrencyCode = "USD" }) {
        const currencyCodeOpts = currencies[currencyCode] || {};
        const defaultCurrencyCodeOpts = currencies[defaultCurrencyCode] || {};
        return merge(defaultCurrencyCodeOpts, currencyCodeOpts, cartCurrencyOpts);
    }

    /**
     * @param {number} price A price.
     * @returns {Currency|currency} A new Currency object.
     */
    newValue(price) {
        return this.constructor(price, { opts: this.settings });
    }

    /**
     * Return full value as cents.
     *@returns {number} The value as cents.
     */
    get asCents() {
        return Math.round(this.value * 100);
    }
    /**
     * @param {number} result A result.
     * @returns {object} An object with changed values.
     */
    _updateFromSuper(result) {
        this.value = result.value;
        this.intValue = result.intValue;
        return this;
    }
    /**
     * @param {number} value A value.
     * @returns {number} The new value we added.
     */
    add(value) {
        return this.newValue(super.add(value).value);
    }
    /**
     * @param {number} value A value to substract.
     * @returns {number} The value substracted.
     */
    subtract(value) {
        return this.newValue(super.subtract(value).value);
    }
    /**
     * @param {number} value A value to multiply.
     * @returns {number} The value multiplied.
     */
    multiply(value) {
        return this.newValue(super.multiply(value).value);
    }
    /**
     * @param {number} value A value to divide.
     * @returns {number} The value divided.
     */
    divide(value) {
        return this.newValue(super.divide(value).value);
    }
}

/**
 *
 */

export default {
    computed: {
        ...mapGetters(["currencyOptions", "cartCurrency"]),
        /**
         * @returns {object} The merged Currency Options / Settings. This is reactive.
         */
        currencySettings() {
            // Lowest priority settings
            const defaultCurrencyCode = this.$store.getters.settings?.currency;
            const defaultCurrency = currencies[defaultCurrencyCode] || {};
            // Middle priority settings
            const cartCurrency = {
                symbol: this.cartCurrency.symbol,
                precision: this.cartCurrency.decimalPlaces,
            };
            // Highest priority settings
            const storeObjectDefaultCurrency = {
                decimal: this.$store_objects?.currency?.default.decimal_token,
                pattern:
                    this.$store_objects?.currency?.default?.currency_location.toLowerCase() ===
                    "right"
                        ? "#!"
                        : "!#",
                precision: this.$store_objects?.currency?.default.decimal_places,
                separator: this.$store_objects?.currency?.default.thousands_token,
                symbol: this.$store_objects?.currency?.default.currency_token,
            };

            // Merge all settings
            const opts = merge(defaultCurrency, cartCurrency, storeObjectDefaultCurrency);
            return new Currency(0, { opts }).settings;
        },
    },
    /**
     * Create the `Currency` method from the the Currency class with options prefilled from the app.
     * Add a `settings` getter to this method so current Currency Settings are always available.
     */
    beforeCreate() {
        const app = this;
        this.Currency = (price) => {
            return new Currency(price, app.currencySettings);
        };
        Object.defineProperty(this.Currency, "settings", { get: () => app.currencySettings });
    },
};
