const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const isDevelopment = process.env.NODE_ENV === 'development'
module.exports = {
    // bundling mode
    mode: process.env.NODE_ENV,
    // entry files
    entry: './src/index.ts',
    // output bundles (location)
    output: {
        path: path.resolve(__dirname, 'dist'),
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
    }
};