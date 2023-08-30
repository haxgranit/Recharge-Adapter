/**
 * Mapping table.  Sets the destination object path and the
 * source input path.  Used to pass into the 'remap' function
 * to build a new object with the new structure
 * https://coda.io/d/BC-CP-Specs_ds6Ro52Tfy_/Settings-Mapping_subgB#_luncA
.
 */
const keys = {
    "accounts.manage_subscriptions_label": {
        clientLocales: "accounts.manage_subscriptions_label",
    },
    "products.how_it_works": {
        clientLocales: "products.how_it_works",
    },
    "products.learnmore_url": {
        clientLocales: "products.learnmore_url",
    },
    "products.learnmore_verbiage": {
        clientLocales: "products.learn_more_link",
    },
    "products.onetime_message": {
        clientLocales: "products.one_time_purchase_label",
    },
    "products.poweredby_url": {
        clientLocales: "products.poweredby_url",
    },
    "products.translations": {
        clientLocales: "products.shipping_interval_unit_type",
    },
    "products.sub_and_save_ext_label": {
        clientLocales: "products.subscribe_and_save_extended_label",
    },
    "products.subscribe_message": {
        clientLocales: "products.subscribe_and_save_label",
    },
    "products.subscribe_without_discount_message": {
        clientLocales: "products.subscription_label",
    },
    "products.subscription_details_verbiage": {
        clientLocales: "products.subscriptionDetailsLabel",
    },
    "products.widget_charge_every": {
        clientLocales: "products.widget_charge_every",
    },
    "products.widget_deliver_every": {
        clientLocales: "products.subscribe_and_save_frequency_label",
    },
    "cart.cart_sub_frequency_text": {
        clientLocales: "cart.cart_sub_frequency_text",
    },
    "cart.cart_sub_save_frequency_text": {
        clientLocales: "cart.cart_sub_save_frequency_text",
    },
};

const keyEntries = Object.entries(keys);

/**
 * @param {object} keys The keys we have originally.
 * @param {object} lookup The value we looked for.
 * @returns {object}
 */
function build(keys, lookup) {
    return keys.reduce((acc, [key, values]) => {
        acc[key] = values[lookup];
        return acc;
    }, {});
}

export const settingsMapping = {
    clientLocales: build(keyEntries, "clientLocales"),
};

export default settingsMapping;
