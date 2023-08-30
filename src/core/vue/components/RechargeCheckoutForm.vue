<template>
    <teleport target="body" mode="after">
        <form method="post" :action="url" style="display: none" ref="rechargeCheckout">
            <input name="cart_json" type="hidden" :value="payload" />
            <input name="email" type="hidden" :value="customerInfo.email" />
            <input name="first_name" type="hidden" :value="customerInfo.first_name" />
            <input name="last_name" type="hidden" :value="customerInfo.last_name" />
            <input name="address1" type="hidden" :value="customerInfo.address1" />
            <input name="address2" type="hidden" :value="customerInfo.address2" />
            <input name="city" type="hidden" :value="customerInfo.city" />
            <input name="province" type="hidden" :value="customerInfo.province" />
            <input name="zip" type="hidden" :value="customerInfo.zip" />
            <input name="country" type="hidden" :value="customerInfo.country" />
            <input name="phone" type="hidden" :value="customerInfo.phone" />
        </form>
    </teleport>
</template>

<script>
import Teleport from "@/core/vue/components/Teleport";

export default {
    name: "RechargeCheckoutForm",
    props: {
        baseUrl: {
            type: String,
            default: "https://checkout.rechargeapps.com/r/checkout",
        },
        domain: String,
        cart_token: {
            type: String,
            default: null,
        },
        cart: {
            type: [String, Object],
            required: true,
        },
        submitOnMount: {
            type: Boolean,
            default: false,
        },
    },
    components: { Teleport },
    computed: {
        /**
         * @returns {string|null} The cart as a JSON encoded string.
         */
        payload() {
            try {
                if (typeof this.cart === "string") {
                    return this.cart;
                }
                return JSON.stringify(this.cart);
            } catch (e) {
                this.$logger.warn(`Invalid ReCharge Cart: ${e}`);
            }
            return null;
        },
        /**
         * @returns {string} Checkout url.
         */
        url() {
            /**
             * If it's a WP store, then RCA_store_objects doesn't exist and
             * domain and cart token aren't set yet.
             */
            return this.recharge?.checkout?.url;
        },

        /**
         * prefill_checkout is a setting  passed from the backend that determines
         * if Recharge Checkout form will be prefilled by RechargeFormCheckout.
         *
         * @returns {boolean} prefill_checkout.
         */
        isPrefillCheckout() {
            return this.$store.getters.settings.pages.checkout?.prefill_checkout_form;
        },

        /**
         * @returns {Object} Customer object.
         *
         * Object includes the following fields that map to the Recharge Checkout form:
         * @property {string}  email        - customer email.
         * @property {string} first_name    - customer first_name.
         * @property {string} last_name     - customer last_name.   
         * @property {string} address1      - customer address line one.
         * @property {string} address2      - customer address line two.
         * @property {string} city          - customer city.
         * @property {string} province      - customer province.
         * @property {string} zip           - customer zip.
         * @property {string} country       - customer country.
         * @property {string} phone         - customer phone.
         */
        customerInfo() {
            return {
                ...(this.$store_objects?.customer?.address || {}),
                ...{
                    email: this.$store_objects?.customer?.email || "",
                    province: this.$store_objects?.customer?.address?.state || "",
                },
            };
        },
    },
    methods: {
        /** @returns {object} $refs initialized.
         */
        // eslint-disable-next-line consistent-return
        submit() {
            if (!this.$refs.rechargeCheckout) {
                return setTimeout(() => this.submit(), 10);
            }
            if (this.payload) {
                try {
                    this.$logger.debug(
                        `Performing ReCharge checkout. Sending payload to ${this.url} ...`
                    );
                    this.$logger.debug("ReCharge Payload", JSON.parse(this.payload));

                    this.$refs.rechargeCheckout.submit();
                } catch (e) {
                    this.$logger.error(`Recharge checkout failed: ${e}`);
                }
            } else {
                this.$logger.warn("Empty ReCharge Checkout Payload");
            }
        },
    },
    // eslint-disable-next-line jsdoc/require-jsdoc
    mounted() {
        if (this.submitOnMount) {
            this.$nextTick(() => this.submit());
        }
    },
};
</script>

<style></style>
