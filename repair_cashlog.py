from pathlib import Path

index = Path('index.html')
snippet = Path('repair_cashlog_snippet.html').read_text(encoding='utf-8')
text = index.read_text(encoding='utf-8')

if 'id="transaction-modal"' not in text:
    text = text.replace('</body>', snippet + '\n</body>', 1)

if 'id="lending-view-toggle"' not in text:
    toggle = '''\n                    <div id="lending-view-toggle" class="flex flex-wrap gap-2 mb-5">\n                        <button type="button" id="lending-view-lent" class="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-sm border border-amber-400">Lending</button>\n                        <button type="button" id="lending-view-borrowed" class="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 font-extrabold text-sm border border-slate-700">Borrowing</button>\n                    </div>\n'''
    route_start = text.find('<div id="route-lending-hub"')
    anchor = '<div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">'
    pos = text.find(anchor, route_start)
    if route_start < 0 or pos < 0:
        raise SystemExit('Lending Hub summary anchor not found')
    text = text[:pos] + toggle + text[pos:]

if 'COINFLOW_CASHLOG_LENDING_HELPER_V1' not in text:
    helper = r'''
<script>
/* COINFLOW_CASHLOG_LENDING_HELPER_V1 */
(function () {
  function setLendingView(view) {
    const lent = document.getElementById('lent-list-container');
    const borrowed = document.getElementById('borrowed-list-container');
    const lentCard = lent && lent.closest('.interactive-card');
    const borrowedCard = borrowed && borrowed.closest('.interactive-card');
    const lentBtn = document.getElementById('lending-view-lent');
    const borrowedBtn = document.getElementById('lending-view-borrowed');
    if (view === 'lent') {
      if (lentCard) lentCard.classList.remove('hidden');
      if (borrowedCard) borrowedCard.classList.add('hidden');
    } else {
      if (lentCard) lentCard.classList.add('hidden');
      if (borrowedCard) borrowedCard.classList.remove('hidden');
    }
    if (lentBtn) lentBtn.className = view === 'lent'
      ? 'px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-sm border border-amber-400'
      : 'px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 font-extrabold text-sm border border-slate-700';
    if (borrowedBtn) borrowedBtn.className = view === 'borrowed'
      ? 'px-4 py-2.5 rounded-xl bg-rose-500 text-white font-extrabold text-sm border border-rose-400'
      : 'px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 font-extrabold text-sm border border-slate-700';
  }
  function boot() {
    const dashboardAdd = document.getElementById('dashboard-add-btn');
    const quickAdd = document.getElementById('quick-add-btn');
    if (dashboardAdd && quickAdd) dashboardAdd.addEventListener('click', () => quickAdd.click());
    const lentBtn = document.getElementById('lending-view-lent');
    const borrowedBtn = document.getElementById('lending-view-borrowed');
    if (lentBtn) lentBtn.addEventListener('click', () => setLendingView('lent'));
    if (borrowedBtn) borrowedBtn.addEventListener('click', () => setLendingView('borrowed'));
    setLendingView('lent');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
</script>
'''
    text = text.replace('</body>', helper + '\n</body>', 1)

index.write_text(text, encoding='utf-8')
Path('repair_cashlog_snippet.html').unlink(missing_ok=True)
Path('repair_cashlog.py').unlink(missing_ok=True)
