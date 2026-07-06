const fs = require('fs');
const path = 'c:/Users/WOOLF/Desktop/web_newspaper/app.js';
let c = fs.readFileSync(path, 'utf8');

// Count before
const lockBefore = (c.match(/document\.body\.style\.overflow\s*=\s*["']hidden["']/g) || []).length;
const unlockBefore = (c.match(/document\.body\.style\.overflow\s*=\s*["']["']/g) || []).length;
console.log('Before - lock:', lockBefore, 'unlock:', unlockBefore);

// Replace lock calls (overflow = hidden)
c = c.replace(/document\.body\.style\.overflow\s*=\s*["']hidden["']\s*;/g, 'lockBodyScroll();');

// Replace unlock calls (overflow = "")
c = c.replace(/document\.body\.style\.overflow\s*=\s*["']["']\s*;/g, 'unlockBodyScroll();');

// Also handle the comment-annotated ones
c = c.replace(/lockBodyScroll\(\);\s*\/\/\s*lock page scroll/g, 'lockBodyScroll(); // lock page scroll');
c = c.replace(/unlockBodyScroll\(\);\s*\/\/\s*restore page scroll/g, 'unlockBodyScroll(); // restore page scroll');

fs.writeFileSync(path, c, 'utf8');

// Count after
const lockAfter = (c.match(/lockBodyScroll/g) || []).length;
const unlockAfter = (c.match(/unlockBodyScroll/g) || []).length;
console.log('After - lockBodyScroll calls:', lockAfter, 'unlockBodyScroll calls:', unlockAfter);
