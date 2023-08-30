// import { MappedObject } from "@/core/utils";
import { MappedObject } from "@/core/utils/object-helper";
import { isBoolean, isEmpty, isString, isUndefined } from "lodash";

/**
 *
 */
export class AdapterSettings extends MappedObject {
    /**
     *
     */
    constructor() {
        super();
        this.transformers = [
            // Convert Application enabled to true or false.
            this._booleanStringTransformer("enabled"),
            // Convert Product Page enabled to true or false.
            {
                condition: this.condition("pages.product.enabled", (i) => !isBoolean(i)),
                transform: this._pageEnabledTransformer("product"),
            },
            // Convert Home Page enabled to true or false.
            {
                condition: this.condition("pages.home.enabled", (i) => !isBoolean(i)),
                transform: this._pageEnabledTransformer("home"),
            },
            // Convert Collection Page enabled to true or false.
            {
                condition: this.condition("pages.collection.enabled", (i) => !isBoolean(i)),
                transform: this._pageEnabledTransformer("collection"),
            },
            // Create ReCharge CDN values for cart_sub_save_frequency_text.
            {
                condition: () =>
                    isUndefined(this.get("cart.cart_sub_save_frequency_text")) &&
                    this.get("subscribe_message") &&
                    this.get("widget_deliver_every"),
                transform: () =>
                    this.transform(
                        "cart.cart_sub_save_frequency_text",
                        () =>
                            `${this.get("subscribe_message")}: "${this.get("widget_deliver_every")}`
                    ),
            },
            // Create ReCharge CDN values for cart_sub_frequency_text.
            {
                condition: () =>
                    isUndefined(this.get("cart.cart_sub_frequency_text")) &&
                    this.get("subscribe_message") &&
                    this.get("widget_deliver_every"),
                transform: () =>
                    this.transform(
                        "cart.cart_sub_frequency_text",
                        () =>
                            `${this.get("subscribe_without_discount_message")}: "${this.get(
                                "widget_deliver_every"
                            )}`
                    ),
            },
            // Convert boolean strings to booleans
            this._booleanStringTransformer("pages.product.select_subscription_first"),
            this._booleanStringTransformer("pages.product.tooltip_enabled"),
            this._booleanStringTransformer("pages.product.show_learnmore"),
            this._booleanStringTransformer("pages.product.show_poweredby"),
            this._booleanStringTransformer("pages.product.show_subscription_details"),
            this._booleanStringTransformer("pages.product.show_subscription_details_icon"),
            this._urlSchemaTransformer("bigcommerce.store_domain"),
        ];
        this.map = {
            enabled: {
                rechargeCdn: "published",
                rcaSettings: "enabled",
            },
            currency: {
                rcaSettings: "currency",
                adapterBackend: "currency",
            },
            pages: {
                cart: {
                    enabled: {
                        rcaSettings: "pages.cart.enabled",
                    },
                    checkout_button: {
                        rcaSettings: "pages.cart.checkout_button",
                    },
                },
                product: {
                    enabled: {
                        rechargeCdn: "display_on",
                        rcaSettings: "pages.product.enabled",
                    },
                    form_type: {
                        rechargeCdn: "form_type",
                        rcaSettings: "pages.product.form_type",
                    },
                    first_option: {
                        rechargeCdn: "first_option",
                        rcaSettings: "pages.product.first_option",
                    },
                    select_subscription_first: {
                        rechargeCdn: "select_subscription_first",
                        rcaSettings: "pages.product.select_subscription_first",
                    },
                    tooltip_enabled: {
                        rechargeCdn: "show_subscription_details",
                        rcaSettings: "pages.product.tooltip_enabled",
                    },
                    show_learnmore: {
                        rechargeCdn: "show_learnmore",
                        rcaSettings: "pages.product.show_learnmore",
                    },
                    show_poweredby: {
                        rechargeCdn: "show_poweredby",
                        rcaSettings: "pages.product.show_poweredby",
                    },
                    show_subscription_details_icon: {
                        rechargeCdn: "show_subscription_details_icon",
                        rcaSettings: "pages.product.show_subscription_details_icon",
                    },
                    preview_modal: {
                        rcaSettings: "pages.product.preview_modal",
                    },
                    widget_icon: {
                        rechargeCdn: "widget_icon",
                        rcaSettings: "pages.product.widget_icon",
                    },
                    widget_template_type: {
                        rechargeCdn: "widget_template_type",
                        rcaSettings: "pages.product.widget_template_type",
                    },
                },
                checkout: {
                    enabled: {
                        rcaSettings: "pages.checkout.enabled",
                    },
                    checkout_url: {
                        default: "https://checkout.rechargeapps.com",
                        rcaSettings: "pages.checkout.checkout_url",
                    },
                    prefill_checkout_form: {
                        default: false,
                        adapterBackend: "settings.prefill_checkout_form",
                        rcaSettings: "pages.checkout.prefill_checkout_form",
                    },
                },
                home: {
                    enabled: {
                        rechargeCdn: "display_on",
                        rcaSettings: "pages.home.enabled",
                    },
                },
                collection: {
                    enabled: {
                        rechargeCdn: "display_on",
                        rcaSettings: "pages.collection.enabled",
                    },
                },
                account: {
                    rcaSettings: "pages.account",
                },
            },
            style: {
                active_color: {
                    rechargeCdn: "active_color",
                    rcaSettings: "style.active_color",
                },
                background_color: {
                    rechargeCdn: "background_color",
                    rcaSettings: "style.background_color",
                },
                font_color: {
                    rechargeCdn: "font_color",
                    rcaSettings: "style.font_color",
                },
                popup_background_color: {
                    rechargeCdn: "popup_background_color",
                    rcaSettings: "style.popup_background_color",
                },
                popup_link_color: {
                    rechargeCdn: "popup_link_color",
                    rcaSettings: "style.popup_link_color",
                },
                popup_text_color: {
                    rechargeCdn: "popup_text_color",
                    rcaSettings: "style.popup_text_color",
                },
            },
            bigcommerce: {
                store_domain: {
                    rcaSettings: "bigcommerce.store_domain",
                    adapterBackend: "shop_url",
                },
            },
            translations: {
                accounts: {
                    manage_subscriptions_label: {
                        clientLocales: "accounts.manage_subscriptions_label",
                    },
                },
                products: {
                    learnmore_verbiage: {
                        rechargeCdn: "learnmore_verbiage",
                        clientLocales: "learn_more_link",
                    },
                    onetime_message: {
                        rechargeCdn: "onetime_message",
                        clientLocales: "products.one_time_purchase_label",
                    },
                    subscribe_message: {
                        rechargeCdn: "subscribe_message",
                        clientLocales: "products.subscribe_and_save_label",
                    },
                    subscribe_without_discount_message: {
                        rechargeCdn: "subscribe_without_discount_message",
                        clientLocales: "products.subscription_label",
                    },
                    sub_and_save_ext_label: {
                        rechargeCdn: "sub_and_save_ext_label",
                        clientLocales: "products.subscribe_and_save_extended_label",
                    },
                    widget_deliver_every: {
                        rechargeCdn: "widget_deliver_every",
                        clientLocales: "products.subscribe_and_save_frequency_label",
                    },
                    how_it_works: {
                        rechargeCdn: "how_it_works",
                        clientLocales: "products.how_it_works",
                    },
                    subscription_details_verbiage: {
                        rechargeCdn: "subscription_details_verbiage",
                        clientLocales: "products.subscriptionDetailsLabel",
                    },
                    shipping_interval_unit_type: {
                        rechargeCdn: "translations",
                        clientLocales: "products.shipping_interval_unit_type",
                    },
                    learnmore_url: {
                        rechargeCdn: "learnmore_url",
                        clientLocales: "products.learnmore_url",
                    },
                    poweredby_url: {
                        rechargeCdn: "poweredby_url",
                        clientLocales: "products.poweredby_url",
                    },
                    widget_charge_every: {
                        rechargeCdn: "widget_charge_every",
                        clientLocales: "products.widget_charge_every",
                    },
                },
                cart: {
                    cart_sub_save_frequency_text: {
                        clientLocales: "cart.cart_sub_frequency_text",
                    },
                    cart_sub_frequency_text: {
                        clientLocales: "cart.cart_sub_save_frequency_text",
                    },
                    cart_estimated_grand_total_text: {
                        clientLocales: "cart.cart_estimated_grand_total_text",
                    },
                },
            },
            backend: {
                is_rc_staging: {
                    adapterBackend: "settings.is_rc_staging",
                    rcaSettings: "backend.is_rc_staging",
                },
                all_checkouts_on_recharge: {
                    adapterBackend: "settings.all_checkouts_on_recharge",
                    rcaSettings: "backend.all_checkouts_on_recharge",
                },
                display_and_handoff_coupons: {
                    adapterBackend: "settings.display_and_handoff_coupons",
                    rcaSettings: "backend.display_and_handoff_coupons",
                },
                use_bc_discounts: {
                    adapterBackend: "settings.use_bc_discounts",
                    rcaSettings: "use_bc_discounts",
                },
                stack_subandsave: {
                    adapterBackend: "settings.stack_subandsave",
                    rcaSettings: "backend.stack_subandsave",
                },
                apply_bc_discount_to_first_order: {
                    adapterBackend: "settings.apply_bc_discount_to_first_order",
                    rcaSettings: "backend.apply_bc_discount_to_first_order",
                },
                create_coupon_for_coupon_only_cart: {
                    adapterBackend: "settings.create_coupon_for_coupon_only_cart",
                    rcaSettings: "backend.create_coupon_for_coupon_only_cart",
                },
                updated_at: { adapterBackend: "updated_at" },
            },
        };
    }

