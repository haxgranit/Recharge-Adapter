import { AdapterBackendHelper } from "@/core/utils";

/**
 * @param store_hash
 * @param root0
 * @param root0.email
 * @param root0.platform_id
 */
async function getCustomerData(store_hash, { email, platform_id } = {}) {
    if (!email && !platform_id) {
        throw Error("getCustomerData requires either email or platform_id");
    }
    if (!store_hash) {
        throw Error("getCustomerData requires store_hash");
    }
    const helper = new AdapterBackendHelper();
    const customer = await helper.searchCustomer({ store_hash, email, platform_id });
    if (!customer) {
        return {
            email: null,
            name: null,
            platform_id: null,
            recharge: {},
        };
    }
    let portalData = null;
    if (customer.rc_id) {
        portalData = await helper.getRechargePortalData(customer.rc_id, store_hash);
    }
    return {
        email: customer.email,
        name: customer.name,
        platform_id: customer.platform_id,
        recharge: {
            id: customer.rc_id,
            hash: customer.rc_hash,
            ...portalData,
        },
    };
}

export default {
    getCustomerData,
};
