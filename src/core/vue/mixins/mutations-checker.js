export default {
    methods: {
        /**
         * Check mutations for particular target. Reduce classlist added to addednodes or target.
         *
         * @param {MutationRecord[]} mutations - From element to check target.
         * @param {string} target - Record string of custom class mutations to check over.
         * @returns {boolean} - Comparing mutations classes with custom class mutatios records.
         */
        checkMutations: function (mutations, target) {
            const nodeClassNames = mutations.reduce(
                (acc, { addedNodes, target: { classList } }) => {
                    addedNodes.forEach((node) => {
                        if (node.classList?.length > 0) {
                            acc.push(...node.classList);
                        }
                    });
                    if (classList?.length > 0) {
                        acc.push(...classList);
                    }
                    return acc;
                },
                []
            );

            const mutationsCheck = new Set(this.getCustomClassMutations(target));
            return nodeClassNames.some((className) => mutationsCheck.has(className));
        },
    },
};
