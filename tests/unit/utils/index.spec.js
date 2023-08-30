import {
    settingsMapping,
    CartHelper,
    EventBus,
    BaseMutationObserver,
    waitForElementToExist,
    doesElementExist,
    isElementVisible,
    waitForElementVisible,
    waitForTrue,
    listElementStyleClasses,
    decodeHtmlEntity,
    AppVue,
    initVueOptions,
    adapterBackendMixin,
    AdapterBackendHelper,
    MappedObject,
    MergedObject,
    RechargeMixin,
    recharge,
    RechargeSettingsHelper,
    buildRequest,
    requestMixin,
} from "../../../src/core/utils";

describe("Core Utils", () => {
    it("should import settings-mapping", () => {
        expect(settingsMapping).not.toBeUndefined();
    });

    it("should import cart-helper", () => {
        expect(CartHelper).not.toBeUndefined();
    });

    it("should import event-bus", () => {
        expect(EventBus).not.toBeUndefined();
    });

    it("should import mutation-observer-helper", () => {
        expect(BaseMutationObserver).not.toBeUndefined();
    });

    it("should import dom-helper", () => {
        expect(waitForElementToExist).not.toBeUndefined();
        expect(doesElementExist).not.toBeUndefined();
        expect(isElementVisible).not.toBeUndefined();
        expect(waitForElementVisible).not.toBeUndefined();
        expect(waitForTrue).not.toBeUndefined();
        expect(listElementStyleClasses).not.toBeUndefined();
        expect(decodeHtmlEntity).not.toBeUndefined();
    });

    it("should import vue-helper", () => {
        expect(AppVue).not.toBeUndefined();
        expect(initVueOptions).not.toBeUndefined();
    });

    it("should import adapter-backend-helper", () => {
        expect(adapterBackendMixin).not.toBeUndefined();
        expect(AdapterBackendHelper).not.toBeUndefined();
    });

    it("should import object-helper", () => {
        expect(MappedObject).not.toBeUndefined();
        expect(MergedObject).not.toBeUndefined();
    });

    it("should import recharge-helper", () => {
        expect(RechargeMixin).not.toBeUndefined();
        expect(recharge).not.toBeUndefined();
        expect(RechargeSettingsHelper).not.toBeUndefined();
    });

    it("should import url-helper", () => {
        expect(buildRequest).not.toBeUndefined();
        expect(requestMixin).not.toBeUndefined();
    });
});
