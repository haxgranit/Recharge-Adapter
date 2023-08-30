import { config, shallowMount } from "@vue/test-utils";
import storeMain from "@/core/vue/store";
import { EventBus as mockEventBus } from "@/core/utils/event-bus";
import PreviewDropdown from "@/bigcommerce/pages/shared/PreviewDropdown.vue";
import { getLocalVue } from "../test_utils/localVue";

config.showDeprecationWarnings = false;

// Disable interfaces
jest.mock("@/core/interfaces");
// Disable i18n
jest.mock("@/core/vue/plugins/i18n.js", () => {
    const original = jest.requireActual("@/core/vue/plugins/i18n.js");
    return {
        i18n: {},
        i18nMixin: () => {
            return {};
        },
        LoadTranslations: original.LoadTranslations,
    };
});

jest.mock("@/bigcommerce/utils/bigcommerce-helper.js", () => {
    const util = require("../test_utils/mock_bigcommerce");
    const mockHelper = util.mockBigcommerceHelper({
        currentSubData: [
            {
                cartid: "48f718e0-6a46-452f-b699-b79464fcbe38",
                line_item: "dd6cc39b-0e69-4c06-8156-2ffe64bbf8ed",
                shipping_unit: "day",
                shipping_frequency: 30,
                charge_frequency: 30,
                discount_type: "percentage",
                discount_amount: 12,
                storefront_purchase_options: "subscription_and_onetime",
                productID: 143,
            },
            {
                cartid: "48f718e0-6a46-452f-b699-b79464fcbe38",
                line_item: "a34516f3-a635-483a-a781-74e2b86e5696",
                shipping_unit: "day",
                shipping_frequency: 30,
                charge_frequency: 30,
                discount_type: "percentage",
                discount_amount: 12,
                storefront_purchase_options: "subscription_and_onetime",
                productID: 143,
            },
        ],
    });
    return mockHelper;
});
const { localVue } = getLocalVue();
const mockVue = localVue;

