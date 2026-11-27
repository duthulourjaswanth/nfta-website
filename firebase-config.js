/**
 * firebase-config.js
 *
 * Public Firebase web config — the 6 values from
 * Firebase Console > Project settings > General > Your apps > SDK setup and configuration.
 * These are safe to expose publicly; access is controlled by firestore.rules, not by
 * hiding this file. See SETUP-ADMIN.md for exact click-by-click steps.
 *
 * Nothing else in the project should import the Firebase SDK directly — only
 * firebase-init.js reads this file.
 */

export const FIREBASE_CONFIG = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID'
};

// True once the placeholders above have been replaced with real values.
export const IS_CONFIGURED = Boolean(
  FIREBASE_CONFIG.apiKey &&
  FIREBASE_CONFIG.apiKey !== 'YOUR_API_KEY' &&
  FIREBASE_CONFIG.projectId &&
  FIREBASE_CONFIG.projectId !== 'YOUR_PROJECT_ID'
);
