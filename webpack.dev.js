const path = require( 'path' );
const {merge} = require( 'webpack-merge')
const commonConfig = require('./webpack.common')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { HotModuleReplacementPlugin } = require('webpack');
module.exports = () => {
    return merge(commonConfig, {
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
        }
    })
}