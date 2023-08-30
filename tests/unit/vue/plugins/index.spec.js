import {
    LoggerPlugin,
    Logger,
    i18n,
    i18nMixin,
    LoadTranslations,
    SettingsPlugin,
} from "../../../../src/core/vue/plugins";

describe("Core Vue - Plugins", () => {
    it("should import LoggerPlugin", () => {
        expect(LoggerPlugin).not.toBeUndefined();
    });

    it("should import Logger", () => {
        expect(Logger).not.toBeUndefined();
    });

    it("should import i18n", () => {
        expect(i18n).not.toBeUndefined();
    });

    it("should import i18nMixin", () => {
        expect(i18nMixin).not.toBeUndefined();
    });

    it("should import LoadTranslations", () => {
        expect(LoadTranslations).not.toBeUndefined();
    });

    it("should import SettingsPlugin", () => {
        expect(SettingsPlugin).not.toBeUndefined();
    });
});
