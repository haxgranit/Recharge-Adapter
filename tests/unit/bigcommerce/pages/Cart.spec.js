import { mountLocalVue } from "../../../test_utils/localVue";
import { CustomClassesMixin } from "@/bigcommerce/vue/mixins";
import Cart from "@/bigcommerce/pages/cart/Cart";
import Zachs_store from "../../../data/zachs_store/zachs_store";

const mockSubData = {
    cartid: Zachs_store.storeObjectsData.cart_id,
    charge_frequency: 1,
    discount_amount: 15,
    discount_type: "percentage",
    line_item: Zachs_store.storeObjectsData.cart.items[0].id,
    productID: Zachs_store.storeObjectsData.cart.items[0].product_id,
    shipping_frequency: 1,
    shipping_unit: "month",
    storefront_purchase_options: "subscription_and_onetime",
};
describe("Cart", () => {
    let wrapper;
    let spyGetLineItemId;
    let spyGetCustomClassElement;
    beforeAll(() => {
        jest.spyOn(CustomClassesMixin.methods, "getCustomClassElements").mockImplementation(() => [
            ".rca-cart-item",
        ]);
        spyGetCustomClassElement = jest
            .spyOn(CustomClassesMixin.methods, "getCustomClassElement")
            .mockImplementation(jest.fn());
        spyGetLineItemId = jest.spyOn(Cart.methods, "getLineItemId").mockImplementation(jest.fn());
        wrapper = mountLocalVue(Cart);
        wrapper.vm.$store.dispatch("addSubItem", mockSubData);
    });
    describe("matchCartSubscriptionElements", () => {
        it("should return an array of matched subscription elements", () => {
            spyGetCustomClassElement
                .mockReturnValueOnce(null)
                .mockReturnValueOnce(".rca-cart-line-item-total")
                .mockReturnValueOnce(".rca-cart-line-item-quantity");
            spyGetLineItemId.mockReturnValueOnce(Zachs_store.storeObjectsData.cart.items[0].id);
            const matchedSubscriptionElements = wrapper.vm.matchCartSubscriptionElements();
            expect(matchedSubscriptionElements).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        ext_price_el: ".rca-cart-line-item-total",
                        line_el: ".rca-cart-item",
                        price_el: null,
                        quantity_el: ".rca-cart-line-item-quantity",
                        sub_data: expect.objectContaining(mockSubData),
                    }),
                ])
            );
        });
        it("should return empty array when there are no matched subscription elements", () => {
            spyGetLineItemId.mockReturnValueOnce("");
            const matchedSubscriptionElements = wrapper.vm.matchCartSubscriptionElements();
            expect(matchedSubscriptionElements).toEqual([]);
        });
    });
    describe("updateCartLineEstimatedTotalElement", () => {
        const mock_bc_item_price = "1.8000€";
        const mockFormattedFirstItemInCartPrice = "2.0000€";
        const mockLineItem = {
            sub_data: mockSubData,
            ext_price_el: {
                textContent: mockFormattedFirstItemInCartPrice,
            },
            quantity_el: {
                value: Zachs_store.checkouts.withSubscription.cart.lineItems.physicalItems[0]
                    .quantity,
            },
        };
        const mockCartResponse = Zachs_store.checkouts.withSubscription.cart;
        beforeEach(() => {
            mockLineItem.ext_price_el.textContent = mockFormattedFirstItemInCartPrice;
        });
        it("should properly update item price when it has discount amount, bc item price and quantity", () => {
            wrapper.vm.updateCartLineEstimatedTotalElement(
                mockLineItem,
                mock_bc_item_price,
                mockCartResponse
            );
            expect(mockLineItem.ext_price_el.textContent).toBe("1.5300€");
        });
        it("should properly update item price when the item does not have a bc item price and it can be found in the cart", () => {
            wrapper.vm.updateCartLineEstimatedTotalElement(mockLineItem, "", mockCartResponse);
            expect(mockLineItem.ext_price_el.textContent).toBe("1.7000€");
        });
        it("should not update item price when there is no discount amount", () => {
            const mockNoDiscountAmountElement = {
                ...mockLineItem,
                sub_data: {
                    ...mockLineItem.sub_data,
                    discount_amount: undefined,
                },
            };
            wrapper.vm.updateCartLineEstimatedTotalElement(
                mockNoDiscountAmountElement,
                "",
                mockCartResponse
            );
            expect(mockLineItem.ext_price_el.textContent).toBe(mockFormattedFirstItemInCartPrice);
        });
        it("should not update item price when there is a discount amount and bc item price but no quantity", () => {
            const mockNoQuantityElement = { ...mockLineItem, quantity_el: undefined };
            wrapper.vm.updateCartLineEstimatedTotalElement(
                mockNoQuantityElement,
                mock_bc_item_price,
                mockCartResponse
            );
            expect(mockLineItem.ext_price_el.textContent).toBe(mockFormattedFirstItemInCartPrice);
        });
        it("should not update item price when the item does not have a bc item price and cannot be found in the cart", () => {
            const mockElementNotInCart = {
                ...mockLineItem,
                sub_data: {
                    ...mockLineItem.sub_data,
                    line_item: "item_not_in_cart",
                },
            };
            wrapper.vm.updateCartLineEstimatedTotalElement(
                mockElementNotInCart,
                "",
                mockCartResponse
            );
            expect(mockLineItem.ext_price_el.textContent).toBe(mockFormattedFirstItemInCartPrice);
        });
    });
});
