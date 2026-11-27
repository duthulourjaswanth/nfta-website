/**
 * admin.js
 *
 * The NFTA content admin panel. Everything here is generated from the
 * declarative PANES array below plus three custom panes (Enquiries, Media
 * Library, Backup & Tools). Adding a new editable field means editing
 * content-schema.js (DEFAULT_CONTENT) AND this file's PANES list — nothing
 * else.
 *
 * Edits live only in memory (in `draft`) until "Publish changes" writes the
 * whole document to Firestore in one atomic setDoc. `published` is a clone
 * of the last-published state, so "Undo changes" is just a restore from it.
 */

import {
  IS_CONFIGURED,
  loadContent,
  saveContent,
  watchAuthState,
  signIn,
  signOutUser,
  resetPassword,
  translateAuthError,
  uploadImage,
  listMedia,
  deleteMediaRecord,
  listEnquiries,
  setEnquiryHandled,
  deleteEnquiryRecord,
  getBackupData,
  restoreFromBackup
} from './firebase-init.js';
import { DEFAULT_CONTENT } from './content-schema.js';

// ===========================================================
// Small DOM / data helpers
// ===========================================================

function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else if (k === 'html') e.innerHTML = v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  (Array.isArray(children) ? children : [children]).forEach((c) => {
    if (c === null || c === undefined) return;
    e.append(c.nodeType ? c : document.createTextNode(String(c)));
  });
  return e;
}

function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function setPath(obj, path, value) {
  const keys = path.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (cur[k] == null || typeof cur[k] !== 'object') cur[k] = {};
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function genId() {
  return 'i' + Math.random().toString(36).slice(2, 9);
}

function formatDate(ts) {
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString();
  } catch {
    return '';
  }
}

