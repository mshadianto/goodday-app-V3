# GoodDay v3.0 — Motivasi Islami Harian

Aplikasi PWA yang memberikan pesan motivasi harian dari Al-Quran dan Hadits, dipersonalisasi sesuai usia, gender, profesi, dan mood pengguna.

## 🏗️ Arsitektur

```
goodday-app/
├── docs/                    ← Frontend (GitHub Pages)
│   ├── index.html
│   ├── manifest.json
│   └── sw.js
├── api/                     ← Backend (Railway/Vercel)
│   └── motivasi.js
├── package.json
└── .gitignore
```

**Frontend:** GitHub Pages (Static HTML/CSS/JS)
**Backend:** Railway.app atau Vercel (Node.js API)
**Database:** localStorage (client-side, privacy-first)

## ✨ Fitur

✅ Pesan motivasi dipersonalisasi (nama, usia, profesi, mood)
✅ Waktu-adaptif: Subuh, Pagi, Siang, Malam
✅ Offline support (PWA + Service Worker)
✅ Riwayat pesan (tersimpan lokal)
✅ Responsive design mobile-first
✅ Privacy-first: semua data di client

## 🚀 Deploy

### Frontend (GitHub Pages)

1. Push code ke GitHub: `https://github.com/namaakun/goodday-app`
2. GitHub repo → Settings → Pages
3. Source: `Deploy from a branch`
4. Branch: `main`
5. Folder: `/docs`
6. Save

Aplikasi live di: `https://namaakun.github.io/goodday-app/`

### Backend (Railway.app)

1. Daftar di: https://railway.app
2. New Project → Deploy from GitHub repo
3. Select branch: `main`
4. Root directory: (leave blank)
5. Add env variable: `SUMOPOD_API_KEY=sk-ant-api03-xxxxx`
6. Deploy

Aplikasi akan mendapat domain Railway seperti: `https://goodday-api.railway.app`

3. Update `API_URL` di `docs/index.html`:
```javascript
const API_URL = 'https://goodday-api.railway.app/api/motivasi';
```

4. Push & GitHub Pages auto-redeploy

## 🔧 Local Development

```bash
# Clone
git clone https://github.com/namaakun/goodday-app.git
cd goodday-app

# Start local server (untuk test frontend)
npx http-server docs

# Test di browser
http://localhost:8080
```

## 📝 Environment Variables

Set di Railway/Vercel dashboard:
```
SUMOPOD_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
```

## 🎨 Customization

- **API Model:** Edit `api/motivasi.js` baris model
- **Theme Colors:** Edit CSS `:root` variables
- **Moods:** Edit `MOODS` array di `docs/index.html`

## 📱 PWA Install

**Android:**
- Open app → menu → "Install app"
- Or: Chrome → menu → "Tambahkan ke layar utama"

**iOS:**
- Safari → Share → "Add to Home Screen"

## 🔐 Privacy

✅ Semua data user tersimpan **lokal di perangkat** (localStorage)
✅ Tidak ada tracking atau analytics
✅ Tidak ada server-side user database
✅ API key dienkripsi di backend

## 📊 Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JS
- **Backend:** Node.js (Railway/Vercel)
- **API:** Sumopod (Anthropic Haiku 4.5 proxy)
- **Hosting:** GitHub Pages + Railway/Vercel

## 📄 License

MIT License - Feel free to use & modify

---

**GoodDay v3.0** — Dibuat dengan ❤️ untuk motivasi harian Anda
