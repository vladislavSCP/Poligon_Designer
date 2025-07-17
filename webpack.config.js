import path from 'path';
import HtmlPlugin from 'html-webpack-plugin';
import MiniCssExtract from 'mini-css-extract-plugin';

export default {
  mode: process.env.NODE_ENV ?? 'development',
  entry: './src/main.js',
  output:{
    path: path.resolve('dist'),
    filename:'bundle.js',
    publicPath:'',
    clean:true
  },
  module:{
    rules:[
      { test:/\.css$/i, use:[MiniCssExtract.loader,'css-loader'] }
    ]
  },
  plugins:[
    new HtmlPlugin({ template:'./src/index.html' }),
    new MiniCssExtract({ filename:'styles.css' })
  ],
  devServer:{
    static:'./src',
    port:3000,
    open:true,
    hot:true
  }
};
