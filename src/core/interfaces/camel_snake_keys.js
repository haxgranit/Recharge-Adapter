import { camelCase, isArray, snakeCase } from "lodash";

/**
 * @param {object | string} data String or keys of object are named in form of snake.
 * @param {number} depth To which level of keys should it process. A value of < 0 will process all
 * possible levels.
 * @returns {object | string} String or keys of object are named in form of camel case.
 */
function snakeToCamel(data, depth = -1) {
    if (typeof data === "object") {
        if (typeof depth === "undefined") {
            depth = 1;
        }
        return processKeys(data, camelCase, depth);
    }
    return camelCase(data);
}

/**
 * @param {object | string} data String or keys of object are named in form of camel case.
 * @param {number} depth To which level of keys should it process. A value of < 0 will process all
 * possible levels.
 * @returns {object | string} String or keys of object are named in form of snake.
 */
function camelToSnake(data, depth = -1) {
    if (typeof data === "object") {
        if (typeof depth === "undefined") {
            depth = 1;
        }
        return processKeys(data, snakeCase, depth);
    }
    return snakeCase(data);
}

/**
 * ToSnake/toCamelize keys of an object.
 *
 * @param {object} obj - The target object.
 * @param {Function} processor The lodash snakeCase or camelCase function.
 * @param {number} depth To which level of keys should it process. A value of < 0 will process all
 * possible levels.
 * @returns {object}
 */
function processKeys(obj, processor, depth = -1) {
    if (depth === 0 || typeof obj !== "object" || obj === null) {
        return obj;
    }
    if (isArray(obj)) {
        return obj.map((item) => processKeys(item, processor, depth - 1));
    }

    let result = {};
    let keys = Object.keys(obj);

    for (let i = 0; i < keys.length; i++) {
        result[processor(keys[i])] = processKeys(obj[keys[i]], processor, depth - 1);
    }

    return result;
}

export { camelToSnake, snakeToCamel };