function csvEscape(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function downloadFile(filename, text, type = 'application/json') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = el('a', { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

let toastTimer = null;
function toast(message, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = message;
  t.classList.toggle('toast--error', isError);
  t.classList.add('is-shown');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-shown'), 3200);
}

// ===========================================================
// Field-definition helpers (used to build PANES)
// ===========================================================

const T = (path, label) => ({ type: 'text', path, label });
const TA = (path, label) => ({ type: 'textarea', path, label });
const IM = (path, label) => ({ type: 'image', path, label });
const SW = (path, label) => ({ type: 'switch', path, label });
const LIST = (path, label, fields) => ({ type: 'list', path, label, fields });
// `fields` is only needed when type === 'list' (a list nested inside a list item).
const LF = (key, type, label, fields) => ({ key, type, label, fields });

// ===========================================================
// PANES — one entry per sidebar section
// ===========================================================

const PANES = [
  {
    id: 'site',
    label: 'Site-Wide',
    groups: [
      { title: 'Brand & nav', fields: [T('site.brand.name', 'Brand name'), T('site.nav.ctaLabel', 'Nav "Contact" button label')] },
      {
        title: 'Contact details (used everywhere)',
        fields: [
          T('site.contact.email', 'Email'),
          T('site.contact.phoneDisplay', 'Phone (as shown)'),
          T('site.contact.phoneHref', 'Phone (digits only, for tap-to-call)'),
          T('site.contact.whatsapp', 'WhatsApp number (country code + digits, e.g. 91XXXXXXXXXX)'),
          T('site.contact.facebook', 'Facebook URL'),
          T('site.contact.instagram', 'Instagram URL')
        ]
      },
      { title: 'Footer', fields: [T('site.footer.tagline', 'Tagline (under logo)'), T('site.footer.copyright', 'Copyright line'), T('site.footer.tagline2', 'Second footer line')] }
    ]
  },
  {
    id: 'home',
    label: 'Home Page',
    groups: [
      {
        title: 'Hero',
        toggle: SW('home.hero.show', 'Show this section'),
        fields: [
          T('home.hero.eyebrow', 'Eyebrow'),
          T('home.hero.titlePre', 'Title — part 1'),
          T('home.hero.titleAccent', 'Title — accent word'),
          T('home.hero.titlePost', 'Title — part 3'),
          TA('home.hero.sub', 'Subtext'),
          T('home.hero.ctaPrimaryLabel', 'Primary button label'),
          T('home.hero.ctaPrimaryLink', 'Primary button link'),
          T('home.hero.ctaSecondaryLabel', 'Secondary button label'),
          T('home.hero.ctaSecondaryLink', 'Secondary button link'),
          IM('home.hero.image', 'Hero image'),
          T('home.hero.badgeTitle', 'Badge title'),
          T('home.hero.badgeSub', 'Badge subtext'),
          LIST('home.hero.stats', 'Trust stats', [LF('value', 'text', 'Value'), LF('label', 'text', 'Label')])
        ]
      },
      { title: 'Scrolling marquee', toggle: SW('home.marquee.show', 'Show this section'), fields: [LIST('home.marquee.items', 'Marquee items', [LF('text', 'text', 'Text')])] },
      {
        title: '"Where Science Is Applied"',
        toggle: SW('home.science.show', 'Show this section'),
        fields: [
          T('home.science.headingPre', 'Heading — plain part'),
          T('home.science.headingAccent', 'Heading — accent word'),
          T('home.science.headingSuffix', 'Heading — plain part after accent'),
          TA('home.science.lead', 'Lead paragraph (basic <b>/<em> tags OK)'),
          IM('home.science.images.0.src', 'Collage image 1'),
          IM('home.science.images.1.src', 'Collage image 2'),
          IM('home.science.images.2.src', 'Collage image 3'),
          LIST('home.science.points', 'Points', [LF('title', 'text', 'Bold lead-in'), LF('body', 'textarea', 'Rest of the line')])
        ]
      },
      {
        title: 'Certification programs',
        toggle: SW('home.programs.show', 'Show this section'),
        fields: [
          T('home.programs.headingPre', 'Heading — plain part'),
          T('home.programs.headingAccent', 'Heading — accent word'),
          TA('home.programs.sub', 'Subtext'),
          LIST('home.programs.cards', 'Program cards', [
            LF('image', 'image', 'Image'),
            LF('title', 'text', 'Title'),
            LF('desc', 'textarea', 'Description'),
            LF('link', 'text', 'Link (leave blank for "Coming soon")'),
            LF('tag', 'text', 'Tag badge (e.g. "Launching soon")')
          ])
        ]
      },
      {
        title: 'Founder',
        toggle: SW('home.founder.show', 'Show this section'),
        fields: [
          T('home.founder.headingPre', 'Heading — plain part'),
          T('home.founder.headingAccent', 'Heading — accent word'),
          TA('home.founder.lead', 'Lead paragraph'),
          IM('home.founder.photo', 'Photo'),
          T('home.founder.name', 'Name'),
          T('home.founder.role', 'Role'),
          T('home.founder.creds', 'Credentials line'),
          TA('home.founder.bio', 'Bio (basic <b>/<em> tags OK)'),
          LIST('home.founder.points', 'Bullet points', [LF('text', 'text', 'Text')]),
          T('home.founder.ctaLabel', 'Button label'),
          T('home.founder.ctaLink', 'Button link')
        ]
      },
      {
        title: 'Pricing',
        toggle: SW('home.pricing.show', 'Show this section'),
        fields: [
          T('home.pricing.headingPre', 'Heading — plain part'),
          T('home.pricing.headingAccent', 'Heading — accent word'),
          TA('home.pricing.sub', 'Subtext'),
          LIST('home.pricing.plans', 'Plans', [
            LF('title', 'text', 'Title'),
            LF('price', 'text', 'Price (e.g. ₹30,000 or "Enquire")'),
            LF('priceNote', 'text', 'Price note'),
            LF('badge', 'text', 'Badge (e.g. "Most Popular", blank = none)'),
            LF('featured', 'switch', 'Highlight this plan'),
            LF('features', 'list', 'Feature bullets', [LF('text', 'text', 'Text')]),
            LF('ctaLabel', 'text', 'Button label'),
            LF('ctaLink', 'text', 'Button link')
          ])
        ]
      },
      { title: 'CTA banner', toggle: SW('home.ctaBanner.show', 'Show this section'), fields: [T('home.ctaBanner.text', 'Heading'), T('home.ctaBanner.ctaLabel', 'Button label'), T('home.ctaBanner.ctaLink', 'Button link')] },
      { title: 'Contact intro', toggle: SW('home.contact.show', 'Show this section'), fields: [T('home.contact.headingPre', 'Heading — plain part'), T('home.contact.headingAccent', 'Heading — accent word'), TA('home.contact.lead', 'Lead text')] }
    ]
  },
  {
    id: 'about',
    label: 'About Page',
    groups: [
      { title: 'Page hero', toggle: SW('about.hero.show', 'Show this section'), fields: [IM('about.hero.bgImage', 'Background image'), T('about.hero.eyebrow', 'Eyebrow'), T('about.hero.titlePre', 'Title — plain part'), T('about.hero.titleAccent', 'Title — accent word'), TA('about.hero.sub', 'Subtext')] },
      { title: 'Our Story', toggle: SW('about.story.show', 'Show this section'), fields: [T('about.story.headingPre', 'Heading — plain part'), T('about.story.headingAccent', 'Heading — accent word'), IM('about.story.image', 'Image'), TA('about.story.lead', 'Lead paragraph (basic <b>/<em> OK)'), TA('about.story.body', 'Second paragraph (basic <b>/<em> OK)')] },
      {
        title: 'Founder feature',
        toggle: SW('about.founderFeature.show', 'Show this section'),
        fields: [
          IM('about.founderFeature.photo', 'Photo'),
          T('about.founderFeature.badge', 'Photo badge'),
          T('about.founderFeature.eyebrow', 'Eyebrow'),
          T('about.founderFeature.name', 'Name'),
          T('about.founderFeature.role', 'Role line'),
          TA('about.founderFeature.bio1', 'Bio paragraph 1 (basic <b>/<em> OK)'),
          TA('about.founderFeature.bio2', 'Bio paragraph 2 (basic <b>/<em> OK)'),
          LIST('about.founderFeature.creds', 'Credential badges', [LF('text', 'text', 'Text')]),
          T('about.founderFeature.ctaLabel', 'Button label'),
          T('about.founderFeature.ctaLink', 'Button link')
        ]
      },
      {
        title: 'Vision & mission',
        toggle: SW('about.visionMission.show', 'Show this section'),
        fields: [
          T('about.visionMission.visionTitlePre', 'Vision title — plain part'),
          T('about.visionMission.visionTitleAccent', 'Vision title — accent word'),
          TA('about.visionMission.visionBody', 'Vision body'),
          T('about.visionMission.missionTitlePre', 'Mission title — plain part'),
          T('about.visionMission.missionTitleAccent', 'Mission title — accent word'),
          TA('about.visionMission.missionBody', 'Mission body')
        ]
      },
      { title: 'Values', toggle: SW('about.values.show', 'Show this section'), fields: [T('about.values.headingPre', 'Heading — plain part'), T('about.values.headingAccent', 'Heading — accent word'), LIST('about.values.items', 'Values', [LF('title', 'text', 'Title'), LF('body', 'textarea', 'Body')])] },
      { title: 'CTA', toggle: SW('about.cta.show', 'Show this section'), fields: [T('about.cta.heading', 'Heading'), T('about.cta.ctaLabel', 'Button label'), T('about.cta.ctaLink', 'Button link')] }
    ]
  },
  {
    id: 'courses',
    label: 'Courses (Listing)',
    groups: [
      { title: 'Page hero', toggle: SW('courses.hero.show', 'Show this section'), fields: [IM('courses.hero.bgImage', 'Background image'), T('courses.hero.eyebrow', 'Eyebrow'), T('courses.hero.titlePre', 'Title — plain part'), T('courses.hero.titleAccent', 'Title — accent word'), TA('courses.hero.sub', 'Subtext')] },
      {
        title: 'Course rows',
        toggle: SW('courses.list.show', 'Show this section'),
        fields: [
          LIST('courses.list.items', 'Rows', [
            LF('image', 'image', 'Image'),
            LF('tag', 'text', 'Tag (course length/level)'),
            LF('title', 'text', 'Title'),
            LF('desc', 'textarea', 'Description'),
            LF('learn', 'list', 'What you\'ll learn (bullets)', [LF('text', 'text', 'Text')]),
            LF('price', 'text', 'Price'),
            LF('priceNote', 'text', 'Price note'),
            LF('detailLink', 'text', 'Detail page link'),
            LF('enrollLink', 'text', 'Enroll link'),
            LF('enrollLabel', 'text', 'Enroll link label')
          ])
        ]
      },
      {
        title: 'How certification works',
        toggle: SW('courses.howItWorks.show', 'Show this section'),
        fields: [T('courses.howItWorks.headingPre', 'Heading — plain part'), T('courses.howItWorks.headingAccent', 'Heading — accent word'), LIST('courses.howItWorks.steps', 'Steps', [LF('text', 'text', 'Text')]), TA('courses.howItWorks.note', 'Note'), T('courses.howItWorks.ctaLabel', 'Button label'), T('courses.howItWorks.ctaLink', 'Button link')]
      }
    ]
  },
  ...['coursePT', 'courseWL', 'courseCP'].map((ns, i) => ({
    id: ns,
    label: ['Course: Personal Trainer', 'Course: Weight Loss', 'Course: Contest Prep'][i],
    groups: [
      {
        title: 'Page hero',
        toggle: SW(`${ns}.hero.show`, 'Show this section'),
        fields: [IM(`${ns}.hero.bgImage`, 'Background image'), T(`${ns}.hero.eyebrow`, 'Eyebrow'), T(`${ns}.hero.titlePre`, 'Title — plain part'), T(`${ns}.hero.titleAccent`, 'Title — accent word'), TA(`${ns}.hero.sub`, 'Subtext'), T(`${ns}.hero.ctaLabel`, 'Button label'), T(`${ns}.hero.ctaLink`, 'Button link')]
      },
      {
        title: 'Why train here',
        toggle: SW(`${ns}.why.show`, 'Show this section'),
        fields: [T(`${ns}.why.headingPre`, 'Heading — plain part'), T(`${ns}.why.headingAccent`, 'Heading — accent word'), TA(`${ns}.why.lead`, 'Lead paragraph'), LIST(`${ns}.why.cards`, 'Cards', [LF('title', 'text', 'Title'), LF('body', 'textarea', 'Body')])]
      },
      { title: "What you'll learn", toggle: SW(`${ns}.learn.show`, 'Show this section'), fields: [T(`${ns}.learn.headingPre`, 'Heading — plain part'), T(`${ns}.learn.headingAccent`, 'Heading — accent word'), LIST(`${ns}.learn.items`, 'Bullets', [LF('text', 'textarea', 'Text')])] },
      { title: 'Who this is for', toggle: SW(`${ns}.who.show`, 'Show this section'), fields: [T(`${ns}.who.headingPre`, 'Heading — plain part'), T(`${ns}.who.headingAccent`, 'Heading — accent word'), LIST(`${ns}.who.items`, 'Bullets', [LF('text', 'text', 'Text')])] },
      { title: 'How it works', toggle: SW(`${ns}.how.show`, 'Show this section'), fields: [T(`${ns}.how.headingPre`, 'Heading — plain part'), T(`${ns}.how.headingAccent`, 'Heading — accent word'), LIST(`${ns}.how.steps`, 'Steps', [LF('text', 'text', 'Text')])] },
      { title: 'FAQs', toggle: SW(`${ns}.faqs.show`, 'Show this section'), fields: [T(`${ns}.faqs.headingPre`, 'Heading — plain part'), T(`${ns}.faqs.headingAccent`, 'Heading — accent word'), LIST(`${ns}.faqs.items`, 'Questions', [LF('q', 'text', 'Question'), LF('a', 'textarea', 'Answer')])] },
      { title: 'CTA', toggle: SW(`${ns}.cta.show`, 'Show this section'), fields: [T(`${ns}.cta.heading`, 'Heading'), T(`${ns}.cta.ctaLabel`, 'Button label'), T(`${ns}.cta.ctaLink`, 'Button link')] }
    ]
  })),
  {
    id: 'trainers',
    label: 'Trainers Page',
    groups: [
      { title: 'Page hero', toggle: SW('trainers.hero.show', 'Show this section'), fields: [IM('trainers.hero.bgImage', 'Background image'), T('trainers.hero.eyebrow', 'Eyebrow'), T('trainers.hero.titlePre', 'Title — plain part'), T('trainers.hero.titleAccent', 'Title — accent word'), TA('trainers.hero.sub', 'Subtext')] },
      {
        title: 'Lead trainer',
        toggle: SW('trainers.lead.show', 'Show this section'),
        fields: [
          IM('trainers.lead.photo', 'Photo'),
          T('trainers.lead.name', 'Name'),
          T('trainers.lead.role', 'Role'),
          T('trainers.lead.creds', 'Credentials line'),
          T('trainers.lead.headingPre', 'Heading — plain part'),
          T('trainers.lead.headingAccent', 'Heading — accent word'),
          TA('trainers.lead.body', 'Body (basic <b>/<em> OK)'),
          LIST('trainers.lead.points', 'Points', [LF('text', 'text', 'Text')])
        ]
      },
      { title: 'Stats', toggle: SW('trainers.stats.show', 'Show this section'), fields: [LIST('trainers.stats.items', 'Stats', [LF('value', 'text', 'Value'), LF('label', 'text', 'Label')])] },
      {
        title: 'Team',
        toggle: SW('trainers.team.show', 'Show this section'),
        fields: [T('trainers.team.headingPre', 'Heading — plain part'), T('trainers.team.headingAccent', 'Heading — accent word'), LIST('trainers.team.members', 'Members', [LF('image', 'image', 'Image'), LF('title', 'text', 'Title'), LF('tag', 'text', 'Tag'), LF('body', 'textarea', 'Body')])]
      },
      { title: 'CTA', toggle: SW('trainers.cta.show', 'Show this section'), fields: [T('trainers.cta.heading', 'Heading'), T('trainers.cta.ctaLabel', 'Button label'), T('trainers.cta.ctaLink', 'Button link')] }
    ]
  },
  {
    id: 'blog',
    label: 'Blog Page',
    groups: [
      { title: 'Page hero', toggle: SW('blog.hero.show', 'Show this section'), fields: [IM('blog.hero.bgImage', 'Background image'), T('blog.hero.eyebrow', 'Eyebrow'), T('blog.hero.titlePre', 'Title — plain part'), T('blog.hero.titleAccent', 'Title — accent word'), TA('blog.hero.sub', 'Subtext')] },
      {
        title: 'Categories',
        toggle: SW('blog.categories.show', 'Show this section'),
        fields: [T('blog.categories.headingPre', 'Heading — plain part'), T('blog.categories.headingAccent', 'Heading — accent word'), LIST('blog.categories.items', 'Categories', [LF('label', 'text', 'Label'), LF('slug', 'text', 'Slug (must match posts\' category field exactly)')])]
      },
      {
        title: 'Posts',
        toggle: SW('blog.posts.show', 'Show this section'),
        fields: [
          LIST('blog.posts.items', 'Posts', [
            LF('image', 'image', 'Image'),
            LF('tag', 'text', 'Tag (category label shown on card)'),
            LF('category', 'text', 'Category slug (must match one above)'),
            LF('title', 'text', 'Title'),
            LF('excerpt', 'textarea', 'Excerpt'),
            LF('readTime', 'text', 'Read time (e.g. "6 min read")'),
            LF('link', 'text', 'Link')
          ])
        ]
      },
      { title: 'Note & CTA', fields: [T('blog.note', 'Note under the grid'), T('blog.cta.heading', 'CTA heading'), T('blog.cta.ctaLabel', 'CTA button label'), T('blog.cta.ctaLink', 'CTA button link')], toggle: SW('blog.cta.show', 'Show CTA section') }
    ]
  },
  {
    id: 'contact',
    label: 'Contact Page',
    groups: [
      { title: 'Page hero', toggle: SW('contact.hero.show', 'Show this section'), fields: [IM('contact.hero.bgImage', 'Background image'), T('contact.hero.eyebrow', 'Eyebrow'), T('contact.hero.titlePre', 'Title — plain part'), T('contact.hero.titleAccent', 'Title — accent word'), TA('contact.hero.sub', 'Subtext')] },
      { title: 'Contact methods', toggle: SW('contact.methods.show', 'Show this section'), fields: [T('contact.methods.headingPre', 'Heading — plain part'), T('contact.methods.headingAccent', 'Heading — accent word'), T('contact.methods.bookLabel', '"Book a session" label'), T('contact.methods.bookActionLabel', '"Book a session" action text')] },
      { title: 'Form course options', toggle: SW('contact.form.show', 'Show the form'), fields: [LIST('contact.form.courseOptions', 'Dropdown options', [LF('text', 'text', 'Text')])] },
      { title: 'FAQs', toggle: SW('contact.faqs.show', 'Show this section'), fields: [T('contact.faqs.headingPre', 'Heading — plain part'), T('contact.faqs.headingAccent', 'Heading — accent word'), LIST('contact.faqs.items', 'Questions', [LF('q', 'text', 'Question'), LF('a', 'textarea', 'Answer')])] }
    ]
  }
];

// ===========================================================
// State
// ===========================================================

const state = {
  user: null,
  draft: null,
  published: null,
  activePane: PANES[0].id,
  activeCustomPane: null // 'enquiries' | 'media' | 'backup' | null
};

function isDirty() {
  return JSON.stringify(state.draft) !== JSON.stringify(state.published);
}

function markDirty() {
  updatePublishBar();
}

// ===========================================================
// Screens
// ===========================================================

const screens = {
  setup: document.getElementById('setup-screen'),
  login: document.getElementById('login-screen'),
  app: document.getElementById('app-screen')
};

function showScreen(name) {
  Object.entries(screens).forEach(([k, s]) => (s.hidden = k !== name));
}

// ---------- Login ----------

function wireLoginScreen() {
  const form = document.getElementById('login-form');
  const errorEl = document.getElementById('login-error');
  const forgotBtn = document.getElementById('login-forgot');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.hidden = true;
    const email = form.email.value.trim();
    const password = form.password.value;
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Signing in…';
    try {
      await signIn(email, password);
      // watchAuthState will move us to the app screen.
    } catch (err) {
      errorEl.textContent = translateAuthError(err.code);
      errorEl.hidden = false;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sign in';
    }
  });

  forgotBtn.addEventListener('click', async () => {
    const email = form.email.value.trim();
    if (!email) {
      errorEl.textContent = 'Enter your email above first, then tap "Forgot password?" again.';
      errorEl.hidden = false;
      return;
    }
    try {
      await resetPassword(email);
      errorEl.textContent = `Password reset link sent to ${email}.`;
      errorEl.classList.add('login-error--info');
      errorEl.hidden = false;
    } catch (err) {
      errorEl.classList.remove('login-error--info');
      errorEl.textContent = translateAuthError(err.code);
      errorEl.hidden = false;
    }
  });
}

// ---------- App shell ----------

function wireAppShell() {
  document.getElementById('publish-btn').addEventListener('click', publish);
  document.getElementById('undo-btn').addEventListener('click', undoChanges);
  document.getElementById('signout-btn').addEventListener('click', handleSignOut);
  document.getElementById('sidebar-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('is-open');
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && !screens.app.hidden) {
      e.preventDefault();
      publish();
    }
  });

  window.addEventListener('beforeunload', (e) => {
    if (isDirty()) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
}

async function handleSignOut() {
  if (isDirty() && !confirm('You have unpublished changes that will be lost. Sign out anyway?')) return;
  await signOutUser();
}

function updatePublishBar() {
  const dirty = isDirty();
  document.getElementById('publish-btn').disabled = !dirty;
  document.getElementById('undo-btn').disabled = !dirty;
  document.getElementById('dirty-indicator').hidden = !dirty;
}

async function publish() {
  const btn = document.getElementById('publish-btn');
  btn.disabled = true;
  btn.textContent = 'Publishing…';
  try {
    await saveContent(state.draft);
    state.published = clone(state.draft);
    updatePublishBar();
    toast('Published — your site is live with these changes.');
  } catch (err) {
    console.error(err);
    toast('Publish failed: ' + err.message, true);
  } finally {
    btn.textContent = 'Publish changes';
    updatePublishBar();
  }
}

function undoChanges() {
  if (!confirm('Discard all unpublished changes?')) return;
  state.draft = clone(state.published);
  renderActivePane();
  updatePublishBar();
  toast('Changes discarded.');
}

// ---------- Sidebar + pane rendering ----------

function renderSidebar() {
  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = '';
  PANES.forEach((pane) => {
    const btn = el('button', { type: 'button', class: 'sidebar__item' + (state.activePane === pane.id && !state.activeCustomPane ? ' is-active' : '') }, pane.label);
    btn.addEventListener('click', () => {
      state.activePane = pane.id;
      state.activeCustomPane = null;
      document.getElementById('sidebar').classList.remove('is-open');
      renderSidebar();
      renderActivePane();
    });
    nav.append(btn);
  });

  const customNav = document.getElementById('sidebar-nav-custom');
  customNav.innerHTML = '';
  [
    ['enquiries', 'Enquiries'],
    ['media', 'Media Library'],
    ['backup', 'Backup & Tools']
  ].forEach(([id, label]) => {
    const btn = el('button', { type: 'button', class: 'sidebar__item' + (state.activeCustomPane === id ? ' is-active' : '') }, label);
    btn.addEventListener('click', () => {
      state.activeCustomPane = id;
      document.getElementById('sidebar').classList.remove('is-open');
      renderSidebar();
      renderActivePane();
    });
    customNav.append(btn);
  });
}

function renderActivePane() {
  const main = document.getElementById('pane-content');
  main.innerHTML = '';

  if (state.activeCustomPane === 'enquiries') return renderEnquiriesPane(main);
  if (state.activeCustomPane === 'media') return renderMediaPane(main);
  if (state.activeCustomPane === 'backup') return renderBackupPane(main);

  const pane = PANES.find((p) => p.id === state.activePane);
  if (!pane) return;

  main.append(el('h1', { class: 'pane__title' }, pane.label));

  pane.groups.forEach((group) => {
    const card = el('section', { class: 'card' });
    const head = el('div', { class: 'card__head' });
    head.append(el('h2', {}, group.title));
    if (group.toggle) head.append(renderFieldByType(group.toggle, () => getPath(state.draft, group.toggle.path), (v) => setPath(state.draft, group.toggle.path, v)));
    card.append(head);
    const body = el('div', { class: 'card__body' });
    group.fields.forEach((field) => body.append(renderTopField(field)));
    card.append(body);
    main.append(card);
  });
}

// ===========================================================
// Field widgets
// ===========================================================

function renderTopField(field) {
  const get = () => getPath(state.draft, field.path);
  const set = (v) => setPath(state.draft, field.path, v);
  return renderFieldByType(field, get, set);
}

function renderFieldByType(field, get, set) {
  switch (field.type) {
    case 'text':
      return renderText(field, get, set);
    case 'textarea':
      return renderTextarea(field, get, set);
    case 'switch':
      return renderSwitch(field, get, set);
    case 'image':
      return renderImage(field, get, set);
    case 'list':
      return renderList(field, get, set);
    default:
      return renderText(field, get, set);
  }
}

function renderText(field, get, set) {
  const input = el('input', { type: 'text', value: get() ?? '' });
  input.addEventListener('input', () => {
    set(input.value);
    markDirty();
  });
  return el('label', { class: 'field' }, [el('span', { class: 'field__label' }, field.label), input]);
}

function renderTextarea(field, get, set) {
  const ta = el('textarea', { rows: 4 });
  ta.value = get() ?? '';
  ta.addEventListener('input', () => {
    set(ta.value);
    markDirty();
  });
  return el('label', { class: 'field' }, [el('span', { class: 'field__label' }, field.label), ta]);
}

function renderSwitch(field, get, set) {
  const input = el('input', { type: 'checkbox' });
  input.checked = get() !== false;
  input.addEventListener('change', () => {
    set(input.checked);
    markDirty();
  });
  return el('label', { class: 'field field--switch' }, [input, el('span', { class: 'field__label' }, field.label)]);
}

function renderImage(field, get, set) {
  const preview = el('img', { class: 'field__preview', src: get() || '', alt: '' });
  preview.onerror = () => {
    preview.style.visibility = 'hidden';
  };
  preview.onload = () => {
    preview.style.visibility = 'visible';
  };

  const urlInput = el('input', { type: 'text', placeholder: 'Paste an image link…', value: get() || '' });
  urlInput.addEventListener('input', () => {
    set(urlInput.value);
    preview.src = urlInput.value;
    markDirty();
  });

  const fileInput = el('input', { type: 'file', accept: 'image/*', style: 'display:none' });
  const uploadBtn = el('button', { type: 'button', class: 'btn-sm' }, 'Upload');
  uploadBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading…';
    try {
      const { url } = await uploadImage(file);
      set(url);
      urlInput.value = url;
      preview.src = url;
      markDirty();
      toast('Image uploaded.');
    } catch (err) {
      toast('Upload failed: ' + err.message, true);
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.textContent = 'Upload';
      fileInput.value = '';
    }
  });

  const libraryBtn = el('button', { type: 'button', class: 'btn-sm' }, 'Library');
  libraryBtn.addEventListener('click', () => {
    openMediaPicker((url) => {
      set(url);
      urlInput.value = url;
      preview.src = url;
      markDirty();
    });
  });

  return el('div', { class: 'field field--image' }, [
    el('span', { class: 'field__label' }, field.label),
    el('div', { class: 'field__imgrow' }, [preview, el('div', { class: 'field__imgcol' }, [urlInput, el('div', { class: 'field__imgbtns' }, [uploadBtn, libraryBtn, fileInput])])])
  ]);
}

