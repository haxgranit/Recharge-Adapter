import { mountLocalVue } from "../../../test_utils/localVue";
import Zachs_store from "../../../data/zachs_store/zachs_store";
import { BigcommerceCart } from "@/bigcommerce/utils";

const mockCartId = Zachs_store.storeObjectsData.cart_id;
const [firstLineItemInCart, secondLineItemInCart] =
    Zachs_store.checkouts.withSubscription.cart.lineItems.physicalItems;
const mockSubscriptionData = {
    properties: null,
    shipping_unit: "day",
    shipping_frequency: 30,
    charge_frequency: 30,
    discount_type: "percentage",
    discount_amount: 12,
    storefront_purchase_options: "subscription_and_onetime",
};
const mockElementWithMissingLineItemAndCartIdsAndProductIdMatchingItemInCart = {
    ...mockSubscriptionData,
    cartid: null,
    line_item: null,
    productID: firstLineItemInCart.productId,
};
const mockElementPreviouslyMissingFromSubDataAddedAsOtp = {
    shipping_unit: null,
    shipping_frequency: null,
    charge_frequency: null,
    discount_type: null,
    discount_amount: null,
    storefront_purchase_options: null,
    properties: null,
    cartid: mockCartId,
    line_item: secondLineItemInCart.id,
    productID: secondLineItemInCart.productId,
};
const mockElementWithWrongCartId = {
    ...mockSubscriptionData,
    cartid: "wrong_cart_id",
    line_item: "zd5689b-0529-4566-8286-2ffe6567f8ed",
    productID: 144,
};
const mockElementWithLineItemIdNotInCart = {
    ...mockSubscriptionData,
    cartid: "48f718e0-6a46-452f-b699-b79464fcbe38",
    line_item: "right_cart_id_but_not_in_cart",
    productID: 145,
};
const mockSubData = [
    mockElementWithMissingLineItemAndCartIdsAndProductIdMatchingItemInCart,
    mockElementWithWrongCartId,
    mockElementWithLineItemIdNotInCart,
];
describe("BigcommercePlugin", () => {
    let wrapper;
    describe("getUpdatedCart", () => {
        beforeAll(async () => {
            jest.spyOn(BigcommerceCart.prototype, "getCheckoutData").mockResolvedValue({
                cartId: mockCartId,
                allLineItems: [firstLineItemInCart, secondLineItemInCart],
                subscriptionData: mockSubData,
            });
            wrapper = mountLocalVue({ methods: {} });
            await wrapper.vm.$store.dispatch("replaceSubData", mockSubData);
            await wrapper.vm.bigcommerce.getUpdatedCart();
        });
        it("should set cartid", () => {
            expect(wrapper.vm.$store.state.main.cartid).toEqual(mockCartId);
        });
        it("should update cartid and line_item of item in subdata that matches to item in cart", () => {
            expect(wrapper.vm.$store.state.main.subdata).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        ...mockElementWithMissingLineItemAndCartIdsAndProductIdMatchingItemInCart,
                        cartid: mockCartId,
                        line_item: firstLineItemInCart.id,
                    }),
                ])
            );
        });
        it("should add item from cart to subdata as otp when there are no elements in subdata that match to it", () => {
            expect(wrapper.vm.$store.state.main.subdata).toEqual(
                expect.arrayContaining([
                    expect.objectContaining(mockElementPreviouslyMissingFromSubDataAddedAsOtp),
                ])
            );
        });
        it("should remove items from subdata that are not in the cart", () => {
            expect(wrapper.vm.$store.state.main.subdata).not.toEqual(
                expect.arrayContaining([
                    expect.objectContaining(mockElementWithWrongCartId),
                    expect.objectContaining(mockElementWithLineItemIdNotInCart),
                ])
            );
        });
    });
});
