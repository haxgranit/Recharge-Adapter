import { BigcommerceCart, BigcommerceCustomer } from "@/bigcommerce/utils";
import { cloneDeep } from "lodash";
import { mapGetters } from "vuex";
import { RechargeMixin } from "@/core/utils";

export const appSupportedPageTypes = {
    product: "Product",
    account: "Account",
    multiple_products: "Multiple Products",
    cart: "Cart",
    checkout: "Checkout",
    default: "Default",
};

export const bigcommercePageTypeMap = {
    product: ["product"],
    account: [
        "account_addressbook",
        "account_downloaditem",
        "account_inbox",
        "editaccount",
        "account_orderstatus",
        "account_order",
        "account_recentitems",
        "account_paymentmethods",
        "account_saved_return",
        "account_returns",
        "wishlists",
        "add-wishlist",
        "wishlist",
    ],
    multiple_products: ["category", "brand", "brands"],
    cart: ["cart"],
    checkout: ["checkout"],
    default: [
        "createaccount_thanks",
        "createaccount",
        "forgotpassword",
        "login",
        "getnewpassword",
        "compare",
        "account_ordersinvoice_print",
        "blog",
        "blog_post",
        403,
        404,
        "error",
        "default",
        "page",
        "page_contact_form",
        "giftcertificates_balance",
        "giftcertificates",
        "giftcertificates_redeem",
        "search",
        "sitemap",
        "rss",
        "newsletter_subscribe",
        "unsubscribe",
        "hibernation",
    ],
};

export default {
    /**
     * @param {object} Vue - The Vue Object.
     * @param {object} root0 An object containing the next attributes.
     * @param {object} root0.storeObjectsData The data of objects in vuex store.
     */
    install(Vue, { storeObjectsData }) {
        Vue.mixin({
            mixins: [RechargeMixin],
            /**
             *
             */
            beforeCreate() {
                this.$store_objects = storeObjectsData || {};
            },
            /**
             *
             */
            computed: {
                ...mapGetters({ subscriptionData: "currentSubData" }),
                /**
                 *
                 *@returns {*} A key.
                 */
                lsKey: function () {
                    return `${this.storeHash}-rca-key`;
                },
            },
            /**
             *Initialize the data for the object.
             *@returns {object} The initialized data.
             */
            data() {
                const app = this;
                return {
                    $store_objects: {},
                    storeHash: app.$store_objects.store_hash,
                    store_hash: app.$store_objects.store_hash,
                    currentCartId: app.$store_objects.cart_id,
                    app: {},
                };
            },
            /**
             * Set up vuex to add sub data
             *  create BigCommerceCart object
             *  set up storefront cart and customer info
             *  supply function for updated cart and for getting pagetype
.
             */
            created() {
                const app = this;
                const getFromVuex = this.$store.getters;
                const bigcommerceCartHelper = new BigcommerceCart({
                    subscriptionDataGetter: () => getFromVuex.subData,
                    rcaProductData: app.$store_data.RCA_PRODUCT_DATA,
                    domain: app.recharge.domain || window.location.hostname,
                    subscriptionCheckoutURL: app.recharge.subscriptionCheckoutURL,
                    weightUnits: app.$store_data?.RCA_STORE_DATA?.weight_units,
                    themeObjectData: app.$store_objects,
                    allCheckoutsOnRecharge:
                        getFromVuex.settings?.backend?.all_checkouts_on_recharge,
                    currencySettings: app.currencySettings,
                });
                this.bigcommerce = {
                    storefront: {
                        cart: bigcommerceCartHelper,
                        customer: new BigcommerceCustomer({
                            app_client_id: process.env.CURRENTCUSTOMER_APP_CLIENT_ID,
                        }),
                    },
                    /**.
                     * Async function sets up the cart as soon as we can by using getCheckoutData()
                     * update subdata to match cart
                     *
                     * @returns {object} current cart data
                     */
                    getUpdatedCart: async () => {
                        const cartData = await bigcommerceCartHelper.getCheckoutData();
                        app.$store.commit("setCartID", cartData.cartId);
                        const subdata = cloneDeep(cartData.subscriptionData);
                        const updatedSubData = cartData.allLineItems.map((item) => {
                            /**
                             * Search subdata for element that matches the cart line-item's line-item id and product
                             * id or an element that is missing a line-item id but has the same product id as the cart
                             * line-item also check that subItem's cart id is not for another cart.
                             */
                            const foundSubItem = subdata.find(
                                (subItem) =>
                                    (item.id === subItem.line_item || !subItem.line_item) &&
                                    subItem.productID === item.productId &&
                                    (subItem.cartid === cartData.cartId || !subItem.cartid)
                            );
                            // If element is found in subdata update line-item and cart id properties and return element
                            if (foundSubItem) {
                                foundSubItem.line_item = item.id;
                                foundSubItem.cartid = cartData.cartId;
                                return foundSubItem;
                            }
                            // Return a new onetime subdata element if no other subdata element is found for the cart line-item
                            return {
                                cartid: cartData.cartId,
                                line_item: item.id,
                                shipping_unit: null,
                                shipping_frequency: null,
                                charge_frequency: null,
                                discount_type: null,
                                discount_amount: null,
                                storefront_purchase_options: null,
                                productID: item.productId,
                                properties: null,
                            };
                        });
                        app.$store.dispatch("replaceSubData", updatedSubData);
                        return cartData;
                    },
                    /**
                     * Get the current page type.
                     * @returns {object} The supported page types.
                     */
                    get currentPageType() {
                        const currentBigcommercePage = app.$store_objects?.page_type;
                        for (const pageType in bigcommercePageTypeMap) {
                            if (
                                bigcommercePageTypeMap[pageType].some(
                                    (bcType) => bcType === currentBigcommercePage
                                )
                            ) {
                                return appSupportedPageTypes[pageType];
                            }
                        }
                        return appSupportedPageTypes.default;
                    },
                };
            },
        });
    },
};
