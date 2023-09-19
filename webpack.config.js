var path = require("path");
var webpack = require("webpack");
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    target: "web",
    entry: {
        registration: "./src/app.ts",
        dialog: "./src/dialog.tsx"
    },
    output: {
        filename: "src/[name].js",
        libraryTarget: "amd"
    },
    externals: [
        /^VSS\/.*/, /^TFS\/.*/, /^q$/
    ],
    resolve: {
        extensions: [
            ".webpack.js",
            ".web.js",
            ".ts",
            ".tsx",
            ".css",
            ".js",
            ".jsx"],
        modules: [
           "./src",
            'node_modules'
            
        ]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude:  /node_modules/,
                loader: "ts-loader"
            },
            {
                test: /\.s?css$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin({patterns:[
            { from: "./node_modules/vss-web-extension-sdk/lib/VSS.SDK.min.js", to: "libs/VSS.SDK.min.js" },
            { from: "./src/*.html", to: "./" },
            { from: "./marketplace", to: "marketplace" },
            { from: "./vss-extension.json", to: "vss-extension-release.json" }
        ]}),
        new webpack.DefinePlugin({
            REACT_SPINKIT_NO_STYLES: true,
            process: {env: {REACT_SPINKIT_NO_STYLES:true}}
        })
    ]
}