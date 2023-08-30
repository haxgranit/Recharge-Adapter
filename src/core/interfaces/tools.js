import CustomClasses from "@/bigcommerce/config/custom-classes.json";
import { App } from "@/bigcommerce/pages";
import Vue from "vue";
import { AppVue, initVueOptions } from "@/core/utils";

/**
 * Contains mock data to use with the testing tool.
 */
class MockData {
    storeData = {
        rc_domain: "recharge-sandbox-1.mybigcommerce.com",
        hash: "t7ixprxojs",
        weight_units: "LBS",
    };

    /**
     * @param {number} productId - The BigCommerce Product ID for the product page to mock.
     */
    constructor(productId) {
        this.productId = productId;
    }

    /**
     * @returns {object} Mocked ReCharge Subscription Data for the product.
     */
    get mockSubscriptionData() {
        return {
            discount_amount: 10,
            discount_type: "percentage",
            charge_interval_frequency: 30,
            order_interval_unit: "day",
            storefront_purchase_options: "subscription_and_onetime",
            expire_after_specific_number_of_charges: null,
            order_interval_frequency_options: ["30", "100", "1000"],
        };
    }

    /**
     * @returns {object} Mocked Adapter Data for the product.
     */
    get mockProductData() {
        return {
            discounts: [],
            id: this.productId,
            tax_code: "",
            variants: [
                {
                    id: null,
                    weight: 1,
                    tax_code: "",
                    tax_class_id: "",
                },
            ],
            weight: 1,
            subscriptions: [this.mockSubscriptionData],
        };
    }

    /**
     * @returns {object} Mocked RCA_DATA object.
     */
    get mockStoreData() {
        return {
            RCA_FILE_DATA: { updated_at: Date.now(), version: "Testing" },
            RCA_PRODUCT_DATA: [this.mockProductData],
            RCA_STORE_DATA: this.storeData,
            // eslint-disable-next-line jsdoc/require-jsdoc
            getSubscriptionsByBCProductID: function (product_id) {
                for (let i = 0; i < this.RCA_PRODUCT_DATA.length; i++) {
                    if (parseInt(this.RCA_PRODUCT_DATA[i].id) === product_id) {
                        return this.RCA_PRODUCT_DATA[i].subscriptions;
                    }
                }
                return null;
            },
            // eslint-disable-next-line jsdoc/require-jsdoc
            getStoreDomain: function () {
                return this.RCA_STORE_DATA.rc_domain;
            },
            // eslint-disable-next-line jsdoc/require-jsdoc
            getStoreHash: function () {
                return this.RCA_STORE_DATA.hash;
            },
        };
    }

    /**
     * @returns {object} Mocked RCA_SETTINGS Object.
     */
    get mockSettings() {
        return { enabled: true };
    }

