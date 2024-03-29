// This condition actually should detect if it's an Node environment
if (typeof require.context === "undefined") {
    const fs = require("fs");
    const path = require("path");

    /**
     * @param {string} base Base.
     * @param {boolean} scanSubDirectories ScanSubDirectories.
     * @param {*} regularExpression RegularExpression.
     * @returns {*}
     */
    require.context = (base = ".", scanSubDirectories = false, regularExpression = /\.js$/) => {
        const files = {};

        /**
         * @param {string} directory Directory.
         */
        function readDirectory(directory) {
            fs.readdirSync(directory).forEach((file) => {
                const fullPath = path.resolve(directory, file);

                if (fs.statSync(fullPath).isDirectory()) {
                    if (scanSubDirectories) readDirectory(fullPath);

                    return;
                }

                if (!regularExpression.test(fullPath)) return;

                files[fullPath] = true;
            });
        }

        readDirectory(path.resolve(__dirname, base));

        /**
         * @param {string} file File.
         * @returns {*}
         */
        function Module(file) {
            return require(file);
        }

        /**
         * @returns {*}
         */
        Module.keys = () => Object.keys(files);

        return Module;
    };
}
