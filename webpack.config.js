const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const HtmlWebpackInjectPreload = require('@principalstudio/html-webpack-inject-preload');
const MinifyPlugin = require("babel-minify-webpack-plugin");


// ENV
let mode = 'development';
if (process.env.MODE != "development") {
  mode = "production";
}

console.log("Build mode: " + mode);

// PLUGINS 
var pluginsIncluded = [
  // https://www.npmjs.com/package/mini-css-extract-plugin
  new MiniCssExtractPlugin({
    filename: '[name].[contenthash:4].css'
  }),

  // https://www.npmjs.com/package/html-webpack-plugin
  /*
  new HtmlWebpackPlugin({
    template: 'src/pug/index.pug'
  }),
  */

  // new MinifyPlugin({},{test:/\.js($|\?)/i}),
];


// Generating Multiple HTML Files of PUG
const directoryPath = path.join(__dirname, 'src/pug/');
let files =  fs.readdirSync(directoryPath);
let is_add_template = false;

files.forEach(function(file) {
  let filePath = path.join(directoryPath, file);
  if(path.extname(filePath) === '.pug') {

    is_add_template = true;
    let filename = path.basename(filePath);
    console.log('Add template file: ' + filePath, filename);
    

    // https://www.npmjs.com/package/html-webpack-plugin
    pluginsIncluded.push(
      new HtmlWebpackPlugin({
        template: 'src/pug/' + filename,
        filename: path.parse(filename).name + ".html"
      })
    )

  }
});

if(!is_add_template) {
  pluginsIncluded.push(
    new HtmlWebpackPlugin({
      template: 'src/pug/index.pug'
    }),
  );
}


pluginsIncluded.push(
  new HtmlWebpackInjectPreload({
    files: [
      {
        match: /loader\.bundle\.js$/,
        attributes: { as: 'script', type: 'text/javascript' },
      },
      {
        match: /.*\.woff$/,
        attributes: { as: 'font', type: 'font/woff', crossorigin: true },
      },
    ]
  })
);

module.exports = {
  // Режим сборки
  mode: mode,
  target: "web",

  stats: {
    children: true,
  },



  devServer: {
    hot: true,
    liveReload: true,
    compress: true,
    client: {
      overlay: true,
      progress: false,
    },
    watchFiles: {
      paths: ['src/**/*.*', 'assets/**/*.*'],
      options: {
        usePolling: true
      }
    }
  },

  // Собираем JS
  entry: {
    loader: './src/js/loader.js',
    index: './src/js/index.js',
  },

  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },


  // sourcemap
  devtool: 'source-map',

  // Подключаем плагины
  plugins: pluginsIncluded,

  // Указываем тут, что будем использовать спец. модуль для определенных файлов (лоадер)
  module: {
    // Указываем правила для данных модулей
    rules: [
      // Указываем правило для каждого лоадера

      // Стили
      {
        test: /\.(sa|sc|c)ss$/, // Файлы по маске *.css, *.scss, *.sass 
        use: [
          (mode === 'development') ? 'style-loader' : MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  [
                    "postcss-preset-env",
                    {}
                  ]
                ]
              }
            }
          },
          "sass-loader"
        ]
      },

      // Изображения растовые
      {
        test: /\.(png|jpe?g|webp)$/i,
        type: "asset/resource",
        generator: {
          filename: '[path][name]_[contenthash:4][ext]'
        }
      },

      // Изображения векторные (SVG)
      {
        test: /\.(svg)$/,
        type: "asset/resource",
        generator: {
          filename: 'assets/svg/[name]_[contenthash:4][ext]'
        }
      },

      // Шрифты
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: "asset/resource",
        generator: {
          filename: '[path][name][contenthash:4][ext]'
        }
      },

      // Video
      {
        test: /\.(mp4)$/,
        type: "asset/resource",
        generator: {
          filename: '[path][name][contenthash:4][ext]'
        }
      },

      // PUG
      {
        test: /\.pug$/,
        loader: 'pug-loader',
      },

      // BABEL JS
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ],
  },

  // Оптимизация изображений
  
  optimization: {
    minimizer: [
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            // Lossless optimization with custom option
            // Feel free to experiment with options for better result for you
            plugins: [
              ["gifsicle", { interlaced: true }],
              ["jpegtran", { progressive: true }],
              ["optipng", { optimizationLevel: 9 }],
              // Svgo configuration here https://github.com/svg/svgo#configuration
              [
                "svgo",
                {
                  plugins: [
                    {
                      name: "preset-default",
                      params: {
                        overrides: {
                          removeViewBox: false,
                          addAttributesToSVGElement: {
                            params: {
                              attributes: [
                                { xmlns: "http://www.w3.org/2000/svg" },
                              ],
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              ],
            ],
          },
        },
      }),
    ],
  },
};
