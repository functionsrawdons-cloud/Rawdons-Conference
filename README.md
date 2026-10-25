# Rawdons Hotel & Brewery Conference Tracker

An enterprise operational readiness, event flow, and banquet order management system tailored specifically for **Rawdons Hotel, Brewery & Estate** in Nottingham Road, KwaZulu-Natal Midlands.

---

## 🌟 Key Features

1. **5 Fully Editable Conference & Event Venues**
   - **Main Conference Room (The Mill Room & Lake Lawn Terrace)**: 120 cinema / 80 schoolroom / 75 banquet.
   - **Breakfast Dining Room / Patio**: 70 cinema / 45 schoolroom / 90 banquet with covered rose patio.
   - **Stirrup Cup**: Historic 1950s English Pub & Fireside Snug (40 cocktail / 25 boardroom).
   - **Bar Garden / Brewery**: Outdoor lawn, pergola & taproom overlooking Nottingham Road copper vats (200 cocktail / 140 banquet).
   - **Full Hotel & All Venues Buyout**: Exclusive estate buyout (all 32 rooms + 4 venues + 10 hectares).
   - *Dynamic Rate Engine*: Seasonal pricing (Low, Mid, Peak) or Delegate Tier Flat-Hire with extra pax surcharges, printable rate card, and CSV export.

2. **32 Hotel Rooms Guest Allocation Matrix**
   - Edit sleeping configurations (King, Queen, Twin Singles, Family Suite, Executive Loft).
   - Real-time guest room allocations by conference with occupancy tracking and rooming-list CSV export.

3. **Conference Insights & Revenue Visualizations (D3.js)**
   - Interactive D3 SVG charts displaying monthly revenue distribution and event type breakdowns (Corporate Summit, Gala Banquet, Executive Retreat, Team Building, Wedding / Celebration).
   - Metric cards for Total Revenue, Average Event Value, Food & Beverage Yield, and Venue Hire Yield.

4. **Storage Cache & Offline Resilience (Zero Data Loss on GitHub)**
   - Automatic local persistence across browser sessions.
   - **One-click JSON Backup Export**: Download complete encrypted system bundle (`Rawdons_Conference_System_Backup_YYYY-MM-DD.json`).
   - **One-click System Restore**: Upload previously saved JSON backups to instantly restore all 5 venues, 32 rooms, guest allocations, staff rosters, department checklists, and active conferences.
   - In-app snapshot recovery points and storage diagnostics.

5. **Operational Excellence Tools**
   - **Departmental Checklists**: Food & Beverage, Kitchen Brigade, Banqueting Setup, Housekeeping, Reception / Front Office, Maintenance & Estate.
   - **Printable BEOs (Banquet Event Orders)**: Formatted for thermal and standard A4 printing.
   - **Executive Financial Quotations**: Formatted invoice breakdown covering Venue Hire, Catering, Bar, AV, and VAT (15% ZAR).
   - **Executive Kitchen 33% Food Cost Governance**: Real-time margin calculator & AI culinary menu engineer.

---

## 🚀 Deployment to GitHub

This repository is preconfigured for static deployment on **GitHub Pages** with relative base path resolution (`base: './'`) and an automated **GitHub Actions** CI/CD pipeline.

### Option A: Automatic Deployment via GitHub Actions (Recommended)

1. Create a new repository on GitHub (e.g. `rawdons-conference-tracker`).
2. Push your project to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Rawdons Conference Tracker"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
3. In your GitHub repository:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. The included `.github/workflows/deploy.yml` workflow will automatically build and publish your app. Your site will be live at:
   `https://<your-username>.github.io/<your-repo-name>/`

### Option B: Manual Static Build & Publish

If you prefer building locally:
```bash
# 1. Install dependencies
npm install

# 2. Build production assets
npm run build

# 3. The output is in the `dist/` directory.
# You can push `dist/` directly to a `gh-pages` branch:
npx gh-pages -d dist
```

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start local full-stack development server (Express + Vite)
npm run dev

# Open in browser:
http://localhost:3000
```

---

## 🔒 Data Security & Privacy

All conference data, room allocations, venue customizations, and staff rosters are stored locally in the user's browser storage. No proprietary hotel data is transmitted to external servers without administrative intent. Use the **Storage Cache & Backup** modal to export timestamped backups before clearing browser history.
