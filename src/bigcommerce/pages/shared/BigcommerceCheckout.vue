<!-- This module controls the checkout flow for BigCommerce. -->
<template>
    <div v-if="ready">
        <!-- ReCharge Checkout with BigCommerce Discounts -->
        <redirect v-if="checkoutType.rechargeDiscount" :url="rechargeDiscountUrl"></redirect>
        <!-- ReCharge Checkout without BigCommerce Discounts -->
        <recharge-checkout-form
            v-else-if="checkoutType.rechargeStandard"
            :cart="rechargeCart"
            :submit-on-mount="true"
            :domain="recharge.domain"
            :cart_token="cart.cartId"
        ></recharge-checkout-form>
        <!-- Normal Onetime checkout -->
        <!--        <redirect v-else :url="bigcommerceCheckoutUrl"></redirect>-->
    </div>
</template>

<script>
import { RechargeCheckoutForm, Redirect } from "@/core/vue/components";
import { adapterBackendMixin } from "@/core/utils";

require("@types");

export default {
    name: "BigcommerceCheckout",
    components: { RechargeCheckoutForm, Redirect },
    mixins: [adapterBackendMixin],
    // eslint-disable-next-line jsdoc/require-jsdoc
    data: function () {
        return {
            /**
             * @type {BigcommerceCart} The BigCommerce cart.
             */
            cart: null,
            /**
             * @type {object} The ReCharge Checkout Cart.
             */
            rechargeCart: null,
            /**
             * @type {boolean} Indicator if the checkout is ready to submit.
             */
            ready: false,
            /**
             * @type {?string} The BigCommerce URL for checkout.
             */
            bigcommerceCheckoutUrl: "/checkout",
            /**
             * @type {?string} The ReCharge Checkout URL when using BigCommerce discounts.
             */
            rechargeDiscountUrl: null,
            /**
             * @type {string} The CSS selector to find all Checkout buttons.
             */
            /**
             * @type {boolean} Indictor if the clickHandler should run. Should be false for BigCommerce Checkouts.
             * */
            shouldRunHandler: true,
        };
    },
    computed: {
        /**
         * @typedef {object} checkoutType
         * @property {boolean} rechargeStandard - Indicator if this is a standard ReCharge checkout.
         * @property {boolean} rechargeDiscount - Indicator if this is a ReCharge checkout using.
         * BigCommerce discounts.
         *
         * @returns {checkoutType}
         */
        checkoutType() {
            const settings = this.settings;
            const isValidRechargeCheckout = this.isRechargeCheckout && this.rechargeCart,
                useBigcommerceDiscounts =
                    settings.backend.use_bc_discounts && this.cart.hasDiscount;
            return {
                rechargeStandard: isValidRechargeCheckout && !useBigcommerceDiscounts,
                rechargeDiscount: isValidRechargeCheckout && useBigcommerceDiscounts,
            };
        },
        /**
         * @returns {boolean} Indicator is the checkout should be a ReCharge checkout.
         */
        isRechargeCheckout() {
            return this.settings.backend.all_checkouts_on_recharge || this.cart.hasSubscription;
        },
    },
    methods: {
        /**
         * @param {jQuery.Event} event - The jQuery click event to check.
         * @returns {boolean} Indicator if the click event is a checkout event.
         */
        isCheckoutEvent(event) {
            const { pathname, href, classList } = event.target ?? {};
            return (
                pathname?.includes(this.bigcommerceCheckoutUrl) ||
                href?.includes(this.bigcommerceCheckoutUrl) ||
                classList?.contains("rca-checkout-button")
            );
        },
        /**
         * Adds a checkout click handler to a node that's passed in. First checks if it is a checkout event before
         * performing further steps. This click handler stops a
         * checkout event, refreshes the cart data, and then processes the correct checkout type.
         * @param {jQuery} node - The target node.
         */
        setClickHandler(node) {
            const clickHandler = async (event) => {
                if (this.shouldRunHandler && this.isCheckoutEvent(event)) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    await this.refreshCart();
                    if (!this.isRechargeCheckout) {
                        this.shouldRunHandler = false;
                        event.target.click();
                    }
                }
            };

            node.addEventListener("click", clickHandler, true);
            this.$logger.debug("Checkout handler added.");
        },

        /**
         * Update the BigCommerce cart data and sets the checkout as "ready".
         */
        async refreshCart() {
            this.cart = await this.bigcommerce.getUpdatedCart();
            if (this.isRechargeCheckout) {
                this.rechargeCart = await this.cart.getRechargeCheckout();
                if (this.checkoutType.rechargeDiscount) {
                    this.rechargeDiscountUrl = await this.adapterBackend.getPromotionsCheckoutURL();
                }
                this.ready = true;
                if (this.checkoutType.rechargeDiscount) {
                    this.$logger.debug(
                        `Proceeding with ReCharge Discount Checkout: ${this.rechargeDiscountUrl}`
                    );
                } else if (this.checkoutType.rechargeStandard) {
                    this.$logger.debug(`Proceeding with ReCharge Standard Checkout`);
                } else {
                    this.$logger.debug(
                        `Proceeding with BigCommerce Onetime Checkout`,
                        this.cart.cartData
                    );
                }
            }
        },
    },
    // eslint-disable-next-line jsdoc/require-jsdoc
    mounted() {
        //capturing all clicks on the document overall.
        //setClickHandler will then check if the click is a checkoutEvent before performing checkout
        this.setClickHandler(document);
    },
};
</script>

<style scoped></style>
