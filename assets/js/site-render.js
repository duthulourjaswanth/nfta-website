/**
 * site-render.js
 *
 * Renders the public site declaratively from the content document via
 * data-cms attributes. Runs in two phases:
 *   1. Synchronous render straight from DEFAULT_CONTENT (content-schema.js,
 *      no network) so the page paints correctly before Firebase is even
 *      configured — main.js's on-load boot (counters, marquee width, etc.)
 *      always sees final content.
 *   2. Lazy-loads firebase-init.js, fetches the real content (or the same
 *      defaults if unconfigured/offline), re-renders, and subscribes to
 *      live updates so an open tab reflects a publish within a second.
 *
 * Attribute vocabulary (combine with "|" on one element):
 *   data-cms="text:path"   textContent
 *   data-cms="html:path"   innerHTML (only for the few fields that carry
 *                          inline <b>/<em> emphasis, e.g. founder bios)
 *   data-cms="lines:path"  textContent with \n -> <br>
 *   data-cms="paras:path"  blank-line-separated -> <p> blocks
 *   data-cms="src:path"    <img>/<source> src
 *   data-cms="href:path"   <a> href
 *   data-cms="alt:path"    alt text
 *   data-cms="tel:path"    <a> href="tel:<digits>"
 *   data-cms="mailto:path" <a> href="mailto:<email>"
 *   data-cms="class:path:className" toggles className on/off the element
 *                          based on whether the field is truthy
 *   data-cms-show="path"   hides the element when the field is false/empty
 *   data-cms-hide="path"   inverse of data-cms-show: hides when truthy
 *   data-cms-list="path"   repeating group; its one child marked
 *                          data-cms-item is the template, cloned per item
 *                          with that item as the new (relative) content root.
 *                          Each item's 0-based position is available as
 *                          "__index" (e.g. data-cms="step:__index" renders
 *                          "/01", "/02", ...; data-cms="num:__index" renders
 *                          "01", "02", ... — used by numbered lists).
 */

import { DEFAULT_CONTENT } from '../../content-schema.js';