    /**
     * Transformer for pages where ReCharge supports enabled/disabled functionality.
     * @param {'product'|'home'|'collection'} page - The page to transform.
     * @returns {Function} A transformer function.
     */
    _pageEnabledTransformer(page) {
        return () => {
            const path = `pages.${page}.enabled`;
            const pageValue = this.get(path);
            if (!isEmpty(pageValue)) {
                this.set(path, pageValue?.includes(page) || pageValue === true);
            }
        };
    }

    /**
     * Creates a transformer object to convert a string boolean ("true" or "false") to literal
     * boolean (true, false).
     * @param {string} path - The dot-notation path to the settings key to target.
     * @returns {object} - A condition/transform object to be used in `this.transformers`.
     */
    _booleanStringTransformer(path) {
        return {
            condition: this.condition(path, (item) => !isBoolean(item) && isString(item)),
            transform: this.transform(path, (value) => value?.toLowerCase() === "true"),
        };
    }

    /**
     * Creates a transformer object to convert a url scheam to match
     * that of the browser.
     * @param {string} path - The dot-notation path to the settings key to target.
     * @returns {object} - A condition/transform object to be used in `this.transformers`.
     */
    _urlSchemaTransformer(path) {
        return {
            condition: () => typeof window !== "undefined" && typeof this.get(path) === "string",
            transform: () =>
                this.set(path, this.get(path).replace(/https?:/i, window.location.protocol)),
        };
    }
}
