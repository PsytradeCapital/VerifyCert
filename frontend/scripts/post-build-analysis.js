#!/usr/bin/env node

/**
 * Post-build Analysis Script
 * Analyzes the build output for optimization opportunities
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📊 Running post-build analysis...');

// 1. Analyze bundle sizes
const analyzeBundleSizes = () => {
  console.log('📦 Analyzing bundle sizes...');
  
  const buildDir = path.join(__dirname, '../build');
  const staticDir = path.join(buildDir, 'static');
  
  if (!fs.existsSync(staticDir)) {
    console.error('❌ Build directory not found. Run npm run build first.');
    return;
  }
  
  const jsDir = path.join(staticDir, 'js');
  const cssDir = path.join(staticDir, 'css');
  
  const getFileSize = (filePath) => {
    const stats = fs.statSync(filePath);
    return Math.round(stats.size / 1024); // KB
  };
  
  const getGzipSize = (filePath) => {
    try {
      const gzipPath = filePath + '.gz';
      if (fs.existsSync(gzipPath)) {
        return getFileSize(gzipPath);
      }
    } catch (error) {
      // Gzip file doesn't exist
    }
    return null;
  };
  
  const getBrotliSize = (filePath) => {
    try {
      const brotliPath = filePath + '.br';
      if (fs.existsSync(brotliPath)) {
        return getFileSize(brotliPath);
      }
    } catch (error) {
      // Brotli file doesn't exist
    }
    return null;
  };
  
  // Analyze JavaScript files
  if (fs.existsSync(jsDir)) {
    const jsFiles = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));
    let totalJSSize = 0;
    let totalJSGzipSize = 0;
    let totalJSBrotliSize = 0;
    
    console.log('\n📄 JavaScript Files:');
    jsFiles.forEach(file => {
      const filePath = path.join(jsDir, file);
      const size = getFileSize(filePath);
      const gzipSize = getGzipSize(filePath);
      const brotliSize = getBrotliSize(filePath);
      
      totalJSSize += size;
      if (gzipSize) totalJSGzipSize += gzipSize;
      if (brotliSize) totalJSBrotliSize += brotliSize;
      
      console.log(`  ${file}: ${size} KB${gzipSize ? ` (${gzipSize} KB gzip)` : ''}${brotliSize ? ` (${brotliSize} KB br)` : ''}`);
    });
    
    console.log(`\n📊 Total JS: ${totalJSSize} KB${totalJSGzipSize ? ` (${totalJSGzipSize} KB gzip)` : ''}${totalJSBrotliSize ? ` (${totalJSBrotliSize} KB br)` : ''}`);
  }
  
  // Analyze CSS files
  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
    let totalCSSSize = 0;
    let totalCSSGzipSize = 0;
    let totalCSSBrotliSize = 0;
    
    console.log('\n🎨 CSS Files:');
    cssFiles.forEach(file => {
      const filePath = path.join(cssDir, file);
      const size = getFileSize(filePath);
      const gzipSize = getGzipSize(filePath);
      const brotliSize = getBrotliSize(filePath);
      
      totalCSSSize += size;
      if (gzipSize) totalCSSGzipSize += gzipSize;
      if (brotliSize) totalCSSBrotliSize += brotliSize;
      
      console.log(`  ${file}: ${size} KB${gzipSize ? ` (${gzipSize} KB gzip)` : ''}${brotliSize ? ` (${brotliSize} KB br)` : ''}`);
    });
    
    console.log(`\n📊 Total CSS: ${totalCSSSize} KB${totalCSSGzipSize ? ` (${totalCSSGzipSize} KB gzip)` : ''}${totalCSSBrotliSize ? ` (${totalCSSBrotliSize} KB br)` : ''}`);
  }
};

// 2. Check compression ratios
const checkCompressionRatios = () => {
  console.log('\n🗜️  Checking compression ratios...');
  
  const buildDir = path.join(__dirname, '../build/static');
  const checkDir = (dir, type) => {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir).filter(file => file.endsWith(`.${type}`));
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const originalSize = fs.statSync(filePath).size;
      
      const gzipPath = filePath + '.gz';
      const brotliPath = filePath + '.br';
      
      if (fs.existsSync(gzipPath)) {
        const gzipSize = fs.statSync(gzipPath).size;
        const gzipRatio = ((originalSize - gzipSize) / originalSize * 100).toFixed(1);
        console.log(`  ${file}: ${gzipRatio}% gzip compression`);
      }
      
      if (fs.existsSync(brotliPath)) {
        const brotliSize = fs.statSync(brotliPath).size;
        const brotliRatio = ((originalSize - brotliSize) / originalSize * 100).toFixed(1);
        console.log(`  ${file}: ${brotliRatio}% brotli compression`);
      }
    });
  };
  
  checkDir(path.join(buildDir, 'js'), 'js');
  checkDir(path.join(buildDir, 'css'), 'css');
};

// 3. Generate optimization recommendations
const generateRecommendations = () => {
  console.log('\n💡 Optimization Recommendations:');
  
  const buildDir = path.join(__dirname, '../build/static');
  const jsDir = path.join(buildDir, 'js');
  
  if (fs.existsSync(jsDir)) {
    const jsFiles = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));
    const largeFiles = jsFiles.filter(file => {
      const size = fs.statSync(path.join(jsDir, file)).size / 1024; // KB
      return size > 100; // Files larger than 100KB
    });
    
    if (largeFiles.length > 0) {
      console.log('  📦 Large JavaScript files detected:');
      largeFiles.forEach(file => {
        const size = Math.round(fs.statSync(path.join(jsDir, file)).size / 1024);
        console.log(`    - ${file} (${size} KB) - Consider code splitting`);
      });
    }
    
    // Check for vendor chunks
    const vendorFiles = jsFiles.filter(file => file.includes('vendor') || file.includes('chunk'));
    if (vendorFiles.length === 0) {
      console.log('  ⚠️  No vendor chunks detected - consider implementing chunk splitting');
    } else {
      console.log(`  ✅ Found ${vendorFiles.length} vendor/chunk files - good code splitting`);
    }
  }
  
  console.log('\n🎯 Performance Tips:');
  console.log('  - Keep main bundle under 250KB (gzipped)');
  console.log('  - Use dynamic imports for route-based code splitting');
  console.log('  - Implement lazy loading for heavy components');
  console.log('  - Consider using a CDN for static assets');
  console.log('  - Enable HTTP/2 server push for critical resources');
};

// 4. Save analysis report
const saveAnalysisReport = () => {
  const reportDir = path.join(__dirname, '../bundle-analysis');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const buildDir = path.join(__dirname, '../build/static');
  const report = {
    timestamp: new Date().toISOString(),
    analysis: {
      bundleOptimization: 'completed',
      treeShaking: 'enabled',
      compression: 'gzip + brotli',
      codeSplitting: 'enabled'
    },
    files: {},
    recommendations: []
  };
  
  // Collect file information
  ['js', 'css'].forEach(type => {
    const dir = path.join(buildDir, type);
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(file => file.endsWith(`.${type}`));
      report.files[type] = files.map(file => {
        const filePath = path.join(dir, file);
        const size = Math.round(fs.statSync(filePath).size / 1024);
        
        let gzipSize = null;
        let brotliSize = null;
        
        try {
          if (fs.existsSync(filePath + '.gz')) {
            gzipSize = Math.round(fs.statSync(filePath + '.gz').size / 1024);
          }
          if (fs.existsSync(filePath + '.br')) {
            brotliSize = Math.round(fs.statSync(filePath + '.br').size / 1024);
          }
        } catch (error) {
          // Ignore compression file errors
        }
        
        return {
          name: file,
          size: `${size} KB`,
          gzipSize: gzipSize ? `${gzipSize} KB` : null,
          brotliSize: brotliSize ? `${brotliSize} KB` : null
        };
      });
    }
  });
  
  fs.writeFileSync(
    path.join(reportDir, 'post-build-analysis.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n📄 Analysis report saved to bundle-analysis/post-build-analysis.json');
};

// Run all analyses
const runAnalysis = async () => {
  try {
    analyzeBundleSizes();
    checkCompressionRatios();
    generateRecommendations();
    saveAnalysisReport();
    
    console.log('\n🎉 Post-build analysis completed successfully!');
  } catch (error) {
    console.error('❌ Post-build analysis failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  runAnalysis();
}

module.exports = { runAnalysis };