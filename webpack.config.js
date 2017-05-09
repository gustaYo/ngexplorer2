var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: './index.coffee',
    output: {
        path: path.resolve(__dirname, '.'),
        filename: 'server.js'
    },
    module: {
        rules: [
            {
                test: /\.coffee.md$/,
                use: [
                    {
                        loader: 'coffee-loader',
                        options: { literate: true }
                    }
                ]
            }
        ],
        loaders: [
            {
                test: /\.coffee$/,
                loader: 'coffee-loader'
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            },
            {
                test: /\.js$/,
                loader: 'babel-loader'
            }
        ]
    },
    stats: {
        colors: true
    },
    target: 'node',
    node: {
        __dirname: false,
        __filename: false,
    },
    devtool: 'source-map'
};