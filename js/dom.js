// ============================================================
// BRAW — the smallest render layer that can carry photographs.
//
// Every view in this app is built the same way: set innerHTML from a
// template string, then query the result and attach listeners to it.
// That is a perfectly reasonable way to render a page of text, and it
// runs into three walls the moment the page is mostly pictures.
//
//   1. Escaping is a thing you remember to do. esc() is called by hand
//      at roughly 150 sites, and forgetting once is a hole. It should
//      not be possible to forget.
//
//   2. Replacing innerHTML destroys every <img> underneath it. The trip
//      sheet re-renders on every check-in; a photo timeline would
//      re-decode every photograph and flash, and the card-entrance
//      animation would replay each time.
//
//   3. Listeners are re-attached per render, per element. Fine for a
//      dozen rows. Not fine for a feed.
//
// Three exports answer those in order: html`` escapes structurally,
// list() reuses elements across renders, and action() replaces
// per-element listeners with one delegated table.
//
// Deliberately NOT a framework: no diffing of attributes, no reactive
// state, no lifecycle. Those would be a rewrite. This is a migration —
// every existing `...HTML()` helper in app.js becomes correct by
// changing one backtick to html`, and keeps composing exactly as it did.
// ============================================================

/**
 * A string that is already HTML and must not be escaped again.
 *
 * This is the whole safety model: interpolate anything you like into
 * html``, and it is escaped unless it is one of these — and the only
 * way to get one is to have come from html`` yourself, or to have said
 * raw() out loud.
 */
class Raw {
  constructor(s) { this.s = s; }
  toString() { return this.s; }
}

/** Escape hatch. Rare and deliberate: say why at every call site. */
export const raw = s => new Raw(String(s));

export const isRaw = v => v instanceof Raw;

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escape = s => String(s).replace(/[&<>"']/g, c => ESCAPES[c]);

/**
 * One interpolated value.
 *
 * null, undefined and false render as nothing, so `${cond && html`…`}`
 * works the way it reads. Arrays flatten, so `${items.map(…)}` needs no
 * .join('') — the missing join being a classic way to get a stray comma
 * into the middle of a page.
 */
function part(v) {
  if (v == null || v === false || v === true) return '';
  if (v instanceof Raw) return v.s;
  if (Array.isArray(v)) return v.map(part).join('');
  return escape(v);
}

/** Tagged template that escapes every interpolation. */
export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) out += part(values[i]) + strings[i + 1];
  return new Raw(out);
}

/**
 * Put a template into an element.
 *
 * Refuses a plain string on purpose. That refusal is what makes the
 * escaping structural rather than a convention: there is no sanctioned
 * path from an unescaped string to the DOM.
 */
export function render(host, value) {
  if (!(value instanceof Raw)) {
    throw new TypeError('render() takes an html`` template, not a string');
  }
  host.innerHTML = value.s;
  return host;
}

/** Build one root element from markup, tagged with its key. */
function build(markup, key) {
  const t = document.createElement('template');
  t.innerHTML = markup.trim();
  const el = t.content.firstElementChild;
  if (!el) throw new Error('list(): the renderer produced no element');
  if (t.content.children.length > 1) {
    throw new Error('list(): the renderer must produce exactly one root element');
  }
  el.dataset.key = key;
  // The markup is held as a property, not an attribute: it is compared
  // on every render and can be a few kilobytes, which is not something
  // to write into the document and ship to the accessibility tree.
  el._brawHTML = markup;
  return el;
}

/**
 * Render a list, keeping the elements that have not changed.
 *
 * The comparison is the rendered markup itself, which is the cheapest
 * honest dirty-check there is: same data in, same string out, no DOM
 * write. An unchanged card keeps its <img> — no re-decode, no flash —
 * and keeps its entrance animation from replaying, which is what makes
 * a photo grid bearable when the view behind it re-renders often.
 *
 * `keyOf` must return something stable and unique. Index is not stable:
 * delete the first trip and every card after it would be rebuilt.
 */
export function list(host, items, keyOf, renderOne) {
  const existing = new Map();
  for (const el of [...host.children]) {
    if (el.dataset.key != null) existing.set(el.dataset.key, el);
  }

  let prev = null;
  for (const item of items) {
    const key = String(keyOf(item));
    const tpl = renderOne(item);
    if (!(tpl instanceof Raw)) {
      throw new TypeError('list(): the renderer must return an html`` template');
    }
    let el = existing.get(key);
    if (el) {
      existing.delete(key);
      if (el._brawHTML !== tpl.s) {
        const fresh = build(tpl.s, key);
        el.replaceWith(fresh);
        el = fresh;
      }
    } else {
      el = build(tpl.s, key);
    }
    const wanted = prev ? prev.nextSibling : host.firstChild;
    if (el !== wanted) host.insertBefore(el, wanted);
    prev = el;
  }

  for (const dead of existing.values()) dead.remove();
  return host;
}

// ------------------------------------------------------- interaction

const ACTIONS = new Map();

/**
 * Register a click handler by name; `data-act="name"` invokes it.
 *
 * One listener for the whole document, so a re-render wires nothing and
 * a thousand rows cost what one row costs. `data-arg` carries the id,
 * which is exactly the data-open / data-del / data-visit idiom the app
 * already uses — this only moves where the listener lives.
 *
 * The useful side effect: closest() finds the INNERMOST [data-act], so
 * a button inside a clickable card no longer needs the card's handler
 * to check whether the click was really meant for the button. That
 * guard was hand-written and easy to get wrong.
 */
export function action(name, fn) {
  ACTIONS.set(name, fn);
  return fn;
}

export const clearActions = () => ACTIONS.clear();

function dispatch(e) {
  const el = e.target.closest?.('[data-act]');
  if (!el) return;
  const fn = ACTIONS.get(el.dataset.act);
  if (!fn) return;
  fn(el.dataset.arg, el, e);
}

/**
 * Start listening. Called once at boot.
 *
 * Anything inside a delegated view that calls stopPropagation() will
 * stop this from ever running, so ported views must not — the nesting
 * rule above removes the reason they used to.
 */
export function mountActions(root = document) {
  if (root._brawActions) return;
  root._brawActions = true;
  root.addEventListener('click', dispatch);
  // A non-button carrying data-act still has to work from the keyboard.
  root.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const el = e.target.closest?.('[data-act]');
    if (!el || el.tagName === 'BUTTON' || el.tagName === 'A' || el.tagName === 'INPUT') return;
    e.preventDefault();
    el.click();
  });
}