    /**
     * @returns {object} Mocked RCA_store_objects Object.
     */
    get mockStoreObject() {
        return {
            graphql_token: "",
            currency: {
                default: {
                    currency_location: "left",
                    currency_token: "$",
                    decimal_places: 2,
                    decimal_token: ".",
                    thousands_token: ",",
                },
                current: {
                    active_currency_code: "USD",
                    active_currency_flag:
                        '<img src="https://cdn11.bigcommerce.com/s-k3iohmimxh/lib/flags/us.gif" border="0" alt="" role="presentation" />',
                    active_currency_id: 1,
                    active_currency_name: "US Dollar",
                    currencies: [
                        {
                            cart_currency_switch_url: "/cart/change-currency",
                            code: "USD",
                            flag: '<img src="https://cdn11.bigcommerce.com/s-k3iohmimxh/lib/flags/us.gif" border="0" alt="" role="presentation" />',
                            id: 1,
                            is_active: true,
                            name: "US Dollar",
                            switch_url:
                                "https://recharge-stage-small.mybigcommerce.com/subscriptions/?setCurrencyId=1",
                        },
                    ],
                    default_currency_code: "USD",
                },
            },
            customer: this.mockCustomerObject,
            cart: {
                coupons: null,
                discount: null,
                gift_certificates: null,
                gift_wrapping_cost: null,
                grand_total: null,
                items: null,
                quantity: null,
                shipping_handling: null,
                show_primary_checkout_button: null,
                status_messages: null,
                sub_total: null,
                taxes: null,
            },
            cart_id: "",
            page_type: "product",
            order: null,
            product: {
                id: null,
                options: null,
                title: "",
                price: null,
            },
            product_results: {
                pagination: null,
                product: [],
            },
            products: [],
            store_hash: this.storeData.hash,
            theme_settings: {
                "alert-backgroundColor": "#ffffff",
                "alert-color": "#333333",
                "alert-color-alt": "#ffffff",
                "applePay-button": "black",
                "banner--deafault-backgroundColor": "#707070",
                "blockquote-cite-font-color": "#999999",
                blog_size: "190x250",
                "body-bg": "#ffffff",
                "body-font": "Google_Karla_400",
                brand_size: "190x250",
                brandpage_products_per_page: 12,
                "button--default-borderColor": "#8F8F8F",
                "button--default-borderColorActive": "#757575",
                "button--default-borderColorHover": "#474747",
                "button--default-color": "#666666",
                "button--default-colorActive": "#000000",
                "button--default-colorHover": "#333333",
                "button--disabled-backgroundColor": "#cccccc",
                "button--disabled-borderColor": "transparent",
                "button--disabled-color": "#ffffff",
                "button--icon-svg-color": "#757575",
                "button--primary-backgroundColor": "#444444",
                "button--primary-backgroundColorActive": "#000000",
                "button--primary-backgroundColorHover": "#666666",
                "button--primary-color": "#ffffff",
                "button--primary-colorActive": "#ffffff",
                "button--primary-colorHover": "#ffffff",
                "card--alternate-backgroundColor": "#ffffff",
                "card--alternate-borderColor": "#ffffff",
                "card--alternate-color--hover": "#ffffff",
                "card-figcaption-button-background": "#ffffff",
                "card-figcaption-button-color": "#333333",
                "card-title-color": "#333333",
                "card-title-color-hover": "#757575",
                "carousel-arrow-bgColor": "#ffffff",
                "carousel-arrow-borderColor": "#ffffff",
                "carousel-arrow-color": "#8f8f8f",
                "carousel-arrow-color--hover": "#474747",
                "carousel-bgColor": "#ffffff",
                "carousel-description-color": "#333333",
                "carousel-dot-bgColor": "#ffffff",
                "carousel-dot-color": "#333333",
                "carousel-dot-color-active": "#757575",
                "carousel-play-pause-button-bgColor": "#ffffff",
                "carousel-play-pause-button-borderColor": "#ffffff",
                "carousel-play-pause-button-textColor": "8f8f8f",
                "carousel-play-pause-button-textColor--hover": "#474747",
                "carousel-title-color": "#444444",
                categorypage_products_per_page: 12,
                "checkRadio-backgroundColor": "#ffffff",
                "checkRadio-borderColor": "#8f8f8f",
                "checkRadio-color": "#333333",
                "checkout-paymentbuttons-paypal-color": "black",
                "checkout-paymentbuttons-paypal-label": "pay",
                "checkout-paymentbuttons-paypal-shape": "rect",
                "checkout-paymentbuttons-paypal-size": "large",
                "color-black": "#ffffff",
                "color-error": "#cc4749",
                "color-errorLight": "#ffdddd",
                "color-grey": "#999999",
                "color-greyDark": "#666666",
                "color-greyDarker": "#333333",
                "color-greyDarkest": "#000000",
                "color-greyLight": "#999999",
                "color-greyLighter": "#cccccc",
                "color-greyLightest": "#e5e5e5",
                "color-greyMedium": "#757575",
                "color-info": "#666666",
                "color-infoLight": "#dfdfdf",
                "color-primary": "#757575",
                "color-primaryDark": "#666666",
                "color-primaryDarker": "#333333",
                "color-primaryLight": "#999999",
                "color-secondary": "#ffffff",
                "color-secondaryDark": "#e5e5e5",
                "color-secondaryDarker": "#cccccc",
                "color-success": "#008a06",
                "color-successLight": "#d5ffd8",
                "color-textBase": "#333333",
                "color-textBase--active": "#757575",
                "color-textBase--hover": "#757575",
                "color-textHeading": "#444444",
                "color-textLink": "#333333",
                "color-textLink--active": "#757575",
                "color-textLink--hover": "#757575",
                "color-textSecondary": "#757575",
                "color-textSecondary--active": "#333333",
                "color-textSecondary--hover": "#333333",
                "color-warning": "#f1a500",
                "color-warningLight": "#fffdea",
                "color-white": "#ffffff",
                "color-whitesBase": "#e5e5e5",
                color_badge_product_sale_badges: "#007dc6",
                color_badge_product_sold_out_badges: "#007dc6",
                color_hover_product_sale_badges: "#000000",
                color_hover_product_sold_out_badges: "#000000",
                color_text_product_sale_badges: "#ffffff",
                color_text_product_sold_out_badges: "#ffffff",
                "container-border-global-color-base": "#e5e5e5",
                "container-fill-base": "#ffffff",
                "container-fill-dark": "#e5e5e5",
                default_image_brand: "img/BrandDefault.gif",
                default_image_gift_certificate: "img/GiftCertificate.png",
                default_image_product: "img/ProductDefault.gif",
                "dropdown--quickSearch-backgroundColor": "#e5e5e5",
                "dropdown--wishList-backgroundColor": "#ffffff",
                "focusTooltip-backgroundColor": "#313440",
                "focusTooltip-textColor": "#ffffff",
                "fontSize-h1": 28,
                "fontSize-h2": 25,
                "fontSize-h3": 22,
                "fontSize-h4": 20,
                "fontSize-h5": 15,
                "fontSize-h6": 13,
                "fontSize-root": 14,
                "footer-backgroundColor": "#ffffff",
                "form-label-font-color": "#666666",
                gallery_size: "300x300",
                "header-backgroundColor": "#ffffff",
                "headings-font": "Google_Montserrat_400",
                hide_blog_page_heading: false,
                hide_breadcrumbs: false,
                hide_category_page_heading: false,
                hide_contact_us_page_heading: false,
                hide_content_navigation: false,
                hide_page_heading: false,
                homepage_blog_posts_count: 3,
                homepage_featured_products_column_count: 4,
                homepage_featured_products_count: 4,
                homepage_new_products_column_count: 4,
                homepage_new_products_count: 5,
                homepage_show_carousel: true,
                homepage_show_carousel_arrows: true,
                homepage_show_carousel_play_pause_button: true,
                homepage_stretch_carousel_images: false,
                homepage_top_products_column_count: 4,
                homepage_top_products_count: 4,
                "icon-color": "#757575",
                "icon-color-hover": "#999999",
                "icon-ratingEmpty": "#8F8F8F",
                "icon-ratingFull": "#474747",
                "input-bg-color": "#ffffff",
                "input-border-color": "#8F8F8F",
                "input-border-color-active": "#474747",
                "input-disabled-bg": "#ffffff",
                "input-font-color": "#666666",
                "label-backgroundColor": "#cccccc",
                "label-color": "#ffffff",
                lazyload_mode: "lazyload+lqip",
                "loadingOverlay-backgroundColor": "#ffffff",
                "logo-position": "center",
                logo_fontSize: 28,
                logo_size: "250x100",
                "navPages-color": "#333333",
                "navPages-color-hover": "#757575",
                "navPages-subMenu-backgroundColor": "#e5e5e5",
                "navPages-subMenu-separatorColor": "#cccccc",
                "navUser-color": "#333333",
                "navUser-color-hover": "#757575",
                "navUser-dropdown-backgroundColor": "#ffffff",
                "navUser-dropdown-borderColor": "#cccccc",
                "navUser-indicator-backgroundColor": "#333333",
                navigation_design: "simple",
                "optimizedCheckout-backgroundImage": "",
                "optimizedCheckout-backgroundImage-size": "1000x400",
                "optimizedCheckout-body-backgroundColor": "#ffffff",
                "optimizedCheckout-buttonPrimary-backgroundColor": "#333333",
                "optimizedCheckout-buttonPrimary-backgroundColorActive": "#000000",
                "optimizedCheckout-buttonPrimary-backgroundColorDisabled": "#cccccc",
                "optimizedCheckout-buttonPrimary-backgroundColorHover": "#666666",
                "optimizedCheckout-buttonPrimary-borderColor": "#333333",
                "optimizedCheckout-buttonPrimary-borderColorActive": "transparent",
                "optimizedCheckout-buttonPrimary-borderColorDisabled": "transparent",
                "optimizedCheckout-buttonPrimary-borderColorHover": "transparent",
                "optimizedCheckout-buttonPrimary-color": "#ffffff",
                "optimizedCheckout-buttonPrimary-colorActive": "#ffffff",
                "optimizedCheckout-buttonPrimary-colorDisabled": "#ffffff",
                "optimizedCheckout-buttonPrimary-colorHover": "#ffffff",
                "optimizedCheckout-buttonPrimary-font": "Google_Montserrat_500",
                "optimizedCheckout-buttonSecondary-backgroundColor": "#ffffff",
                "optimizedCheckout-buttonSecondary-backgroundColorActive": "#e5e5e5",
                "optimizedCheckout-buttonSecondary-backgroundColorHover": "#f5f5f5",
                "optimizedCheckout-buttonSecondary-borderColor": "#cccccc",
                "optimizedCheckout-buttonSecondary-borderColorActive": "#757575",
                "optimizedCheckout-buttonSecondary-borderColorHover": "#999999",
                "optimizedCheckout-buttonSecondary-color": "#333333",
                "optimizedCheckout-buttonSecondary-colorActive": "#000000",
                "optimizedCheckout-buttonSecondary-colorHover": "#333333",
                "optimizedCheckout-buttonSecondary-font": "Google_Montserrat_500",
                "optimizedCheckout-colorFocus": "#4496f6",
                "optimizedCheckout-contentPrimary-color": "#333333",
                "optimizedCheckout-contentPrimary-font": "Google_Montserrat_500",
                "optimizedCheckout-contentSecondary-color": "#757575",
                "optimizedCheckout-contentSecondary-font": "Google_Montserrat_500",
                "optimizedCheckout-discountBanner-backgroundColor": "#e5e5e5",
                "optimizedCheckout-discountBanner-iconColor": "#333333",
                "optimizedCheckout-discountBanner-textColor": "#333333",
                "optimizedCheckout-form-textColor": "#666666",
                "optimizedCheckout-formChecklist-backgroundColor": "#ffffff",
                "optimizedCheckout-formChecklist-backgroundColorSelected": "#f5f5f5",
                "optimizedCheckout-formChecklist-borderColor": "#cccccc",
                "optimizedCheckout-formChecklist-color": "#333333",
                "optimizedCheckout-formField-backgroundColor": "#ffffff",
                "optimizedCheckout-formField-borderColor": "#cccccc",
                "optimizedCheckout-formField-errorColor": "#d14343",
                "optimizedCheckout-formField-inputControlColor": "#476bef",
                "optimizedCheckout-formField-placeholderColor": "#999999",
                "optimizedCheckout-formField-shadowColor": "transparent",
                "optimizedCheckout-formField-textColor": "#333333",
                "optimizedCheckout-header-backgroundColor": "#f5f5f5",
                "optimizedCheckout-header-borderColor": "#dddddd",
                "optimizedCheckout-header-textColor": "#333333",
                "optimizedCheckout-headingPrimary-color": "#333333",
                "optimizedCheckout-headingPrimary-font": "Google_Montserrat_700",
                "optimizedCheckout-headingSecondary-color": "#333333",
                "optimizedCheckout-headingSecondary-font": "Google_Montserrat_700",
                "optimizedCheckout-link-color": "#476bef",
                "optimizedCheckout-link-font": "Google_Montserrat_500",
                "optimizedCheckout-link-hoverColor": "#002fe1",
                "optimizedCheckout-loadingToaster-backgroundColor": "#333333",
                "optimizedCheckout-loadingToaster-textColor": "#ffffff",
                "optimizedCheckout-logo": "",
                "optimizedCheckout-logo-position": "left",
                "optimizedCheckout-logo-size": "250x100",
                "optimizedCheckout-orderSummary-backgroundColor": "#ffffff",
                "optimizedCheckout-orderSummary-borderColor": "#dddddd",
                "optimizedCheckout-show-backgroundImage": false,
                "optimizedCheckout-show-logo": "none",
                "optimizedCheckout-step-backgroundColor": "#757575",
                "optimizedCheckout-step-borderColor": "#dddddd",
                "optimizedCheckout-step-textColor": "#ffffff",
                "overlay-backgroundColor": "#333333",
                "pace-progress-backgroundColor": "#999999",
                "paymentbanners-cartpage-logo-position": "left",
                "paymentbanners-cartpage-logo-type": "primary",
                "paymentbanners-cartpage-text-color": "black",
                "paymentbanners-homepage-color": "white",
                "paymentbanners-homepage-ratio": "8x1",
                "paymentbanners-proddetailspage-color": "white",
                "paymentbanners-proddetailspage-ratio": "8x1",
                "paymentbuttons-paypal-color": "gold",
                "paymentbuttons-paypal-fundingicons": false,
                "paymentbuttons-paypal-label": "checkout",
                "paymentbuttons-paypal-layout": "vertical",
                "paymentbuttons-paypal-shape": "rect",
                "paymentbuttons-paypal-size": "responsive",
                "paymentbuttons-paypal-tagline": false,
                "pdp-custom-fields-tab-label": "Additional Information",
                "pdp-non-sale-price-label": "Was:",
                "pdp-price-label": "",
                "pdp-retail-price-label": "MSRP:",
                "pdp-sale-price-label": "Now:",
                pdp_sale_badge_label: "On Sale!",
                pdp_sold_out_label: "Sold Out",
                price_ranges: true,
                product_list_display_mode: "grid",
                product_sale_badges: "none",
                product_size: "500x659",
                product_sold_out_badges: "none",
                productgallery_size: "500x659",
                productpage_related_products_count: 10,
                productpage_reviews_count: 9,
                productpage_similar_by_views_count: 10,
                productpage_videos_count: 8,
                productthumb_size: "100x100",
                productview_thumb_size: "50x50",
                restrict_to_login: false,
                searchpage_products_per_page: 12,
                "select-arrow-color": "#757575",
                "select-bg-color": "#ffffff",
                shop_by_brand_show_footer: true,
                shop_by_price_visibility: true,
                "show-admin-bar": true,
                show_accept_amazonpay: false,
                show_accept_amex: false,
                show_accept_discover: false,
                show_accept_googlepay: false,
                show_accept_klarna: false,
                show_accept_mastercard: false,
                show_accept_paypal: false,
                show_accept_visa: false,
                show_copyright_footer: true,
                show_custom_fields_tabs: false,
                show_powered_by: true,
                show_product_details_tabs: true,
                show_product_dimensions: false,
                show_product_quantity_box: true,
                show_product_quick_view: true,
                show_product_reviews: true,
                show_product_swatch_names: true,
                show_product_weight: true,
                social_icon_placement_bottom: "bottom_none",
                social_icon_placement_top: false,
                "spinner-borderColor-dark": "#999999",
                "spinner-borderColor-light": "#ffffff",
                "storeName-color": "#333333",
                supported_card_type_icons: [
                    "american_express",
                    "diners",
                    "discover",
                    "mastercard",
                    "visa",
                ],
                supported_payment_methods: ["card", "paypal"],
                swatch_option_size: "22x22",
                thumb_size: "100x100",
                zoom_size: "1280x1280",
            },
        };
    }