function renderList(field, get, set) {
  const itemsWrap = el('div', { class: 'list__items' });

  function itemBlank() {
    const blank = { id: genId() };
    field.fields.forEach((sub) => {
      blank[sub.key] = sub.type === 'switch' ? false : sub.type === 'list' ? [] : '';
    });
    return blank;
  }

  function redraw() {
    itemsWrap.innerHTML = '';
    let arr = get();
    if (!Array.isArray(arr)) {
      arr = [];
      set(arr);
    }
    arr.forEach((item, idx) => {
      const row = el('div', { class: 'list__item', draggable: 'true' });

      const body = el('div', { class: 'list__body' });
      field.fields.forEach((sub) => {
        const getSub = () => arr[idx][sub.key];
        const setSub = (v) => {
          arr[idx][sub.key] = v;
          set(arr);
        };
        body.append(renderFieldByType({ ...sub, label: sub.label }, getSub, setSub));
      });

      const up = el('button', { type: 'button', class: 'icon-btn', title: 'Move up', disabled: idx === 0 }, '↑');
      up.addEventListener('click', () => {
        if (idx === 0) return;
        [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
        set(arr);
        markDirty();
        redraw();
      });
      const down = el('button', { type: 'button', class: 'icon-btn', title: 'Move down', disabled: idx === arr.length - 1 }, '↓');
      down.addEventListener('click', () => {
        if (idx === arr.length - 1) return;
        [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
        set(arr);
        markDirty();
        redraw();
      });
      const del = el('button', { type: 'button', class: 'icon-btn icon-btn--danger', title: 'Delete' }, '✕');
      del.addEventListener('click', () => {
        if (!confirm('Delete this item?')) return;
        arr.splice(idx, 1);
        set(arr);
        markDirty();
        redraw();
      });

      row.append(el('span', { class: 'list__handle', title: 'Drag to reorder' }, '⠿'), body, el('div', { class: 'list__controls' }, [up, down, del]));

      row.addEventListener('dragstart', (e) => {
        row.classList.add('is-dragging');
        e.dataTransfer.setData('text/plain', String(idx));
      });
      row.addEventListener('dragend', () => row.classList.remove('is-dragging'));
      row.addEventListener('dragover', (e) => e.preventDefault());
      row.addEventListener('drop', (e) => {
        e.preventDefault();
        const from = Number(e.dataTransfer.getData('text/plain'));
        if (Number.isNaN(from) || from === idx) return;
        const [moved] = arr.splice(from, 1);
        arr.splice(idx, 0, moved);
        set(arr);
        markDirty();
        redraw();
      });

      itemsWrap.append(row);
    });
  }
  redraw();

  const addBtn = el('button', { type: 'button', class: 'btn-sm' }, '+ Add item');
  addBtn.addEventListener('click', () => {
    const arr = get() || [];
    arr.push(itemBlank());
    set(arr);
    markDirty();
    redraw();
  });

  return el('div', { class: 'field field--list' }, [el('span', { class: 'field__label' }, field.label), itemsWrap, addBtn]);
}

// ===========================================================
// Media picker (used by IM widgets)
// ===========================================================

let mediaCache = null;

async function openMediaPicker(onPick) {
  const overlay = el('div', { class: 'modal-overlay' });
  const modal = el('div', { class: 'modal' });
  modal.append(el('h3', {}, 'Pick from Media Library'), el('p', { class: 'modal__loading' }, 'Loading…'));
  overlay.append(modal);
  document.body.append(overlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  const items = mediaCache || (await listMedia());
  mediaCache = items;

  modal.innerHTML = '';
  modal.append(el('h3', {}, 'Pick from Media Library'), el('button', { type: 'button', class: 'modal__close', onclick: () => overlay.remove() }, '✕'));

  if (!items.length) {
    modal.append(el('p', {}, 'No images uploaded yet. Use "Upload" on any image field, or the Media Library pane.'));
  } else {
    const grid = el('div', { class: 'media-grid' });
    items.forEach((m) => {
      const cell = el('button', { type: 'button', class: 'media-grid__item' }, [el('img', { src: m.url, alt: m.name || '' }), el('span', {}, m.name || '')]);
      cell.addEventListener('click', () => {
        onPick(m.url);
        overlay.remove();
      });
      grid.append(cell);
    });
    modal.append(grid);
  }
  document.body.append(overlay); // ensure on top after rebuild
}

// ===========================================================
// Custom pane: Enquiries
// ===========================================================

async function renderEnquiriesPane(main) {
  main.append(el('h1', { class: 'pane__title' }, 'Enquiries'));
  const toolbar = el('div', { class: 'toolbar' });
  const refreshBtn = el('button', { type: 'button', class: 'btn-sm' }, 'Refresh');
  const csvBtn = el('button', { type: 'button', class: 'btn-sm' }, 'Export CSV');
  toolbar.append(refreshBtn, csvBtn);
  main.append(toolbar);
  const list = el('div', { class: 'enquiry-list' }, 'Loading…');
  main.append(list);

  let rows = [];

  async function load() {
    list.textContent = 'Loading…';
    rows = await listEnquiries();
    draw();
  }

  function draw() {
    list.innerHTML = '';
    if (!rows.length) {
      list.append(el('p', {}, 'No enquiries yet.'));
      return;
    }
    rows.forEach((r) => {
      const card = el('div', { class: 'enquiry-card' + (r.handled ? ' is-handled' : '') });
      card.append(
        el('div', { class: 'enquiry-card__head' }, [el('b', {}, r.name || '(no name)'), el('span', { class: 'enquiry-card__date' }, formatDate(r.createdAt))]),
        el('div', { class: 'enquiry-card__row' }, [el('span', {}, r.phone || ''), el('span', {}, r.email || '')]),
        el('div', { class: 'enquiry-card__row' }, [el('span', { class: 'tag' }, r.course || '')]),
        el('p', { class: 'enquiry-card__msg' }, r.message || '')
      );
      const actions = el('div', { class: 'enquiry-card__actions' });
      if (r.phone) {
        const digits = String(r.phone).replace(/\D/g, '');
        actions.append(el('a', { class: 'btn-sm', href: `https://wa.me/${digits}`, target: '_blank', rel: 'noopener' }, 'WhatsApp'));
      }
      const handleBtn = el('button', { type: 'button', class: 'btn-sm' }, r.handled ? 'Mark unhandled' : 'Mark handled');
      handleBtn.addEventListener('click', async () => {
        try {
          await setEnquiryHandled(r.id, !r.handled);
          r.handled = !r.handled;
          draw();
        } catch (err) {
          toast('Failed: ' + err.message, true);
        }
      });
      const delBtn = el('button', { type: 'button', class: 'btn-sm btn-sm--danger' }, 'Delete');
      delBtn.addEventListener('click', async () => {
        if (!confirm('Delete this enquiry permanently?')) return;
        try {
          await deleteEnquiryRecord(r.id);
          rows = rows.filter((x) => x.id !== r.id);
          draw();
        } catch (err) {
          toast('Failed: ' + err.message, true);
        }
      });
      actions.append(handleBtn, delBtn);
      card.append(actions);
      list.append(card);
    });
  }

  refreshBtn.addEventListener('click', load);
  csvBtn.addEventListener('click', () => {
    const header = ['Name', 'Phone', 'Email', 'Course', 'Message', 'Status', 'Handled', 'Date'];
    const lines = [header.join(',')];
    rows.forEach((r) => {
      lines.push([r.name, r.phone, r.email, r.course, r.message, r.status, r.handled ? 'yes' : 'no', formatDate(r.createdAt)].map(csvEscape).join(','));
    });
    downloadFile('nfta-enquiries.csv', lines.join('\n'), 'text/csv');
  });

  await load();
}

// ===========================================================
// Custom pane: Media Library
// ===========================================================

async function renderMediaPane(main) {
  main.append(el('h1', { class: 'pane__title' }, 'Media Library'));
  main.append(el('p', { class: 'pane__hint' }, 'Deleting here removes only the library record — the image file stays on Cloudinary\'s CDN, so anything already using it keeps working.'));

  const toolbar = el('div', { class: 'toolbar' });
  const fileInput = el('input', { type: 'file', accept: 'image/*', style: 'display:none' });
  const uploadBtn = el('button', { type: 'button', class: 'btn-sm' }, 'Upload image');
  uploadBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading…';
    try {
      await uploadImage(file);
      mediaCache = null;
      toast('Uploaded.');
      await load();
    } catch (err) {
      toast('Upload failed: ' + err.message, true);
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.textContent = 'Upload image';
      fileInput.value = '';
    }
  });
  toolbar.append(uploadBtn, fileInput);
  main.append(toolbar);

  const grid = el('div', { class: 'media-grid media-grid--manage' }, 'Loading…');
  main.append(grid);

  async function load() {
    grid.textContent = 'Loading…';
    const items = await listMedia();
    mediaCache = items;
    grid.innerHTML = '';
    if (!items.length) {
      grid.append(el('p', {}, 'No images uploaded yet.'));
      return;
    }
    items.forEach((m) => {
      const cell = el('div', { class: 'media-grid__item media-grid__item--manage' });
      const copyBtn = el('button', { type: 'button', class: 'icon-btn', title: 'Copy URL' }, '⧉');
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(m.url);
          toast('URL copied.');
        } catch {
          toast(m.url);
        }
      });
      const delBtn = el('button', { type: 'button', class: 'icon-btn icon-btn--danger', title: 'Delete record' }, '✕');
      delBtn.addEventListener('click', async () => {
        if (!confirm('Remove this record from the library? The Cloudinary file itself will stay online.')) return;
        try {
          await deleteMediaRecord(m.id);
          mediaCache = null;
          await load();
        } catch (err) {
          toast('Failed: ' + err.message, true);
        }
      });
      cell.append(
        el('img', { src: m.url, alt: m.name || '' }),
        el('span', {}, m.name || ''),
        el('span', { class: 'media-grid__dims' }, m.width && m.height ? `${m.width}×${m.height}` : ''),
        el('div', { class: 'media-grid__actions' }, [copyBtn, delBtn])
      );
      grid.append(cell);
    });
  }

  await load();
}

