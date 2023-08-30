import { mapActions } from "vuex";
import axios from "axios";
import { merge } from "lodash";
import { Logger } from "@/core/vue/plugins/logger";

require("@types");

/**
 * @module url-helper This module is used for any helper functions or classes related to making AJAX calls
 * and requests.
 */

/**
 * @typedef {object} buildRequestData - Data used to construct a buildRequest object
 * @property {string} [url] - The url for the request. This can be an absolute or relative URL.
 * @property {string} [baseURL] - If the url is relative, it will be appended to this value.
 * @property {requestMethod} [method] - The method of the request.
 * @property {object} [params] - Key-Value pairs for Query Parameters.
 * @property {object} [data] - Key-Value pairs for Body data/.
 * @property {object} [headers] - Key-Value pairs for Request Headers.
 * @property {number} [timeout] - The maximum amount of time to wait for the request to finish.
 */

/**
 *
 */
class RequestLog {
    /**
     * A class used for logging Axios requests in the console.
     * @param {object} root0 - The root object.
     * @param {AxiosResponse} root0.response - The Axios response object.
     * @param {axiosRequest} root0.request - The Axios request object.
     * @param {AxiosConfig} root0.config - The Axios config object.
     * @param {AxiosError} root0.error - The Axios error object.
     */
    constructor({ response, request, config, error }) {
        this.config = config;
        this.response = response;
        this.request = request;
        if (error) this.error = error;
    }
}

const _logger = new Logger("requestHelper");

const axiosInterceptors = {
    /**
     * @param {object} error - The Axios error object.
     * @param {object} logger - The logger to use when logging the Axios error.
     */
    axiosErrorLogger(error, logger = _logger) {
        const response = error.response;
        const request = error.request;
        const config = error?.config || null;
        const method = (config?.method || request?.method || "").toUpperCase();
        const url = config?.url || request?.responseURL;
        const label = `Error in ${method} ${url}`;
        logger.startGroup(label);
        logger.logger.warn(`[${response?.status || "???"}] ${label}`);
        logger.dir(
            new RequestLog({
                response,
                request,
                config,
                error,
            })
        );
        logger.endGroup();
    },
    /**
     * @param {object} response - The Axios response object.
     * @param {object} logger - The logger to use when logging the Axios response.
     */
    axiosResponseLogger(response, logger = _logger) {
        const request = response.request;
        const config = response?.config;
        const method = (config?.method || request?.method || "").toUpperCase();
        const url = request.responseURL;
        const label = `${method} ${url}`;

        logger.startGroup(label);
        logger.logger.debug(`[${response.status}] ${label}`);
        logger.logger.debug(new RequestLog({ response, request, config }));
        logger.endGroup();
    },
};

/**
 * @class
 * @classdesc A helper class for creating and handling Axios requests.
 */
export class buildRequest {
    /**
     * @param {buildRequestData} obj - An anonymous buildRequestData object.
     * @param {Logger} [logger] - The logger to use for this request object.
     */
    constructor({ url, baseURL, method = "get", params, data, headers, timeout = 10000 }, logger) {
        this.baseURL = baseURL;
        this.method = method;
        this.data = data;
        this.params = params;
        this.path = url;
        this.headers = headers;
        this.timeout = timeout;
        this.logger = logger || new Logger("urlHelper", { enabled: true });
    }

    /**
     * The absolute URL of the request including query parameters.
     *
     * @readonly
     * @returns {string}
     */
    get url() {
        let url = this.path ? new URL(this.path, this.baseURL) : new URL(this.baseURL);
        for (let p in this.params) {
            url.searchParams.append(p, this.params[p]);
        }
        return url.href;
    }

    /**
     * Shared config values for all requests.
     *
     * @readonly
     * @returns {{baseURL: string, timeout: number, headers: (object | undefined)}}
     */
    get baseConfig() {
        let requestData = {
            baseURL: this.baseURL,
            timeout: this.timeout,
        };
        this.headers ? (requestData.headers = this.headers) : null;
        return requestData;
    }

    /**
     * An Axios Instance with baseConfig values.
     *
     * @readonly
     * @returns {axiosInstance}
     */
    get client() {
        const instance = axios.create(this.baseConfig);
        this.setInterceptors(instance);
        return instance;
    }

    /**
     * Creates a new buildRequest object from this one.
     *
     * @param {buildRequestData} requestData - An buildRequestData object.
     * @returns {buildRequest}
     */
    request(requestData) {
        /**
         * @type {buildRequestData}
         */
        const _requestData = merge({}, this.baseConfig, requestData);
        return new buildRequest(_requestData, this.logger);
    }

    /**
     *
     */
    setInterceptorsGlobally() {
        axios.interceptors.response.use(
            (response) => {
                axiosInterceptors.axiosResponseLogger(response);
                return response;
            },
            (error) => {
                axiosInterceptors.axiosErrorLogger(error);
                throw error;
            }
        );
    }

    /**
     * Send this request and return the response.
     *
     * @returns {Promise<axiosResponse>}
     */
    async send() {
        let response;
        let requestData = this.baseConfig;
        requestData.method = this.method;
        requestData.data = this.data || undefined;
        requestData.params = this.params || undefined;
        requestData.url = this.path || undefined;
        response = await this.client.request(requestData);
        return response.data ?? response;
    }

    /**
     * @param {axiosInstance} instance - The Axios Instance object.
     */
    setInterceptors(instance) {
        instance.interceptors.response.use(
            (response) => {
                axiosInterceptors.axiosResponseLogger(response, this.logger);
                return response;
            },
            (error) => {
                axiosInterceptors.axiosErrorLogger(error, this.logger);
                throw error;
            }
        );
    }
}

/**
 * Vue Mixin object for this module.
 *
 * @mixin
 */
export const requestMixin = {
    methods: {
        ...mapActions({ disableApp: "setAppDisabled" }),
        /**
         * Creates a new buildRequest object.
         *
         * @param {string} url - The url for the request. This can be an absolute or relative URL.
         * @param {string} baseURL - If the url is relative, it will be appended to this value.
         * @param {requestMethod} method - The method of the request.
         * @param {object} params - Key-Value pairs for Query Parameters.
         * @param {object} data - Key-Value pairs for Body data/.
         * @param {object} headers - Key-Value pairs for Request Headers.
         * @param {number} timeout - The maximum amount of time to wait for the request to finish.
         * @returns {buildRequest}
         */
        $request(url, baseURL, method = "get", params, data, headers, timeout = 10000) {
            return new buildRequest({ url, baseURL, method, params, data, headers, timeout });
        },
    },
    /**
     *
     */
    beforeCreate() {
        this.$axios = axios.create();
        this.$axios.interceptors.response.use(
            (response) => {
                axiosInterceptors.axiosResponseLogger(response, this.$logger);
                return response;
            },
            (error) => {
                axiosInterceptors.axiosErrorLogger(error, this.$logger);
                const isAdapterRequest = error.request.responseURL.startsWith(
                    process.env.BIGCOMMERCE_APP_URL
                );
                const statusCode = error?.response?.status || 0;
                if (isAdapterRequest && statusCode >= 500) {
                    this.$logger.error(
                        `${statusCode} Adapter Response.
        Disabling  the application and reloading the current page.`
                    );
                    this.disableApp();
                }
                throw error;
            }
        );
    },
};