    /**
     * Returns the mock customer object.
     * @returns {object}
     */
    get mockCustomerObject() {
        return {
            email: "subs-user@fack.com",
            id: 2,
            orders: null,
            customer_group_id: null,
            customer_group_name: "",
        };
    }
}

/**
 *
 */
class TestingTool {
    /**
     *
     */
    constructor() {
        this.mockData = new MockData(this.currentProductId);
    }

    /**
     * @returns {object} The RCA_DATA or mock RCA_DATA for the store.
     */
    get storeData() {
        if (!window.RCA_DATA) {
            return this.mockData.mockStoreData;
        }
        const productData = window.RCA_DATA.RCA_PRODUCT_DATA;
        const index = productData.findIndex((element) => element.id === this.currentProductId);
        if (index > -1 && !productData[index]?.subscriptions[0]?.order_interval_frequency_options) {
            productData[index].subscriptions = [this.mockData.mockSubscriptionData];
            window.RCA_DATA.RCA_PRODUCT_DATA = productData;
        } else {
            productData.push(this.mockData.mockProductData);
        }

        return window.RCA_DATA;
    }

    /**
     * @returns {object} RCA_store_objects or mock RCA_store_objects for the store.
     */
    get storeObjectData() {
        if (!window.RCA_store_objects) {
            return this.mockData.mockStoreObject;
        }
        return window.RCA_store_objects;
    }

