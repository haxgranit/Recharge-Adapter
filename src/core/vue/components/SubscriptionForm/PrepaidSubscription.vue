<template>
    <div>
        <span class="rca-prepaid-detail-title" v-if="showMainTitle">Offer Schedule</span>
        <span class="rca-prepaid-details"
            >{{ $t("products.widget_deliver_every") }} {{ deliveryInterval }}
            {{ deliveryIntervalUnit }}.
            <span v-if="hideBilledMessage()"
                >{{ $t("products.widget_charge_every") }} {{ chargeInterval }}
                {{ chargeIntervalUnit }}</span
            >
        </span>
    </div>
</template>
<script>
export default {
    name: "PrepaidSubscription",
    props: {
        subscription: {
            type: Object,
            required: true,
        },
        showMainTitle: {
            type: Boolean,
            required: true,
        },
    },
    computed: {
        /**
         *
         */
        deliveryIntervalUnit() {
            return this.subscription.order_interval_frequency_options[0] > 1
                ? `${this.subscription.order_interval_unit}s`
                : this.subscription.order_interval_unit;
        },
        /**
         *
         */
        chargeIntervalUnit() {
            return this.subscription.charge_interval_frequency > 1
                ? `${this.subscription.order_interval_unit}s`
                : this.subscription.order_interval_unit;
        },
    },
    /**
     *
     */
    data() {
        return {
            deliveryInterval: parseInt(this.subscription.order_interval_frequency_options[0]),
            chargeInterval: this.subscription.charge_interval_frequency,
        };
    },
    methods: {
        /**
         *
         */
        hideBilledMessage: function () {
            return this.chargeInterval / this.deliveryInterval !== 1;
        },
    },
};
</script>
<style>
.rca-prepaid-detail-title {
    display: block;
    font-size: 18px;
    line-height: 30px;
}

.rca-prepaid-details {
    display: block;
    font-size: 14px;
    line-height: 26px;
    font-weight: bold;
}
</style>
