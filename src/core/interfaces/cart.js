import axios from "axios";
import { BigcommerceCartMixin } from "@/bigcommerce/vue/mixins";
import { PricingHelper } from "@/core/vue/mixins";
import {
    makeVM,
    SubscriptionInterface as subscription,
    CheckoutInterface,
} from "@/core/interfaces";
import { BigcommerceCart } from "@/bigcommerce/utils";

/**
 * Gets the current BC cart data.
 *
 * @returns {Promise<object>} The current cart in BC format.
 */
async function getCurrentCart() {
    const opts = {
        $axios: axios,
    };
    const vm = makeVM(BigcommerceCartMixin, opts);
    const cart_response = await vm.getCartResponse();
    if (cart_response && cart_response.data && cart_response.data.length) {
        return cart_response.data[0];
    }
    throw Error("No cart found.");
}

/**
 * Check if the the current cart or a specified cart has a subscription.
 *
 * @param {object} [cart_data=false] A specific BC cart object as returned from the Storefront API.
 * @returns {Promise<boolean>} Whether the cart has a subscription.
 */
function hasSubscription(cart_data = false) {
    const cartHelper = helper();
    cartHelper.cartId = cart_data.id;
    return cartHelper.hasSubscription;
}

/**
 * Helper function which returns the total_price field from a checkout payload.
 *
 * @returns {Promise<number>} The total_price for the current cart.
 */
async function helperCurrentCartTotal() {
    const subscription_iface = subscription;
    const checkout_iface = CheckoutInterface;
    const cart_data = await getCurrentCart();
    const subscription_data = await subscription_iface.getSubscriptions({
        cart_id: cart_data.id,
    });
    const payload = checkout_iface.createPayload(cart_data, subscription_data);
    return payload.total_price;
}

/**
 * Helper function which returns an item price for a cart line item.
 *
 * @param {string} line_id A cart line id that exists in the current cart.
 * @returns {Promise<number>} The item price for the cart line.
 */
async function helperCurrentCartLineItemPrice(line_id) {
    const cart_data = await getCurrentCart();
    const item_types = ["physicalItems", "digitalItems", "customItems"];
    let cart_line = false;
    for (let i = 0; i < item_types.length; i++) {
        for (let j = 0; j < cart_data.lineItems[item_types[i]].length; j++) {
            if (cart_data.lineItems[item_types[i]][j].id === line_id) {
                cart_line = cart_data.lineItems[item_types[i]][j];
                break;
            }
        }
    }
    if (!cart_line) {
        throw Error(`Cart line not found in current cart: ${line_id}`);
    }

    const subscription_iface = subscription;
    const subscription_data = await subscription_iface.getSubscriptions(cart_data.id, cart_line.id);

    if (!subscription_data.length) {
        return cart_line.salePrice;
    }

    return new PricingHelper().calculateItemPrice({
        item_price: cart_line.salePrice,
        ...subscription_data[0],
    }).value;
}

/**
 * @param {string} rechargeDomain The store's domain from recharge.
 * @param {string} checkoutUrl The Checkout URL.
 * @returns {object} A bigcommerce cart.
 */
function helper(rechargeDomain, checkoutUrl) {
    // const vuex = makeStoreVM({ getters: ["currentSubData"] });
    const rca_data = typeof RCA_DATA !== "undefined" ? RCA_DATA : window.RCA_DATA;
    return new BigcommerceCart({
        subscriptionDataGetter: subscription.currentSubscriptionData,
        rcaProductData: rca_data.RCA_PRODUCT_DATA,
        domain: rechargeDomain,
        subscriptionCheckoutURL: checkoutUrl,
        themeObjectData: window.RCA_store_objects,
    });
}

export default {
    cartTotal: helperCurrentCartTotal,
    itemPrice: helperCurrentCartLineItemPrice,
    hasSubscription: hasSubscription,
    helper,
};