    /**
     * @returns {object} RCA_SETTINGS or mock RCA_SETTINGS for the store.
     */
    get storePageSettings() {
        if (!window.RCA_SETTINGS) {
            return this.mockData.mockSettings;
        }
        return window.RCA_SETTINGS;
    }

    /**
     * Instance of the frontend app to reInit the application from the interface.
     * @returns {Vue} Instance.
     */
    get app() {
        Vue.prototype.$store_data = this.storeData;
        initVueOptions({
            pageSettings: this.storePageSettings,
            storeObjectsData: this.storeObjectData,
            storeData: this.storeData,
            useSentry: false,
            loggerEnabled: true,
            environment: "development",
        });
        Object.defineProperty(this, "app", {
            value: new AppVue({ render: (h) => h(App) }),
            configurable: true,
        });
        this.app.bigcommerce.storefront.cart.domain = window.location.host;

        return this.app;
    }

    /**
     * @returns {number} The BigCommerce Product ID of the current page.
     */
    get currentProductId() {
        if (window.RCA_store_objects) {
            return window.RCA_store_objects.product.id;
        }
        const id = document.querySelector('input[name="product_id"]')?.value;
        return id ? parseInt(id, 10) : null;
    }

    /**
     * Iterate over the custom-classes.json and check the classes for the current page
     * Log a new object with the missing and added classes.
     */
    checkClasses() {
        const classes = CustomClasses;
        delete CustomClasses.custom_classes_settings;
        let rca_status_classes = {};
        for (const s in classes) {
            // eslint-disable-next-line no-prototype-builtins
            if (classes.hasOwnProperty(s)) {
                if (null == rca_status_classes[s]) {
                    rca_status_classes[s] = {
                        added_classes: [],
                        missing_classes: [],
                    };
                }
                for (const k in classes[s]) {
                    if (null == document.querySelector("." + classes[s][k].custom_class)) {
                        rca_status_classes[s].missing_classes.push(classes[s][k]);
                    } else {
                        rca_status_classes[s].added_classes.push(classes[s][k]);
                    }
                }
            }
        }
        console.log(rca_status_classes);
    }

    /**
     * Loads and sets the customer data.
     */
    async loadCustomerData() {
        const app = this.app;
        const customerObject = this.mockData.mockCustomerObject;
        const customerData = {
            email: customerObject.email,
            expiration: Date.now() + 10 * 60 * 1000, // 10 minutes
            id: customerObject.id,
            rechargeCustomerHash: "fakeRechargeCustomerHash",
            rechargeCustomerId: 0xfacec00571d,
            token: "fakeCustomerToken",
            tokenExpiration: Date.now() + 6 * 60 * 60 * 1000, // 6 hours
        };
        await app.$store.dispatch("customer/saveCustomer", {
            key: `${app.storeHash}-rca-key`,
            customerData,
        });
        app.$store_objects.customer = customerObject;
    }

    /**
     * Mounts the adapter onto the page.
     * @returns {this.app}
     */
    async run() {
        await this.loadCustomerData();
        this.app.$mount();
        return this.app;
    }
}

const testingTool = new TestingTool();

export default {
    checkClasses: testingTool.checkClasses.bind(testingTool),
    runTestingTool: testingTool.run.bind(testingTool),
    testing: new TestingTool(),
};
