const path = require('path');

module.exports = {
    entry: './client/src/client.js',
    output: {
        path: path.resolve(__dirname, 'client/dist'),
        filename: 'bundle.js',
    },
    devtool: 'source-map',
    watchOptions: {
        ignored: [
            path.resolve(__dirname, 'client/dist'), 
            path.resolve(__dirname, 'node_modules')
        ],
        aggregateTimeout: 0
    }
};