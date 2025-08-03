const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Enable tree shaking optimizations
      if (env === 'production') {
        // Ensure tree shaking is enabled
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          usedExports: true,
          sideEffects: false,
          // Enhanced tree shaking
          providedExports: true,
          // Split chunks for better caching
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
                priority: 10,
              },
              common: {
                name: 'common',
                minChunks: 2,
                chunks: 'all',
                priority: 5,
                reuseExistingChunk: true,
              },
              // Separate chunk for large libraries
              ethers: {
                test: /[\\/]node_modules[\\/]ethers[\\/]/,
                name: 'ethers',
                chunks: 'all',
                priority: 20,
              },
              framerMotion: {
                test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
                name: 'framer-motion',
                chunks: 'all',
                priority: 15,
              }
            }
          },
          // Minimize bundle size
          minimize: true,
          minimizer: [
            ...webpackConfig.optimization.minimizer,
          ]
        };

        // Add compression plugin
        webpackConfig.plugins.push(
          new CompressionPlugin({
            algorithm: 'gzip',
            test: /\.(js|css|html|svg)$/,
            threshold: 8192,
            minRatio: 0.8,
            filename: '[path][base].gz',
          })
        );

        // Add Brotli compression
        webpackConfig.plugins.push(
          new CompressionPlugin({
            algorithm: 'brotliCompress',
            test: /\.(js|css|html|svg)$/,
            compressionOptions: {
              level: 11,
            },
            threshold: 8192,
            minRatio: 0.8,
            filename: '[path][base].br',
          })
        );

        // Bundle analyzer (only when ANALYZE=true)
        if (process.env.ANALYZE === 'true') {
          webpackConfig.plugins.push(
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              openAnalyzer: true,
              reportFilename: '../bundle-analysis/report.html'
            })
          );
        }
      }

      // Resolve optimizations
      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        alias: {
          ...webpackConfig.resolve.alias,
          '@': path.resolve(__dirname, 'src'),
          '@components': path.resolve(__dirname, 'src/components'),
          '@utils': path.resolve(__dirname, 'src/utils'),
          '@hooks': path.resolve(__dirname, 'src/hooks'),
        },
        // Optimize module resolution
        modules: [
          path.resolve(__dirname, 'src'),
          'node_modules'
        ],
      };

      // Module rules optimization
      const oneOfRule = webpackConfig.module.rules.find(rule => rule.oneOf);
      if (oneOfRule) {
        // Add rule for tree shaking CSS modules
        oneOfRule.oneOf.unshift({
          test: /\.module\.css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: env === 'production' ? '[hash:base64:5]' : '[name]__[local]__[hash:base64:5]',
                },
                importLoaders: 1,
              },
            },
            'postcss-loader',
          ],
        });
      }

      return webpackConfig;
    },
  },
  // Babel configuration for better tree shaking
  babel: {
    plugins: [
      // Enable tree shaking for imports
      ['import', {
        libraryName: 'lodash',
        libraryDirectory: '',
        camel2DashComponentName: false,
      }, 'lodash'],
      // Optimize React imports
      ['import', {
        libraryName: 'react',
        libraryDirectory: '',
        camel2DashComponentName: false,
      }, 'react'],
    ],
    presets: [
      ['@babel/preset-env', {
        modules: false, // Keep ES modules for tree shaking
        useBuiltIns: 'entry',
        corejs: 3,
      }],
      '@babel/preset-react',
      '@babel/preset-typescript',
    ],
  },
  // Development server optimizations
  devServer: {
    compress: true,
    hot: true,
  },
};