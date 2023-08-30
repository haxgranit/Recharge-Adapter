import CustomerMixin from "@/core/vue/mixins/customer";
import { mountLocalVue } from "../../test_utils/localVue";
import { merge, omit } from "lodash";
import { BigcommerceCustomer } from "@/bigcommerce/utils";
import { AdapterBackendHelper } from "@/core/utils";
import Zachs_store from "../../data/zachs_store/zachs_store";

/** All mocks used within the tests below. */
const mocks = {
    time: {
        future: (mins = 1) => mocks.time.current + mins * 60 * 1000,
        current: Date.now(),
        past: (mins = 1) => mocks.time.current - mins * 60 * 1000,
    },
    /** Used to mock a successful `adapter.getRechargePortalData` call. */
    portalData: {
        base_url: "mock-base-portal-url",
        customer_hash: "mock-customer-hash",
        expires_at: "mock-exiration-time",
        portal_url: "mock-portal-url",
        temp_token: "mock-temp-token",
    },
};
/**
 * @type {savedCustomer} Mock for the currentCustomer object within the customer mixin.
 */
mocks.currentCustomer = {
    id: Zachs_store.storeObjectsData.customer.id,
    email: Zachs_store.storeObjectsData.customer.email,
    rechargeCustomerId: "mock_rc_id",
    rechargeCustomerHash: "mock_rc_hash",
    token: null,
    expiration: mocks.time.current,
    tokenExpiration: null,
    portalUrl: null,
};
/** Used to mock `this.bigcommerce.storefront.customer.get_current()` call. */
mocks.storefrontCustomer = {
    created_at: "mock_created_at",
    customer_hash: "mock-customer-hash",
    email: mocks.currentCustomer.email,
    platform: "mock_platform",
    platform_id: mocks.currentCustomer.id,
    rc_hash: mocks.currentCustomer.rechargeCustomerHash,
    rc_id: mocks.currentCustomer.rechargeCustomerId,
    store_hash: Zachs_store.RCA_DATA.getStoreHash(),
    store_id: "mock_store_id",
};
/**
 * A mutable object used within tests in place of currentCustomer.
 * Any changes to this object are reset in-between tests.
 * @type {savedCustomer}
 */
let mockedCustomer = mocks.currentCustomer;
let wrapper;
/**
 * Mocks key functions before mounting `CustomerMixin` with necessary options.
 * @param {object} root The root object.
 * @param {object} root.extra Any extra parameters to pass into `mountLocalVue`.
 * @param {object} root.portalData Overrides for `adapter.getRechargePortalData` return.
 * @param {object} root.currentTime Overrides for `Date.now()` return.
 * @returns {Wrapper}
 */
const setup = ({
    extra = {},
    portalData = mocks.portalData,
    currentTime = mocks.time.current,
} = {}) => {
    jest.spyOn(BigcommerceCustomer.prototype, "get_current").mockResolvedValue(
        mocks.storefrontCustomer
    );
    jest.spyOn(Date, "now").mockReturnValue(currentTime);
    jest.spyOn(AdapterBackendHelper.prototype, "getRechargePortalData").mockReturnValue(portalData);
    return mountLocalVue(
        CustomerMixin,
        merge(
            {
                storeOptions: {
                    storeObjectsData: Zachs_store.storeObjectsData,
                    storeData: Zachs_store.RCA_DATA,
                },
                options: { render: () => undefined },
                mockMethods: {
                    /* eslint-disable require-await */
                    getCustomerFromStorage: async () => mockedCustomer,
                },
            },
            extra
        )
    );
};

