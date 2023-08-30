export default {
    methods: {
        /**
         * Display the respective subscription verbiage.
         *  @param {string} subscribe_type Operator.
         *  @param {number} subscribe_length Subscription length in {units}.
         *  @param {string} subscribe_units Subscription units (ex: day[s]).
         *  @returns {string} Associated subscription display text.
         */
        subscribeText: function (
            subscribe_type,
            subscribe_length = undefined,
            subscribe_units = undefined
        ) {
            let subscribe_text;
            switch (subscribe_type) {
                case "onetime":
                    subscribe_text = this.$t("products.onetime_message");
                    break;
                case "subscribe":
                    subscribe_text = this.$t("products.subscribe_without_discount_message");
                    break;
                case "subscribesave":
                    subscribe_text = this.$t("products.subscribe_message");
                    if (subscribe_length && subscribe_units) {
                        subscribe_text =
                            subscribe_text + ": Every " + subscribe_length + " " + subscribe_units;
                        // TODO: pluralize
                    }
                    break;
            }
            return subscribe_text;
        },
    },
};
