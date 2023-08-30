import { App } from "@/bigcommerce/pages";
import { appSupportedPageTypes } from "@/bigcommerce/vue/plugins";
import { mountLocalVue } from "../test_utils/localVue";

describe("App", () => {
    describe("App", () => {
        let mutationObserverMock;
        let wrapper;

        const mockPropsData = {
            supportedPageTypes: appSupportedPageTypes,
            quickViewObserver: null,
            rcaSettingsData: null,
            jsonRequestInterval: null,
            jsonRequestIntervalTime: 30000,
            isQuickView: false,
            isProductObserverStarted: false,
        };

        beforeAll(() => {
            mutationObserverMock = jest.fn(function MutationObserver(callback) {
                this.observe = jest.fn();
                this.disconnect = jest.fn();
                this.trigger = (mockedMutationsList) => {
                    callback(mockedMutationsList, this);
                };
            });
            global.MutationObserver = mutationObserverMock;
            wrapper = mountLocalVue(App);
        });
        beforeEach(() => jest.clearAllMocks());

        it("should return an array of HTML Collection", function () {
            const getCustomClassElements = jest.fn().mockReturnValueOnce(["cart_quick_link"]);
            const collection = App.computed.cartElements.call({
                getCustomClassElements,
            });

            expect(collection).toEqual(["cart_quick_link"]);
            expect(getCustomClassElements).toBeCalledTimes(1);
            expect(getCustomClassElements.mock.calls[0]).toEqual(["cart_quick_link"]);
        });

        it("should add custom classes", function () {
            const addCustomClassesToGroup = jest.fn();
            App.methods.addCustomClasses.call({ addCustomClassesToGroup });

            expect(addCustomClassesToGroup).toBeCalledTimes(4);
            expect(addCustomClassesToGroup.mock.calls[0]).toEqual(["ALL"]);
            expect(addCustomClassesToGroup.mock.calls[1]).toEqual(["PRODUCT"]);
            expect(addCustomClassesToGroup.mock.calls[2]).toEqual(["CART"]);
            expect(addCustomClassesToGroup.mock.calls[3]).toEqual(["CATEGORY"]);
        });

        it("should observe quickview when to add subscription elements", function () {
            expect(App.methods.startQuickviewObserve).not.toHaveBeenCalled();

            wrapper.vm.startQuickviewObserve();
            expect(App.methods.startQuickviewObserve).toHaveBeenCalled();
            expect(wrapper.vm.additionalCheckoutButtonsObserver()).toEqual(
                expect.objectContaining({
                    start: expect.any(Function),
                    stop: expect.any(Function),
                })
            );
        });

        it("should enable settings", function () {
            // TODO This doesn't really test anything valuable and should be updated.
            expect(wrapper.vm.isEnabled).toBe(false);
        });

        it("should enable settings but set store data to false", function () {
            wrapper.setData({
                ...mockPropsData,
                settings: {
                    enabled: true,
                },
            });
            expect(wrapper.vm.isEnabled).toBe(true);
            wrapper.vm.$store_data = false;
        });

        it("should disable settings", async function () {
            wrapper.setData({
                ...mockPropsData,
                settings: {
                    enabled: true,
                },
            });
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.disableApp).not.toHaveBeenCalled();
            wrapper.setData({
                settings: {
                    enabled: false,
                },
            });
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.disableApp).toHaveBeenCalled();
            expect(wrapper.vm.$logger.error).toHaveBeenCalled();
        });

        it("should enable settings but set store data to true", function () {
            // TODO What does this actually test? Update or replace this.
            wrapper.setData({
                ...mockPropsData,
                settings: {
                    enabled: true,
                },
            });
            expect(wrapper.vm.isEnabled).toBe(true);
            wrapper.vm.$store_data = true;
        });

        it.skip("should watch changes of settingsLoader", async function () {
            // FIXME The watcher is broken. Evaluate if this watcher is still needed and update.
            jest.spyOn(wrapper.vm.settingsLoader, "refresh");
            wrapper.setData({
                ...mockPropsData,
                settingsLoader: {
                    version: false,
                },
            });
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.$logger.debug).toHaveBeenCalled();
        });
    });

    describe("methods", () => {
        let data = {};
        let additionalCheckoutButtonsMethods;
        let additionalCheckoutButton;
        beforeAll(() => {
            jest.spyOn(App, "mounted").mockImplementation(jest.fn());
            data.wrapper = mountLocalVue(App);
            data.wrapper.vm
                .$("body")
                .append(
                    "<button class='rca-additionalCheckoutButton' style='display:block;'>Google Pay</button>"
                );
            [additionalCheckoutButton] = data.wrapper.vm.$(".rca-additionalCheckoutButton");
        });
        describe("additionalCheckoutButtonsObserver", () => {
            it("returns an object containing start, stop and hideAdditionalCheckoutButtonsIfRechargeCart functions", () => {
                additionalCheckoutButtonsMethods =
                    data.wrapper.vm.additionalCheckoutButtonsObserver();
                expect(additionalCheckoutButtonsMethods).toEqual(
                    expect.objectContaining({
                        start: expect.any(Function),
                        stop: expect.any(Function),
                        hideAdditionalCheckoutButtonsIfRechargeCart: expect.any(Function),
                    })
                );
            });
            it("does not hide additional checkout buttons when isRechargeCart returns false", () => {
                jest.spyOn(
                    data.wrapper.vm.bigcommerce.storefront.cart,
                    "isRechargeCart",
                    "get"
                ).mockReturnValue(false);
                additionalCheckoutButtonsMethods.hideAdditionalCheckoutButtonsIfRechargeCart();
                expect(additionalCheckoutButton.style.display).toEqual("block");
            });
            it("hides additional checkout buttons when isRechargeCart returns true", () => {
                jest.spyOn(
                    data.wrapper.vm.bigcommerce.storefront.cart,
                    "isRechargeCart",
                    "get"
                ).mockReturnValue(true);
                additionalCheckoutButtonsMethods.hideAdditionalCheckoutButtonsIfRechargeCart();
                expect(additionalCheckoutButton.style.display).toEqual("none");
            });
            it("calls jquery observe when start is called", () => {
                jest.spyOn(data.wrapper.vm.$.fn, "observe");
                additionalCheckoutButtonsMethods.start();
                expect(data.wrapper.vm.$.fn.observe).toHaveBeenCalledWith(
                    "childlist subtree",
                    additionalCheckoutButtonsMethods.hideAdditionalCheckoutButtonsIfRechargeCart
                );
            });
            it("calls jquery disconnect when stop is called", () => {
                jest.spyOn(data.wrapper.vm.$.fn, "disconnect");
                additionalCheckoutButtonsMethods.stop();
                expect(data.wrapper.vm.$.fn.disconnect).toHaveBeenCalledWith(
                    "childlist subtree",
                    additionalCheckoutButtonsMethods.hideAdditionalCheckoutButtonsIfRechargeCart
                );
            });
        });
        it.todo("startQuickviewObserve");
        it.todo("addCustomClasses");
        it.todo("startQuickSearchObserver");
        it.todo("disableApp");
        it.todo("isAppDisabled");
        it.todo("getSubscriptions");
        it.todo("clearExpiredCustomers");
    });
    describe("Recharge Test URL", () => {
        it("should return true if the window.location contains ?recharge=true ", () => {
            delete window.location;
            const mockLocation = new URL("https://thecameoco.com/?recharge=true");
            window.location = mockLocation;
            const test = App.computed.isTestModeEnabled.call();
            expect(test).toBe(true);
        });

        it("should return true if the window.location contains ?recharge=test", () => {
            delete window.location;
            const mockLocation = new URL("https://thecameoco.com/?recharge=test");
            window.location = mockLocation;
            const test = App.computed.isTestModeEnabled.call();
            expect(test).toBe(true);
        });

        it("should return false if the window.location contains ?recharge=x", () => {
            delete window.location;
            const mockLocation = new URL("https://thecameoco.com/?recharge=x");
            window.location = mockLocation;
            const test = App.computed.isTestModeEnabled.call();
            expect(test).toBe(false);
        });
    });
});
