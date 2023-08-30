import { config, shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import CustomClassesPlugin from "@/bigcommerce/vue/plugins/custom_classes";
import Logger from "@/core/vue/plugins/logger";
import storeMain from "@/core/vue/store";
import { EventBus as mockEventBus } from "@/core/utils/event-bus";
import Product from "@/bigcommerce/pages/product/Product";

config.showDeprecationWarnings = false;

jest.mock("@/core/libs/locales-loader", () => {
    return {
        /**
         * @returns {*}
         */
        keys: () => {
            return [];
        },
    };
});
jest.mock("@/core/utils/event-bus");

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(CustomClassesPlugin);
localVue.use(Logger, { useSentry: false, useLogDNA: false, useConsole: false });

const mock_product_data = JSON.parse(
    '[{"id": 123, "weight": 11, "variants": [{"id": 146, "weight": 11, "tax_code": "TEST-TAX-CODE-5", "tax_class_id": ""}], "discounts": [], "subscriptions": [{"discount_amount": 25.0, "discount_type": "percentage", "charge_interval_frequency": 30, "order_interval_unit": "day", "storefront_purchase_options": "subscription_and_onetime", "expire_after_specific_number_of_charges": null, "order_interval_frequency_options": ["1", "30", "60", "90"]}], "tax_code": "TEST-TAX-CODE-5"}]'
);

// mock store_data object for tests
const mock_store_data = {
    /**
     * @param {number} product_id Product ID.
     * @returns {object}
     */
    getSubscriptionsByBCProductID: (product_id) =>
        mock_product_data.find((item) => item.id === product_id),
};

// mock custom classes
const mock_custom_classes = {
    groups: {},
    classes: {
        product_price: {
            required: true,
            custom_class: "rca-product-price",
            selectors: {
                default: [
                    ".productView [data-product-price-with-tax]",
                    ".productView [data-product-price-without-tax]",
                ],
                capacityBright: [".product-header [data-product-price]"],
                fortune: [".product-area .product-price .price-value"],
            },
            observers: {
                default: [".rca-product-price"],
                fortune: ["[data-product-price]"],
            },
        },
    },
    themes: ["fab"],
};

describe("Product", () => {
    // Turn off console.log, console.error and console.debug messages
    beforeAll(() => {
        jest.spyOn(console, "log").mockImplementation(jest.fn());
        jest.spyOn(console, "error").mockImplementation(jest.fn());
        jest.spyOn(console, "debug").mockImplementation(jest.fn());
        jest.spyOn(console, "warn").mockImplementation(jest.fn());
    });

    describe("Subscription Info", () => {
        const mock_elem_options_data = [{ selectedFrequency: "30" }];
        const mock_subs_options_data = [
            {
                order_interval_unit: "day",
                charge_frequency: 30,
                discount_type: "percentage",
                discount_amount: 30,
                storefront_purchase_options: "subscription_and_onetime",
            },
        ];

        const mock_subs_data_with_defined_properties = {
            ...mock_subs_options_data[0],
            cartid: "5fb858be-db45-4ad8-8dbe-ecb007be186b",
            line_item: "60dfb2c4-72f6-469f-a2d3-1801da15a9f4",
            bundle_id: "c39e58ab12",
            shipping_frequency: 1,
            shipping_unit: "month",
        };

        const mock_cart_response_data_with_defined_properties = {
            data: [
                {
                    id: mock_subs_data_with_defined_properties.cartid,
                    currency: "US",
                    properties: {
                        bundle_id: mock_subs_data_with_defined_properties.bundle_id,
                    },
                },
            ],
        };
        const mock_subs_data_with_undefined_properties = {
            cartid: "5fcd5zfe-db88-4ad8-8zce-ecb008ef186b",
            line_item: "60358df4-73d6-469f-a2d3-1801zb15a9f4",
            shipping_frequency: 1,
            shipping_unit: "month",
        };

        const mock_cart_response_data_with_undefined_properties = {
            data: [
                {
                    id: mock_subs_data_with_undefined_properties.cartid,
                    currency: "US",
                },
            ],
        };
        const mock_logger = { fatal: jest.fn(), debug: jest.fn() };
        const product_attributes = {
            price: {
                tax_label: "Sales Tax",
                without_tax: {
                    currency: "USD",
                    formatted: "$9.97",
                    value: 9.97,
                },
            },
        };
        global.BCData = { product_attributes };

        const mockPropsData = {
            productID: "PID-123",
            productPrice: 9.97,
            product_attributes: global.BCData.product_attributes,
        };
        const mockDataOptions = {
            variant_options: [{ variant: "test" }],
            productID: mockPropsData.productID,
        };
        const mockMixins = {};
        // this is being deprecated so will need to be fixed at some point
        const mockMethods = {};
        // direct overload of functions
        const prototype = {};
        let wrapper;

        beforeEach(() => {
            mockEventBus.$emit.mockImplementation();

            mockMixins.addCustomClassesToGroup = jest.fn();
            mockMethods.findProductPriceElem = jest.spyOn(Product.methods, "findProductPriceElem");
            mockMethods.createProductInformation = jest.spyOn(
                Product.methods,
                "createProductInformation"
            );
            mockMethods.registerHooks = jest.spyOn(Product.methods, "registerHooks");
            mockMethods.unregisterHooks = jest.spyOn(Product.methods, "unregisterHooks");
            mockMethods.productChangeHandler = jest.spyOn(Product.methods, "productChangeHandler");

            prototype.getCartResponse = jest.fn();

            // https://vue-test-utils.vuejs.org/api/options.html#context
            wrapper = shallowMount(Product, {
                localVue,
                mixins: [{ methods: mockMixins }],
                methods: mockMethods,
                mocks: {
                    $store: storeMain,
                    $store_data: mock_store_data,
                    $custom_classes: mock_custom_classes,
                    $logger: mock_logger,
                },
                propsData: mockPropsData,
                /**
                 * @returns {*}
                 */
                data: () => mockDataOptions,
            });
            wrapper.vm.getCartResponse = prototype.getCartResponse;
        });

        afterEach(() => {
            jest.resetAllMocks();
        });

        it("should update with data that has defined properties, and open preview", () => {
            prototype.getCartResponse.mockImplementation(() => {
                return Promise.resolve(mock_cart_response_data_with_defined_properties);
            });

            wrapper.setData({
                selectedType: "subscription",
                selectedFrequency: mock_elem_options_data.selectedFrequency,
                subscriptionOptions: mock_subs_options_data,
                lastCartLineID: "5fb858be-db45-4ad8-8dbe-ecb007be186b",
            });

            // ensure this.lastCartLineID is set
            expect(wrapper.vm.lastCartLineID).toEqual(mock_subs_data_with_defined_properties.cartid);
            // emit signal check

            //expect(mockEventBus.$emit).toHaveBeenCalledTimes(1);
        });

        it("should update with data that has undefined properties, and open preview", () => {
            prototype.getCartResponse.mockImplementation(() => {
                return Promise.resolve(mock_cart_response_data_with_undefined_properties);
            });

            wrapper.setData({
                selectedType: "subscription",
                selectedFrequency: mock_elem_options_data.selectedFrequency,
                subscriptionOptions: mock_subs_options_data,
                lastCartLineID: "5fcd5zfe-db88-4ad8-8zce-ecb008ef186b",
            });

            // ensure this.lastCartLineID is set
            expect(wrapper.vm.lastCartLineID).toEqual(mock_subs_data_with_undefined_properties.cartid);
        });
        it("should update product price by getProductPrice method call", function () {
            const priceObject = { without_tax: { value: 9.97 } };
            const calcPrice = wrapper.vm.getProductPrice(priceObject, false);
            expect(calcPrice).toEqual(9.97);
        });

        it.todo("should get product price by productChangeHandler method call");

        it.todo("should get productID and price");

        it("should get undefined for not-existing price element", function () {
            expect(wrapper.vm.findProductPriceElem()).toEqual(undefined);
        });
    });
});
