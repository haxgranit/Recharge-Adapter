<template>
    <span>
        <div id="recharge-cart"></div>
        <template v-for="item in subscriptionDetails">
            <Teleport :target="item.target" :mode="item.mode" :key="item.key">
                <prepaid-subscription
                    v-if="item.isPrepaid"
                    :subscription="item.props.subscription"
                    :showMainTitle="item.props.showMainTitle"
                ></prepaid-subscription>
                <subscribe-and-save
                    v-else
                    :unit="item.props.unit"
                    :shippingFrequency="item.props.shippingFrequency"
                    :discountAmount="item.props.discountAmount"
                    :subscribeWording="item.props.subscribeWording"
                ></subscribe-and-save>
            </Teleport>
        </template>
    </span>
</template>

<script>
import BigcommerceCartMixin from "@/bigcommerce/vue/mixins/bc-cart";
import CustomClassesMixin from "@/bigcommerce/vue/mixins/custom-classes";
import {
    CurrencyMixin,
    MutationsCheckerMixin,
    PricingMixin,
    SubscriptionDetailsMixin,
} from "@/core/vue/mixins";
import { mapActions, mapGetters, mapMutations } from "vuex";
import PrepaidSubscription from "@/core/vue/components/SubscriptionForm/PrepaidSubscription";
import SubscribeAndSave from "@/bigcommerce/pages/shared/Cart/SubscribeAndSave";
import { Teleport } from "@/core/vue/components";
import { isEmpty } from "lodash";

