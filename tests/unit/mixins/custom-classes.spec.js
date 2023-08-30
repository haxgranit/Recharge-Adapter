import { CustomClassesMixin } from "@/bigcommerce/vue/mixins";

const mockReplacements = {
    subtotalText: "$150.00",
};
describe("Custom Classes", () => {
    describe("getCustomClassValue", () => {
        it("should return the value of the element", () => {
            const getCustomClassElement = jest.fn(() => ({ value: "test-01" }));
            const result = CustomClassesMixin.methods.getCustomClassValue.call(
                {
                    getCustomClassElement,
                },
                "record-test01",
                "default"
            );

            expect(result).toEqual("test-01");
        });

        it("should return the default value", () => {
            const getCustomClassElement = jest.fn(() => ({}));
            const result = CustomClassesMixin.methods.getCustomClassValue.call(
                {
                    getCustomClassElement,
                },
                "record-test01",
                "default"
            );

            expect(result).toEqual("default");
        });

        it.todo("should return error if missing record");
    });

    describe("getCustomClass", () => {
        it("should return the value without a dot", () => {
            const $custom_classes = { classes: { record: { custom_class: "my-class" } } };
            const result = CustomClassesMixin.methods.getCustomClass.call(
                {
                    $custom_classes,
                },
                "record",
                false
            );

            expect(result).toEqual("my-class");
        });

        it("should return the value with a dot", () => {
            const $custom_classes = { classes: { record: { custom_class: "my-class" } } };
            const result = CustomClassesMixin.methods.getCustomClass.call(
                {
                    $custom_classes,
                },
                "record",
                true
            );

            expect(result).toEqual(".my-class");
        });

        it("should return a empty string", () => {
            const $custom_classes = { classes: { record: { custom_class: "my-class" } } };
            const result = CustomClassesMixin.methods.getCustomClass.call(
                {
                    $custom_classes,
                },
                "no-record",
                false
            );

            expect(result).toEqual("");
        });

        it.todo("should throw an error if class is missing");
    });

    describe("getCustomClassSelectors", () => {
        it("should return an empty array", () => {
            const $custom_classes = { themes: [], classes: {} };
            const result = CustomClassesMixin.methods.getCustomClassSelectors.call(
                {
                    $custom_classes,
                },
                "record"
            );

            expect(result).toEqual([]);
        });

        it("should return selectors as an array", () => {
            const $custom_classes = {
                themes: ["theme1", "theme2", "theme3"],
                classes: {
                    record: {
                        selectors: { theme1: ["first-1"], theme2: ["first-2", "second-2"] },
                    },
                },
            };
            const result = CustomClassesMixin.methods.getCustomClassSelectors.call(
                {
                    $custom_classes,
                },
                "record"
            );

            expect(result).toEqual(["first-1", "first-2", "second-2"]);
        });

        it.todo("should error if missing selectors");

        it("should handle dynamic selectors", () => {
            const $custom_classes = {
                themes: ["theme1"],
                classes: {
                    record: {
                        selectors: {
                            theme1: ["[data-cart-totals] .cart-subtotal:contains(${subtotalText})"],
                        },
                    },
                },
            };
            const result = CustomClassesMixin.methods.getCustomClassSelectors.call(
                {
                    $custom_classes,
                },
                "record",
                mockReplacements
            );

            expect(result).toEqual([
                `[data-cart-totals] .cart-subtotal:contains(${mockReplacements.subtotalText})`,
            ]);
        });
    });

    describe("getCustomClassElement", () => {
        const getCustomClass = jest.fn(() => null);
        it("should return value", () => {
            const document = { querySelector: jest.fn(() => "selector") };
            const result = CustomClassesMixin.methods.getCustomClassElement.call(
                {
                    getCustomClass,
                },
                "record",
                document
            );

            expect(result).toEqual("selector");
        });

        it("should return null", () => {
            const document = { querySelector: jest.fn(() => undefined) };
            const warn = jest.fn(() => null);
            const result = CustomClassesMixin.methods.getCustomClassElement.call(
                {
                    getCustomClass,
                    $logger: { warn },
                },
                "record",
                document
            );

            expect(result).toEqual(null);
        });

        it.todo("should return use the document for look up");
    });

    describe("getCustomClassMutations", () => {
        it("should return an empty array", () => {
            const $custom_classes = { themes: [], classes: {} };
            const result = CustomClassesMixin.methods.getCustomClassMutations.call(
                {
                    $custom_classes,
                },
                "record"
            );

            expect(result).toEqual([]);
        });

        it("should return mutations as an array", () => {
            const $custom_classes = {
                themes: ["theme1", "theme2", "theme3"],
                classes: {
                    record: {
                        mutations: { theme1: ["first-1"], theme2: ["first-2", "second-2"] },
                    },
                },
            };
            const result = CustomClassesMixin.methods.getCustomClassMutations.call(
                {
                    $custom_classes,
                },
                "record"
            );

            expect(result).toEqual(["first-1", "first-2", "second-2"]);
        });

        it.todo("should error if missing mutation");
    });

    describe("getCustomClassObservers", () => {
        it("should return an empty array", () => {
            const $custom_classes = { themes: [], classes: {} };
            const result = CustomClassesMixin.methods.getCustomClassObservers.call(
                {
                    $custom_classes,
                },
                "record"
            );

            expect(result).toEqual([]);
        });

        it("should return observers as an array", () => {
            const $custom_classes = {
                themes: ["theme1", "theme2", "theme3"],
                classes: {
                    record: {
                        observers: { theme1: ["first-1"], theme2: ["first-2", "second-2"] },
                    },
                },
            };
            const result = CustomClassesMixin.methods.getCustomClassObservers.call(
                {
                    $custom_classes,
                },
                "record"
            );

            expect(result).toEqual(["first-1", "first-2", "second-2"]);
        });

        it.todo("should error if missing observers");
    });

    describe("getCustomClassElements", () => {
        const $logger = { warn: jest.fn(() => null) };
        it("should return an empty array when record not found", () => {
            const getCustomClass = jest.fn(() => "class-test01");
            const document = {
                querySelector: jest.fn(() => null),
            };

            const result = CustomClassesMixin.methods.getCustomClassElements.call(
                {
                    getCustomClass,
                    $logger,
                },
                "record",
                document
            );

            expect(result).toEqual([]);
            expect(getCustomClass).toBeCalledWith("record");
            expect(document.querySelector).toBeCalledWith("class-test01");
        });

        it("should return an array of objects when record is found", () => {
            const expected = ["a", "b", "c"];
            const getCustomClass = jest.fn(() => "class-test01");
            const document = {
                querySelector: jest.fn(() => expected[0]),
                querySelectorAll: jest.fn(() => expected),
            };

            const result = CustomClassesMixin.methods.getCustomClassElements.call(
                {
                    getCustomClass,
                    $logger,
                },
                "record",
                document
            );

            expect(result).toEqual(expected);
            expect(getCustomClass).toBeCalledWith("record");
            expect(document.querySelector).toBeCalledWith("class-test01");
            expect(document.querySelectorAll).toBeCalledWith("class-test01");
        });
    });

    describe("getCustomAttribute", () => {
        const $logger = { error: jest.fn(() => null) };
        it("should return an empty string if there are no themes", () => {
            const $custom_classes = { themes: [], classes: { record: {} } };
            const getCustomClassElement = jest.fn(() => null);
            const result = CustomClassesMixin.methods.getCustomAttribute.call(
                {
                    $custom_classes,
                    getCustomClassElement,
                    $logger,
                },
                "record"
            );

            expect(result).toEqual("");
        });

        it("should return an empty string if there is no matching record", () => {
            const $custom_classes = { themes: ["theme1"], classes: { record: {} } };
            const getCustomClassElement = jest.fn(() => null);
            const result = CustomClassesMixin.methods.getCustomAttribute.call(
                {
                    $custom_classes,
                    getCustomClassElement,
                    $logger,
                },
                "record"
            );

            expect(result).toEqual("");
        });

        it("should return an empty string if there are attributes", () => {
            const $custom_classes = { themes: ["theme1"], classes: { record: {} } };
            const getCustomClassElement = jest.fn(() => null);
            const result = CustomClassesMixin.methods.getCustomAttribute.call(
                {
                    $custom_classes,
                    getCustomClassElement,
                    $logger,
                },
                "record"
            );

            expect(result).toEqual("");
        });

        it.todo("should return an empty string if elements have a matching attribute");
        it.todo("should return an the matching attribute");
    });

    describe("genericRemove", () => {
        it("should handle removal of elements", () => {
            const removeMock = jest.fn(() => null);
            const $ = jest.fn(() => ({ remove: removeMock }));
            const addCustomClassesToGroup = jest.fn(() => null);
            const getCustomClass = jest.fn(() => "test-selector");

            CustomClassesMixin.methods.genericRemove.call({
                $,
                addCustomClassesToGroup,
                getCustomClass,
            });

            expect(addCustomClassesToGroup).toBeCalledWith("REMOVE");
            expect(getCustomClass).toBeCalledWith("generic_remove");
            expect($).toBeCalledWith("test-selector");
            expect(removeMock).toBeCalledTimes(1);
        });
    });

    describe("addCustomClassToElement", () => {
        const addClass = jest.fn(() => null);
        const $ = jest.fn(() => ({ addClass }));

        afterEach(() => {
            jest.clearAllMocks();
        });

        it("should return false if no elements are found", () => {
            const getElements = jest.fn(() => []);

            const result = CustomClassesMixin.methods.addCustomClassToElement.call(
                {
                    getElements,
                },
                "element-class",
                "element-query",
                1
            );

            expect(result).toEqual(false);
            expect(getElements).toBeCalledWith("element-query", 1);
        });

        it("should return true and only add a single class", () => {
            const elements = ["a", "b"];
            const getElements = jest.fn(() => elements);

            const result = CustomClassesMixin.methods.addCustomClassToElement.call(
                {
                    $,
                    getElements,
                },
                "element-class",
                "element-query",
                1,
                "single"
            );

            expect(result).toEqual(true);
            expect(getElements).toBeCalledWith("element-query", 1);
            expect(addClass).toBeCalledTimes(1);
            expect(addClass).toBeCalledWith("element-class");
        });

        it("should skip undefined and return true and only add a single class", () => {
            const elements = [undefined, "a", "b"];
            const getElements = jest.fn(() => elements);

            const result = CustomClassesMixin.methods.addCustomClassToElement.call(
                {
                    $,
                    getElements,
                },
                "element-class",
                "element-query",
                1,
                "single"
            );

            expect(result).toEqual(true);
            expect(getElements).toBeCalledWith("element-query", 1);
            expect(addClass).toBeCalledTimes(1);
            expect(addClass).toBeCalledWith("element-class");
        });

        it("should return true and add a multiple classes", () => {
            const elements = [undefined, "a", undefined, "b"];
            const getElements = jest.fn(() => elements);

            const result = CustomClassesMixin.methods.addCustomClassToElement.call(
                {
                    $,
                    getElements,
                },
                "element-class",
                "element-query",
                1
            );

            expect(result).toEqual(true);
            expect(getElements).toBeCalledWith("element-query", 1);
            expect($).toBeCalledTimes(2);
            expect($.mock.calls[0]).toEqual([elements[1]]);
            expect($.mock.calls[1]).toEqual([elements[3]]);
            expect(addClass).toBeCalledTimes(2);
            expect(addClass).toBeCalledWith("element-class");
        });
    });

    describe("addCustomClassesToGroup", () => {
        it.todo("should skip if group undefined");
        it.todo("should skip if group item is undefined");

        it("should skip if group list is empty", () => {
            const $custom_classes = { groups: { "group-1": {} } };
            const getCustomClassElements = jest.fn(() => {});

            const result = CustomClassesMixin.methods.addCustomClassesToGroup.call(
                {
                    $custom_classes,
                    getCustomClassElements,
                },
                "group-1"
            );

            expect(result).toEqual(null);
            expect(getCustomClassElements).not.toHaveBeenCalled();
        });

        it("should skip if group item is null", () => {
            const $custom_classes = { groups: { "group-2": { "record-001": null } } };
            const getCustomClassElements = jest.fn(() => {});

            const result = CustomClassesMixin.methods.addCustomClassesToGroup.call(
                {
                    $custom_classes,
                    getCustomClassElements,
                },
                "group-2"
            );

            expect(result).toEqual(null);
            expect(getCustomClassElements).not.toHaveBeenCalled();
        });

        it("should only process a single element when found", () => {
            const $custom_classes = {
                groups: {
                    "group-2": {
                        "record-001": {
                            mock: true,
                            parentLevel: 0,
                            mode: "single",
                            selectors: {
                                test: [],
                            },
                        },
                    },
                },
                themes: ["test"],
            };
            const getCustomClassElements = jest
                .fn()
                .mockReturnValueOnce([])
                .mockReturnValueOnce(["element"]);

            const result = CustomClassesMixin.methods.addCustomClassesToGroup.call(
                {
                    $custom_classes,
                    getCustomClassElements,
                },
                "group-2"
            );

            expect(result).toEqual(null);
            expect(getCustomClassElements).toBeCalledTimes(1);
            expect(getCustomClassElements.mock.calls[0]).toEqual(["record-001"]);
        });

        it("should stop when matching elements are found", () => {
            const $custom_classes = {
                groups: {
                    "group-3": {
                        "record-001": {
                            mock: true,
                            mode: "single",
                        },
                    },
                },
                themes: ["test"],
            };
            const getCustomClassElements = jest
                .fn()
                .mockReturnValueOnce(["element"])
                .mockReturnValueOnce([]);

            const result = CustomClassesMixin.methods.addCustomClassesToGroup.call(
                {
                    $custom_classes,
                    getCustomClassElements,
                },
                "group-3"
            );

            expect(result).toEqual(null);
            expect(getCustomClassElements).toBeCalledTimes(1);
            expect(getCustomClassElements.mock.calls[0]).toEqual(["record-001"]);
        });

        it("should stop for single and process all elements when not single", () => {
            const $custom_classes = {
                groups: {
                    "group-5": {
                        "record-001": {
                            mock: true,
                            custom_class: "test-class001",
                            selectors: { test: ["a", "b"] },
                        },
                        "record-002": {
                            mock: true,
                            custom_class: "test-class002",
                            selectors: { test: ["c", "d"] },
                            mode: "single",
                        },
                    },
                },
                themes: ["test"],
            };
            const addCustomClassToElement = jest.fn(() => true);
            const getCustomClassElements = jest.fn(() => []);

            const result = CustomClassesMixin.methods.addCustomClassesToGroup.call(
                {
                    $custom_classes,
                    getCustomClassElements,
                    addCustomClassToElement,
                },
                "group-5"
            );

            expect(result).toEqual(null);
            expect(getCustomClassElements).toBeCalledTimes(2);
            expect(getCustomClassElements.mock.calls[0]).toEqual(["record-001"]);
            expect(getCustomClassElements.mock.calls[1]).toEqual(["record-002"]);

            expect(addCustomClassToElement).toBeCalledTimes(3);

            const { ["record-001"]: record1, ["record-002"]: record2 } =
                $custom_classes.groups["group-5"];
            expect(addCustomClassToElement.mock.calls[0]).toEqual([
                record1.custom_class,
                "a",
                0,
                "multi",
            ]);
            expect(addCustomClassToElement.mock.calls[1]).toEqual([
                record1.custom_class,
                "b",
                0,
                "multi",
            ]);
            expect(addCustomClassToElement.mock.calls[2]).toEqual([
                record2.custom_class,
                "c",
                0,
                "single",
            ]);
        });

        it("should continue for all elements when not single", () => {
            const $custom_classes = {
                groups: {
                    "group-4": {
                        "record-001": {
                            mock: true,
                            custom_class: "test-class001",
                            selectors: { test: ["a"] },
                        },
                        "record-002": {
                            mock: true,
                            custom_class: "test-class002",
                            selectors: { test: ["b", "c"] },
                            mode: "multi",
                        },
                    },
                },
                themes: ["test"],
            };
            const addCustomClassToElement = jest.fn(() => false);
            const getCustomClassElements = jest
                .fn()
                .mockReturnValueOnce(["element"])
                .mockReturnValueOnce([]);

            const result = CustomClassesMixin.methods.addCustomClassesToGroup.call(
                {
                    $custom_classes,
                    getCustomClassElements,
                    addCustomClassToElement,
                },
                "group-4"
            );

            expect(result).toEqual(null);
            expect(getCustomClassElements).toBeCalledTimes(2);
            expect(getCustomClassElements.mock.calls[0]).toEqual(["record-001"]);
            expect(getCustomClassElements.mock.calls[1]).toEqual(["record-002"]);

            expect(addCustomClassToElement).toBeCalledTimes(3);

            const { ["record-001"]: record1, ["record-002"]: record2 } =
                $custom_classes.groups["group-4"];
            expect(addCustomClassToElement.mock.calls[0]).toEqual([
                record1.custom_class,
                "a",
                0,
                "multi",
            ]);
            expect(addCustomClassToElement.mock.calls[1]).toEqual([
                record2.custom_class,
                "b",
                0,
                "multi",
            ]);
            expect(addCustomClassToElement.mock.calls[2]).toEqual([
                record2.custom_class,
                "c",
                0,
                "multi",
            ]);
        });
        it("should handle dynamic selectors", () => {
            const addCustomClassToElement = jest.fn(() => true);
            const getCustomClassElements = jest.fn(() => []);
            const $custom_classes = {
                groups: {
                    cart: {
                        subtotal: {
                            custom_class: "rca-cart-subtotal",
                            selectors: {
                                theme1: [
                                    "[data-cart-totals] .cart-subtotal:contains(${subtotalText})",
                                ],
                            },
                        },
                    },
                },
                themes: ["theme1"],
            };
            CustomClassesMixin.methods.addCustomClassesToGroup.call(
                {
                    $custom_classes,
                    addCustomClassToElement,
                    getCustomClassElements,
                },
                "cart",
                mockReplacements
            );
            expect(addCustomClassToElement).toHaveBeenCalledWith(
                "rca-cart-subtotal",
                `[data-cart-totals] .cart-subtotal:contains(${mockReplacements.subtotalText})`,
                0,
                "multi"
            );
        });
    });

    describe("getElements", () => {
        it.todo(`
            This routine seems to have logic errors,
            like when there aren't n parents above the element.
            No unit testing until a review of the code can be performed.
            parentLevel, is never defined in the object structure, so
            this value is always 0, which will never exercise the for loop.
        `);
    });
});
