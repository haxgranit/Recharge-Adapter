<template>
    <span id="cartSubscribe" class="rca-cart-line-item-subscribe">
        <br />
        <strong> {{ text }} {{ shippingFrequency }} {{ units }} </strong>
    </span>
</template>

<script>
export default {
    name: "SubscribeAndSave",
    props: {
        discountAmount: [String, Number],
        shippingFrequency: [String, Number],
        unit: { type: String, default: "" },
    },
    computed: {
        /**
         * Calculates the correct plural.
         * @returns {string}
         */
        units() {
            if (
                parseInt(this.shippingFrequency, 10) !== 1 &&
                this.unit.substring(this.unit.length - 1) !== "s"
            ) {
                return `${this.unit}s`;
            }
            return this.unit;
        },
        /**
         * Based on discount amount chooses the correct
         * localized subscription frequency text.
         * @returns {string}
         */
        text() {
            return this.discountAmount === null || !this.discountAmount > 0
                ? this.$t("cart.cart_sub_frequency_text")
                : this.$t("cart.cart_sub_save_frequency_text");
        },
    },
};
</script>