// Use `this.bigcommerce.storefront.cart` for the BigcommerceCart class helper.
// Remember that the cart sometimes needs to be refreshed via
// this.bigcommerce.storefront.cart.getCheckoutData()
export default {
    name: "Cart",
    /**
     *
     */
    data() {
        return {
            /**
             * Component scope storage of a DOM observer for cart content.
             */
            cartItemsObserver: false,
            /**
             * Component scope storage of a DOM observer for cart totals.
             */
            cartTotalsObserver: false,
            /**
             * Component scope storage of the DOM observer for the delete items modal.
             */
            deleteItemObserver: false,
            /**
             * Store the cart line id currently being deleted.
             */
            cartRemoveLineID: false,
            /**
             * Whether the currently displayed cart has a subscription.
             */
            hasSubscription: false,
            /**
             * List of objects to build UI components for line-items.
             */
            subscriptionDetails: [],
        };
    },
    mixins: [
        BigcommerceCartMixin,
        PricingMixin,
        CustomClassesMixin,
        CurrencyMixin,
        SubscriptionDetailsMixin,
        MutationsCheckerMixin,
    ],
    components: {
        Teleport,
        "prepaid-subscription": PrepaidSubscription,
        "subscribe-and-save": SubscribeAndSave,
    },
    computed: {
        /**
         * @returns {boolean} Indicator is the Cart Page is enabled in the adapter settings.
         */
        isEnabledInSettings() {
            const isEnabled = this.settings?.pages?.cart?.enabled || true;
            this.$logger.debug(`Cart page is ${isEnabled ? "enabled" : "disabled"}.`);
            return isEnabled;
        },
        /**
         * @returns {boolean} Indicator if cart has subscription items in it.
         */
        isSubscriptionCart() {
            const isSubCart = this.bigcommerce.storefront.cart.hasSubscription;
            this.$logger.debug(
                `Cart | Cart type is ${isSubCart ? "subscription" : "one-time only"}.`
            );
            return isSubCart;
        },
    },
    methods: {
        /**
         * Map the store action for saving a subscription.
         */
        ...mapActions(["removeSubItem"]),
        /**
         * Map the store getters.
         */
        ...mapGetters({ currentCartID: "cartID" }),
        ...mapMutations({ setCartCurrency: "setCartCurrency" }),
        /**.
         * Temporary template function for FAB Tax translation.
         *
         * @param {string} path The message path within the translation.
         *
         * @returns {string} Translation string based on input path
         */
        __t: function (path) {
            const path_parts = path.split(".");
            let walked_val = this.$store.getters.settings?.language?.translation;
            for (const part of path_parts) {
                try {
                    walked_val = walked_val[part];
                } catch {
                    this.$logger.warn(`tempTranslation path not found: ${path} - ${part}`);
                }
            }
            return walked_val;
        },
        /**
         * Add text to the cart line-item indicating what type of subscription it is.
         *
         * @param {Array} sub_line_list List of objects mapping DOM elements to subdata entries.
         * @param {object} cartResponse Cart response data.
         */
        addLineItemSubLabel: function (sub_line_list, cartResponse) {
            const details = [];
            const self = this;
            for (const item of sub_line_list) {
                let line_item = item.sub_data.line_item;
                const cartItem =
                    self.bigcommerce.storefront.cart.getCartItemByLineItemId(line_item);
                let productId = self.getProductIdByLineItem(line_item, cartResponse);
                if (!item.sub_data.charge_frequency) {
                    continue;
                }

                const key = `${Date.now()}.${Math.random()}`;
                const item_name_elem = self.getCustomClassElement(
                    "cart_line_item_name",
                    item.line_el
                );
                if (cartItem.subscription.isPrepaid) {
                    details.push({
                        key,
                        mode: "after",
                        target: item_name_elem,
                        isPrepaid: true,
                        props: {
                            subscription: cartItem?.rcaData?.subscriptions?.[0], //TODO update PrepaidSubscription.vue
                            showMainTitle: false,
                        },
                    });
                } else if (item?.sub_data?.shipping_frequency !== "once") {
                    details.push({
                        key,
                        mode: "append",
                        target: item_name_elem,
                        props: {
                            unit: cartItem.subscription.shipping_unit,
                            shippingFrequency: cartItem.subscription.shipping_frequency,
                            discountAmount: cartItem.subscription.discount_amount,
                            subscribeWording: cartItem.subscription.subscribe_wording,
                        },
                    });
                }
            }
            this.subscriptionDetails = details;
        },
        /**
         * Add text to the cart line-item indicating what type of subscription it is.
         *
         * @param {object} lineItemElement DOM element to start search from.
         * @returns {Array} List of objects mapping DOM elements to subdata entries.
         */
        getLineItemId: function (lineItemElement) {
            const lineItemIdAttrs = ["data-cart-itemid", "data-item-id"];
            const lineItemIdElement =
                this.getCustomClassElement("cart_line_item_id_element", lineItemElement) ??
                lineItemElement;

            for (const idAttribute of lineItemIdAttrs) {
                const lineItemId = lineItemIdElement.getAttribute(idAttribute);
                if (lineItemId) {
                    return lineItemId;
                }
            }
            return undefined;
        },
        /**
         * Locates subscriptions elements by class names and return list of DOM elements.
         *
         * @returns {Array} List of subscription DOM elements.
         */
        matchCartSubscriptionElements: function () {
            const cart_line_elems = Array.from(this.getCustomClassElements("cart_line_item"));
            const sub_data = this.$store.getters.subData;
            const update_line_list = [];
            if (cart_line_elems.length && sub_data.length) {
                for (const cart_item of cart_line_elems) {
                    const line_item_id = this.getLineItemId(cart_item);
                    const sub_line = sub_data.filter((item) => item.line_item === line_item_id);
                    if (!isEmpty(sub_line)) {
                        const line_data = {
                            price_el: null,
                            ext_price_el: null,
                            sub_data: sub_line[0],
                            quantity_el: null,
                        };
                        line_data.line_el = cart_item;
                        line_data.price_el = this.getCustomClassElement(
                            "cart_line_item_price",
                            cart_item
                        );
                        line_data.ext_price_el = this.getCustomClassElement(
                            "cart_line_item_total",
                            cart_item
                        );
                        line_data.quantity_el = this.getCustomClassElement(
                            "cart_line_item_quantity",
                            cart_item
                        );
                        update_line_list.push(line_data);
                    }
                }
            }
            // Filter to items with subscriptions then set whether the displayed cart has a subscription.
            this.hasSubscription = !!update_line_list.filter(
                (line) => line.sub_data.shipping_frequency
            ).length;
            return update_line_list;
        },
        /**
         * DOM manipulation group to re-process on cart updates.
         */
        overwriteCartDisplay: async function () {
            let has_subscription = false;
            const sub_line_list = this.matchCartSubscriptionElements();
            this.overwriteCartTotalsLabels();
            if (this.hasSubscription) {
                has_subscription = true;
                const cartResponse = await this.getCartResponse();
                this.addLineItemSubLabel(sub_line_list, cartResponse);
                try {
                    await this.updateCartLinePrices(sub_line_list, cartResponse);
                    this.updateCartTotalPrices();
                } catch (e) {
                    this.$logger.warn(`Unable to update Cart prices:\n${e}`);
                }
            }

            this.hideForSubscription(has_subscription);
        },
        /**
         * Overwrite line item price element.
         *
         * @param {object} item Object containing line item data.
         * @returns {object} String containing the bigcommerce item price.
         */
        updateCartLinePriceElement: function (item) {
            let bc_item_price = this.Currency(item.price_el.textContent).value;
            let price;
            if (item.sub_data.discount_amount) {
                price = this.pricing.calculateItemPrice({
                    item_price: bc_item_price,
                    ...item.sub_data,
                }).value;
            }
            //update element with new price
            item.price_el.textContent = this.pricing.toPriceString(price);
            return bc_item_price;
        },
        /**
         * Overwrite line item estimated grand total element.
         *
         * @param {object} item Object containing line item data.
         * @param {string} bc_item_price String containing the bigcommerce item price.
         * @param {string} cart_data Data from current user cart.
         */
        updateCartLineEstimatedTotalElement: function (item, bc_item_price, cart_data) {
            let price = this.Currency(item.ext_price_el.textContent).value;
            if (item.sub_data.discount_amount) {
                if (bc_item_price) {
                    if (item.quantity_el) {
                        price = this.pricing.calculateLinePrice({
                            item_price: bc_item_price,
                            item_quantity: item.quantity_el.value,
                            ...item.sub_data,
                        }).value;
                    } else {
                        this.$logger.error("Cart line missing quantity value");
                    }
                } else {
                    // If there was no item price in cart page we search for it in the cart and get its line price
                    this.$logger.debug("Searching for item in cart.");
                    const productSearched = this.searchItemInCart(
                        cart_data["lineItems"],
                        item.sub_data.line_item
                    );
                    try {
                        price = this.pricing.calculateLinePrice({
                            item_price: productSearched.salePrice,
                            item_quantity: productSearched.quantity,
                            ...item.sub_data,
                        });
                    } catch {
                        this.$logger.error("Item not found in cart");
                    }
                }
            }
            //update element with new price
            item.ext_price_el.textContent = this.pricing.toPriceString(price);
        },
        /**.
         * Overwrite cart price values with subscription factored in.
         *
         * @param {Array<object>} update_line_list Objects containing pricing elements and subscription data.
         * @param {Object} cartResponse cart response object
         */
        updateCartLinePrices: function (update_line_list, cartResponse) {
            for (let i = 0; i < update_line_list.length; i++) {
                let bc_item_price = "";
                let item = update_line_list[i];
                //skip price update if no discount
                if (!item.sub_data.discount_amount) {
                    continue;
                }
                if (item.price_el) {
                    bc_item_price = this.updateCartLinePriceElement(item);
                }
                if (item.ext_price_el) {
                    this.updateCartLineEstimatedTotalElement(
                        item,
                        bc_item_price,
                        cartResponse.data[0]
                    );
                }
            }
        },
        /**
         * Search for item in the storefront cart API by comparing IDs.
         *
         * @param {object} lineItems A dictionary consisting of physical, digital and custom items inside a cart.
         * @param {number} id The Id of an Item to find.
         * @returns {object} The item we're looking for.
         */
        searchItemInCart: function (lineItems, id) {
            let found;
            for (const category in lineItems) {
                // eslint-disable-next-line eqeqeq
                found = lineItems[category].find((element) => element.id == id);
                if (found != null) {
                    return found;
                }
            }
            return found;
        },
        /**
         * Updates the existing subtotal with a discount element.
         * @param {number} cart_subtotal The current cart subtotal.
         * @param {string} searchElement String for finding custom class element.
         * @returns {number} Updated cart subtotal.
         */
        updateSubtotalWithDiscountText: function (cart_subtotal, searchElement) {
            let elementSearch = this.getCustomClassElement(searchElement);
            if (elementSearch && elementSearch.textContent) {
                const discount = this.pricing.fromString(elementSearch.textContent).value;
                discount ? (cart_subtotal -= discount) : cart_subtotal;
            } else {
                this.$logger.log(`cart ${searchElement} element not found`);
            }
            return cart_subtotal;
        },
        /**
         * Overwrite cart total price values with subscription factored in.
         */
        updateCartTotalPrices: function () {
            //sum totals
            const app = this;
            let cart_subtotal = 0;
            let result = this.getCustomClassElements("cart_line_item");
            for (const lineElem of result) {
                const itemTotalElem = this.getCustomClassElement("cart_line_item_total", lineElem);
                if (itemTotalElem) {
                    cart_subtotal += app.pricing
                        .fromString(itemTotalElem.textContent, { allPrices: true })
                        .pop().value;
                } else {
                    const price_el = this.getCustomClassElement("cart_line_item_price", lineElem);
                    const quantity_el = this.getCustomClassElement(
                        "cart_line_item_quantity",
                        lineElem
                    );
                    if (price_el && quantity_el) {
                        cart_subtotal +=
                            app.pricing.fromString(price_el.textContent, { allPrices: true }).pop()
                                .value * quantity_el.value;
                    }
                }
            }

            let cart_subtotal_text = this.pricing.toPriceString(cart_subtotal);
            //update subtotal
            result = this.getCustomClassElement("subtotal_value");
            if (result) {
                result.innerHTML = cart_subtotal_text;
            } else {
                this.$logger.error("cart subtotal element not found");
            }

            cart_subtotal = this.updateSubtotalWithDiscountText(cart_subtotal, "cart_discount");
            cart_subtotal = this.updateSubtotalWithDiscountText(
                cart_subtotal,
                "cart_coupon_applied_value"
            );

            cart_subtotal_text = this.pricing.toPriceString(cart_subtotal);

            //update total
            result = this.getCustomClassElement("grandtotal_value");
            if (result) {
                result.innerHTML = cart_subtotal_text;
            } else {
                this.$logger.error("cart total element not found");
            }
        },
        /**
         * Overwrite cart totals labels.
         */
        overwriteCartTotalsLabels: function () {
            const self = this;
            // eslint-disable-next-line jsdoc/require-jsdoc
            function updateInnerHtml(custClass, html) {
                const elem = document.getElementsByClassName(
                    self.getCustomClass(custClass, false)
                )[0];
                if (elem) {
                    elem.innerHTML = html;
                }
            }

            //estimated total header
            updateInnerHtml("header_subtotal_label", "Estimated Total");

            // tax label. Will only change when there's a tempTranslation path is available
            const taxSub = this.__t("tax.label_subscription"),
                tax = this.__t("tax.label");
            if (taxSub != null || tax != null) {
                // TODO - Review, if hasSubscription is false and tax is null,
                // will this be correct?
                updateInnerHtml("taxes_label", this.hasSubscription ? taxSub : tax);
            }
            //estimated total
            updateInnerHtml("grandtotal_label", this.$t("cart.cart_estimated_grand_total_text"));
        },
        /**
         * Create observer to watch for updates to the cart items.
         */
        registerCartItemsObserver: function () {
            this.cartItemsObserver = new MutationObserver(this.handleCartItemsObserver);
            this.$logger.debug("Cart items observer registered.");
        },
        /**
         * Start watching the cart items DOM for changes.
         */
        startCartItemsObserver: function () {
            let result = this.getCustomClassElement("cart_items");
            const options = { childList: true, subtree: true };
            if (result) {
                this.cartItemsObserver.observe(result, options);
                this.$logger.debug("Cart totals observer started.");
            } else {
                // this is present when the cart is empty
                this.$logger.warn("Cart totals elements not found.");
            }
        },
        /**
         * Stop watching the cart items DOM for changes.
         */
        stopCartItemsObserver: function () {
            this.cartItemsObserver.disconnect();
            this.$logger.debug("Cart items observer stopped.");
        },
        /**
         * Cart observer callback to run when DOM changes are observed.
         * Listens for a node added to page with the cart_items custom class mutation.
         *
         * @param {Array} mutations Value from DOM MutationObserver handler.
         */
        handleCartItemsObserver: function (mutations) {
            if (this.checkMutations(mutations, "cart_items")) {
                this.refreshCart();
            }
        },
        /**
         * Create observer to watch for updates to the cart totals.
         */
        registerCartTotalsObserver: function () {
            this.cartTotalsObserver = new MutationObserver(this.handleCartTotalsObserver);
            this.$logger.debug("Cart totals observer registered.");
        },
        /**
         * Start watching the cart totals DOM for changes.
         */
        startCartTotalsObserver: function () {
            let result = this.getCustomClassElement("cart_totals");
            const options = { childList: true, subtree: true };
            if (result) {
                this.cartTotalsObserver.observe(result, options);
                this.$logger.debug("Cart totals observer started.");
            } else {
                // this happens when the cart is empty
                this.$logger.warn("Cart totals elements not found.");
            }
        },
        /**
         * Stop watching the cart totals DOM for changes.
         */
        stopCartTotalsObserver: function () {
            this.cartTotalsObserver.disconnect();
            this.$logger.debug("Cart totals observer stopped.");
        },
        /**
         * Cart totals observer callback to run when DOM changes are observed.
         * Listens for a node added to page with the cart class.
         *
         * @param {*} mutations Mutations.
         */
        handleCartTotalsObserver: function (mutations) {
            const added_nodes = mutations
                .filter((m) => m.addedNodes.length)
                .map((m) => m.addedNodes);
            if (added_nodes.length) {
                this.genericRemove();
                this.addCustomClasses();
                this.hideForSubscription(this.hasSubscription);
            }
        },
        /**
         * Create observer to watch for the creation/update of the delete item modal.
         */
        registerDeleteItemModalObserver: function () {
            this.deleteItemObserver = new MutationObserver(this.handleDeleteItemModalObserver);
            this.$logger.debug("Delete item observer registered.");
        },
        /**
         * Start watching the DOM for delete item modal.
         */
        startDeleteItemModalObserver: function () {
            const result = document.getElementsByTagName("BODY");
            if (result) {
                this.deleteItemObserver.observe(result[0], { attributes: true });
                this.$logger.debug("Delete item observer started.");
            } else {
                this.$logger.error("Delete item element not found (body).");
            }
        },
        /**
         * Delete item modal observer callback to run when the body receives the swal2-container class.
         * Sets the cart line id that is being modified and registers the subscription removal on confirmation button.
         *
         *  @param {Array.<MutationRecord>} mutation A list of modifications to the body.
         */
        handleDeleteItemModalObserver: function (mutation) {
            if (mutation.length && mutation[0].target.classList.contains("swal2-shown")) {
                const confirm_elem = mutation[0].target.getElementsByClassName("swal2-confirm")[0];
                const self = this;
                this.$(confirm_elem).on({
                    /**
                     *
                     */
                    click: function () {
                        const cart_id = self.currentCartID(),
                            line_id = self.cartRemoveLineID;
                        try {
                            self.removeSubItem({ cart_id, line_id });
                        } catch (e) {
                            this.$logger.warn(
                                `Unable to delete line item ${line_id} from cart ${cart_id}`,
                                e
                            );
                        }
                    },
                });
            }
        },
        /**
         *
         */
        setCartLineIDRemoveButtons: function () {
            const self = this;
            const cartLineElements = document.querySelectorAll(
                this.getCustomClass("cart_line_item")
            );
            cartLineElements.forEach((cartLineElement) => {
                const removeElement = cartLineElement.getElementsByClassName(
                    this.getCustomClass("cart_remove", false)
                )[0];
                const lineItemId = this.getLineItemId(cartLineElement);
                this.$(removeElement).on("click", () => {
                    if (removeElement.querySelector("a")) {
                        self.removeSubItem({ cart_id: self.currentCartID(), line_id: lineItemId });
                        return;
                    }
                    self.cartRemoveLineID = lineItemId;
                });
            });
        },
        /**
         * Add custom classes to DOM elements.
         */
        addCustomClasses: function () {
            this.addCustomClassesToGroup("ALL");
            this.addCustomClassesToGroup("CART", {
                discountText: this.$store_objects?.cart?.discount?.formatted,
                subtotalText: this.$store_objects?.cart?.sub_total?.formatted,
            });
        },
        /**
         *
         */
        refreshCart: function () {
            this.stopCartItemsObserver();
            this.genericRemove();
            this.addCustomClasses();
            this.overwriteCartDisplay();
            this.setCartLineIDRemoveButtons();
            this.startCartItemsObserver();
        },
    },
    /**
     *
     */
    created() {},
    /**
     *
     */
    async mounted() {
        this.$logger.log("Cart page mounted");
        await this.bigcommerce.getUpdatedCart();
        if (this.isEnabledInSettings && this.bigcommerce.storefront.cart.isRechargeCart) {
            this.$logger.debug("Cart page running in ReCharge Checkout Mode.");
            // initial load DOM actions
            this.genericRemove();
            this.addCustomClasses();
            this.overwriteCartDisplay();
            this.setCartLineIDRemoveButtons();

            // register observers
            this.registerCartItemsObserver();
            this.registerDeleteItemModalObserver();
            this.registerCartTotalsObserver();

            // observers for future actions
            this.startCartItemsObserver();
            this.startDeleteItemModalObserver();
            this.startCartTotalsObserver();
        }
    },
};
</script>
<style></style>
