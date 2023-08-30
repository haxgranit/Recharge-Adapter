// noinspection LongLine

import { MergedObject } from "@/core/utils/object-helper";

/**
 * @type {number} The number of minutes to cache a call to ReCharge CDN or the backend settings.
 */
export const CACHE_INTERVAL = 5; // in minutes

/**
 * Merges the settings sources by priority (1 = highest priority).
 * @param {object} options Root object.
 * @param {object} options.rcaSettings Object from RCA_SETTINGS variable.
 * @param {object} options.clientLocales Object from RCA_LOCALES variable.
 * @param {object} options.rechargeCdn Widget_settings from ReCharge CDN.
 * @param {object} options.adapterBackend Object from Adapter Query Store route.
 * @param {object} options.timestamps Object with human-readable timestamps of when the settings
 * were last called.
 * @param {object} options.defaultLocaleTranslations Default translation object from the locales
 * folder.
 * @returns {*}
 */
export const settingsMapPriority = ({
    rcaSettings,
    clientLocales,
    rechargeCdn,
    adapterBackend,
    timestamps,
    defaultLocaleTranslations,
}) => {
    return MergedObject.byPriority({
        1: timestamps,
        2: rcaSettings,
        3: clientLocales,
        4: rechargeCdn,
        5: adapterBackend,
        6: defaultLocaleTranslations,
    });
};

/**
 * @typedef {object} adapterSettings
 * @property {boolean|null} enabled - Is the adapter application enabled?
 * @property {string} currency - The currency to use for this store.
 *
 * @property {object} pages - Storefront Page specific settings.
 *
 * @property {object} pages.cart - Cart Page specific settings.
 * @property {boolean} pages.cart.enabled - Is the adapter enabled for the cart page?
 * @property {object} pages.cart.checkout_button - Cart Page specific settings for the checkout button.
 * @property {boolean} pages.cart.checkout_button.enabled - Is the adapter checkout button enabled for the Cart Page?
 *
 * @property {object} pages.product - Product Page specific settings.
 * @property {object} pages.product.enabled - Is the adapter enabled for the product page?
 * @property {('button'|'checkbox'|'radio')} pages.product.form_type - The type of subscription form to use.
 * @property {('onetime'|'subscription')} pages.product.first_option - Indicator of the first listed purchase option.
 * @property {boolean} pages.product.select_subscription_first - Boolean indicating whether subscription option is selected by default.
 * @property {boolean} pages.product.tooltip_enabled - For whether the popup should be shown or not.
 * @property {boolean} pages.product.show_learnmore - Boolean indicating whether "Learn more" section is displayed.
 * @property {boolean} pages.product.show_poweredby - Boolean indicating whether "Powered by" section is displayed.
 * @property {boolean} pages.product.show_subscription_details - Boolean indicating whether subscription details are displayed.
 * @property {boolean} pages.product.show_subscription_details_icon - Boolean indicating whether Recharge icon is displayed in subscription details.
 * @property {boolean} pages.product.preview_modal - Should the preview modal show when an user buys a product.
 * @property {('black'|'white')} pages.product.widget_icon - Color of the Recharge icon within the widget.
 * @property {string} pages.product.widget_template_type - TODO @zpyoung needs to fill this.
 *
 * @property {object} pages.checkout - Checkout Page specific settings.
 * @property {string} pages.checkout.checkout_url - Store's URL for doing checkout.
 * @property {boolean} pages.checkout.prefill_checkout_form - Is customer info needed for checkout page.
 *
 * @property {object} pages.home - Checkout Page specific settings.
 * @property {boolean} pages.home.enabled - Is the adapter enabled for the home page?
 *
 * @property {object} pages.collection - Checkout Page specific settings.
 * @property {boolean} pages.collection.enabled - Is the adapter enabled for collection pages?
 *
 * @property {Array<string>} pages.account - URL paths where the "Manage Subscriptions" link should be shown.
 *
 * @property {object} style - Object containing settings pertaining to widget CSS styles.
 * @property {string} style.active_color - HTML Hex code used to set the text color of a selected option.
 * @property {string} style.background_color - HTML Hex code used to set the the background color of the widget.
 * @property {string} style.font_color - HTML Hex code used to set the color of the text.
 * @property {string} style.popup_background_color - HTML Hex code used to set the background color of the popup.
 * @property {string} style.popup_link_color - HTML Hex code used to set the popup link color.
 * @property {string} style.popup_text_color - HTML Hex code used to set the popup text color.
 *
 * @property {object} bigcommerce - BigCommerce specific settings.
 * @property {string} bigcommerce.store_domain - BigCommerce store domain.
 *
 * @property {object} translations - I18n translation messages to use for the default locale.
 *
 * @property {object} translations.accounts - Translations for the account page.
 * @property {string} translations.accounts.manage_subscriptions_label - The text to used for the "Manage Subscriptions" link.
 *
 * @property {object} translations.products - Translations for the product page.
 * @property {string} translations.products.learnmore_verbiage - Display text for the learn more button.
 * @property {string} translations.products.onetime_message - Text displayed when a customer chooses to purchase the item as a onetime purchase.
 * @property {string} translations.products.subscribe_message - Text displayed when a user chooses to purchase the item as a subscription purchase item.
 * @property {string} translations.products.subscribe_without_discount_message - Text displayed when a user chooses to purchase the item as a subscription purchase item, but no discount is offered.
 * @property {string} translations.products.sub_and_save_ext_label - Additional display text for subscribe and save purchase option.
 * @property {string} translations.products.widget_deliver_every - Text preceding the available interval options for subscriptions.
 * @property {string} translations.products.how_it_works - HTML for the “How it works" section.
 * @property {string} translations.products.subscription_details_verbiage - Text displayed as a link to link to view subscription details.
 * @property {string} translations.products.shipping_interval_unit_type - Object containing translation options for shipping interval unit verbiage.
 * @property {string} translations.products.learnmore_url - URL target for the "Learn More" button.
 * @property {string} translations.products.poweredby_url - URL target for the "Powered by" button.
 * @property {string} translations.products.widget_charge_every - Display text preceding charge interval options.
 *
 * @property {object} translations.cart - Translations for the cart page.
 * @property {string} translations.cart.cart_sub_save_frequency_text - Text displayed in the cart when a user chooses to purchase the item as a subscription purchase item.
 * @property {string} translations.cart.cart_sub_frequency_text - Text displayed in the cart when a user chooses to purchase the item as a subscription purchase item, but no discount is offered.
 *
 * @property {object} backend - Settings from the adapter backend.
 * @property {boolean} backend.is_rc_staging - Indicator whether this store uses the ReCharge Staging endpoints.
 * @property {boolean} backend.all_checkouts_on_recharge - Indicator if all checkouts should go to ReCharge.
 * @property {boolean} backend.display_and_handoff_coupons - Indicator if BigCommerce coupons can be used for ReCharge checkouts.
 * @property {boolean} backend.use_bc_discounts - Indicator if BigCommerce discounts can be used for ReCharge checkouts.
 * @property {boolean} backend.stack_subandsave - Indicator if Subscribe & Save discounts should combine and stack with other BigCommerce discounts.
 * @property {boolean} backend.apply_bc_discount_to_first_order - Indicator is BigCommerce discounts should be applied to the first order of a subscription purchase.
 * @property {boolean} backend.create_coupon_for_coupon_only_cart - TODO @danny needs to add this.
 * @property {string|null} backend.updated_at - Timestamp of the last time the backend settings were updated in the database.
 *
 * @property {object} timestamps - Timestamps indicating the last time settings were pulled from their remote sources.
 * @property {string|null} timestamps.recharge - Timestamp the last time settings were pulled from the ReCharge CDN.
 * @property {string|null} timestamps.backend - Timestamp the last time settings were pulled from the Adapter Backend.
 */

