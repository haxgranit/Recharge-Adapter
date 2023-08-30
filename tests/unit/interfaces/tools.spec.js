import { createLocalVue } from "@vue/test-utils";
describe("tools", () => {
    const mockDate = new Date(1466424490000);
    jest.spyOn(global.Date, "now").mockImplementation(() => mockDate.getTime());
    const vueSpy = createLocalVue();
    const utilsSpy = {
        AppVue: jest.fn(),
        initVueOptions: jest.fn(),
    };
    let customClassesMock = {};

    jest.doMock("vue", () => vueSpy);
    jest.doMock("@/core/utils", () => utilsSpy);
    jest.doMock("@/bigcommerce/config/custom-classes.json", () => customClassesMock);

    const { default: TestingTool } = require("@/core/interfaces/tools");

    // Turn off console.log, console.error and console.debug messages
    beforeAll(() => {
        jest.spyOn(console, "log").mockImplementation(jest.fn());
        jest.spyOn(console, "error").mockImplementation(jest.fn());
        jest.spyOn(console, "debug").mockImplementation(jest.fn());
        jest.spyOn(console, "warn").mockImplementation(jest.fn());
        jest.spyOn(console, "group").mockImplementation(jest.fn());
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it("should be defined", () => {
        expect(TestingTool).toBeDefined();
        expect(typeof TestingTool).toBe("object");
    });

    it("should export checkClasses", () => {
        expect(typeof TestingTool.checkClasses).toBe("function");
    });

    it("should export runTestingTool", () => {
        expect(typeof TestingTool.runTestingTool).toBe("function");
    });

    it("should export testing", () => {
        expect(TestingTool.runTestingTool).toBeDefined();
        expect(typeof TestingTool.testing).toBe("object");
    });

    describe("testing", () => {
        const testing = TestingTool.testing;

        describe("storeData", () => {
            it("should have set RCA_FILE_DATA to default values", () => {
                expect(testing.storeData.RCA_FILE_DATA).toEqual({
                    updated_at: mockDate.getTime(),
                    version: "Testing",
                });
            });
            it("should have set RCA_PRODUCT_DATA to default values", () => {
                expect(testing.storeData.RCA_PRODUCT_DATA).toEqual([
                    {
                        discounts: [],
                        id: null,
                        tax_code: "",
                        variants: [{ id: null, weight: 1, tax_code: "", tax_class_id: "" }],
                        weight: 1,
                        subscriptions: [
                            {
                                discount_amount: 10,
                                discount_type: "percentage",
                                charge_interval_frequency: 30,
                                order_interval_unit: "day",
                                storefront_purchase_options: "subscription_and_onetime",
                                expire_after_specific_number_of_charges: null,
                                order_interval_frequency_options: ["30", "100", "1000"],
                            },
                        ],
                    },
                ]);
            });

            it("should have set RCA_STORE_DATA to default values", () => {
                expect(testing.storeData.RCA_STORE_DATA).toEqual({
                    rc_domain: "recharge-sandbox-1.mybigcommerce.com",
                    hash: "t7ixprxojs",
                    weight_units: "LBS",
                });
            });

            describe("getSubscriptionsByBCProductID", () => {
                it("should not find subscription with missing product id", () => {
                    const MOCK_RCA_PRODUCT_DATA = [{ id: 10 }, { id: 11 }, { id: 12 }];
                    const res = testing.storeData.getSubscriptionsByBCProductID.call(
                        { RCA_PRODUCT_DATA: MOCK_RCA_PRODUCT_DATA },
                        "MOCKID"
                    );
                    expect(res).toEqual(null);
                });

                it("should find subscription with product id", () => {
                    const MOCK_RCA_PRODUCT_DATA = [
                        { id: "10", subscriptions: "MOCK SUBSCRPTION" },
                        { id: "11" },
                        { id: "12" },
                    ];
                    const res = testing.storeData.getSubscriptionsByBCProductID.call(
                        { RCA_PRODUCT_DATA: MOCK_RCA_PRODUCT_DATA },
                        10
                    );
                    expect(res).toEqual("MOCK SUBSCRPTION");
                });
            });

            describe("getStoreDomain", () => {
                it("should return domain", () => {
                    const res = testing.storeData.getStoreDomain.call({
                        RCA_STORE_DATA: { rc_domain: "mock_domain" },
                    });
                    expect(res).toEqual("mock_domain");
                });
            });

            describe("getStoreHash", () => {
                it("should return hash", () => {
                    const res = testing.storeData.getStoreHash.call({
                        RCA_STORE_DATA: { hash: "mock_hash" },
                    });
                    expect(res).toEqual("mock_hash");
                });
            });

            describe("getter", () => {
                const _win_data = { ...global.window.RCA_DATA };
                const _mockData = { ...testing.mockData };
                const _RCA_store_objects = { ...global.window.RCA_store_objects };

                afterEach(() => {
                    global.window.RCA_DATA = _win_data;
                    global.window.RCA_store_objects = _RCA_store_objects;
                    testing.mockData = _mockData;
                });

                it("should return global data set", () => {
                    const MOCK_DATA = { RCA_PRODUCT_DATA: [] };
                    global.window.RCA_DATA = MOCK_DATA;

                    const res = testing.storeData;
                    expect(res).toEqual(MOCK_DATA);
                });

                it("should update product data from current id", () => {
                    const MOCK_DATA = {
                        RCA_PRODUCT_DATA: [
                            {
                                id: 10,
                                subscriptions: [
                                    { order_interval_frequency_options: ["MOCK_FREQ_OPTIONS"] },
                                ],
                            },
                        ],
                    };
                    testing.mockData = { mockSubscriptionData: "MOCK_SUBS" };
                    global.window.RCA_DATA = MOCK_DATA;
                    global.window.RCA_store_objects = { product: { id: 10 } };

                    const res = testing.storeData;
                    expect(res).toEqual({
                        RCA_PRODUCT_DATA: [
                            {
                                id: 10,
                                subscriptions: [
                                    { order_interval_frequency_options: ["MOCK_FREQ_OPTIONS"] },
                                ],
                            },
                            undefined,
                        ],
                    });
                });
            });
        });

        describe("storeObjectData", () => {
            const _mockData = { ...testing.mockData };

            afterEach(() => {
                testing.mockData = _mockData;
            });

            it("should return mock store data", () => {
                global.window.RCA_store_objects = null;
                testing.mockData = { mockStoreObject: "MOCK_OBJECT" };
                expect(testing.storeObjectData).toEqual("MOCK_OBJECT");
            });

            it("should return global store data", () => {
                global.window.RCA_store_objects = { mock: "MOCK" };
                expect(testing.storeObjectData).toEqual({ mock: "MOCK" });
            });
        });

        describe("storePageSettings", () => {
            const _RCA_SETTINGS = { ...global.window.RCA_SETTINGS };
            const _MOCK_SETTINGS = testing.mockData;

            afterEach(() => {
                global.window.RCA_SETTINGS = _RCA_SETTINGS;
                testing.mockData = _MOCK_SETTINGS;
            });

            it("should return mock data", () => {
                global.window.RCA_SETTINGS = null;
                testing.mockData = { mockSettings: "MOCK_SETTINGS" };
                expect(testing.storePageSettings).toEqual("MOCK_SETTINGS");
            });

            it("should return window data", () => {
                global.window.RCA_SETTINGS = { mock: "RCA_SETTINGS" };
                expect(testing.storePageSettings).toEqual({ mock: "RCA_SETTINGS" });
            });
        });

        describe("currentProductId", () => {
            const _storeObjects = { ...global.RCA_store_objects };
            const _spys = {};

            beforeEach(() => {
                _spys.querySelector = jest.spyOn(global.document, "querySelector");
            });

            afterEach(() => {
                global.RCA_store_objects = _storeObjects;
                jest.resetAllMocks();
            });

            it.todo("should return window data");

            it("should return null if element not found", () => {
                global.window.RCA_store_objects = undefined;
                _spys.querySelector.mockImplementation(() => undefined);
                expect(testing.currentProductId).toEqual(null);
            });

            it("should return null if value undefined", () => {
                global.window.RCA_store_objects = undefined;
                _spys.querySelector.mockImplementation(() => ({ value: undefined }));
                expect(testing.currentProductId).toEqual(null);
            });

            it("should return document value", () => {
                global.window.RCA_store_objects = undefined;
                _spys.querySelector.mockImplementation(() => ({ value: "10" }));
                expect(testing.currentProductId).toEqual(10);
            });
        });

        describe("app", () => {
            const _mockData = { ...testing.mockData };
            const _win_data = { ...global.window.RCA_DATA };
            const _win_location = { ...global.window.location };

            beforeEach(() => {
                global.window.RCA_DATA = null;
            });
            afterEach(() => {
                testing.mockData = _mockData;
                global.window.RCA_DATA = _win_data;
                global.window.location = _win_location;
                jest.resetAllMocks();
            });

            it("should initialize app and return", () => {
                delete global.window.location;
                global.window.location = { host: "mockdomain" };
                utilsSpy.AppVue.mockImplementation(() => ({
                    mock: true,
                    bigcommerce: { storefront: { cart: { domain: undefined } } },
                }));
                const resp = testing.app;
                expect(resp).toEqual({
                    bigcommerce: { storefront: { cart: { domain: "mockdomain" } } },
                    mock: true,
                });
                expect(utilsSpy.initVueOptions).toHaveBeenCalledTimes(1);
            });
        });

        describe("checkClasses", () => {
            const _customClassesMock = { ...customClassesMock };
            const _spys = { querySelector: jest.spyOn(global.document, "querySelector") };

            beforeEach(() => {
                for (var prop in customClassesMock) delete customClassesMock[prop];
            });

            afterEach(() => {
                Object.apply(customClassesMock, _customClassesMock);
                jest.resetAllMocks();
            });

            it("should report missing/discovered classes on console", () => {
                _spys.querySelector.mockReturnValueOnce({}).mockReturnValueOnce(null);
                customClassesMock.found = { foundclass: { custom_class: "found" } };
                customClassesMock.missing = [{ custom_class: "missing" }];

                testing.checkClasses();
                expect(_spys.querySelector).toHaveBeenNthCalledWith(1, ".found");
                expect(_spys.querySelector).toHaveBeenNthCalledWith(2, ".missing");

                expect(console.log).toHaveBeenCalledWith({
                    found: { added_classes: [{ custom_class: "found" }], missing_classes: [] },
                    missing: { added_classes: [], missing_classes: [{ custom_class: "missing" }] },
                });
            });
        });

        describe("loadCustomerData", () => {
            it("should update customer data", async () => {
                jest.spyOn(global.Date, "now").mockImplementation(() => mockDate.getTime());

                expect.assertions(2);

                const mock = {
                    app: {
                        mock: true,
                        storeHash: "mock_hash",
                        $store_objects: { customer: undefined },
                        $store: { dispatch: jest.fn() },
                    },
                    mockData: {
                        mockCustomerObject: { email: "me@mock.com", id: "10" },
                    },
                };
                await testing.loadCustomerData.call(mock);

                expect(mock.app.$store_objects.customer).toEqual({
                    email: "me@mock.com",
                    id: "10",
                });
                expect(mock.app.$store.dispatch).toHaveBeenCalledWith("customer/saveCustomer", {
                    customerData: {
                        email: "me@mock.com",
                        expiration: 1466425090000,
                        id: "10",
                        rechargeCustomerHash: "fakeRechargeCustomerHash",
                        rechargeCustomerId: 17235368236829,
                        token: "fakeCustomerToken",
                        tokenExpiration: 1466446090000,
                    },
                    key: "mock_hash-rca-key",
                });
            });
        });

        describe("run", () => {
            afterEach(jest.resetAllMocks);

            it("should load data and mount component", async () => {
                expect.assertions(3);

                const mock = {
                    loadCustomerData: jest.fn().mockResolvedValue(),
                    app: { $mount: jest.fn() },
                };
                const ret = await testing.run.call(mock);

                expect(mock.loadCustomerData).toHaveBeenCalledTimes(1);
                expect(mock.app.$mount).toHaveBeenCalledTimes(1);
                expect(ret).toEqual(mock.app);
            });
        });
    });
});
