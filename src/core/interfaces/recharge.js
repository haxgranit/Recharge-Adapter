import Vue from "vue";
import axios from "axios";
import { mapGetters } from "vuex";

import store from "@/core/vue/store";

/**
 * @param $logger
 */
function getRechargeSettings($logger) {
    const storeDomain = RCA_DATA.getStoreDomain();
    const storeHash = RCA_DATA.getStoreHash();
    const envName = store.getters.isStaging ? ".staging" : "";
    const timestamp = new Date().getTime();
    const url = `https://static${envName}.rechargecdn.com/store/${storeDomain}/2020-12/widget_settings.json?_ts=${timestamp}`;
    if (!$logger) {
        $logger = console;
    }
    return axios
        .get(url)
        .then(({ data, status }) => {
            if (status >= 400) {
                return Promise.reject(data);
            }
            return Promise.resolve(data);
        })
        .catch((err) => $logger.error(`Failed to load Recharge Settings: ${err}`));
}

/**
 * @param customerId
 * @param $logger
 */
function getRechargeTempToken(customerId, $logger) {
    const storeHash = RCA_DATA.getStoreHash();
    const url = `${process.env.BIGCOMMERCE_APP_URL}/recharge/customers/${customerId}/portal_url?store_hash=${storeHash}`;

    return axios
        .get(url)
        .then(({ data, status }) => {
            if (status >= 400) return Promise.reject(data);
            return Promise.resolve(data);
        })
        .catch((err) => $logger.error(`Failed to load Recharge Portal data: ${err}`));
}

export default {
    getRechargeSettings,
    getRechargeTempToken,
};
