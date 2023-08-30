const path = require("path");
const { DefinePlugin, ProvidePlugin, optimize } = require("webpack");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const TerserPlugin = require("terser-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const fs = require("file-system");
const config = require("./config/config").keys(process.env.NODE_ENV);
const CompressionPlugin = require("compression-webpack-plugin");

let branch = "unknown";
try {
    let head_str = fs.readFileSync("../.git/HEAD", "utf-8");
    branch = head_str.substr(head_str.lastIndexOf("/") + 1, head_str.length);
} catch {
    // Do nothing
}

Object.entries(config).forEach((value) => {
    process.env[value[0]] = value[1];
});

const default_exports = {
    entry: {
        bc: "./src/bigcommerce/main.js",
    },
    mode: "none",
    output: {
        path: path.resolve(__dirname, "../server/static/js"),
        publicPath: config.publicPath,
        filename: "[name].js",
        assetModuleFilename: "[name].[ext]?[hash]",
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["vue-style-loader", "css-loader"],
            },
            {
                test: /\.vue$/,
                loader: "vue-loader",
                options: {
                    loaders: {},
                    // other vue-loader options go here
                },
            },
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                type: "asset/resource",
            },
        ],
    },
    resolve: {
        alias: {
            vue$: "vue/dist/vue.esm.js",
            "@config": path.resolve(__dirname, "config"),
            "@types": path.resolve(__dirname, "src", "core", "libs", "types"),
            "@": path.resolve("src"),
        },
        extensions: ["*", ".js", ".vue", ".json"],
        fallback: {
            os: require.resolve("os-browserify/browser"),
        },
    },
    devServer: {
        historyApiFallback: true,
        port: 8081,
        client: {
            logging: "verbose",
            overlay: true,
            progress: true,
        },
        hot: true,
        host: "0.0.0.0",
        server: "http",
        webSocketServer: false,
    },
    optimization: {},
    performance: {
        hints: false,
    },
    devtool: "eval-source-map",
    plugins: [
        new Dotenv({
            systemvars: true,
            allowEmptyValues: false,
        }),
        new DefinePlugin({
            GIT_BRANCH: JSON.stringify(branch),
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        }),
        new ProvidePlugin({
            process: "process/browser",
        }),
        new VueLoaderPlugin(),
    ],
    stats: {
        errorDetails: true,
    },
};
// If this is a local environment, do not minimize or compress.
// Add named moduleIds for easier debugging.
if (process.env.NODE_ENV.includes("local")) {
    default_exports.optimization = {
        moduleIds: "named",
    };
    default_exports.plugins.push(
        new optimize.LimitChunkCountPlugin({
            maxChunks: 1,
        })
    );
} else if (!process.env.NODE_ENV.includes("dev")) {
    default_exports.optimization = {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: false,
            }),
        ],
    };
    default_exports.plugins.push(new CompressionPlugin());
    default_exports.mode = "development";
}

// Environment specific build options.
if (process.env.NODE_ENV.includes("dev")) {
    // Add named moduleIds for easier debugging.
    Object.assign(default_exports.optimization, {
        moduleIds: "named",
    });
} else if (process.env.NODE_ENV === "end-to-end") {
    // Limit chunks to 1 so Selenium can insert a local copy of the script.
    default_exports.plugins.push(
        new optimize.LimitChunkCountPlugin({
            maxChunks: 1,
        })
    );
} else if (process.env.NODE_ENV.includes("production")) {
    // Turn off development settings.
    default_exports.devtool = "source-map";
    default_exports.mode = "production";
}

module.exports = default_exports;
