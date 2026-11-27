# NFTA Admin Panel — Setup Guide

This guide gets your admin panel (`admin.html`) working so you can edit every
page of your website yourself — no coding, no developer needed after this.

It takes about 15–20 minutes, one time only. You'll create two free
accounts (Firebase and Cloudinary), copy a few codes into two small files,
and create your own login.

---

## Part 1 — Firebase (stores your content, powers your login)

### 1.1 Create a Firebase project

1. Go to **console.firebase.google.com** and sign in with a Google account
   (create one if you don't have one — this can be your business Gmail).
2. Click **Add project**.
3. Name it something like `nfta-website`. Click **Continue**.
4. You can turn **off** Google Analytics (not needed). Click **Create project**,
   then **Continue** once it's ready.

### 1.2 Turn on Firestore (where your content is stored)

1. In the left sidebar, click **Build > Firestore Database**.
2. Click **Create database**.
3. Choose **Start in production mode**. Click **Next**.
4. Pick the location closest to your users (e.g. `asia-south1 (Mumbai)` for India). Click **Enable**.

### 1.3 Turn on Email/Password sign-in (your admin login)

1. In the left sidebar, click **Build > Authentication**.
2. Click **Get started**.
3. Click **Email/Password** in the list of sign-in providers, toggle it **Enabled**, and click **Save**.

### 1.4 Create your own admin login

There is deliberately no "sign up" page on the website — this keeps the panel
safe. You create your login by hand, right here:

1. Still in **Authentication**, click the **Users** tab.
2. Click **Add user**.
3. Enter the email and password you want to use to log into the admin panel
   (this does **not** need to be your public contact email — pick whatever
   you'll remember, or use a password manager).
4. Click **Add user**.

You can repeat this step later to give a staff member their own login.

### 1.5 Get your website's connection codes

1. Click the **gear icon** next to "Project Overview" (top-left) > **Project settings**.
2. Scroll down to **Your apps**. Click the **</>** (web) icon to add a web app.
3. Give it a nickname like `nfta-site` and click **Register app**. (Skip the "hosting" checkbox.)
4. You'll see a code block that looks like this:

   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "nfta-website.firebaseapp.com",
     projectId: "nfta-website",
     storageBucket: "nfta-website.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

5. Open **`firebase-config.js`** in your website folder using any plain text
   editor (Notepad, TextEdit, VS Code, etc.).
6. Copy each value from the Firebase code block into the matching line, replacing
   the placeholder text. For example `apiKey: 'YOUR_API_KEY'` becomes
   `apiKey: 'AIza...'` (keep the quote marks). Save the file.

### 1.6 Set the security rules

This step controls who can read and write your data — it's already written
for you, you just need to paste it in.

1. Back in Firebase, go to **Build > Firestore Database > Rules** tab.
2. Open **`firestore.rules`** from your website folder in a text editor,
   select all the text, and copy it.
3. In the Firebase Rules editor, select all the existing text and paste yours
   over it.
4. Click **Publish**.

---

## Part 2 — Cloudinary (stores your photos)

Firebase's own file storage requires a paid plan, so images are hosted on
Cloudinary instead (it has a generous free plan).

### 2.1 Create a Cloudinary account

1. Go to **cloudinary.com** and sign up for a free account.
2. Once logged in, your **Cloud name** is shown on the Dashboard near the top
   (e.g. `dabc123xy`). Note it down.

### 2.2 Create an "unsigned" upload preset

This lets the admin panel upload photos directly and safely, without needing
a developer's secret key.

1. Click the **gear/Settings** icon (top right) > **Upload** tab.
2. Scroll to **Upload presets** and click **Add upload preset**.
3. Set **Signing Mode** to **Unsigned**.
4. (Optional) Give it a name you'll recognize, e.g. `nfta_unsigned`.
5. Click **Save**.
6. Note down the preset's name (shown in the list, e.g. `nfta_unsigned` or an
   auto-generated one like `ml_default`).

### 2.3 Add the codes to your website

1. Open **`cloudinary-config.js`** in a text editor.
2. Replace `'YOUR_CLOUD_NAME'` with your Cloud name from step 2.1.
3. Replace `'YOUR_UNSIGNED_UPLOAD_PRESET'` with your preset name from step 2.2.
4. Save the file.

---

## Part 3 — You're set up. Start editing.

1. Upload your website folder to your hosting exactly as before (FTP or however
   you normally publish it) — or just open `admin.html` locally first to try it out.
2. Open `admin.html` in a browser (e.g. `yourdomain.com/admin.html`).
3. Sign in with the email and password you created in step 1.4.
4. Pick a page from the left menu, edit any field, and click **Publish
   changes** (top right) when you're happy — or press **Ctrl+S** (**Cmd+S**
   on Mac).
5. Nothing goes live until you click Publish. If you change your mind, click
   **Undo changes** to throw away unsaved edits.

### What each part of the panel does

- **Sidebar pages** (Home, About, Courses, etc.) — every text field, image,
  price, and button on that page.
- **"Show this section" toggle** — hides a whole section from the live site
  without deleting your content, in case you want to bring it back later.
- **Image fields** — three ways to set a picture: **Upload** a photo from
  your device, pick one you've already used from the **Library**, or paste a
  direct image link.
- **Enquiries** — every contact-form submission, with a one-tap WhatsApp
  reply button, a "mark handled" toggle, and a CSV export you can open in
  Excel.
- **Media Library** — every photo you've ever uploaded. Deleting a photo here
  only removes it from this list — it does **not** delete the file itself, so
  any page still using that photo keeps working.
- **Backup & Tools** — download a full backup of your site's content as a
  file you can keep safe, restore from a backup, and request a password
  reset email.

---

## Troubleshooting

**The admin page just says "Almost there" / setup notice.**
`firebase-config.js` still has placeholder values. Re-check Part 1.5 — every
value must be copied over, no `YOUR_...` text left.

**I can't sign in / "No account found with that email."**
Double check you created the user in Firebase **Authentication > Users**
(Part 1.4), and that you're typing the same email and password.

**Forgot your password.**
Click **Forgot password?** on the sign-in screen — a reset link will be
emailed to you (uses Firebase's built-in email, no setup needed).

**Uploaded images aren't appearing / upload fails.**
Check that your Cloudinary upload preset's **Signing Mode** is set to
**Unsigned** (Part 2.2) — a "signed" preset will not work from the browser.

**The public website looks unchanged after I published.**
Give it a few seconds and hard-refresh the page (Ctrl+Shift+R / Cmd+Shift+R).
If it's still wrong, re-check the field you edited in the admin panel — it
should show the "Unpublished changes" indicator go away after a successful
publish.

**I want to add another staff login.**
Repeat step 1.4 (Firebase > Authentication > Users > Add user) with their
email and a password — they can change it themselves later from **Backup &
Tools > Change password** once signed in.
