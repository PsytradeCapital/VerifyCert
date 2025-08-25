const fs = require('fs');
const path = require('path');

// Comprehensive syntax fixes for TypeScript/React files
const fixes = [
  // Fis
  {
    pattern: /export inte$/gm,
n$2\n}'
  },
  
  // Fix malformed template literals
  {
    pattern: /className=
    replacement: 'className
  },
  
  // Fiaces
  {
    pattern: /(\w+\??: [^;,\n}]+)(?=\s*
    replacement: '$1;'
  },
  
  // Fix missing closingJSX
  {
    pat*$/gm,
    replacement: '$'
  },
 
  // Fix malformed object destructuring
  {
    pattern: /\{\s*([^}]*),\s*\}/g,
    replacement: '{ $1 }'
  },
  
  // Fix missing return statements
  {
    pattern: /const (\w+): React\.FC<,
    replacement: (match, name, body) => {
      if (!body.includes('return')) {
        return `const ${;`;
      }
     
 }
  }
];

function fixFile(filePath) {
  try {
    l');
false;
    
    // Apply each fix
    fixes.forEach(fix => {
    
      if (newContent !== content) 
        content = newContent;
        modified = true;
      }
    });
    
    // Additional specific fixes
    
    /erfaces
{
      if (!match.endsWith('}')) {
        return match + '\n}';
      }
    match;
    });
    
    // Fix malformed template literals in className
    content = content.
    
ng tags
    content = conte</$1>');
    
    // Fix incomplete function components
    content = cont> {
     
    
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log);
    true;
 }
 
    return false;
  } catch (error) {
    console.error(`Error fixing ${fi
  
  }
}

func{
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdi;
    
   ) {
   item);
      const sta;
 

        traverse(llPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.)) {
;
      }
    }
  }
  
(dir);
  return files;
}

// Main execution
con');
cir);

console.log(`Found ${files.length} TypeScript files to check.

 0;
files.forEach(file => {
  if (fixFile(file)) {
    f
  }
});

console.log(`Fixed ${fixedCount} files with syntax errors.`);
/);!'pletedcoms x fixentaensive sylog('Comprehnsole.}
});

coe);
  or.messag erre}:`,s to ${filific fixeecapplying spor(`Error onsole.err {
    catch (error));
  } cto: ${file}`s ic fixespecif`Applied ole.log(ns
    coent);e, contync(fil.writeFileS   fs });
    lace);
rch, repplace(seatent.re= conent      cont
 }) => {h, replace { searcforEach((ixes.
    fe, 'utf8');leSync(filFi.read= fs content  let
    try {s }) => {
 { file, fixech((ixes.forEaecificF;

sp
  }
] ]}
       y
};`
  verOnl
  Holy,OnouchopOnly,
  TDeskttOnly,
    TablebileOnly,
ult {
  Moport defa

ex/div>
);}
  <hildren)}>
    {c className-only',('hovere={cnsNam  <div clas }) => (
assNamehildren, cl{ cs> = (ropeUtilityPResponsivt.FC<eacy: RerOnl const Hove: `export replacm,
       *$/gOnly[^;]t Hoverconst arch: /expor  se    
    { [
    ixes:  f
  tility.tsx',/ResponsiveUts/ui/Layout/componenontend/src file: 'fr[
  {
   Fixes = ficspecinst co fixes
filepecific al sddition A
/