import { MappedObject, MergedObject } from "@/core/utils";

describe("Object Helper Mixin", () => {
    describe("Merged Object", () => {
        it("should exist", () => {
            expect(typeof MergedObject === "function").toBe(true);
            expect(!!MergedObject).toBe(true);
        });
    });

    describe("Mapped Object", () => {
        it("should exist", () => {
            expect(typeof MappedObject === "function").toBe(true);
            expect(!!MappedObject).toBe(true);
        });
    });

    describe("Statics", () => {
        describe("removeValues", () => {
            it("should return number", () => {
                const ret = MergedObject.removeValues(4);

                expect(ret).toBe(4);
            });

            it("should return string", () => {
                const val = "test 001";
                const ret = MergedObject.removeValues(val);

                expect(ret).toEqual(val);
            });

            it("should return null", () => {
                const val = null;
                const ret = MergedObject.removeValues(val);

                expect(ret).toEqual(val);
            });

            it("should return undefined", () => {
                const val = undefined;
                const ret = MergedObject.removeValues(val);

                expect(ret).toEqual(val);
            });

            it.todo(
                "should remove undefined values from array" /*, ()=> {
                const val = [undefined, "one", "two", null];
                const ret = MergedObject.removeValues(val, (value) => [undefined, null].includes(value));

                expect(ret).toEqual(["one","two"]);
            }*/
            );

            it("should remove undefined values from object", () => {
                const val = { 1: undefined, 2: "one", 3: "two", 4: null };
                const ret = MergedObject.removeValues(val, (value) =>
                    [undefined, null].includes(value)
                );

                expect(ret).toEqual({ 2: "one", 3: "two" });
            });

            it("should remove empty values from object", () => {
                const val = { 1: "  ", 4: "", 2: "one", 3: "two" };
                const ret = MergedObject.removeValues(val, (value) =>
                    [undefined, null].includes(value)
                );

                expect(ret).toEqual({ 2: "one", 3: "two" });
            });

            it("should remove empty values from child objects", () => {
                const val = {
                    1: {
                        empty: "  ",
                        child: { empty: "", null: null, undefined: undefined, 1: "child one" },
                    },
                    2: "one",
                    3: "two",
                };
                const ret = MergedObject.removeValues(val, (value) =>
                    [undefined, null].includes(value)
                );

                expect(ret).toEqual({ 1: { child: { 1: "child one" } }, 2: "one", 3: "two" });
            });
        });
    });
});
