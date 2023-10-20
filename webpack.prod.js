const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: './umd.js',
  output: {
    path: path.join(__dirname, '/lib'),
    filename: 'index.js',
    library: 'WebChat',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'], // Include '@babel/preset-react' for JSX files
          },
        },
      },
      {
        test: /\.(scss|css)$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.svg$/,
        use: ['svg-inline-loader'],
      },
      // Add more rules for handling other asset types (e.g., images) if necessary
    ],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['lib', 'module'],
    }),
    // ... other plugins you might have
  ],
};
