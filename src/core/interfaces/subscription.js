import store from "@/core/vue/store";
import { camelToSnake } from "@/core/interfaces/camel_snake_keys";

/**
 * Adds a subscription to the vuex store.
 *
 * @param {object} subscription_data Subscription data in adapter format.
 * @returns {Promise<boolean>} Returns true if subscription saved.
 */
function addSubscription(subscription_data) {
    const subExists = store.getters.subExists({
        cartid: subscription_data.cartid,
        line_item: subscription_data.line_item,
    });
    return new Promise((resolve, reject) => {
        if (subExists) {
            reject(
                new Error(
                    `Subscription already exists for cart:${subscription_data.cartid}, line: ${subscription_data.line_item}`
                )
            );
        }
        resolve(setSubscription(subscription_data));
    });
}

/**
 * Get and return subscription data from vuex store.
 *
 * @param {string=} cart_id BC cart ID to get subscriptions for.
 * @param {string=} line_id BC cart line ID to get subscription for.
 * @returns {Promise<object>} Subscription data in vuex storage format.
 */
function getSubscriptions(cart_id = "", line_id = "") {
    return store.dispatch("getSubscriptions", { cart_id: cart_id, line_id: line_id });
}

/**
 * @returns {object} CurrentSubData.
 */
function currentSubscriptionData() {
    return store.getters.currentSubData;
}

/**
 * Replaces subscription in the vuex store.
 *
 * @param {object} subscription_data Subscription data in adapter format.
 * @returns {Promise<boolean>} Returns true if subscription updated.
 */
function updateSubscription(subscription_data) {
    const subExists = store.getters.subExists({
        cartid: subscription_data.cartid,
        line_item: subscription_data.line_item,
    });
    return new Promise((resolve, reject) => {
        if (!subExists) {
            reject(
                new Error(
                    `Subscription not found for cart:${subscription_data.cartid}, line: ${subscription_data.line_item}`
                )
            );
        }
        resolve(setSubscription(subscription_data));
    });
}

/**
 * Replaces or adds subscription in the vuex store.
 *
 * @param {object} subscription_data Subscription data in adapter format.
 * @returns {Promise<boolean>} Returns true if subscription updated.
 */
function setSubscription(subscription_data) {
    return new Promise((resolve, reject) => {
        store
            .dispatch("addSubItem", subscription_data)
            .then(() => {
                resolve(true);
            })
            .catch((msg) => {
                reject(msg);
            });
    });
}

/**
 * Removes a saved subscription from vuex store.
 *
 * @param {string} cart_id A BC cart ID the subscription is for.
 * @param {string} line_id A BC cart line ID the subscription is for.
 * @returns {Promise<boolean>} Whether the subscription was removed.
 */
function removeSubscription(cart_id, line_id) {
    return new Promise((resolve, reject) => {
        store
            .dispatch("removeSubItem", { cart_id: cart_id, line_id: line_id })
            .then(() => {
                resolve(true);
            })
            .catch((msg) => {
                reject(msg);
            });
    });
}

/**
 *
 * @param {number} productId - ProductId.
 * @param {number} variantId - VariantId.
 * @param {object} cartData - CartData.
 * @param {object} cartData.line_items - Line_items.
 * @param {object | null} [productSubscriptionData] - ProductSubscriptionData.
 * @param {boolean} [isSubscription] - IsSubscription.
 * @param {number | null} [selectedFrequency] - SelectedFrequency.
 * @returns {Promise<boolean>} Returns true if subscription updated.
 */
function addProductToSubscriptions(
    productId,
    variantId,
    cartData,
    productSubscriptionData = null,
    isSubscription = false,
    selectedFrequency = null
) {
    let subscription_data = {
        cartid: cartData.id,
        productID: productId,
        discount_type: false,
    };
    // const cartDataSnakeCase = camelToSnake(cartData, 2);
    // eslint-disable-next-line
    for (const [k, v] of Object.entries(camelToSnake(cartData, 1).line_items)) {
        if (!subscription_data.line_item) {
            v.some((product) => {
                const productBySnakeCase = camelToSnake(product, 1);

                if (
                    productBySnakeCase.product_id === Number(productId) &&
                    productBySnakeCase.variant_id === Number(variantId)
                ) {
                    subscription_data.line_item = productBySnakeCase.id;
                    const productSubscriptionDataBySnakeCase = productSubscriptionData[0]
                        ? camelToSnake(productSubscriptionData[0], 1)
                        : camelToSnake(productSubscriptionData, 1);

                    if (productSubscriptionData && isSubscription) {
                        subscription_data.charge_frequency =
                            productSubscriptionDataBySnakeCase.charge_interval_frequency;
                        subscription_data.discount_amount =
                            productSubscriptionDataBySnakeCase.discount_amount;
                        subscription_data.discount_type =
                            productSubscriptionDataBySnakeCase.discount_type;
                        subscription_data.shipping_frequency = selectedFrequency;
                        subscription_data.shipping_unit =
                            productSubscriptionDataBySnakeCase.order_interval_unit;
                    }
                }
            });
        }
    }

    return new Promise((resolve, reject) => {
        if (!subscription_data.line_item) {
            reject(
                new Error(
                    `Product-Variant: ${productId}-${variantId} cannot be added for cart:${subscription_data.cartid}`
                )
            );
        }
        resolve(setSubscription(subscription_data));
    });
}

export default {
    addSubscription,
    getSubscriptions,
    updateSubscription,
    removeSubscription,
    addProductToSubscriptions,
    currentSubscriptionData,
};
