# AuditMD

# DFEAL Health IT — AI Readiness Audit Website

Enterprise-grade AI compliance and Health IT audit landing site for **DFEAL LLC**.

---

## Project Structure

```
dfeal-health/
├── index.html        ← Main landing page
├── thank-you.html    ← Form submission confirmation
├── 404.html          ← Custom error page
├── favicon.svg       ← Brand favicon (navy D + gold accent)
├── dfeal-logo.png    ← ⚠️  ADD THIS — place your logo PNG here
├── robots.txt        ← Search engine directives
├── sitemap.xml       ← SEO sitemap (update domain if needed)
├── netlify.toml      ← Netlify deploy config + security headers
├── vercel.json       ← Vercel deploy config
└── README.md         ← This file
```

---

## Before You Deploy

### 1. Add Your Logo

Place `dfeal-logo.png` in this folder alongside `index.html`.  
The site uses it in the navbar and footer. If the file is missing, the SVG text fallback shows automatically.

### 2. Update Your Domain

If your site URL is not `health.dfeal.com`, update these three places:

- `sitemap.xml` → `<loc>` URL
- `robots.txt` → `Sitemap:` URL
- `index.html` → All `og:url`, `twitter:url`, and `link rel="canonical"` tags in `<head>`

---

## Deploy to Netlify (Recommended — Free)

Netlify handles form submissions natively with zero backend code.

### Option A: Drag-and-Drop (Fastest)

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the entire `dfeal-health/` folder onto the page
3. Done — your site is live in seconds

### Option B: Connect Git Repo

1. Push this folder to a GitHub/GitLab repo
2. Go to [app.netlify.com](https://app.netlify.com) → New Site → Import from Git
3. Select the repo; Netlify auto-detects `netlify.toml`
4. Click **Deploy**

### Set Up Form Email Notifications

After your first form submission arrives:

1. Netlify dashboard → **Site** → **Forms** → `ai-readiness-intake`
2. Click **Notifications** → **Add notification** → Email
3. Enter `intake@dfeal.com` (or any address you want notified)

---

## Deploy to Vercel (Alternative)

```bash
# Install Vercel CLI once
npm install -g vercel

# Deploy from this folder
cd dfeal-health
vercel
```

> **Note:** Vercel does not process HTML forms natively. To use the contact form on Vercel, integrate a third-party form service (Formspree, Basin, etc.) and update the `action` attribute in `index.html`.

---

## Custom Domain Setup

### Netlify

1. Site Settings → Domain Management → Add custom domain
2. Enter `health.dfeal.com`
3. Add a CNAME record at your DNS provider:  
   `health` → `[your-site-name].netlify.app`
4. SSL is provisioned automatically

### Vercel

```bash
vercel domains add health.dfeal.com
```

Then add the CNAME record shown in the Vercel dashboard.

---

## Contact Info (on site)

| Channel     | Value                                      |
|-------------|---------------------------------------------|
| Email       | intake@dfeal.com                            |
| Phone       | +1 (844) 442-0529                           |
| Address     | 254 Chapman Rd, Ste 208, Newark, DE 19702   |
| Calendly    | calendly.com/dfealllc/30min                 |

---

## Federal Credentials (displayed in footer)

| Field       | Value          |
|-------------|----------------|
| CAGE Code   | 15RT3          |
| UEI         | G1XCPA2ANMC3   |
| NAICS       | 541611, 541618, 541714 |

---

## Tech Stack

- Pure HTML / CSS / JS — no build step, no framework
- Google Fonts: Inter + DM Sans
- Netlify Forms for contact (zero-backend)
- Netlify/Vercel for hosting and CDN

---

© 2026 DFEAL LLC. All rights reserved.  
AI Health IT Readiness Audit™ is a trademark of DFEAL LLC.
