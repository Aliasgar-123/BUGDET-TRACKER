import fs from 'node:fs';

const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');

const oldBlock = `            function initTheme() {\n                const sunBtn = document.getElementById('theme-sun');\n                const moonBtn = document.getElementById('theme-moon');\n                if (state.theme === 'dark') {\n                    document.documentElement.className = 'dark';\n                    sunBtn.classList.remove('hidden');\n                    moonBtn.classList.add('hidden');\n                } else {\n                    document.documentElement.className = 'light';\n                    moonBtn.classList.remove('hidden');\n                    sunBtn.classList.add('hidden');\n                }\n            }`;

const newBlock = `            function initTheme() {\n                const sunBtn = document.getElementById('theme-sun');\n                const moonBtn = document.getElementById('theme-moon');\n                const root = document.documentElement;\n                if (state.theme === 'dark') {\n                    root.className = 'dark';\n                    sunBtn?.classList.remove('hidden');\n                    moonBtn?.classList.add('hidden');\n                } else {\n                    root.className = 'light';\n                    moonBtn?.classList.remove('hidden');\n                    sunBtn?.classList.add('hidden');\n                }\n            }`;

if (!html.includes(oldBlock)) {
  throw new Error('CoinFlow initTheme block was not found; refusing to modify the application.');
}

html = html.replace(oldBlock, newBlock);
fs.writeFileSync(file, html);
console.log('CoinFlow navigation startup patch applied.');
