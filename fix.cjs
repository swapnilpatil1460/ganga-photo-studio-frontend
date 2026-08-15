const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Fix commonly mangled characters due to UTF-8 misinterpretation
    content = content.replace(/â€¢/g, '•'); // Bullet
    content = content.replace(/â€”/g, '—'); // Em dash
    content = content.replace(/â€“/g, '–'); // En dash
    content = content.replace(/â€™/g, "'"); // Apostrophe
    content = content.replace(/â€œ/g, '"'); // Left double quote
    content = content.replace(/â€\x9D/g, '"'); // Right double quote
    content = content.replace(/â€/g, '-'); // Fallback for single â€
    content = content.replace(/â‚¹/g, '₹'); // INR
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed ' + filePath);
    }
  }
});