// ===========================================================
// Custom pane: Backup & Tools
// ===========================================================

function renderBackupPane(main) {
  main.append(el('h1', { class: 'pane__title' }, 'Backup & Tools'));

  const backupCard = el('section', { class: 'card' });
  backupCard.append(el('div', { class: 'card__head' }, el('h2', {}, 'Backup')));
  const backupBody = el('div', { class: 'card__body' });

  const downloadBtn = el('button', { type: 'button', class: 'btn-sm' }, 'Download backup (JSON)');
  downloadBtn.addEventListener('click', async () => {
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Preparing…';
    try {
      const backup = await getBackupData();
      downloadFile(`nfta-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(backup, null, 2));
    } catch (err) {
      toast('Backup failed: ' + err.message, true);
    } finally {
      downloadBtn.disabled = false;
      downloadBtn.textContent = 'Download backup (JSON)';
    }
  });

  const restoreInput = el('input', { type: 'file', accept: 'application/json', style: 'display:none' });
  const restoreBtn = el('button', { type: 'button', class: 'btn-sm btn-sm--danger' }, 'Restore from backup…');
  restoreBtn.addEventListener('click', () => restoreInput.click());
  restoreInput.addEventListener('change', async () => {
    const file = restoreInput.files[0];
    if (!file) return;
    if (!confirm('This will overwrite the LIVE published site with the contents of this backup file. Continue?')) {
      restoreInput.value = '';
      return;
    }
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await restoreFromBackup(data);
      const fresh = await loadContent();
      state.draft = clone(fresh);
      state.published = clone(fresh);
      updatePublishBar();
      renderActivePane();
      toast('Backup restored and published.');
    } catch (err) {
      toast('Restore failed: ' + err.message, true);
    } finally {
      restoreInput.value = '';
    }
  });

  backupBody.append(el('p', {}, 'Download everything (site content + media library records) as a JSON file you can keep safe.'), downloadBtn, el('hr'), el('p', {}, 'Restoring immediately overwrites the live site — use with care.'), restoreBtn, restoreInput);
  backupCard.append(backupBody);
  main.append(backupCard);

  const pwCard = el('section', { class: 'card' });
  pwCard.append(el('div', { class: 'card__head' }, el('h2', {}, 'Change password')));
  const pwBody = el('div', { class: 'card__body' });
  const pwBtn = el('button', { type: 'button', class: 'btn-sm' }, 'Email me a password reset link');
  pwBtn.addEventListener('click', async () => {
    try {
      await resetPassword(state.user.email);
      toast(`Reset link sent to ${state.user.email}.`);
    } catch (err) {
      toast(translateAuthError(err.code), true);
    }
  });
  pwBody.append(el('p', {}, `Signed in as ${state.user?.email || ''}.`), pwBtn);
  pwCard.append(pwBody);
  main.append(pwCard);
}

// ===========================================================
// Boot
// ===========================================================

function boot() {
  wireLoginScreen();
  wireAppShell();

  if (!IS_CONFIGURED) {
    showScreen('setup');
    return;
  }

  watchAuthState(async (user) => {
    state.user = user;
    if (!user) {
      showScreen('login');
      return;
    }
    showScreen('app');
    document.getElementById('user-email').textContent = user.email || '';

    const content = await loadContent();
    state.draft = clone(content);
    state.published = clone(content);
    state.activePane = PANES[0].id;
    state.activeCustomPane = null;
    updatePublishBar();
    renderSidebar();
    renderActivePane();
  });
}

boot();
