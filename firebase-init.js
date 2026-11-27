/**
 * firebase-init.js
 *
 * The ONLY file in this project that talks to Firebase or Cloudinary.
 * Both the public site (assets/js/site-render.js) and the admin panel
 * (admin.js) import from here. Nothing else imports the Firebase SDK
 * directly — swapping hosts/providers later means rewriting this file.
 *
 * Loading is lazy and staged:
 *   - firebase-app + firebase-firestore load on the first content read.
 *   - firebase-auth loads ONLY when something calls an auth function
 *     (i.e. only the admin panel ever downloads it).
 * Cloudinary needs no SDK — uploads are a plain fetch() to its REST API.
 */

import { FIREBASE_CONFIG, IS_CONFIGURED } from './firebase-config.js';
import { CLOUDINARY_CONFIG, IMAGES_CONFIGURED } from './cloudinary-config.js';
import { DEFAULT_CONTENT, mergeContent } from './content-schema.js';

export { IS_CONFIGURED, IMAGES_CONFIGURED };

const SDK_VERSION = '10.12.2';
const CDN = `https://www.gstatic.com/firebasejs/${SDK_VERSION}`;

let appPromise = null;
let dbPromise = null;
let authPromise = null;

function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      if (!IS_CONFIGURED) return null;
      const { initializeApp, getApps, getApp: getExistingApp } = await import(`${CDN}/firebase-app.js`);
      return getApps().length ? getExistingApp() : initializeApp(FIREBASE_CONFIG);
    })();
  }
  return appPromise;
}

function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const app = await getApp();
      if (!app) return null;
      const mod = await import(`${CDN}/firebase-firestore.js`);
      return { mod, db: mod.getFirestore(app) };
    })();
  }
  return dbPromise;
}

function getAuthCtx() {
  if (!authPromise) {
    authPromise = (async () => {
      const app = await getApp();
      if (!app) return null;
      const mod = await import(`${CDN}/firebase-auth.js`);
      return { mod, auth: mod.getAuth(app) };
    })();
  }
  return authPromise;
}

// ===========================================================
// CONTENT (site/content) — public read, admin write
// ===========================================================

/**
 * Never throws. Firebase down, keys missing, offline, quota blown — all
 * fall back to DEFAULT_CONTENT so a visitor always gets a complete site.
 */
export async function loadContent() {
  try {
    if (!IS_CONFIGURED) return DEFAULT_CONTENT;
    const ctx = await getDb();
    if (!ctx) return DEFAULT_CONTENT;
    const { doc, getDoc } = ctx.mod;
    const snap = await getDoc(doc(ctx.db, 'site', 'content'));
    if (!snap.exists()) return DEFAULT_CONTENT;
    return mergeContent(DEFAULT_CONTENT, snap.data());
  } catch (err) {
    console.warn('[NFTA CMS] loadContent failed, using defaults:', err);
    return DEFAULT_CONTENT;
  }
}

/**
 * Subscribes to live updates on site/content so open tabs re-render within
 * a second of a publish. Returns an unsubscribe function. Never throws —
 * failures are logged and simply mean no live updates.
 */
export function subscribeContent(onChange) {
  let unsub = () => {};
  let stopped = false;
  (async () => {
    try {
      if (!IS_CONFIGURED) return;
      const ctx = await getDb();
      if (!ctx || stopped) return;
      const { doc, onSnapshot } = ctx.mod;
      unsub = onSnapshot(
        doc(ctx.db, 'site', 'content'),
        (snap) => {
          try {
            onChange(snap.exists() ? mergeContent(DEFAULT_CONTENT, snap.data()) : DEFAULT_CONTENT);
          } catch (err) {
            console.warn('[NFTA CMS] subscribeContent handler failed:', err);
          }
        },
        (err) => console.warn('[NFTA CMS] subscribeContent error:', err)
      );
    } catch (err) {
      console.warn('[NFTA CMS] subscribeContent setup failed:', err);
    }
  })();
  return () => { stopped = true; unsub(); };
}

/**
 * Whole-document, atomic save. Used only by the admin panel on "Publish
 * changes" — allowed to throw so the panel can tell the admin it failed.
 */
export async function saveContent(content) {
  const ctx = await getDb();
  if (!ctx) throw new Error('Firebase is not configured — see SETUP-ADMIN.md.');
  const { doc, setDoc, serverTimestamp } = ctx.mod;
  await setDoc(doc(ctx.db, 'site', 'content'), { ...content, updatedAt: serverTimestamp() });
}

