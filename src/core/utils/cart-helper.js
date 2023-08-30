/**
 * Chooses the product weight to use for checkout and converts to grams.
 *
 * @param {object} variant_data Adapter variant data in data script format.
 * @param {object} product_data Adapter product data in data script format.
 * @param {string} weight_unit The BC unit of weight, must be one of Ounces, LB, KGS, Grams, or Tonnes.
 * @throws {Error} Invalid weight unit supplied.
 * @returns {number} The product weight in grams to use for RC.
 */
import { Logger } from "@/core/vue/plugins/logger";

/**
 *
 */
export class CartHelper {
    $logger = new Logger("CartHelper");

    /**
     * @param originalWeight
     * @param weightUnit
     */
    weightToGrams(originalWeight, weightUnit) {
        const product_weight = originalWeight;
        const weight_factors = {
            Ounces: 28.34952,
            LBS: 453.5924,
            KGS: 1000,
            Grams: 1,
            Tonnes: 1000000,
        };
        const weight_factor = weight_factors[weightUnit];
        if (!weight_factor) {
            this.$logger = `Unknown weight unit: ${weightUnit}`;
            return originalWeight;
        }
        return Math.ceil(product_weight * weight_factor);
    }
}
