module.exports = {
    /**
     * @param env
     */
    keys(env) {
        return module.exports = require(`./config.${env}.json`)
    }
}
