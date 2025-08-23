const { execSync } = require('child_process');

console.log('🔍 Checking TypeScript errors after fixes...');

try {
  execSync('cd frontend && npx tsc --noEmit > ../tsc-errors-progress.txt 2>&1', { stdio: 'inherit' });
  console.log('✅ No TypeScript errors found!');
} catch (error) {
  console.log('📊 TypeScript errors found, checking count...');
  
  try {
    const fs = require('fs');
    const content = fs.readFileSync('tsc-errors-progress.txt', 'utf8');
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    console.log(`📈 Current error count: ${lines.length} errors`);
    
    if (lines.length < 3000) {
      console.log('🎉 Great progress! Reduced from 3,824 to', lines.length);
    } else {
      console.log('⚠️  Still need more fixes. Current:', lines.length);
    }
  } catch (readError) {
    console.log('❌ Could not read error file');
  }
}