# SetLogic - GitHub Pages Deployment Guide

## Quick Deploy to GitHub Pages

### Step 1: Update vite.config.js
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/YOUR-REPO-NAME/', // Replace with your actual repo name
})
```

**Important:** If your repo is called `SetLogic`, use `base: '/SetLogic/'`
If your repo is called `setlogic-app`, use `base: '/setlogic-app/'`

### Step 2: Install gh-pages
```bash
npm install --save-dev gh-pages
```

### Step 3: Add deploy scripts to package.json
Add these to the "scripts" section:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

### Step 4: Deploy
```bash
npm run deploy
```

This will:
1. Build your app
2. Create a `gh-pages` branch
3. Push the `dist` folder to that branch

### Step 5: Enable GitHub Pages
1. Go to your repo on GitHub
2. Settings → Pages
3. Source: `gh-pages` branch
4. Root directory: `/ (root)`
5. Save

Your site will be live at: `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

---

## Alternative: Deploy to Vercel (Recommended - No Config Needed)

### Option 1: Vercel CLI
```bash
npm i -g vercel
vercel
```

### Option 2: Vercel GitHub Integration
1. Go to vercel.com
2. "New Project"
3. Import your GitHub repo
4. Deploy (zero config needed!)

**Vercel Benefits:**
- No base path config needed
- Automatic HTTPS
- Preview deployments for PRs
- Much faster than GitHub Pages

---

## Alternative: Netlify

### Drag & Drop
1. Run `npm run build`
2. Go to netlify.com/drop
3. Drag the `dist` folder
4. Done!

### Or GitHub Integration
1. netlify.com → New site from Git
2. Connect your repo
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy

---

## Troubleshooting 404 Errors

**Problem:** Getting 404s for manifest.json, vite.svg, etc.

**Solution:** Make sure `base` in vite.config.js matches your repo name EXACTLY.

Example:
- Repo: `github.com/username/SetLogic`
- Config: `base: '/SetLogic/'` ✅
- Config: `base: '/setlogic/'` ❌ (case mismatch)

**After changing base:**
1. Run `npm run build` again
2. Run `npm run deploy` again
3. Wait 1-2 minutes for GitHub to update

---

## Custom Domain (Optional)

### GitHub Pages:
1. Settings → Pages → Custom domain
2. Add your domain (e.g., `setlogic.app`)
3. Add CNAME record in your DNS:
   - Type: `CNAME`
   - Name: `@` or `www`
   - Value: `YOUR-USERNAME.github.io`

### Vercel/Netlify:
1. Project settings → Domains
2. Add your domain
3. Follow DNS instructions
4. Auto SSL certificate

---

## Performance Tips

### Enable Compression (Vercel/Netlify auto-do this)
Your bundle is ~900kb. After gzip: ~271kb. Good!

### Code Splitting (Optional)
For even faster loads, add lazy loading:

```javascript
// App.jsx
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./components/Dashboard'));
const Chat = lazy(() => import('./components/Chat'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {/* Your routes */}
    </Suspense>
  );
}
```

---

## Current Deployment Status

**If you're seeing 404 errors:**
1. Check your repo name
2. Update `base` in vite.config.js to match
3. Rebuild: `npm run build`
4. Redeploy: `npm run deploy`

**Recommended:**
Use Vercel instead - it's faster and has zero config! Just run `vercel` in your terminal.
