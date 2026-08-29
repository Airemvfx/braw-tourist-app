// The render layer. The escaping is easy to eyeball; the part worth a
// test is list(), because its whole reason to exist is invisible when
// it works — an <img> that was not rebuilt looks exactly like one that
// was, until you watch a photo grid flicker on every check-in.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

let fails = 0;
const ok = (cond, msg) => { console.log(`  ${cond ? '✓' : '✗'} ${msg}`); if (!cond) fails++; };

(async () => {
  const b = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const p = await (await b.newContext()).newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  await p.goto('http://localhost:8099/');

  const r = await p.evaluate(async () => {
    const { html, raw, render, list, action, mountActions } = await import('/js/dom.js');
    const out = {};
    const host = document.createElement('div');
    document.body.appendChild(host);

    // ---- escaping ----
    out.attr = html`<p title="${'a"b'}"></p>`.s;
    out.text = html`${'<img src=x onerror=alert(1)>'}`.s;
    out.quote = html`${"it's"}`.s;
    out.rawKept = html`${raw('<b>b</b>')}`.s;
    out.arrayJoined = html`${[1, 2].map(n => html`<i>${n}</i>`)}`.s;
    out.nullish = html`${null}${undefined}${false}`.s;
    try { render(host, 'nope'); out.refusedString = false; } catch { out.refusedString = true; }

    // ---- list(): identity across renders ----
    const draw = items => list(host, items, i => i.id, i => html`<article class="row">${i.label}</article>`);

    draw([{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }]);
    const first = [...host.children];
    out.count = first.length;
    out.isArticle = first[0].tagName === 'ARTICLE';
    out.hasClass = first[0].className === 'row';
    first.forEach((el, i) => { el._mark = i; });

    // same data again — nothing should be rebuilt
    draw([{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }]);
    out.allReused = [...host.children].every((el, i) => el._mark === i);

    // change one label — only that one is rebuilt
    draw([{ id: 'a', label: 'A' }, { id: 'b', label: 'CHANGED' }, { id: 'c', label: 'C' }]);
    const after = [...host.children];
    out.changedRebuilt = after[1]._mark === undefined;
    out.neighboursKept = after[0]._mark === 0 && after[2]._mark === 2;
    out.changedText = after[1].textContent;

    // reorder — the same elements move, none are recreated
    after.forEach((el, i) => { el._mark2 = i; });
    draw([{ id: 'c', label: 'C' }, { id: 'a', label: 'A' }, { id: 'b', label: 'CHANGED' }]);
    out.reordered = [...host.children].map(el => el.dataset.key).join(',');
    out.reorderReused = [...host.children].map(el => el._mark2).join(',') === '2,0,1';

    // removal
    draw([{ id: 'a', label: 'A' }]);
    out.afterRemove = [...host.children].map(el => el.dataset.key).join(',');

    // the big markup string must not be written into the document
    out.noHtmlAttr = !host.innerHTML.includes('brawhtml') && !host.innerHTML.includes('data-html');

    // a renderer returning two roots is a bug worth catching loudly
    try {
      list(host, [{ id: 'x' }], i => i.id, () => html`<i></i><i></i>`);
      out.refusedTwoRoots = false;
    } catch { out.refusedTwoRoots = true; }

    // ---- action(): one delegated table ----
    host.innerHTML = '';
    mountActions(document);
    const log = [];
    action('outer', arg => log.push('outer:' + arg));
    action('inner', arg => log.push('inner:' + arg));
    render(host, html`
      <div data-act="outer" data-arg="card">
        <span id="plain">text</span>
        <button data-act="inner" data-arg="btn">go</button>
      </div>`);
    host.querySelector('#plain').click();
    host.querySelector('button').click();
    out.delegated = log.join('|');

    host.remove();
    return out;
  });

  console.log('\n-- escaping --');
  ok(r.attr === '<p title="a&quot;b"></p>', `a quote cannot escape an attribute (${r.attr})`);
  ok(!r.text.includes('<img'), 'a tag in text is neutralised');
  ok(r.quote === 'it&#39;s', "an apostrophe is escaped too");
  ok(r.rawKept === '<b>b</b>', 'raw() passes through untouched');
  ok(r.arrayJoined === '<i>1</i><i>2</i>', 'an array joins with no separator');
  ok(r.nullish === '', 'null, undefined and false render as nothing');
  ok(r.refusedString === true, 'render() refuses a plain string');

  console.log('\n-- list() --');
  ok(r.count === 3, `renders each item once (${r.count})`);
  ok(r.isArticle && r.hasClass, 'the template root is the element, not a wrapper');
  ok(r.allReused === true, 'an unchanged render rebuilds nothing');
  ok(r.changedRebuilt === true, 'the one changed item is rebuilt');
  ok(r.neighboursKept === true, 'and its neighbours are left alone');
  ok(r.changedText === 'CHANGED', 'the change is actually applied');
  ok(r.reordered === 'c,a,b', `reordering moves elements (${r.reordered})`);
  ok(r.reorderReused === true, 'and reuses them rather than rebuilding');
  ok(r.afterRemove === 'a', `dropped items are removed (${r.afterRemove})`);
  ok(r.noHtmlAttr === true, 'the cached markup is not written into the DOM');
  ok(r.refusedTwoRoots === true, 'a two-root template is rejected');

  console.log('\n-- action() --');
  ok(r.delegated === 'outer:card|inner:btn',
    `the innermost handler wins, with no stopPropagation (${r.delegated})`);

  console.log('\n-- page --');
  ok(errors.length === 0, `no page errors (${errors.length ? errors[0] : 'none'})`);

  await b.close();
  console.log(fails ? `\ndom: ${fails} FAILED` : '\ndom: all good');
  process.exit(fails ? 1 : 0);
})();
