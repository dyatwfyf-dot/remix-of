// tools/auto-wrap-bookmarklet.js
// Safe DOM-only script: does NOT modify application source files.
// Usage: paste into the browser console on the page that shows the tables
// (or create a bookmarklet from the minified version in the docs file).

(function(){
  function injectStyles() {
    if (document.getElementById('auto-wrap-styles')) return;
    const css = `
      .col-text { white-space: normal !important; word-break: break-word !important; }
      .col-no-wrap { white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }
    `;
    const style = document.createElement('style');
    style.id = 'auto-wrap-styles';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  function isLikelyDate(str) {
    if (!str) return false;
    const trimmed = str.trim();
    if (!trimmed) return false;
    // Try Date.parse as a heuristic (accepts many formats)
    const parsed = Date.parse(trimmed);
    if (!isNaN(parsed)) return true;
    // Common date separators with numbers: dd/mm/yyyy or yyyy-mm-dd
    if (/^\d{1,4}[\.\-\/]\d{1,2}[\.\-\/]\d{1,4}$/.test(trimmed)) return true;
    return false;
  }

  function isLikelyNumber(str) {
    if (str === null || str === undefined) return false;
    const trimmed = String(str).trim();
    if (!trimmed) return false;
    // Remove common thousands separators and currency symbols then test
    const cleaned = trimmed.replace(/[,\s\u00A0]+/g, '')
                           .replace(/^[^\d\-+('.')]+|[^\d\.\-+eE]+$/g, '');
    return cleaned !== '' && !isNaN(Number(cleaned));
  }

  function applyWrapByColumnOnTable(table) {
    if (!table || !(table instanceof HTMLTableElement)) return;
    const tbody = table.tBodies[0] || table;
    const rows = Array.from(tbody.querySelectorAll('tr')).filter(r => r.children.length);
    if (!rows.length) return;
    const colCount = Array.from(rows[0].children).length;

    for (let c = 0; c < colCount; c++) {
      let textCount = 0, totalCount = 0, nonEmptyCount = 0;
      for (const row of rows) {
        const cell = row.children[c];
        if (!cell) continue;
        const txt = (cell.textContent || '').trim();
        if (txt === '') continue;
        nonEmptyCount++;
        if (isLikelyNumber(txt) || isLikelyDate(txt)) {
          // treat as non-text for our purposes
        } else {
          textCount++;
        }
        totalCount++;
      }

      // Decision rule: if >= 80% of non-empty cells look like text, treat column as text-only
      const isTextOnly = nonEmptyCount > 0 && (textCount / nonEmptyCount) >= 0.8;

      // Apply classes to header and body cells
      const selector = `thead th:nth-child(${c+1}), tbody td:nth-child(${c+1}), tr td:nth-child(${c+1}), tr th:nth-child(${c+1})`;
      const elems = table.querySelectorAll(selector);
      elems.forEach(el => {
        if (isTextOnly) {
          el.classList.add('col-text');
          el.classList.remove('col-no-wrap');
        } else {
          el.classList.add('col-no-wrap');
          el.classList.remove('col-text');
        }
      });
    }
  }

  function findTargetTables() {
    // Prefer tables inside sections/tabs with Arabic names mentioned by the user
    const tabNames = ['الحوافظ','الحساب الجاري','القيود اليوميه','القيود اليومية'];
    const candidates = new Set();

    // 1) Find elements with exact text matching tab names (common for tab headers)
    tabNames.forEach(name => {
      const xpath = `//*[normalize-space(text())='${name}']`;
      try {
        const iterator = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
        let node = iterator.iterateNext();
        while (node) {
          // search for a table sibling/descendant
          const tbl = node.closest('section, div, main')?.querySelector('table');
          if (tbl) candidates.add(tbl);
          node = iterator.iterateNext();
        }
      } catch (e) {
        // ignore xpath errors
      }
    });

    // 2) Find all visible tables on the page as fallback
    const allTables = Array.from(document.querySelectorAll('table'));
    allTables.forEach(t => {
      // only visible and non-empty
      const rect = t.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && t.querySelectorAll('tr').length > 0) candidates.add(t);
    });

    return Array.from(candidates);
  }

  function run() {
    injectStyles();
    const tables = findTargetTables();
    if (!tables.length) {
      console.warn('auto-wrap: no target tables found on this page');
      return;
    }
    tables.forEach(t => applyWrapByColumnOnTable(t));
    console.info(`auto-wrap: processed ${tables.length} table(s)`);
  }

  // Run now
  run();

  // Optional: observe DOM mutations to re-run when tables change (e.g., tabs switched)
  const observer = new MutationObserver(() => {
    try { run(); } catch (e) {}
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true });

  // Expose for manual re-run
  window.autoWrapColumns = run;
})();
