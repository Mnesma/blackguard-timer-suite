const path = require("path");
const process = require("process");

const config = {
    entry: "./src/main/index.ts",
    target: "electron-main",
    output: {
        path: path.resolve(__dirname, "dist/main"),
        filename: "index.js"
    },
    module: {
        rules: [
            {
                test: /\.(ts)$/i,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            configFile: "src/main/tsconfig.json"
                        }
                    }
                ],
                exclude: ["/node_modules/"]
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    }
};

module.exports = () => {
    if (process.env.NODE_ENV === "production") {
        config.mode = "production";
    } else {
        config.mode = "development";
        config.devtool = "source-map";
    }
    return config;
};
