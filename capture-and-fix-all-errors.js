#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 Comprehensive TypeScript Error Capture and Fix System');
console.log('📊 Capturing all 6000+ TypeScript errors...');

// Function to capture all TypeScript errors
function captureAllErrors() {
    try {
        console.log('🔍 Running TypeScript compiler to capture all errors...');
        execSync('cd frontend && npx tsc --noEmit --pretty false 2>&1', { 
            stdio: 'pipe',
            encoding: 'utf8'
        });
        return '';
    } catch (error) {
        return error.stdout || error.stderr || '';
    }
}

// Function to parse TypeScript errors
function parseErrors(errorOutput) {
    const errors = [];
    const lines = errorOutput.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.includes(' - error TS')) {
            const match = line.match(/^(.+?):(\d+):(\d+) - error (TS\d+): (.+)$/);
            if (match) {
                errors.push({
                    file: match[1],
                    line: parseInt(match[2]),
                    column: parseInt(match[3]),
                    code: match[4],
                    message: match[5],
                    fullLine: line
                });
            }
        }
    }
    
    return errors;
}

// Function to group errors by type
function groupErrorsByType(errors) {
    const groups = {};
    errors.forEach(error => {
        if (!groups[error.code]) {
            groups[error.code] = [];
        }
        groups[error.code].push(error);
    });
    return groups;
}

