#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analyzes the webpack bundle to identify optimization opportunities
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Install webpack-bundle-analyzer if not present
try {
  require.resolve('webpack-bundle-analyzer');
} catch (e) {
  console.log('Installing webpack-bundle-analyzer...');
  execSync('npm install --save-dev webpack-bundle-analyzer', { stdio: 'inherit' });
}

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

// Create a temporary webpack config for analysis
const webpackConfig = {
  mode: 'production',
  entry: './src/index.js',
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: true,
      reportFilename: '../bundle-analysis/report.html'
    })
  ]
};

// Ensure bundle-analysis directory exists
const analysisDir = path.join(__dirname, '../bundle-analysis');
if (!fs.existsSync(analysisDir)) {
  fs.mkdirSync(analysisDir, { recursive: true });
}

console.log('Analyzing bundle...');
console.log('Bundle analysis report will be generated at:', path.join(analysisDir, 'report.html'));

// Run the analysis
const webpack = require('webpack');
webpack(webpackConfig, (err, stats) => {
  if (err || stats.hasErrors()) {
    console.error('Bundle analysis failed:', err || stats.toString());
    process.exit(1);
  }
  
  console.log('Bundle analysis complete!');
  console.log('Report saved to:', path.join(analysisDir, 'report.html'));
});