import _, { merge } from "lodash";
import store from "@/core/vue/store";
import { CACHE_INTERVAL, settingsMapPriority } from "./constants";
import { AdapterSettings } from "./mapping";
import { Logger } from "@/core/vue/plugins";
import { loggerEnabled as mainLoggerEnabled } from "@/bigcommerce/main";
import { AdapterBackendHelper, RechargeSettingsHelper } from "@/core/utils";

// noinspection EqualityComparisonWithCoercionJS
/**
 *Class which contains the domain and the hash of current store.
 */
export class LoadSettings {
    /**
     * @param {object} root - An object containing the following values.
     * @param {string} root.storeDomain - The domain of a store.
     * @param {string} root.storeHash - The hash of a store.
     * @param {object} root.pageSettings - An object containing the settings from the RCA_SETTINGS.
     * @param {object} root.translations - The RCA_LOCALES object.
     * @param {boolean} loggerEnabled - Boolean indicating if the logger is enabled or disabled.
     */
    constructor(
        { storeDomain, storeHash, pageSettings = {}, translations } = {},
        loggerEnabled = mainLoggerEnabled
    ) {
        this.storeDomain = storeDomain;
        this.storeHash = storeHash;
        this.pageSettings = pageSettings;
        this.translations = translations;
        this.logger = new Logger("SettingsLoader", { enabled: loggerEnabled || mainLoggerEnabled });
        this.adapterClient = new AdapterBackendHelper(loggerEnabled || mainLoggerEnabled);
        this.mergePromise = undefined;

        this.refreshVersion();
    }

    /**
     * @returns {object} The settings saved in Vuex storage.
     */
    get storedSettings() {
        return store.getters.settings;
    }

    /**
     * @returns {RechargeSettingsHelper} The ReCharge settings client.
     */
    get rechargeClient() {
        const isStaging = this.storedSettings?.backend?.is_rc_staging || false;
        return new RechargeSettingsHelper(
            {
                rechargeStoreDomain: this.storeDomain,
                isStaging,
            },
            this.logger.enabled
        );
    }

    /**
     * A Cache Breaker, to avoid making multiple calls to the backend and cache the answers instead.
     *@returns {number} The difference between the last time called and now.
     */
    get cacheBreaker() {
        const timestamp = store.getters.initialAppLoadTimestamp;
        const interval = CACHE_INTERVAL * 60 * 1000; // Converting to ms
        return Math.ceil(Math.max(0, Date.now() - timestamp) / interval);
    }

    /**
     * @returns {boolean} Indicator if a new settings version needs to be created.
     */
    get needsNewVersion() {
        // eslint-disable-next-line eqeqeq
        return this.cacheBreaker != this.version || this.version === 0;
    }

    /**
     * Updates this.version with the version from Vuex storage.
     */
    refreshVersion() {
        this.version = store.getters.lastSettingsVersion;
        this.logger.debug(`New Settings Version: ${this.version}`);
    }

    /**
     * Get local configurations, RCA_LOCALES (locale configuration) and RCA_SETTINGS(store information)
     * If either is missing, it returns the default settings instead.
     * @returns {object} The local settings or the default settings.
     */
    getLocalAdapterSettings() {
        return merge({}, this.pageSettings);
    }

    /**
     * Get adapter's backend settings.
     * @returns {object} A Dictionary with the back end settings.
     */
    async getBackendSettings() {
        try {
            const settings = RCA_DATA.getAdapterSettings();
            store.dispatch("setAdapterBackendSettings", settings);
            return { settings };
        } catch (err) {
            let data = {};
            const forceRequest = !this.storedSettings.backend.updated_at;
            if (this.needsNewVersion || forceRequest) {
                data = await this.adapterClient.getStoreInfo(this.storeHash, {
                    _ts: this.cacheBreaker,
                });
                if (!_.isEmpty(data?.settings)) {
                    store.dispatch("setAdapterBackendSettings", data.settings);
                }
            }
            return data;
        }
    }

    /**
     * Get Recharge configuration.
     * @returns {object} A dictionary containing CDN settings.
     */
    async getRechargeSettings() {
        return await this.rechargeClient.getWidgetSettings();
    }

    /**
     * Guard routine to ensure that getMergedSettings is only called once.
     * @returns {object} A settings object merged by priority from all sources.
     */
    async getMergedSettings() {
        if (this.mergePromise) {
            return await this.mergePromise;
        }

        this.mergePromise = this._getMergedSettings();
        const results = await this.mergePromise;

        this.mergePromise = undefined;
        return results;
    }

    /**
     * @returns {object} A settings object merged by priority from all sources.
     */
    async _getMergedSettings() {
        try {
            let rcaSettings = this.getLocalAdapterSettings();
            const promises = {
                adapterBackend: this.getBackendSettings(),
                rechargeCdn: this.getRechargeSettings(),
            };
            let rechargeCdn = await promises.rechargeCdn;
            let adapterBackend = await promises.adapterBackend;
            this.refreshVersion();
            const timestamps = {
                timestamps: {
                    recharge: rechargeCdn.published
                        ? new Date(Date.now()).toISOString()
                        : undefined,
                    backend: adapterBackend.settings
                        ? new Date(Date.now()).toISOString()
                        : undefined,
                },
            };
            const mappedSourceValues = {
                timestamps,
                rcaSettings: AdapterSettings.from(rcaSettings, "rcaSettings"),
                clientLocales: AdapterSettings.from(
                    this.translations.currentLocaleTranslations,
                    "clientLocales"
                ),
                rechargeCdn: AdapterSettings.from(rechargeCdn, "rechargeCdn"),
                adapterBackend: AdapterSettings.from(adapterBackend, "adapterBackend"),
                defaultLocaleTranslations: this.translations.defaultMessages,
            };
            store.commit("setLastSettingsVersion", this.cacheBreaker);
            const mergedSettings = settingsMapPriority(mappedSourceValues);
            this.logger.debug("Merged Settings Created", {
                finalValue: mergedSettings,
                mappedSourceValues,
                rawSourceValues: {
                    rcaSettings,
                    rechargeCdn,
                    adapterBackend,
                    clientLocales: this.translations.currentLocaleTranslations,
                    defaultLocaleTranslations: this.translations.defaultMessages,
                },
            });
            return mergedSettings;
        } catch (e) {
            this.logger.error(e);
        }
        return {};
    }

    /**
     * Refresh the settings in Vuex storage.
     * @returns {object} The settings commited to vuex.
     */
    async refresh() {
        let settings = {};
        try {
            this.logger.debug("Refreshing settings");
            settings = await this.getMergedSettings();
            store.commit("updateSettings", settings);
        } catch (e) {
            this.logger.error(`Settings did not refresh. Using stored settings: ${e}`);
        }
        return settings;
    }

    /**
     * @returns {boolean} Indicator if the app is currently disabled.
     */
    get isAppDisabled() {
        const disabled_at = store.getters.appDisabledAt || 0;
        const disabled_for = store.getters.appDisabledTime || 0;
        return disabled_at + disabled_for > Date.now();
    }
}
