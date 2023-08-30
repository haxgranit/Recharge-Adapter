import $ from "jquery-slim";

/**
 * @param selector
 * @param callback
 * @param checkFrequencyInMs
 * @param timeoutInMs
 */
export function waitForElementToExist(
    selector,
    callback,
    checkFrequencyInMs = 20,
    timeoutInMs = 3000
) {
    let checkExist = setInterval(function () {
        let target = doesElementExist(selector);
        if (target) {
            clearInterval(checkExist);
            callback();
        }
    }, checkFrequencyInMs);
    setTimeout(clearInterval, timeoutInMs, checkExist);
}

/**
 * @param selectors
 */
export function doesElementExist(selectors) {
    if (Array.isArray(selectors)) {
        return selectors.some((selector) => document.querySelector(selector));
    }
    const element = document.querySelector(selectors);
    return !!element;
}

/**
 * @param selectors
 */
export function isElementVisible(selectors) {
    if (Array.isArray(selectors)) {
        return selectors.some((selector) => isElementVisible(selector));
    }
    const element = document.querySelector(selectors);
    return element?.style?.visibility === "visible";
}

/**
 * @param selector
 * @param callback
 * @param checkFrequencyInMs
 * @param timeoutInMs
 */
export function waitForElementVisible(
    selector,
    callback,
    checkFrequencyInMs = 20,
    timeoutInMs = 3000
) {
    let checkExist = setInterval(function () {
        const target = isElementVisible(selector);
        if (target) {
            clearInterval(checkExist);
            callback();
        }
    }, checkFrequencyInMs);
    setTimeout(clearInterval, timeoutInMs, checkExist);
}

/**
 * @param checker
 * @param checkFrequencyInMs
 * @param timeoutInMs
 */
export async function waitForTrue(checker, checkFrequencyInMs = 20, timeoutInMs = 3000) {
    let checkExist = setInterval(function () {
        if (checker()) {
            clearInterval(checkExist);
            return true;
        }
    }, checkFrequencyInMs);
    setTimeout(clearInterval, timeoutInMs, checkExist);
}

/**
 * @param selector
 * @param $elementParent
 */
export function listElementStyleClasses(selector, $elementParent = document) {
    // if $elementParent is NULL, it wasn't being replaced
    $elementParent = $elementParent || document;
    const $element = $elementParent.querySelector(selector) || {};
    const cssClasses = Array.from($element.classList);
    const classesToIgnore = /active|hide|visible/;
    // remove visibility/status modifiers
    return cssClasses.filter((cssClass) => !classesToIgnore.test(cssClass));
}

/**
 * @param value
 */
export function decodeHtmlEntity(value) {
    const valueType = typeof value;
    if (Array.isArray(valueType)) {
        value.map((item) => decodeHtmlEntity(item));
        return value;
    } else if (valueType === "object" && valueType !== null) {
        const newObj = {};
        for (const [key, val] of Object.entries(value)) {
            newObj[key] = decodeHtmlEntity(val);
        }
        return newObj;
    }
    return $("<textarea/>").html(value).text();
}
