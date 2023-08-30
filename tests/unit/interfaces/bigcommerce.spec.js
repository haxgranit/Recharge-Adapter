import subscription from "@/core/interfaces/subscription";
import BigcommerceInterface from "@/core/interfaces/bigcommerce";

window.RCA_DATA = {
    mock: true,
    RCA_PRODUCT_DATA: [
        {
            id: 1,
            weight: 84000,
            variants: [
                {
                    id: 2,
                    weight: 84000,
                    tax_code: "",
                    tax_class_id: "",
                },
            ],
            discounts: [],
            subscriptions: [{ order_interval_frequency_options: ["30", "60", "90"] }],
            tax_code: "",
        },
    ],
};

describe("bigcommerce", () => {
    // Turn off console.log, console.error and console.debug messages
    beforeAll(() => {
        jest.spyOn(console, "log").mockImplementation(jest.fn());
        jest.spyOn(console, "error").mockImplementation(jest.fn());
        jest.spyOn(console, "debug").mockImplementation(jest.fn());
        jest.spyOn(console, "warn").mockImplementation(jest.fn());
        jest.spyOn(console, "group").mockImplementation(jest.fn());
    });

    afterEach(() => {
        // eslint-disable-next-line
        Object.entries(spies).forEach(([_key, spy]) => spy.mockRestore());
    });

    let spies = {};

    describe("Cart", () => {
        it("should expose a cart object", () => {
            expect(typeof BigcommerceInterface.cart).toBe("object");
        });

        describe("addSubscriptionByProduct", () => {
            let cart;
            const asbpSpies = {};

            beforeEach(() => {
                cart = BigcommerceInterface.cart;

                asbpSpies.refreshCart = jest.spyOn(cart, "refreshCart");
                asbpSpies.allLineItemsGet = jest.spyOn(cart, "allLineItems", "get");
                asbpSpies.cartDataGet = jest.spyOn(cart, "cartData", "get");
                asbpSpies._addSubscriptionByLineItem = jest.spyOn(
                    cart,
                    "_addSubscriptionByLineItem"
                );
                asbpSpies.getProductSubscriptionData = jest.spyOn(
                    cart,
                    "getProductSubscriptionData"
                );
                asbpSpies.subscription_addProductToSubscriptions = jest.spyOn(
                    subscription,
                    "addProductToSubscriptions"
                );

                cart.checkoutData = {
                    mock: true,
                    cart: {},
                };

                asbpSpies.allLineItemsGet.mockImplementation(() => [
                    {
                        productId: 1,
                        variantId: 2,
                        id: "test-001",
                        rcaData: {
                            subscriptions: [
                                { order_interval_frequency_options: ["30", "60", "90"] },
                            ],
                        },
                    },
                ]);

                asbpSpies.cartDataGet.mockImplementation(() => ({
                    mock: true,
                }));

                asbpSpies.getProductSubscriptionData.mockImplementation(() => ({}));
                asbpSpies.subscription_addProductToSubscriptions.mockImplementation(() =>
                    Promise.resolve({})
                );
            });

            afterEach(() => {
                // eslint-disable-next-line
                Object.entries(asbpSpies).forEach(([_key, spy]) => spy.mockRestore());
            });

            it("should return true with valid product, variant and subscription", async () => {
                asbpSpies.refreshCart.mockImplementation(() => Promise.resolve(true));
                const response = await cart.addSubscriptionByProduct(1, 2, 30);
                expect(response).toBe(true);
            });

            it("should return false with invalid product id", async () => {
                asbpSpies.refreshCart.mockImplementation(() => Promise.resolve(true));
                const response = await cart.addSubscriptionByProduct(null);
                expect(response).toBe(false);
            });

            it("should return false with invalid variant id", async () => {
                asbpSpies.refreshCart.mockImplementation(() => Promise.resolve(true));
                const response = await cart.addSubscriptionByProduct(1);
                expect(response).toBe(false);
            });

            /*
                        Mock out _addSubscriptionByLineItem
                    */

            it("should return false with undefined subscription frequency", async () => {
                asbpSpies.refreshCart.mockImplementation(() => Promise.resolve(true));
                const response = await cart.addSubscriptionByProduct(1, 2, undefined);
                expect(response).toBe(false);
            });

            it("should return false with invalid subscription frequency", async () => {
                asbpSpies.refreshCart.mockImplementation(() => Promise.resolve(true));
                const response = await cart.addSubscriptionByProduct(1, 2, -1);
                expect(response).toBe(false);
            });
        });

        describe("addSubscriptionByLineItemId", () => {
            let cart;
            const asbpSpies = {};

            beforeEach(() => {
                cart = BigcommerceInterface.cart;

                asbpSpies.refreshCart = jest.spyOn(cart, "refreshCart");
                asbpSpies.allLineItemsGet = jest.spyOn(cart, "allLineItems", "get");
                asbpSpies.cartDataGet = jest.spyOn(cart, "cartData", "get");
                asbpSpies._addSubscriptionByLineItem = jest.spyOn(
                    cart,
                    "_addSubscriptionByLineItem"
                );
                asbpSpies.getProductSubscriptionData = jest.spyOn(
                    cart,
                    "getProductSubscriptionData"
                );
                asbpSpies.subscription_addProductToSubscriptions = jest.spyOn(
                    subscription,
                    "addProductToSubscriptions"
                );

                cart.checkoutData = {
                    mock: true,
                    cart: {},
                };

                asbpSpies.allLineItemsGet.mockImplementation(() => [
                    {
                        productId: 1,
                        variantId: 2,
                        id: "test-002",
                        rcaData: {
                            subscriptions: [
                                { order_interval_frequency_options: ["30", "60", "90"] },
                            ],
                        },
                    },
                ]);

                asbpSpies.cartDataGet.mockImplementation(() => ({
                    mock: true,
                }));

                asbpSpies.getProductSubscriptionData.mockImplementation(() => ({}));
                asbpSpies.subscription_addProductToSubscriptions.mockImplementation(() =>
                    Promise.resolve({})
                );
            });

            afterEach(() => {
                // eslint-disable-next-line
                Object.entries(asbpSpies).forEach(([_key, spy]) => spy.mockRestore());
            });

            it("should not find line item with undefined id", async () => {
                asbpSpies.refreshCart.mockImplementation(() => Promise.resolve(true));
                asbpSpies._addSubscriptionByLineItem.mockImplementation(() =>
                    Promise.resolve(true)
                );

                await cart.addSubscriptionByLineItemId(undefined);

                expect(asbpSpies._addSubscriptionByLineItem.mock.calls.length).toBe(1);
                expect(asbpSpies._addSubscriptionByLineItem.mock.calls[0]).toEqual([
                    undefined,
                    undefined,
                    false,
                ]);
            });

            it("should not find line item with invalid id", async () => {
                asbpSpies.refreshCart.mockImplementation(() => Promise.resolve(true));
                asbpSpies._addSubscriptionByLineItem.mockImplementation(() =>
                    Promise.resolve(true)
                );

                await cart.addSubscriptionByLineItemId(-1);

                expect(asbpSpies._addSubscriptionByLineItem.mock.calls.length).toBe(1);
                expect(asbpSpies._addSubscriptionByLineItem.mock.calls[0]).toEqual([
                    undefined,
                    undefined,
                    false,
                ]);
            });

            it("should find line item with valid id", async () => {
                asbpSpies.refreshCart.mockImplementation(() => Promise.resolve(true));
                asbpSpies._addSubscriptionByLineItem.mockImplementation(() =>
                    Promise.resolve(true)
                );

                await cart.addSubscriptionByLineItemId("test-002", 60);

                expect(asbpSpies._addSubscriptionByLineItem.mock.calls.length).toBe(1);
                expect(asbpSpies._addSubscriptionByLineItem.mock.calls[0]).toEqual([
                    {
                        productId: 1,
                        variantId: 2,
                        id: "test-002",
                        rcaData: {
                            subscriptions: [
                                { order_interval_frequency_options: ["30", "60", "90"] },
                            ],
                        },
                    },
                    60,
                    false,
                ]);
            });
        });

        describe("_addSubscriptionByLineItem", () => {
            var cart;
            const asbpSpies = {};
            const mockLineItems = [
                {
                    productId: 1,
                    variantId: 2,
                    id: "test-003",
                    rcaData: {
                        subscriptions: [{ order_interval_frequency_options: ["30", "60", "90"] }],
                    },
                },
            ];

            beforeEach(() => {
                cart = BigcommerceInterface.cart;

                asbpSpies.refreshCart = jest.spyOn(cart, "refreshCart");
                asbpSpies.getProductSubscriptionData = jest.spyOn(
                    cart,
                    "getProductSubscriptionData"
                );
                asbpSpies.subscription_addProductToSubscriptions = jest.spyOn(
                    subscription,
                    "addProductToSubscriptions"
                );

                cart.checkoutData = {
                    mock: true,
                    cart: {},
                };

                asbpSpies.getProductSubscriptionData.mockImplementation(() => ({}));
                asbpSpies.subscription_addProductToSubscriptions.mockImplementation(() =>
                    Promise.resolve({})
                );
            });

            afterEach(() => {
                // eslint-disable-next-line
                Object.entries(asbpSpies).forEach(([key, spy]) => spy.mockRestore());
            });

            it("should return false with invalid line item object", async () => {
                asbpSpies.refreshCart.mockImplementation(() => Promise.resolve(true));

                const response = await cart._addSubscriptionByLineItem(undefined);

                expect(response).toBe(false);
            });

            it("should return false with empty line item", async () => {
                asbpSpies.refreshCart.mockImplementation(() => Promise.resolve(true));

                const response = await cart._addSubscriptionByLineItem({});

                expect(response).toBe(false);
            });

            it("should return false with mssing selected frequency", async () => {
                asbpSpies.refreshCart.mockImplementation(() => Promise.resolve(true));

                const lineItem = mockLineItems.find((item) => item.id === "test-003");

                const response = await cart._addSubscriptionByLineItem(lineItem, undefined);

                expect(response).toBe(false);
            });

            it("should return false with missing incorrect frequency", async () => {
                asbpSpies.refreshCart.mockImplementation(() => Promise.resolve(true));

                const lineItem = mockLineItems.find((item) => item.id === "test-003");

                const response = await cart._addSubscriptionByLineItem(lineItem, -1);

                expect(response).toBe(false);
            });

            it("should return true with valid line item and valid frequency", async () => {
                asbpSpies.refreshCart.mockImplementation(() => Promise.resolve(true));
                asbpSpies.getProductSubscriptionData.mockImplementation(() => ({}));

                const lineItem = mockLineItems.find((item) => item.id === "test-003");

                const response = await cart._addSubscriptionByLineItem(lineItem, 90);

                expect(response).toBe(true);
                expect(asbpSpies.getProductSubscriptionData.mock.calls.length).toBe(1);
                expect(asbpSpies.getProductSubscriptionData.mock.calls[0]).toEqual([
                    lineItem.productId,
                ]);

                expect(asbpSpies.subscription_addProductToSubscriptions.mock.calls.length).toBe(1);
                expect(asbpSpies.subscription_addProductToSubscriptions.mock.calls[0]).toEqual([
                    lineItem.productId,
                    lineItem.variantId,
                    cart.cartData,
                    {},
                    true,
                    90,
                ]);
            });
        });
    });
});