describe("PreviewDropdown", () => {
    // Turn off console.log, console.error and console.debug messages

    beforeAll(() => {
        // jest.spyOn(console, "log").mockImplementation(jest.fn());
        jest.spyOn(console, "error").mockImplementation(jest.fn());
        jest.spyOn(console, "debug").mockImplementation(jest.fn());
        jest.spyOn(console, "warn").mockImplementation(jest.fn());
    });

    it("should be defined", () => {
        expect(PreviewDropdown).toBeDefined();
        expect(typeof PreviewDropdown).toBe("object");
    });

    describe("calculateSubtotalPrice", () => {
        let mockMixins = {};
        let mockMethods = {};
        let mock_logger = {};
        let wrapper;

        beforeEach(() => {
            mockEventBus.$emit.mockImplementation();
            mockMixins.addCustomClassesToGroup = jest.fn();
            mockMethods.registerCartDropdownObserver = jest.fn();
            mock_logger = { fatal: jest.fn(), debug: jest.fn() };

            jest.mock("vue", () => mockVue);
            wrapper = shallowMount(PreviewDropdown, {
                localVue,
                mixins: [{ methods: mockMixins }],
                methods: mockMethods,
                mocks: {
                    $store: storeMain,
                    $logger: mock_logger,
                },
            });
        });

        it("should handle cart with no line items", () => {
            wrapper.vm.addCustomClasses();
        });

        it("should return correct subtotal price", () => {
            wrapper.vm.addCustomClasses();
            const rechargeCheckout =
                wrapper.vm.bigcommerce.storefront.cart.createRechargeCheckout();
            expect(rechargeCheckout.subtotal_price.divide(100).value).toEqual(5.28);
        });
    });

    describe("overwriteCartDropdown", () => {
        let mockMixins = {};
        let mockMethods = {};
        let mock_logger = {};
        let wrapper;

        beforeEach(() => {
            mockEventBus.$emit.mockImplementation();
            mockMixins.addCustomClassesToGroup = jest.fn();
            mockMethods.registerCartDropdownObserver = jest.fn();
            mock_logger = { fatal: jest.fn(), debug: jest.fn() };

            jest.mock("vue", () => mockVue);
            wrapper = shallowMount(PreviewDropdown, {
                localVue,
                mixins: [{ methods: mockMixins }],
                methods: mockMethods,
                mocks: {
                    $store: storeMain,
                    $logger: mock_logger,
                },
                computed: {
                    currentSubData: () => [
                        {
                            line_item: "77db660c-9536-436d-a187-59261689b15f",
                            discount_type: "percentage",
                        },
                    ],
                },
            });

            wrapper.vm.getCartResponse = jest.fn();
        });

        it("should be defined", () => {
            const overwriteCartDropdown = wrapper.vm.overwriteCartDropdown;
            expect(overwriteCartDropdown).toBeDefined();
        });

        it("should do nothing when cart data is empty", async () => {
            jest.spyOn(wrapper.vm, "getCartResponse").mockImplementationOnce(() => {
                return { data: [] };
            });

            const overwriteCartDropdown = wrapper.vm.overwriteCartDropdown;
            const nodeEl = {
                firstElementChild: {
                    classList: {
                        contains: () => true,
                    },
                },
                innerHTML: "$10.00",
                /**
                 *
                 * @returns {object}
                 */
                querySelector() {
                    return this;
                },
            };

            const cartElements = [nodeEl];

            await overwriteCartDropdown(cartElements);
            expect(cartElements[0].innerHTML).toBe("$10.00");
        });

        it("should update innerHTML", async () => {
            const cart_data = [
                {
                    lineItems: {
                        physicalItems: [
                            {
                                id: "77db660c-9536-436d-a187-59261689b15f",
                            },
                        ],
                    },
                },
            ];

            jest.spyOn(wrapper.vm, "getCartResponse").mockImplementationOnce(() => {
                return { data: cart_data };
            });

            jest.spyOn(wrapper.vm, "getCustomClass").mockImplementationOnce(
                () => ".rca-cart-dropdown-price"
            );

            jest.spyOn(wrapper.vm, "Currency").mockImplementationOnce();
            jest.spyOn(wrapper.vm.pricing, "calculateItemPrice").mockReturnValue({ value: 0 });
            jest.spyOn(wrapper.vm, "getPriceString").mockReturnValue("$10.00");
            jest.spyOn(wrapper.vm.pricing, "toPriceString")
                .mockImplementation()
                .mockReturnValue("$5.00");

            const overwriteCartDropdown = wrapper.vm.overwriteCartDropdown;
            const nodeEl = {
                firstElementChild: {
                    classList: {
                        contains: () => true,
                    },
                },
                innerHTML: "$10.00",
                /**
                 *
                 * @returns {object}
                 */
                querySelector() {
                    return this;
                },
            };

            const cartElements = [nodeEl];

            await overwriteCartDropdown(cartElements);
            expect(cartElements[0].innerHTML).toBe("$5.00");
        });

        it("should update innerHTML of all cart elements", async () => {
            const cart_data = [
                {
                    lineItems: {
                        physicalItems: [
                            {
                                id: "77db660c-9536-436d-a187-59261689b15f",
                            },
                            {
                                id: "77db660c-9536-436d-a187-59261689b15f",
                            },
                        ],
                    },
                },
            ];

            jest.spyOn(wrapper.vm, "getCartResponse").mockImplementationOnce(() => {
                return { data: cart_data };
            });

            jest.spyOn(wrapper.vm, "getCustomClass").mockImplementationOnce(
                () => ".rca-cart-dropdown-price"
            );

            jest.spyOn(wrapper.vm, "Currency").mockImplementationOnce();
            jest.spyOn(wrapper.vm.pricing, "calculateItemPrice").mockReturnValue({ value: 0 });
            jest.spyOn(wrapper.vm, "getPriceString")
                .mockReturnValueOnce("$10.00")
                .mockReturnValue("$15.00");
            jest.spyOn(wrapper.vm.pricing, "toPriceString")
                .mockReturnValueOnce("")
                .mockReturnValueOnce("$5.00")
                .mockReturnValueOnce("")
                .mockReturnValue("$7.50");

            const overwriteCartDropdown = wrapper.vm.overwriteCartDropdown;
            const nodeEl = {
                firstElementChild: {
                    classList: {
                        contains: () => true,
                    },
                },
                innerHTML: "$10.00",
                /**
                 *
                 * @returns {object}
                 */
                querySelector() {
                    return this;
                },
            };

            const nodeEl2 = {
                firstElementChild: {
                    classList: {
                        contains: () => true,
                    },
                },
                innerHTML: "$15.00",
                /**
                 *
                 * @returns {object}
                 */
                querySelector() {
                    return this;
                },
            };

            const cartElements = [nodeEl, nodeEl2];

            await overwriteCartDropdown(cartElements);
            expect(cartElements[0].innerHTML).toBe("$5.00");
            expect(cartElements[1].innerHTML).toBe("$7.50");
        });
    });
});
