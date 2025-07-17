import path from 'path';
export default {
  mode: 'development',
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve('dist'),
    clean: true
  },
  devServer: {
    static: './src',
    port: 3000,
    open: true,
    hot: true
  },
  module: {
    rules: [{
      test: /\.css$/i,
      use: ['style-loader', 'css-loader']
    }]
  }
};
