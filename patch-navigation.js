import fs from 'node:fs';

const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');

// Vercel runs this script as the project's build command. It must be safe to run
// repeatedly because the frontend may already contain the startup fix.
const legacyBlock = `sunBtn.classList.remove('hidden');`;
const legacyMoonHide = `moonBtn.classList.add('hidden');`;
const legacyMoonShow = `moonBtn.classList.remove('hidden');`;
const legacySunHide = `sunBtn.classList.add('hidden');`;

html = html.replaceAll(legacyBlock, `if (sunBtn) sunBtn.classList.remove('hidden');`);
html = html.replaceAll(legacyMoonHide, `if (moonBtn) moonBtn.classList.add('hidden');`);
html = html.replaceAll(legacyMoonShow, `if (moonBtn) moonBtn.classList.remove('hidden');`);
html = html.replaceAll(legacySunHide, `if (sunBtn) sunBtn.classList.add('hidden');`);

// Collapse accidental duplicate auth/settings wrapper IDs without touching
// authentication or Supabase data logic.
html = html.replace(
  `        <div id="auth-view" class="max-w-md mx-auto px-4 py-16">\n\n        <div id="auth-view"`,
  `        <div id="auth-view"`,
);
html = html.replace(
  `        <div id="settings-page-workspace" class="hidden"><!-- NEWLY CONSTRUCTED DEDICATED SETTINGS PAGE VIEW CONTAINER -->\n        <div id="settings-page-workspace" class="space-y-6 hidden">`,
  `        <div id="settings-page-workspace" class="space-y-6 hidden">`,
);

// The script intentionally does not fail when the target is already patched.
fs.writeFileSync(file, html);
console.log('CoinFlow frontend build patch completed safely.');
