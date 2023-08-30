import LocalizeMixin from "./localize";
import { mapGetters } from "vuex";

export default {
    mixins: [LocalizeMixin],
    computed: {
        ...mapGetters({ subscriptionData: "currentSubData" }),
    },
    methods: {
        /**
         * Text for subscription interval unit. Adds an s to the end if not already present on quantities greater than 0.
         *
         * @param {string} unit A unit of time to return formatted for single/multiple frequency periods.
         * @param {string|number} freq The frequency used to determine if the unit text should be modified.
         * @returns {string} Text for subscription interval unit.
         */
        displayIntervalText: function (unit, freq) {
            if (parseInt(freq) > 1 && unit.substring(unit.length - 1) !== "s") {
                return `${unit}s`;
            }
            return unit;
        },
        /**
         * Check if the subscription options is from a prepaid product.
         *
         * Prepaid products match criteria.
         * Subscription type is subscription only.
         * Subscription order interval exist and only exist one interval.
         * Subscription charge interval exist.
         * Subscription charge interval isn't divisible by order interval.
         *
         * @param {object} subscriptionOptions Product subscription options.
         * @returns {boolean} Bool if subscription options are from a prepaid subscription.
         */
        isPrepaidSubscriptionOptions: function (subscriptionOptions) {
            const frequency = parseInt(subscriptionOptions.order_interval_frequency_options[0], 10);
            return (
                subscriptionOptions.storefront_purchase_options === "subscription_only" &&
                subscriptionOptions.order_interval_frequency_options?.length === 1 &&
                subscriptionOptions?.charge_interval_frequency > frequency &&
                subscriptionOptions?.charge_interval_frequency % frequency === 0
            );
        },
        /**
         * Hide or show elements based on subscription presence if we have a subscription cart.
         * This Function will create a list with every class we'll hide and then it'll add the rca-hide-element class to it.
         * The conditions for wether we hide the element or not are the following:
         * If the cart is a recharge cart, We will hide the shipping labels regardless.
         * If the settings for using BC discounts are false, we'll hide everything labeled rca-cart-hide-subscription.
         * Wether we show the coupon label can be toggled with the display_and_handoff_coupons setting regardless of the value of use_bc_discounts.
         *
         * @param {boolean} areSubscriptionsPresent Whether subscriptions are present in the cart.
         */
        hideForSubscription(areSubscriptionsPresent) {
            if (areSubscriptionsPresent ?? this.bigcommerce.storefront.cart.isRechargeCart) {
                let classList = this.getCustomClass("shipping_label");

                if (this.settings?.backend?.use_bc_discounts) {
                    if (!this.settings?.backend?.display_and_handoff_coupons) {
                        classList += ", " + this.getCustomClass("cart_coupon");
                    }
                } else {
                    classList += ", " + this.getCustomClass("cart_hide_subscription");
                    if (!this.settings?.backend?.display_and_handoff_coupons) {
                        classList += ", " + this.getCustomClass("cart_coupon");
                    }
                }
                const elementsToRemove = document.querySelectorAll(classList);
                elementsToRemove.forEach((element) => {
                    element.classList.add("rca-hide-element");
                });
            }
        },
    },
};
