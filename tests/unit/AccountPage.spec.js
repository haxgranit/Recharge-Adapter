import { AccountPage } from "@/bigcommerce/pages";
import { CustomClassesMixin } from "../../src/bigcommerce/vue/mixins";
import { CustomerMixin } from "../../src/core/vue/mixins";
import { mountLocalVue } from "../test_utils/localVue";

describe("AccountPage", () => {
    let wrapper;
    let spyPreloadCustomerPortalUrl;
    let spyCheckExistCustomElements;
    let spyAddCustomClassesToGroup;
    beforeAll(() => {
        spyPreloadCustomerPortalUrl = jest.spyOn(CustomerMixin.methods, "preloadCustomerPortalUrl");
        spyCheckExistCustomElements = jest.spyOn(AccountPage.methods, "checkExistCustomElements");
        spyAddCustomClassesToGroup = jest.spyOn(
            CustomClassesMixin.methods,
            "addCustomClassesToGroup"
        );
        wrapper = mountLocalVue(AccountPage);
    });
    describe("mounted", () => {
        it('should call addCustomClassesToGroup with "account"', function () {
            expect(spyAddCustomClassesToGroup).toHaveBeenCalledWith("account");
        });
        it("should set displayLinks to true", function () {
            expect(wrapper.vm.displayLinks).toEqual(true);
        });
        it("should call checkExistCustomElements", function () {
            expect(spyCheckExistCustomElements).toHaveBeenCalled();
        });
        it("should call preloadCustomerPortalUrl", function () {
            expect(spyPreloadCustomerPortalUrl).toHaveBeenCalled();
        });
    });
});