// Function to fix common TypeScript errors
function fixCommonErrors(errors) {
    const fixes = [];
    
    // Group errors by file for batch processing
    const fileErrors = {};
    errors.forEach(error => {
        if (!fileErrors[error.file]) {
            fileErrors[error.file] = [];
        }
        fileErrors[error.file].push(error);
    });
    
    Object.keys(fileErrors).forEach(filePath => {
        const fileErrorList = fileErrors[filePath];
        
        try {
            if (!fs.existsSync(filePath)) {
                console.log(`⚠️  File not found: ${filePath}`);
                return;
            }
            
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;
            
            // Fix template literal errors (TS1005)
            const templateLiteralErrors = fileErrorList.filter(e => e.code === 'TS1005' && e.message.includes("',' expected"));
            if (templateLiteralErrors.length > 0) {
                // Fix template literals with proper backticks
                content = content.replace(/([^`])\$\{([^}]+)\}/g, '`${$2}`');
                content = content.replace(/([^`])'([^']*\$\{[^}]+\}[^']*)'([^`])/g, '`$2`');
                modified = true;
            }
            
            // Fix missing semicolons (TS1005)
            const semicolonErrors = fileErrorList.filter(e => e.code === 'TS1005' && e.message.includes("';' expected"));
            if (semicolonErrors.length > 0) {
                // Add missing semicolons at end of statements
                content = content.replace(/([^;{}\s])\s*\n/g, '$1;\n');
                modified = true;
            }
            
            // Fix missing closing braces (TS1005)
            const braceErrors = fileErrorList.filter(e => e.code === 'TS1005' && e.message.includes("'}' expected"));
            if (braceErrors.length > 0) {
                // Count and balance braces
                const openBraces = (content.match(/\{/g) || []).length;
                const closeBraces = (content.match(/\}/g) || []).length;
                if (openBraces > closeBraces) {
                    content += '\n' + '}'.repeat(openBraces - closeBraces);
                    modified = true;
                }
            }
            
            // Fix missing closing parentheses (TS1005)
            const parenErrors = fileErrorList.filter(e => e.code === 'TS1005' && e.message.includes("')' expected"));
            if (parenErrors.length > 0) {
                const openParens = (content.match(/\(/g) || []).length;
                const closeParens = (content.match(/\)/g) || []).length;
                if (openParens > closeParens) {
                    content += ')'.repeat(openParens - closeParens);
                    modified = true;
                }
            }
            
            // Fix identifier expected errors (TS1003)
            const identifierErrors = fileErrorList.filter(e => e.code === 'TS1003');
            if (identifierErrors.length > 0) {
                // Fix malformed imports
                content = content.replace(/import\s*\{\s*;\s*\}/g, 'import {}');
                content = content.replace(/import\s*\{\s*,\s*\}/g, 'import {}');
                content = content.replace(/,\s*;/g, '');
                content = content.replace(/,\s*\}/g, ' }');
                modified = true;
            }
            
            // Fix expression expected errors (TS1109)
            const expressionErrors = fileErrorList.filter(e => e.code === 'TS1109');
            if (expressionErrors.length > 0) {
                // Fix incomplete arrow functions
                content = content.replace(/=>\s*;/g, '=> {}');
                content = content.replace(/=>\s*$/gm, '=> {}');
                modified = true;
            }
            
            // Fix declaration or statement expected (TS1128)
            const declarationErrors = fileErrorList.filter(e => e.code === 'TS1128');
            if (declarationErrors.length > 0) {
                // Remove stray closing braces and parentheses
                content = content.replace(/^\s*\}\s*$/gm, '');
                content = content.replace(/^\s*\)\s*$/gm, '');
                modified = true;
            }
            
            // Fix JSX errors (TS1382, TS1381)
            const jsxErrors = fileErrorList.filter(e => e.code === 'TS1382' || e.code === 'TS1381');
            if (jsxErrors.length > 0 && filePath.includes('.tsx')) {
                // Fix JSX syntax issues
                content = content.replace(/\{>\}/g, '{">"}');
                content = content.replace(/\{'\}/g, '{"}"');
                content = content.replace(/&gt;/g, '>');
                content = content.replace(/&rbrace;/g, '}');
                modified = true;
            }
            
            if (modified) {
                fs.writeFileSync(filePath, content);
                fixes.push(`✅ Fixed ${filePath}`);
                console.log(`✅ Applied fixes to ${filePath}`);
            }
            
        } catch (error) {
            console.error(`❌ Error fixing ${filePath}:`, error.message);
        }
    });
    
    return fixes;
}

// Main execution
console.log('🚀 Starting comprehensive error capture and fix...');

// Capture all errors
const errorOutput = captureAllErrors();
if (!errorOutput) {
    console.log('🎉 No TypeScript errors found!');
    process.exit(0);
}

// Parse errors
const errors = parseErrors(errorOutput);
console.log(`📊 Found ${errors.length} TypeScript errors`);

// Group errors by type
const errorGroups = groupErrorsByType(errors);
console.log('📋 Error breakdown:');
Object.keys(errorGroups).forEach(code => {
    console.log(`   ${code}: ${errorGroups[code].length} errors`);
});

// Save full error report
const errorReport = {
    timestamp: new Date().toISOString(),
    totalErrors: errors.length,
    errorGroups: errorGroups,
    allErrors: errors
};

fs.writeFileSync('typescript-error-report.json', JSON.stringify(errorReport, null, 2));
console.log('📄 Full error report saved to typescript-error-report.json');

// Apply fixes
console.log('🔧 Applying automated fixes...');
const fixes = fixCommonErrors(errors);

console.log(`✅ Applied ${fixes.length} fixes`);
fixes.forEach(fix => console.log(`   ${fix}`));

// Re-run TypeScript to check remaining errors
console.log('🔍 Checking remaining errors...');
const remainingErrorOutput = captureAllErrors();
const remainingErrors = parseErrors(remainingErrorOutput);

console.log(`📊 Remaining errors: ${remainingErrors.length} (reduced from ${errors.length})`);
console.log(`🎯 Error reduction: ${((errors.length - remainingErrors.length) / errors.length * 100).toFixed(1)}%`);

// Save summary
const summary = {
    originalErrors: errors.length,
    remainingErrors: remainingErrors.length,
    fixesApplied: fixes.length,
    reductionPercentage: ((errors.length - remainingErrors.length) / errors.length * 100).toFixed(1)
};

fs.writeFileSync('error-fix-summary.json', JSON.stringify(summary, null, 2));

console.log('\\n🎯 Error Fix Summary:');
console.log(`   Original errors: ${summary.originalErrors}`);
console.log(`   Remaining errors: ${summary.remainingErrors}`);
console.log(`   Fixes applied: ${summary.fixesApplied}`);
console.log(`   Error reduction: ${summary.reductionPercentage}%`);

if (remainingErrors.length > 0) {
    console.log('\\n🔍 Top remaining error types:');
    const remainingGroups = groupErrorsByType(remainingErrors);
    Object.keys(remainingGroups)
        .sort((a, b) => remainingGroups[b].length - remainingGroups[a].length)
        .slice(0, 10)
        .forEach(code => {
            console.log(`   ${code}: ${remainingGroups[code].length} errors`);
        });
}

console.log('\\n✅ Comprehensive error capture and fix complete!');