function getPath(obj, path) {
  if (!path) return undefined;
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function applyField(el, ctx) {
  const spec = el.getAttribute('data-cms');
  if (!spec) return;
  spec.split('|').forEach((part) => {
    const sep = part.indexOf(':');
    if (sep === -1) return;
    const mode = part.slice(0, sep).trim();
    const rest = part.slice(sep + 1).trim();

    if (mode === 'class') {
      const [fieldPath, className] = rest.split(':');
      el.classList.toggle(className, Boolean(getPath(ctx, fieldPath)));
      return;
    }

    const path = rest;
    const val = getPath(ctx, path);
    if (val === undefined || val === null) return;
    switch (mode) {
      case 'text':
        el.textContent = val;
        break;
      case 'html':
        el.innerHTML = val;
        break;
      case 'lines':
        el.innerHTML = escapeHtml(val).replace(/\n/g, '<br>');
        break;
      case 'paras':
        el.innerHTML = String(val)
          .split(/\n\s*\n/)
          .filter((p) => p.trim())
          .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
          .join('');
        break;
      case 'src':
        el.setAttribute('src', val);
        break;
      case 'href':
        el.setAttribute('href', val);
        break;
      case 'alt':
        el.setAttribute('alt', val);
        break;
      case 'tel':
        el.setAttribute('href', 'tel:' + val);
        break;
      case 'mailto':
        el.setAttribute('href', 'mailto:' + val);
        break;
      case 'content':
        el.setAttribute('content', val);
        break;
      case 'step':
        el.textContent = '/' + String(Number(val) + 1).padStart(2, '0');
        break;
      case 'num':
        el.textContent = String(Number(val) + 1).padStart(2, '0');
        break;
      default:
        // "attr-<name>:path" sets an arbitrary attribute (e.g. attr-data-cat:slug)
        if (mode.startsWith('attr-')) el.setAttribute(mode.slice(5), val);
        break;
    }
  });
}

function bind(root, ctx) {
  if (!root || ctx == null) return;

  // Repeating lists first — everything inside a cloned item is bound
  // recursively against that item as the new content root.
  const lists = Array.from(root.querySelectorAll('[data-cms-list]')).filter((el) => {
    let p = el.parentElement;
    while (p) {
      if (p === root) return true;
      if (p.hasAttribute('data-cms-list')) return false;
      p = p.parentElement;
    }
    return true;
  });

  lists.forEach((container) => {
    const path = container.getAttribute('data-cms-list');
    const items = getPath(ctx, path);
    if (!Array.isArray(items)) return;

    if (!container._cmsTemplate) {
      const template = container.querySelector(':scope > [data-cms-item]');
      if (!template) return;
      template.remove();
      container._cmsTemplate = template;
    }
    const template = container._cmsTemplate;

    container.innerHTML = '';
    items.forEach((item, i) => {
      const clone = template.cloneNode(true);
      const itemCtx = item && typeof item === 'object' && !Array.isArray(item) ? { ...item, __index: i } : item;
      bind(clone, itemCtx);
      container.appendChild(clone);
    });
  });

  // Elements inside a nested list we just expanded were already bound
  // recursively against their own item as context — skip them here so we
  // don't re-visit them against THIS (wrong, outer) context.
  const ownedByNestedList = (el) => lists.some((container) => container !== el && container.contains(el));

  // Show/hide toggles. Works for real "show" booleans (hide on false) and
  // for optional string fields like a card's tag (hide on empty/missing).
  const isHidden = (val) => val === false || val === '' || val === undefined || val === null;
  root.querySelectorAll('[data-cms-show]').forEach((el) => {
    if (ownedByNestedList(el)) return;
    el.hidden = isHidden(getPath(ctx, el.getAttribute('data-cms-show')));
  });
  if (root.hasAttribute && root.hasAttribute('data-cms-show')) {
    root.hidden = isHidden(getPath(ctx, root.getAttribute('data-cms-show')));
  }
  root.querySelectorAll('[data-cms-hide]').forEach((el) => {
    if (ownedByNestedList(el)) return;
    el.hidden = !isHidden(getPath(ctx, el.getAttribute('data-cms-hide')));
  });
  if (root.hasAttribute && root.hasAttribute('data-cms-hide')) {
    root.hidden = !isHidden(getPath(ctx, root.getAttribute('data-cms-hide')));
  }

  // Field bindings.
  root.querySelectorAll('[data-cms]').forEach((el) => {
    if (ownedByNestedList(el)) return;
    applyField(el, ctx);
  });
  if (root.hasAttribute && root.hasAttribute('data-cms')) applyField(root, ctx);
}

function duplicateMarquee() {
  // The CSS loop needs two identical, back-to-back groups. The first is the
  // live (data-cms-bound) one; clone it into the aria-hidden duplicate.
  const groups = document.querySelectorAll('.marquee__track > .marquee__group');
  if (groups.length < 2) return;
  const [live, dupe] = groups;
  dupe.innerHTML = live.innerHTML;
}

function waLink(whatsappDigits, text) {
  const digits = String(whatsappDigits || '').replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

function wireContactForm(content) {
  const form = document.querySelector('.contact__form');
  if (!form) return;
  const note = form.querySelector('.form-note');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalLabel = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
    }
    try {
      const { submitEnquiry } = await import('../../firebase-init.js');
      await submitEnquiry({
        name: data.name,
        phone: data.phone,
        email: data.email,
        course: data.course,
        message: data.message
      });
      if (note) note.hidden = false;
      form.reset();
    } catch (err) {
      console.warn('[NFTA] contact form submission failed, falling back to WhatsApp:', err);
      const text = `Hi NFTA, I'd like to enquire.\nName: ${data.name || ''}\nPhone: ${data.phone || ''}\nEmail: ${data.email || ''}\nCourse: ${data.course || ''}\nMessage: ${data.message || ''}`;
      window.open(waLink(content.site.contact.whatsapp, text), '_blank', 'noopener');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    }
  });
}

// ---------- Phase 1: instant, defaults-only render ----------
bind(document.body, DEFAULT_CONTENT);
duplicateMarquee();
wireContactForm(DEFAULT_CONTENT);

// ---------- Phase 2: real content + live updates (never blocks paint) ----------
import('../../firebase-init.js')
  .then(async ({ loadContent, subscribeContent }) => {
    const content = await loadContent();
    bind(document.body, content);
    duplicateMarquee();

    subscribeContent((updated) => {
      bind(document.body, updated);
      duplicateMarquee();
    });
  })
  .catch((err) => {
    console.warn('[NFTA CMS] Firebase integration failed to load; site stays on defaults:', err);
  });
