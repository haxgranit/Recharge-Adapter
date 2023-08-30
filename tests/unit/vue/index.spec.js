import { Store, Plugins, Mixins, Components } from "../../../src/core/vue";

describe("Core Vue", () => {
    it("should import Store", () => {
        expect(Store).not.toBeUndefined();
    });

    it("should import Plugins", () => {
        expect(Plugins).not.toBeUndefined();
    });

    it("should import Mixins", () => {
        expect(Mixins).not.toBeUndefined();
    });

    it("should import Components", () => {
        expect(Components).not.toBeUndefined();
    });
});
