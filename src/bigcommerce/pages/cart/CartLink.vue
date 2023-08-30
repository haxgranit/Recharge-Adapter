<template>
    <teleport v-if="cartElement" :target="cartElement" mode="replace">
        <a
            ref="cart_link"
            @click="addProduct"
            href="javascript:void(0);"
            data-event-type="product-click"
            :class="linkClass"
            >{{ linkText }}</a
        >
    </teleport>
</template>
<script>
import { mapActions } from "vuex";
import { Teleport } from "@/core/vue/components";
export default {
    name: "CartLink",
    components: {
        Teleport,
    },
    props: {
        /**
         * Cart element for replacing the add cart link.
         */
        cartElement: {
            type: Element,
            required: true,
        },
    },
    /**
     * Initializing the variables for the application.
     * @returns {object} All the data initialized.
     */
    data() {
        return {
            /**
             * State tracking to prevent multiple button presses.
             */
            addInProgress: false,
            /**
             * Text to display on add to cart button.
             */
            linkText: "Add to Cart",
        };
    },
    computed: {
        /**
         * @returns {string} - Add to cart url for the product.
         */
        cartURL() {
            return new URL(this.cartElement.getAttribute("href")).toString();
        },
        /**
         * @returns {string} - Class string to use for the add to cart button.
         */
        linkClass() {
            return this.cartElement?.className || "button button--small card-figcaption-button";
        },
    },
    methods: {
        /**
         * Map the store action for saving a subscription.
         */
        ...mapActions({
            addSubItem: "addSubItem",
            updateSubDataCartIds: "updateSubDataCartIds",
        }),
        /**
         * When the user clicks the add button perform the BC cart add and record a subscription
         * in store if the product is Subscription only or adds a one time purchase.
         */
        addProduct: function () {
            const self = this;
            if (!this.addInProgress) {
                this.addInProgress = true;
                this.$axios
                    .get(this.cartURL)
                    .then((response) => {
                        const res_url = response.request.responseURL;
                        let sen = "suggest=";
                        const line_item_id = res_url.substring(res_url.indexOf(sen) + sen.length);
                        sen = "cartId";
                        const cart_id_str = response.data.substr(
                            response.data.indexOf(sen) + sen.length,
                            45
                        );
                        const cart_id = cart_id_str.match(/[a-zA-Z0-9-]+/g)[0];
                        const productID = parseInt(this.cartURL.split("product_id=")[1]);
                        const subscription =
                            this.$store_data.getSubscriptionsByBCProductID(productID)[0];

                        let sub_item = {
                            cartid: cart_id,
                            line_item: line_item_id,
                            discount_type: false,
                        };
                        if (
                            subscription &&
                            subscription.storefront_purchase_options === "subscription_only"
                        ) {
                            sub_item = {
                                cartid: cart_id,
                                line_item: line_item_id,
                                shipping_unit: subscription.order_interval_unit || null,
                                shipping_frequency:
                                    subscription.order_interval_frequency_options[0] || null,
                                charge_frequency: subscription.charge_interval_frequency || null,
                                discount_type: subscription.discount_type || null,
                                discount_amount: subscription.discount_amount || null,
                            };
                        }

                        self.addSubItem(sub_item)
                            .then(() => {
                                self.$logger.debug(
                                    `Saved subscription information for cart line: ${line_item_id}`
                                );
                                window.location.href = res_url;
                            })
                            .catch((err) => {
                                this.$logger.error("Failed to save subscription: " + err);
                                throw err;
                            });
                    })
                    .then((e) => {

                        //after a successful saving of subscription product to cart
                        // and after successful adding product to sub data
                        // make sure all cartids in sub data lineitems are updated
                        this.$logger.debug(e);
                        this.updateSubDataCartIds(this.bigcommerce.storefront.cart_id);
                    })
                    .catch((err) => {
                        this.addInProgress = false;
                        this.$logger.error("Failed to add OTP to cart: " + err);
                    });
            } else {
                this.$logger.warn("Not added to cart, a cart add is already in progress.");
            }
        },
    },
};
</script>
