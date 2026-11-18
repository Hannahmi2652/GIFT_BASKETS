# Little Moments – Gift Baskets

A standalone, multilingual inquiry website and private customer-submissions portal for **Little Moments – Gift Baskets**, built with React, TypeScript, Tailwind CSS, Google Sheets (via Google Apps Script), and Firebase (Cloud Firestore + Google Authentication).

## Features

- **Full-Bleed Gift Basket Photography**: Uses your uploaded gift basket photograph (`/public/assets/aistudio/Panier_cadeau_naissance_aux_tons_pastel_2c4130df.png`) centered with `background-size: cover` without stretching or distortion.
- **60% Translucent Ivory Form Card**: Centered `#FFFEFC` background at **60% opacity** (`rgba(255, 254, 252, 0.6)`) so the gift basket photograph shows clearly behind the card while all text, labels, icons, inputs, and buttons remain 100% opaque and legible.
- **Full Multilingual & RTL/LTR Support**:
  - `🇬🇧 English` (LTR)
  - `🇫🇷 Français` (LTR)
  - `🇮🇱 עברית` (RTL)
  Switching languages updates the entire website, directionality (`dir="ltr"` / `dir="rtl"`), headings, labels, placeholders, validation messages, submit button, and confirmation message.
- **Minimal Two-Field Lead Capture**:
  - **Full Name** (required, 2–120 characters)
  - **Phone Number** (required, validated international phone characters)
- **Google Sheets Integration (Google Apps Script)**:
  - Automatically appends every validated submission as a new row with columns:
    1. `Submission Date`
    2. `Full Name`
    3. `Phone Number`
    4. `Selected Language`
  - Prevents duplicate rows on repeated clicks or retries using client-side synchronous locking + server-side `LockService` and `CacheService` deduplication.
  - Displays the confirmation message only after saving succeeds, and shows a clear error message if saving fails.
- **Private Owner Portal (Cloud Firestore + Google Auth)**:
  - Click **Owner Access** below the form (or visit `/#admin`) and sign in with your authorized Google account (`hmazoulay@gmail.com`) to view submissions in real time, search, filter, mark as contacted, or export CSV.

---

## Step-by-Step Guide: Connect Your Own Google Sheet

1. **Create a new Google Spreadsheet**:
   - Go to [sheets.new](https://sheets.new) (or open Google Drive → **New → Google Sheets**).
   - Name the spreadsheet (for example, `Little Moments Inquiries`).
2. **Open Extensions → Apps Script**:
   - In the Google Sheet top menu, click **Extensions → Apps Script**.
   - Delete any starter code (`function myFunction() {}`) in `Code.gs`.
3. **Paste the script**:
   - Copy the entire contents of `google-apps-script/Code.gs` from this project and paste it into `Code.gs`.
   - Click the **Save** icon (or `Ctrl+S` / `Cmd+S`) and name the project (e.g., `Little Moments Webhook`).
4. **Deploy it as a Web App**:
   - Click the blue **Deploy** button in the top-right corner → **New deployment**.
   - Click the gear icon next to **Select type** and choose **Web app**.
5. **Configure permissions correctly**:
   - **Description**: `Little Moments Form Handler`
   - **Execute as**: **Me** (your Google account)
   - **Who has access**: **Anyone** (so customers visiting your website can submit without signing in to Google)
   - Click **Deploy**.
   - When prompted, click **Authorize access**, select your Google account, click **Advanced → Go to ... (unsafe)** if Google shows the unverified personal script screen, and click **Allow**.
6. **Copy the Web App URL**:
   - Copy the generated **Web app URL** (it ends in `/exec`, e.g. `https://script.google.com/macros/s/AKfycb.../exec`).
7. **Connect the URL to your website**:
   - Create or edit `.env` in the project root (or set the environment variable in your hosting provider / AI Studio environment):
     ```env
     VITE_GOOGLE_SHEETS_WEB_APP_URL="https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
     ```
   - Restart the dev server (`npm run dev`) or rebuild (`npm run build`) so Vite picks up `VITE_GOOGLE_SHEETS_WEB_APP_URL`.

---

## Local Development & Build

```bash
npm install
npm run dev       # Starts Vite on http://localhost:3000
npm run lint      # Runs TypeScript type-checking (tsc --noEmit)
npm run build     # Builds production bundle into dist/
```