/**
 * @constant {adapterSettings} Default values for adapter settings.
 */
export const defaultSettings = {
    enabled: false,
    currency: "USD",
    pages: {
        cart: {
            enabled: true,
            checkout_button: {
                enabled: true,
            },
        },
        product: {
            enabled: true,
            form_type: "button",
            first_option: "onetime",
            select_subscription_first: false,
            tooltip_enabled: false,
            show_learnmore: true,
            show_poweredby: true,
            show_subscription_details_icon: true,
            preview_modal: true,
            widget_icon: "black",
            widget_template_type: "radio",
        },
        checkout: {
            enabled: true,
            checkout_url: "https://checkout.rechargeapps.com",
            prefill_checkout_form: false,
        },
        home: {
            enabled: false,
        },
        collection: {
            enabled: false,
        },
        account: ["/account.php", "/wishlist.php"],
    },
    style: {
        active_color: "#000000",
        background_color: "#efefef",
        font_color: "#040404",
        popup_background_color: "#606060",
        popup_link_color: "#ffffff",
        popup_text_color: "#e7e7e7",
    },
    bigcommerce: {
        store_domain: window.location.origin,
    },
    translations: {
        accounts: {
            manage_subscriptions_label: "Manage Subscriptions",
        },
        products: {
            learnmore_verbiage: "Learn more...",
            onetime_message: "One-Time Purchase",
            subscribe_message: "Subscribe & Save",
            subscribe_without_discount_message: "Subscribe",
            sub_and_save_ext_label: "on every recurring order",
            widget_deliver_every: "Delivery every",
            how_it_works: `<strong>How subscriptions work</strong><br><br>Products are automatically
 delivered on your schedule.No obligation, modify or cancel your subscription anytime.`,
            subscription_details_verbiage: "Subscription Details",
            shipping_interval_unit_type:
                '{"days":"Days","month":"Month","months":"Months","week":"Week","weeks":"Weeks"}',
            learnmore_url: "http://rechargepayments.com/subscribe-with-recharge",
            poweredby_url: "http://rechargepayments.com/subscribe-with-recharge",
            widget_charge_every: "Charge every",
        },
        cart: {
            cart_sub_save_frequency_text: "Subscribe & save: Delivery every",
            cart_sub_frequency_text: "Subscribe: Delivery every",
            cart_estimated_grand_total_text: "Estimated Cart Total",
        },
    },
    backend: {
        is_rc_staging: false,
        all_checkouts_on_recharge: false,
        display_and_handoff_coupons: false,
        use_bc_discounts: false,
        stack_subandsave: true,
        apply_bc_discount_to_first_order: true,
        create_coupon_for_coupon_only_cart: false,
        updated_at: null,
    },
    timestamps: {
        recharge: null,
        backend: null,
    },
};
