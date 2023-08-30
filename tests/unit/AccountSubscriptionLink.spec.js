import { AccountSubscriptionLink } from "@/bigcommerce/pages";
import jQuery from "jquery-slim";

describe("AccountSubscriptionLink", () => {
    let mockGetCustomClass;
    let mockGetCustomClassElement;

    beforeAll(() => {
        mockGetCustomClass = jest.fn();
        mockGetCustomClassElement = jest.fn();
    });
    /** Source : https://alexjover.com/blog/test-computed-properties-and-watchers-in-vue-js-components-with-jest. */
    describe("AccountSubscriptionLink computed properties", () => {
        describe("mountTo", () => {
            it("should return custom class for customClassId that exists", () => {
                const localThis = {
                    customClassId: "account_navbar_section",
                    getCustomClass: mockGetCustomClass.mockReturnValueOnce(
                        ".rca-account-navbar-section"
                    ),
                };

                expect(AccountSubscriptionLink.computed.mountTo.call(localThis)).toEqual(
                    ".rca-account-navbar-section"
                );
            });
            it("should not stop execution for customClassId that does not exist", () => {
                const localThis = {
                    customClassId: "",
                    getCustomClass: mockGetCustomClass.mockReturnValueOnce(""),
                };
                expect(AccountSubscriptionLink.computed.mountTo.call(localThis)).toEqual("");
            });
        });
        describe("uniqueSelectorLink", () => {
            it("should return a unique selector for manage subscriptions link", () => {
                const localThis = {
                    mountTo: ".rca-account-navbar-section",
                    getCustomClass: mockGetCustomClass.mockReturnValueOnce(
                        ".rca-manage-subscriptions"
                    ),
                };
                expect(
                    AccountSubscriptionLink.computed.uniqueSelectorLink.call(localThis)
                ).toStrictEqual(".rca-account-navbar-section .rca-manage-subscriptions");
            });
        });

        describe("appendClasses", () => {
            const listNode = document.createElement("ul");
            listNode.innerHTML =
                '<ul class="navBar-section rca-account-navbar-section"><li class="navPages-list navPages-list--user navBar-item navBar-action" style="cursor: pointer;"></li> <li class="navBar-item navBar-action" style="cursor: pointer; display: inline-flex;"><span class="navBar-action">Subscriptions</span></li><li class="navBar-item is-active" id="accountPage-orders"><a class="navBar-action" href="/account.php?action=order_status"><i class="far fa-clipboard"></i>Orders</a></li><li class="navBar-item"><a class="navBar-action" href="/account.php?action=inbox"><i class="far fa-comment-alt"></i>Messages (0)</a></li><li class="navBar-item"><a class="navBar-action" href="/account.php?action=address_book"><i class="far fa-address-book"></i>Addresses</a></li><li class="navBar-item"><a class="navBar-action" href="/account.php?action=recent_items"><i class="far fa-eye"></i>Recently Viewed</a></li><li class="navBar-item"><a class="navBar-action" href="/account.php?action=account_details"><i class="fas fa-sliders-h"></i>Account Settings</a></li><li class="navBar-item rca-manage-subscriptions"><a href="https://customerportal.getlivfresh.com/portal/13dd6a2c0964eb790a9762adda4ee0/schedule?token=e8b9956fcdb949a198792fcb96a75086" target="_blank" class="navBar-action" style="--color:#757575;"> Manage Subscriptions</a></li></ul>';
            it("should return the correct list of classes for parent of manage subscriptions link", () => {
                const localThis = {
                    getCustomClassElement: mockGetCustomClassElement.mockReturnValueOnce(listNode),
                    $: jQuery,
                };
                expect(AccountSubscriptionLink.computed.appendClasses.call(localThis)).toEqual(
                    "navBar-item"
                );
            });
        });

        describe("linkClasses", () => {
            const listNode = document.createElement("ul");
            //mocking nav from livFresh
            listNode.innerHTML =
                '<ul class="rca-account-navbar-section"><li class="navPages-list navPages-list--user navBar-item navBar-action" style="cursor: pointer;"></li><li class="navBar-item navBar-action" style="cursor: pointer; display: inline-flex;"><span class="navBar-action">Subscriptions</span></li><li class="navBar-item is-active" id="accountPage-orders"><a class="navBar-action" href="#"><i class="far fa-clipboard"></i>Orders</a></li><li class="navBar-item"><a class="navBar-action" href="#"><i class="far fa-comment-alt"></i>Messages (0)</a></li><li class="rca-manage-subscriptions"><a href="#" target="_blank" class="navBar-action" style="--color:#757575;">Manage Subscriptions</a></li></ul>';

            it("should return the classes for the manage subscriptions link with isLiveLink true", () => {
                const localThis = {
                    customClassId: "account_navbar_section",
                    getCustomClassElement: mockGetCustomClassElement.mockReturnValueOnce(listNode),
                    isLiveLink: true,
                };
                expect(AccountSubscriptionLink.computed.linkClasses.call(localThis)).toEqual(
                    "navBar-action"
                );
            });
            it("should return the classes for the manage subscriptions link with isLiveLink false", () => {
                const localThis = {
                    customClassId: "account_navbar_section",
                    getCustomClassElement: mockGetCustomClassElement.mockReturnValueOnce(listNode),
                    isLiveLink: false,
                };
                expect(AccountSubscriptionLink.computed.linkClasses.call(localThis)).toEqual(
                    "navBar-action rca-link--disabled rca-link--no-hover .rca-manage-subscription"
                );
            });
        });

        describe("isLiveLink", () => {
            it("should return false if href is not set", () => {
                const localThis = {
                    href: "",
                };
                expect(AccountSubscriptionLink.computed.isLiveLink.call(localThis)).toBe(false);
            });
            it("should return true if href is  set", () => {
                const localThis = {
                    href: "https://www.testurl.com",
                };
                expect(AccountSubscriptionLink.computed.isLiveLink.call(localThis)).toBe(true);
            });
        });

        describe("cssVariables", () => {
            it("should return color-textSecondary value if theme setting is set", () => {
                const localThis = {
                    $store_objects: {
                        theme_settings: {
                            "color-textSecondary": "#757575",
                        },
                    },
                };
                expect(AccountSubscriptionLink.computed.cssVariables.call(localThis)).toEqual({
                    "--color": "#757575",
                });
            });
            it("should return inherit if theme is not set", () => {
                const localThis = {
                    $store_objects: {},
                };
                expect(AccountSubscriptionLink.computed.cssVariables.call(localThis)).toEqual({
                    "--color": "inherit",
                });
            });
        });
    });
});
