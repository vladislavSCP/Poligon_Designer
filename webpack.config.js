import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

export default {
   entry: './src/main.js',          // ← пусть точка входа остаётся main.js
   output: {
     path: path.resolve(__dirname, 'dist'),
     filename: 'main.js',                clean: true,
     publicPath: '/Poligon_Designer/'
   },
   module: { /* ваши rules */ },
   plugins: [
     new HtmlWebpackPlugin({
       template: 'src/index.html',
       inject: 'body'
     })
   ]
};