describe("CustomerMixin", () => {
    process.env.BIGCOMMERCE_APP_URL = "https://api-dev.rechargeadapter.com";
    // mockEventBus.$emit.mockImplementation();
    beforeEach(() => {
        // Reset mockedCustomer
        mockedCustomer = { ...mocks.currentCustomer };
        // Reset wrapper
        wrapper = undefined;
        // Reset and restore mocks to their original values.
        jest.restoreAllMocks();
    });

    describe("Expiration info", () => {
        it("should get newCustomerExpiration", async function () {
            wrapper = setup();
            expect(await wrapper.vm.newCustomerExpiration()).toBeGreaterThan(mocks.time.current);
        });

        it("should get newTokenExpiration", async function () {
            wrapper = setup();
            expect(await wrapper.vm.newTokenExpiration()).toBeGreaterThan(mocks.time.current);
        });
        it.each`
            currentTime                | expected
            ${mocks.time.future(3000)} | ${true}
            ${mocks.time.past(300)}    | ${false}
        `(
            "should get isCustomerTokenExpired and return expired = $expected",
            async ({ expected, currentTime }) => {
                wrapper = setup();
                await wrapper.vm.getCurrentCustomer();
                await wrapper.vm.refreshCurrentCustomerData();
                // Now that the customer data is created, we want to go forward/backward in time.
                Date.now.mockReturnValue(currentTime);
                expect(await wrapper.vm.isCustomerTokenExpired()).toEqual(expected);
            }
        );
    });
    describe("refreshCurrentCustomerData", () => {
        it("should refresh currentCustomer data with data from recharge portal url when temp_token exists", async function () {
            wrapper = setup();
            await wrapper.vm.getCurrentCustomer();
            await wrapper.vm.refreshCurrentCustomerData();
            expect(wrapper.vm.currentCustomer).toEqual(
                expect.objectContaining({
                    portalUrl: "mock-portal-url",
                    token: "mock-temp-token",
                    tokenExpiration: wrapper.vm.newTokenExpiration(),
                })
            );
        });
        it("should not refresh currentCustomer data when temp_token does not exist", async function () {
            // This is the response sent by the adapter when a customer is not found.
            wrapper = setup({
                portalData: {
                    detail: {
                        msg: "Customer ID 0 not found",
                        request_id: "89834cb232602641",
                    },
                },
            });
            await wrapper.vm.getCurrentCustomer();
            await wrapper.vm.refreshCurrentCustomerData();
            expect(wrapper.vm.currentCustomer.token).toBeFalsy();
            expect(wrapper.vm.currentCustomer.portalUrl).toBeFalsy();
        });
    });
    describe("getCustomerFromRemote", () => {
        it("should get currentCustomer from storefront api", async function () {
            wrapper = setup();
            await wrapper.vm.getCustomerFromRemote();
            // Getting the expirations to match was proving tricky, and we don't care about the exact value.
            const expectedCustomer = omit(mocks.currentCustomer, "expiration");
            expect(wrapper.vm.currentCustomer).toMatchObject(expectedCustomer);
            expect(wrapper.vm.currentCustomer.expiration).toBeGreaterThan(mocks.time.current);
        });
    });
    describe("preloadCustomerPortalUrl", () => {
        it("should save current customer when active customer has subscriptions", async function () {
            wrapper = setup();
            await wrapper.vm.preloadCustomerPortalUrl();
            expect(wrapper.vm.saveCurrentCustomer).toHaveBeenCalledTimes(1);
        });
        it("should refresh current customer data when active customer has subscriptions and customer token is expired", async function () {
            // Mock an expired customer before mounting.
            mockedCustomer.tokenExpiration = mocks.time.past(300);
            wrapper = setup();
            await wrapper.vm.preloadCustomerPortalUrl();
            expect(wrapper.vm.refreshCurrentCustomerData).toHaveBeenCalledTimes(1);
        });
        it("should not save current customer when active customer has no subscriptions", async function () {
            // Mock a non-subscription customer before mounting.
            mockedCustomer.rechargeCustomerId = null;
            mockedCustomer.rechargeCustomerHash = null;
            wrapper = setup();
            await wrapper.vm.preloadCustomerPortalUrl();
            expect(wrapper.vm.saveCurrentCustomer).not.toBeCalled();
        });
    });
});
