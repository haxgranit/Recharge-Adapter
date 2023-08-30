import CurrencyMixin, { Currency } from "./currency-helper";
import { merge } from "lodash";
import { mapGetters } from "vuex";

/**
 * @param price
 * @param currency
 */
function toCurrency(price, currency) {
    try {
        // Convert valid types to a Currency object from currency-helper.js
        if (["number", "string", "bigint"].includes(typeof price)) {
            price = currency.newValue(price);
        }
        // Throw an error if price is not a Currency object from currency-helper.js
        if (!price.settings) {
            throw new Error("error");
        }
        return price;
    } catch (e) {
        console.warn(`Item price of ${price} (${typeof price}) is invalid.\n${e}`);
    }
}

/**
 * @param value
 */
function toNumber(value) {
    try {
        if (value.value !== undefined) {
            return value.value;
        }
        return Number(value);
    } catch (e) {
        if (value) {
            console.warn({ msg: "Could not convert value to number.", value });
        }
        return value;
    }
}

/**
 * @param root0
 * @param root0.discount_type
 * @param root0.discount_amount
 * @param root0.item_price
 */

/**
 * @param symbol
 * @param separator
 * @param decimal
 * @param flags
 * @param pattern
 */
function priceRegex(symbol, separator, decimal, pattern, flags) {
    const num = `(?:\\d+${"\\" + separator}?)+${"\\" + decimal}?\\d*`;
    const sym = `${"\\" + symbol}`;
    return new RegExp(pattern.replace("#", num).replace("!", sym), flags);
}

/**
 *
 */
export class PricingHelper {
    /**
     * @param currency
     */
    constructor(currency = new Currency(0)) {
        this.currency = currency;
    }

    /**
     * @param priceString
     * @param root0
     * @param root0.symbol
     * @param root0.separator
     * @param root0.decimal
     * @param root0.currency
     * @param currency
     * @param root0.allPrices
     */
    fromString(priceString, { currency = this.currency, allPrices = false } = {}) {
        const s = currency.settings;
        const re = priceRegex(s.symbol, s.separator, s.decimal, s.pattern, "g");
        const results = [...priceString.matchAll(re)].map((item) => toCurrency(item[0], currency));
        if (results.length && !allPrices) {
            return results[0];
        }
        return results || [];
    }

    /**
     * Display format prices with rounding, currency symbol, and monetary format.
     *
     * @param {number | string} price String to extract currency symbol from.
     * @param currency
     * @returns {string} Formatted price string to for display.
     */
    toPriceString(price, currency = this.currency) {
        const asCurrency = toCurrency(price, currency);
        return asCurrency.format();
    }

    /**
     * Calculate the price for an items with a subscription.
     *
     * @param {string} discount_type The type of subscription discount.
     * @param {number} discount_amount Amount the discount is for.
     * @param {number} item_price The price of the item before discount.
     * @param {number} item_quantity The number of items to calculate the price of.
     * @returns {Currency} The discrete price for a given quantity of items.
     */
    calculateLinePrice({
        discount_type,
        discount_amount,
        item_price,
        item_quantity,
        currency,
    } = {}) {
        return this.calculateItemPrice({
            discount_type,
            discount_amount,
            item_price,
            currency,
        }).multiply(item_quantity);
    }

    /**
     * Calculate the price for an item with a subscription.
     *
     * @param {string} discount_type The type of subscription discount.
     * @param {number} discount_amount Amount the discount is for.
     * @param {number} item_price The price of the item before discount.
     * @returns {Currency} The discrete item price.
     */
    calculateItemPrice({ discount_type, discount_amount, item_price, currency }) {
        currency = currency || this.currency;
        item_price = toCurrency(item_price, currency);
        discount_amount = this.getDiscountAmount({ item_price, discount_type, discount_amount });
        return item_price.subtract(discount_amount);
    }

    /**
     * Get subscription data for a line item in the cart.
     *
     * @param {object} line_data Data for the line item in the cart.
     * @param {string} line_data.id Id for the line item.
     * @param {object} sub_data Subscription data for store.
     * @returns {object} Subscription data for the line item.
     */
    getLineSubData(line_data, sub_data) {
        let line_sub_data = sub_data.find((item) => item.line_item === line_data.id);
        let default_data = {
            discount_type: "percentage",
            discount_amount: 0,
        };
        return merge(default_data, line_sub_data);
    }
    /**
     * @param root0
     * @param root0.discount_type
     * @param root0.discount_amount
     * @param root0.item_price
     */
    getDiscountAmount({ discount_type, discount_amount, item_price }) {
        discount_amount = toNumber(discount_amount);
        discount_amount = discount_amount >= 0 ? discount_amount : 0;
        switch (discount_type) {
            case "fixed_amount":
                return discount_amount;
            case "percentage":
                return item_price.multiply(discount_amount / 100).value;
            case undefined:
                return 0;
        }
        console.warn(`${discount_type} is not a supported discount type`);
        return 0;
    }
}

export default {
    mixins: [CurrencyMixin],
    computed: {
        ...mapGetters(["currentSubData"]),
    },
    /**
     *
     */
    beforeCreate() {
        const app = this;
        /**
         *
         */
        class AppPricingHelper extends PricingHelper {
            /**
             * @param line_data
             * @param sub_data
             */
            getLineSubData(line_data, sub_data = app.currentSubData) {
                return super.getLineSubData(line_data, sub_data);
            }
            /**
             *
             */
            get currency() {
                return app.Currency(0);
            }
            /**
             *
             */
            set currency(value) {
                // Do nothing
            }
        }
        this.pricing = new AppPricingHelper();
    },
};
