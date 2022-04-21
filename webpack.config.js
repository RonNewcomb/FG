const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    // basic config
    experiments: {
        topLevelAwait: true
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    mode: 'development',
    //devtool: 'none',
    devtool: 'source-map',

    // in, transform, out
    entry: {
        game: {
            import: './src/game/app.ts',
        },
        balancer: {
            import: './src/balance/matchup.tsx',
            //dependOn: 'game',
        },
    },
    plugins: [
        new HtmlWebpackPlugin({ inject: false, favicon: './favicon.ico', template: './src/index.html', filename: 'index.html' }),
        new HtmlWebpackPlugin({ inject: false, favicon: './favicon.ico', template: './src/balance/matchup.html', filename: 'balancer.html' })
    ],
    module: {
        rules: [
            { test: /\.css$/, use: 'css-loader' },
            { test: /\.tsx?$/, use: 'ts-loader' },
        ],
    },
    output: {
        filename: '[name].js',
        path: __dirname + '/built',
    },

};