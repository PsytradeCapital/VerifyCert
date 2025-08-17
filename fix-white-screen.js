#!/usr/bin/env node

/**
 * Quick fix for white screen issue
 * This script will create a simplified version of the app to identify the problem
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Applying white screen fix...\n');

// Backup original files
const appPath = path.join(__dirname, 'frontend', 'src', 'App.tsx');
const indexPath = path.join(__dirname, 'frontend', 'src', 'index.tsx');
const appBackupPath = path.join(__dirname, 'frontend', 'src', 'App-backup.tsx');
const indexBackupPath = path.join(__dirname, 'frontend', 'src', 'index-backup.tsx');

try {
  // Create backups
  if (fs.existsSync(appPath) && !fs.existsSync(appBackupPath)) {
    fs.copyFileSync(appPath, appBackupPath);
    console.log('✅ Backed up App.tsx');
  }
  
  if (fs.existsSync(indexPath) && !fs.existsSync(indexBackupPath)) {
    fs.copyFileSync(indexPath, indexBackupPath);
    console.log('✅ Backed up index.tsx');
  }

  // Replace with simple versions
  const simpleAppPath = path.join(__dirname, 'frontend', 'src', 'App-simple.tsx');
  const simpleIndexPath = path.join(__dirname, 'frontend', 'src', 'index-simple.tsx');
  
  if (fs.existsSync(simpleAppPath)) {
    fs.copyFileSync(simpleAppPath, appPath);
    console.log('✅ Applied simple App.tsx');
  }
  
  if (fs.existsSync(simpleIndexPath)) {
    fs.copyFileSync(simpleIndexPath, indexPath);
    console.log('✅ Applied simple index.tsx');
  }

  console.log('\n🚀 Now rebuild and test:');
  console.log('   cd frontend');
  console.log('   npm run build');
  console.log('   npx serve -s build -l 3001');
  
  console.log('\n🔄 To restore original files:');
  console.log('   node restore-original.js');

} catch (error) {
  console.error('❌ Error applying fix:', error.message);
  process.exit(1);
}