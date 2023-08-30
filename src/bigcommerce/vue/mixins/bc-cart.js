import PricingMixin from "@/core/vue/mixins/pricing";

export default {
    mixins: [PricingMixin],
    methods: {
        /**
         * Get a cart response from BigCommerce.
         *
         * @returns {Promise} Promise of request to BC storefront cart API.
         */
        getCartResponse: function () {
            const storefrontCartURL = new URL(
                "/api/storefront/carts",
                this.$store.getters.settings.bigcommerce.store_domain
            );
            storefrontCartURL.searchParams.append(
                "include",
                "lineItems.digitalItems.options,lineItems.physicalItems.options"
            );
            return this.$axios.get(storefrontCartURL.href);
        },
        /**
         * Create cart with line item or add a new product if a cart already exist.
         *
         * @param {number} productId The ID of a product.
         * @param {number} quantity How many products in this cart with that ID.
         * @param {object} modifiers Modifiers set for this product.
         * @returns {Promise} Promise of Request to BC storefront cart API.
         */
        addItemToCart: function (productId, quantity, modifiers = null) {
            let line_item = {
                productId: productId,
                quantity: quantity,
            };

            if (modifiers) {
                //Renaming the keys of the object
                let options = modifiers.map(function (obj) {
                    obj["optionId"] = obj["id"];
                    obj["optionValue"] = obj["value"];
                    delete obj["id"];
                    delete obj["value"];
                    return obj;
                });
                Object.assign(line_item, { optionSelections: options });
            }
            return this.getCartResponse().then((response) => {
                let cartId = response.data.length > 0 ? response.data[0].id : false;
                if (cartId) {
                    return this.addLineItemToCart(cartId, line_item);
                }
                return this.createCartWithLineItem(line_item);
            });
        },
        /**
         * Add a new product to a existing cart.
         *
         * @param {string} cartId The ID of a cart.
         * @param {object} line_item Object of line_item to be passed to the storefront BC endpoint.
         * @returns {Promise} Promise of Request to BC storefront cart API.
         */
        addLineItemToCart: function (cartId, line_item) {
            const storefrontCartURL = new URL(
                `/api/storefront/carts/${cartId}/items`,
                this.$store.getters.settings.bigcommerce.store_domain
            );
            storefrontCartURL.searchParams.append(
                "include",
                "lineItems.digitalItems.options,lineItems.physicalItems.options"
            );
            return this.$axios
                .post(storefrontCartURL.href, {
                    lineItems: [line_item],
                })
                .catch((error) => {
                    this.$logger.error(error);
                });
        },
        /**
         * Creates a cart with a line item.
         *
         * @param {object} line_item Object of line_item to be passed to the storefront BC endpoint.
         * @returns {Promise} Promise of Request to BC storefront cart API.
         */
        createCartWithLineItem: function (line_item) {
            const storefrontCartURL = new URL(
                "/api/storefront/carts",
                this.$store.getters.settings.bigcommerce.store_domain
            );
            storefrontCartURL.searchParams.append(
                "include",
                "lineItems.digitalItems.options,lineItems.physicalItems.options"
            );
            return this.$axios
                .post(storefrontCartURL.href, {
                    lineItems: [line_item],
                })
                .catch((error) => {
                    this.$logger.error(error);
                });
        },
        /**
         * Determine if a cart contains subscription items.
         *
         * @param {object} cart_data BC storefront cart data.
         * @param {Array} sub_data Vuex subdata state.
         * @returns {boolean} Whether the cart contains subscription items.
         */
        cartHasSubscription: function (cart_data, sub_data) {
            // Build list of cart line ids from bc cart item types
            const item_types = ["physicalItems", "digitalItems", "customItems"];
            let cart_line_ids = [];
            for (let i = 0; i < item_types.length; i++) {
                cart_line_ids = cart_line_ids.concat(
                    cart_data.lineItems[item_types[i]].map((line) => line.id)
                );
            }
            //Only keep sub entries that are subscriptions
            sub_data = sub_data.filter((sub) => sub.discount_type || sub.charge_frequency);
            // Build list of sub line ids from subscription data
            const sub_line_ids = sub_data.map((sub) => sub.line_item);
            return cart_line_ids.some((line_id) => sub_line_ids.includes(line_id));
        },
        /**
         * Check whether a BC cart is taxable.
         * Checks taxable status based on the isTaxIncluded item flag and whether the BC cart baseAmount equals the
         * sum of BC cart item extendedSalePrice.
         *
         * @param {object} cart_data BC storefront cart data.
         * @returns {boolean} Whether the cart is taxable or not.
         */
        cartTaxable: function (cart_data) {
            //if items inclusive of tax always tax included. Also if display settings are tax inclusive.
            let tax_included = cart_data.isTaxIncluded ? cart_data.isTaxIncluded : false;
            let items_subtotal = 0;
            const item_types = ["physicalItems", "digitalItems", "customItems"];
            for (let i = 0; i < item_types.length; i++) {
                items_subtotal += cart_data.lineItems[item_types[i]].reduce(function (prev, curr) {
                    return parseFloat(prev) + parseFloat(curr.extendedSalePrice);
                }, 0);
            }
            items_subtotal = items_subtotal.toFixed(2);
            // Set to true if the sum of salePrice items does not match cart baseAmount
            if (items_subtotal !== parseFloat(cart_data.baseAmount).toFixed(2)) {
                tax_included = true;
            }
            return !tax_included;
        },
        /**
         * @param {string} line_item_id The ID of an item in a cart.
         * @param {object} cartResponse The cart response data.
         * @returns {object} The productID of an Item.
         */
        getProductIdByLineItem: function (line_item_id, cartResponse) {
            const cartData = cartResponse.data[0];
            const item_types = ["physicalItems", "digitalItems", "customItems"];
            for (const item_type of item_types) {
                let line_item = cartData.lineItems[item_type].find(
                    (item) => item.id === line_item_id
                );
                if (line_item) {
                    return line_item.productId;
                }
            }
            return undefined;
        },
        /**
         *
         * @param {string} line_item_id Line item ID.
         * @returns {object} Line item object from BC Cart.
         */
        getLineItemDetails: async function (line_item_id) {
            const cartData = (await this.getCartResponse()).data[0];
            const item_types = ["physicalItems", "digitalItems", "customItems"];
            //Looping the cart
            for (const item_type of item_types) {
                //Searching on all of item_types
                let cartItem = cartData.lineItems[item_type].find(
                    (item) => item.id === line_item_id
                );
                if (cartItem) {
                    return cartItem;
                }
            }
            return undefined;
        },
        /**
         * Get price of line item, it checks for discounts and return the price.
         *
         * @param {string} line_item_id Line item ID.
         * @returns {number} Price.
         */
        getLineItemPrice: async function (line_item_id) {
            const line_item = await this.getLineItemDetails(line_item_id);
            return line_item.salePrice;
        },
    },
};
