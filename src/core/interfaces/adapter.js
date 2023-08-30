import axios from "axios";

import store from "@/core/vue/store";

/**
 * Get adapter backend setting, save it to store and return it.
 * @param {object} $logger Logger object.
 * @returns {null} Adapter's backend settings.
 */
async function getAdapterBackendSettings($logger) {
    try {
        const settings = RCA_DATA.getAdapterSettings();
        return store.dispatch("setAdapterBackendSettings", settings);
    } catch (err) {
        $logger.log(`Failed to load the adapter Settings from CDN accessing backend...`);
        const storeHash = RCA_DATA.getStoreHash();
        const storeInfoUrl = `${process.env.BIGCOMMERCE_APP_URL}/stores/query?store_hash=${storeHash}`;
        try {
            const { data } = await axios.get(storeInfoUrl);
            if (data) {
                return store.dispatch("setAdapterBackendSettings", data.settings);
            }
        } catch (err) {
            $logger.error(`Failed to load the adapter Settings from the backend: ${err}`);
        }
    }
    return null;
}

export default { getAdapterBackendSettings };
