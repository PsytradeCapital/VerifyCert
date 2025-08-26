module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Optimize memory usage
      webpackConfig.optimization = {
        ...webpackConfig.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
      
      // Reduce memory usage
      webpackConfig.resolve.symlinks = false;
      webpackConfig.resolve.cacheWithContext = false;
      
      return webpackConfig;
    },
  },
  typescript: {
    enableTypeChecking: false
  }
};