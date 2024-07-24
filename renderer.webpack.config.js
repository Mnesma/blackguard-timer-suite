const path = require("path");
const process = require("process");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

const config = {
    entry: "./src/renderer/index.ts",
    target: "electron-renderer",
    output: {
        path: path.resolve(__dirname, "dist/renderer"),
        filename: "index.js"
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].css"
        }),
        new HtmlWebpackPlugin({
            title: "Blackguard Timer Suite",
            scriptLoading: "module",
            template: "src/renderer/index.html"
        })
    ],
    module: {
        rules: [
            {
                test: /\.(ts)$/i,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            configFile: "src/renderer/tsconfig.json"
                        }
                    }
                ],
                exclude: ["/node_modules/"]
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"]
            },
            {
                test: /\.(ttf|webp|png)$/,
                type: "asset/resource",
                generator: {
                    filename: (pathData) => {
                        const pathSegments = pathData.filename.split("/");

                        const assetsSegmentLocation = pathSegments.findIndex(
                            segment => segment === "assets"
                        );

                        if (assetsSegmentLocation > -1) {
                            const newFilename = pathSegments.slice(
                                assetsSegmentLocation + 1
                            ).join("/");
                            return newFilename;
                        }

                        throw new Error(
                            "not a valid asset because \"assets\" segment could not be found"
                        );
                    },
                    publicPath: "assets/"
                }
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    optimization: {
        minimizer: [
            new ImageMinimizerPlugin({
                minimizer: {
                    implementation: ImageMinimizerPlugin.sharpMinify,
                    options: {
                        encodeOptions: {
                            webp: {
                                lossless: true
                            },
                            png: {}
                        }
                    }
                }
            })
        ]
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