// ===========================================================
// ENQUIRIES (enquiries/{id}) — public validated create, admin read/manage
// ===========================================================

const ENQUIRY_LIMITS = { name: 200, phone: 50, email: 200, course: 200, message: 5000 };

function clip(value, max) {
  return String(value ?? '').slice(0, max);
}

/**
 * Public contact-form submission. Throws on failure so the caller can fall
 * back to the WhatsApp link — a lead should never just vanish.
 */
export async function submitEnquiry({ name, phone, email, course, message }) {
  const ctx = await getDb();
  if (!ctx) throw new Error('Firebase is not configured.');
  const { collection, addDoc, serverTimestamp } = ctx.mod;
  await addDoc(collection(ctx.db, 'enquiries'), {
    name: clip(name, ENQUIRY_LIMITS.name),
    phone: clip(phone, ENQUIRY_LIMITS.phone),
    email: clip(email, ENQUIRY_LIMITS.email),
    course: clip(course, ENQUIRY_LIMITS.course),
    message: clip(message, ENQUIRY_LIMITS.message),
    status: 'new',
    createdAt: serverTimestamp()
  });
}

/** Admin only (enforced by firestore.rules, not by this function). */
export async function listEnquiries() {
  const ctx = await getDb();
  if (!ctx) return [];
  const { collection, getDocs, query, orderBy } = ctx.mod;
  const snap = await getDocs(query(collection(ctx.db, 'enquiries'), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function setEnquiryHandled(id, handled) {
  const ctx = await getDb();
  if (!ctx) throw new Error('Firebase is not configured.');
  const { doc, updateDoc } = ctx.mod;
  await updateDoc(doc(ctx.db, 'enquiries', id), { handled: Boolean(handled) });
}

export async function deleteEnquiryRecord(id) {
  const ctx = await getDb();
  if (!ctx) throw new Error('Firebase is not configured.');
  const { doc, deleteDoc } = ctx.mod;
  await deleteDoc(doc(ctx.db, 'enquiries', id));
}

// ===========================================================
// MEDIA LIBRARY (media/{id}) — admin only
// ===========================================================

export async function listMedia() {
  const ctx = await getDb();
  if (!ctx) return [];
  const { collection, getDocs, query, orderBy } = ctx.mod;
  try {
    const snap = await getDocs(query(collection(ctx.db, 'media'), orderBy('createdAt', 'desc')));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('[NFTA CMS] listMedia failed:', err);
    return [];
  }
}

async function addMediaRecord({ name, url, width, height }) {
  const ctx = await getDb();
  if (!ctx) return;
  const { collection, addDoc, serverTimestamp } = ctx.mod;
  await addDoc(collection(ctx.db, 'media'), {
    name: clip(name, 200),
    url,
    width: width || null,
    height: height || null,
    createdAt: serverTimestamp()
  });
}

/** Removes only the Firestore record — the Cloudinary file is left in place. */
export async function deleteMediaRecord(id) {
  const ctx = await getDb();
  if (!ctx) throw new Error('Firebase is not configured.');
  const { doc, deleteDoc } = ctx.mod;
  await deleteDoc(doc(ctx.db, 'media', id));
}

// ===========================================================
// IMAGE UPLOAD — canvas resize + Cloudinary unsigned upload
// ===========================================================

/** Returns a smaller Blob, or null if resizing doesn't apply / fails. */
async function shrinkImage(file) {
  if (!file.type || file.type === 'image/gif' || file.type === 'image/svg+xml') return null;
  try {
    const bitmap = await createImageBitmap(file);
    const maxWidth = CLOUDINARY_CONFIG.maxWidth || 1600;
    if (bitmap.width <= maxWidth) {
      bitmap.close?.();
      return null;
    }
    const scale = maxWidth / bitmap.width;
    const w = maxWidth;
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const c2d = canvas.getContext('2d');
    c2d.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    return await new Promise((resolve) => canvas.toBlob(resolve, outType, 0.85));
  } catch (err) {
    // A failed shrink must never block the upload — caller uploads the original.
    console.warn('[NFTA CMS] in-browser image resize failed, uploading original:', err);
    return null;
  }
}

/**
 * Resizes (when it helps), uploads to Cloudinary, and best-effort writes a
 * Firestore media record. The Firestore write failing does NOT fail the
 * upload — the file is already on Cloudinary's CDN and its URL is returned.
 */
export async function uploadImage(file) {
  if (!IMAGES_CONFIGURED) throw new Error('Cloudinary is not configured — see SETUP-ADMIN.md.');
  if (!file.type || file.type === 'image/svg+xml') {
    throw new Error('SVG files are not supported by the image uploader — paste a link instead.');
  }

  let toUpload = file;
  if (file.type !== 'image/gif') {
    const resized = await shrinkImage(file);
    if (resized && resized.size < file.size) toUpload = resized;
  }

  const form = new FormData();
  form.append('file', toUpload, file.name);
  form.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  if (CLOUDINARY_CONFIG.folder) form.append('folder', CLOUDINARY_CONFIG.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
    method: 'POST',
    body: form
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Cloudinary upload failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  const url = data.secure_url;

  try {
    await addMediaRecord({ name: file.name, url, width: data.width, height: data.height });
  } catch (err) {
    console.warn('[NFTA CMS] media record write failed (upload still succeeded):', err);
  }

  return { url, width: data.width, height: data.height };
}

// ===========================================================
// AUTH — lazy-loaded ONLY when the admin panel calls one of these
// ===========================================================

/** Gates the panel: fires with the current user (or null) on every change. */
export function watchAuthState(onChange) {
  let unsub = () => {};
  let stopped = false;
  (async () => {
    const ctx = await getAuthCtx();
    if (!ctx || stopped) {
      onChange(null);
      return;
    }
    const { onAuthStateChanged } = ctx.mod;
    unsub = onAuthStateChanged(ctx.auth, (user) => onChange(user));
  })();
  return () => { stopped = true; unsub(); };
}

export async function signIn(email, password) {
  const ctx = await getAuthCtx();
  if (!ctx) throw { code: 'app/not-configured' };
  const { signInWithEmailAndPassword } = ctx.mod;
  return signInWithEmailAndPassword(ctx.auth, email, password);
}

export async function signOutUser() {
  const ctx = await getAuthCtx();
  if (!ctx) return;
  const { signOut } = ctx.mod;
  return signOut(ctx.auth);
}

/** Also used as "change password" — the client sets a new one via the emailed link. */
export async function resetPassword(email) {
  const ctx = await getAuthCtx();
  if (!ctx) throw { code: 'app/not-configured' };
  const { sendPasswordResetEmail } = ctx.mod;
  return sendPasswordResetEmail(ctx.auth, email);
}

const AUTH_ERROR_MESSAGES = {
  'auth/invalid-email': "That email address doesn't look right.",
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'No account found with that email.',
  'auth/wrong-password': 'Incorrect password. Try again or reset it.',
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/invalid-login-credentials': 'Email or password is incorrect.',
  'auth/missing-password': 'Enter your password.',
  'auth/too-many-requests': 'Too many attempts — wait a few minutes and try again.',
  'auth/network-request-failed': 'Network error — check your connection and try again.',
  'app/not-configured': "Firebase isn't set up yet — follow SETUP-ADMIN.md first."
};

export function translateAuthError(code) {
  return AUTH_ERROR_MESSAGES[code] || 'Something went wrong signing in. Please try again.';
}

// ===========================================================
// BACKUP & RESTORE
// ===========================================================

export async function getBackupData() {
  const content = await loadContent();
  const media = await listMedia().catch(() => []);
  return { exportedAt: new Date().toISOString(), content, media };
}

export async function restoreFromBackup(backup) {
  if (!backup || typeof backup !== 'object' || !backup.content) {
    throw new Error('That file doesn\'t look like an NFTA backup (missing "content").');
  }
  await saveContent(backup.content);
  if (Array.isArray(backup.media) && backup.media.length) {
    const ctx = await getDb();
    if (ctx) {
      const { doc, writeBatch } = ctx.mod;
      const batch = writeBatch(ctx.db);
      backup.media.forEach((m) => {
        if (m && m.id) {
          const { id, ...rest } = m;
          batch.set(doc(ctx.db, 'media', id), rest);
        }
      });
      try {
        await batch.commit();
      } catch (err) {
        console.warn('[NFTA CMS] media library restore partially failed:', err);
      }
    }
  }
}
