const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const isDevelopment = process.env.NODE_ENV === 'development'
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { HotModuleReplacementPlugin } = require('webpack');
module.exports = {
    // bundling mode
    mode: process.env.NODE_ENV,
    // entry files
    entry: './src/index.ts',
    // output bundles (location)
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'mini-mf.js',
    },
    // file resolutions
    resolve: {
        extensions: ['.ts', '.js'],
    },
    // loaders
    module: {
        rules: [
            {
                test: /\.tsx?/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }, 
            {
                test: /\.s(a|c)ss$/,
                exclude: /\.module.(s(a|c)ss)$/,
                use: [ 'style-loader','css-loader', 'sass-loader'],
            }
        ]
    },
    plugins: [
        new HotModuleReplacementPlugin({}),
        new HtmlWebpackPlugin({
            filename: 'index.html', // name of file that will be outputted to 'src' when built
            template: './root.html',// path to your html file relative to config
            inject: true
        })
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, './'),
            watch: true
        },
        port: 7000,
        open: true,
        compress: false
    },
    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    }
};