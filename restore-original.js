#!/usr/bin/env node

/**
 * Restore original App.tsx and index.tsx files
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Restoring original files...\n');

const appPath = path.join(__dirname, 'frontend', 'src', 'App.tsx');
const indexPath = path.join(__dirname, 'frontend', 'src', 'index.tsx');
const appBackupPath = path.join(__dirname, 'frontend', 'src', 'App-backup.tsx');
const indexBackupPath = path.join(__dirname, 'frontend', 'src', 'index-backup.tsx');

try {
  // Restore from backups
  if (fs.existsSync(appBackupPath)) {
    fs.copyFileSync(appBackupPath, appPath);
    console.log('✅ Restored App.tsx');
  }
  
  if (fs.existsSync(indexBackupPath)) {
    fs.copyFileSync(indexBackupPath, indexPath);
    console.log('✅ Restored index.tsx');
  }

  console.log('\n✅ Original files restored successfully!');
  console.log('   Remember to rebuild: cd frontend && npm run build');

} catch (error) {
  console.error('❌ Error restoring files:', error.message);
  process.exit(1);
}