<template>
    <span id="subAndSave" :class="className">
        <strong>{{ subscribeWording }}</strong>: Every {{ shippingFrequency }} {{unit}}
    </span>
</template>

<script>
export default {
    name: "SubscribeAndSave",
    props: {
        /**
         * The class name of the subAndSave element.
         */
        className: {
            type: String,
            default: "",
        },
        /**
         * The string of the subscription widget.
         */
        subscribeWording: {
            type: String,
            default: "",
        },
        /**
         * Shipping frequency.
         */
        shippingFrequency: [String, Number],
        /**
         * The unit of the Product.
         */
        unit: {
            type: String,
            default: "",
        },
    }
};
</script>
