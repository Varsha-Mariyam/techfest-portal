# TechFest 2026 Portal (production-ready)

React (Vite) frontend + Express API + MongoDB Atlas.

```
Browser → Netlify/Vercel (React) → Render (Express API) → MongoDB Atlas
                GitHub push → GitHub Actions (test + build) → auto-deploy
```

## Run locally
```bash
# terminal 1
cd server && cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm install && npm run dev
# terminal 2
cd client && cp .env.example .env
npm install && npm run dev          # http://localhost:5173
```
Tests: `cd server && npm test`

## Security demos (Steps 2–5): show the problem, then the fix
Work on a **copy** of the project. Take a screenshot at each stage.

**A. NoSQL injection.** Before: in `server/app.js` remove `app.use(mongoSanitize())` and the
`isStr` check from `/api/auth/login`, and change the query to `User.findOne({ email, password })`.
Attack:
```bash
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":{"$ne":null},"password":{"$ne":null}}'
```
It logs in without credentials. After: restore the original code and repeat. It returns `400 Invalid input`.

**B. XSS.** Before: in `client/src/pages/Feedback.jsx` replace `<p>{f.text}</p>` with
`<p dangerouslySetInnerHTML={{ __html: f.text }} />`, then post `<img src=x onerror="alert('hi')">`
(React inserts innerHTML scripts without running `<script>`, but event handlers like `onerror` do run).
After: restore `<p>{f.text}</p>`; the text shows literally. Helmet's CSP header stays on.

**C. Cookies / CSRF.** See `cookieOptions` in `server/app.js`: `httpOnly` (scripts can't read it),
`secure` (HTTPS only), `sameSite` (browser won't attach the cookie to requests started by other sites,
which is what blocks CSRF). Production uses `sameSite: 'none'` because Netlify and Render are different
sites; this works only together with `secure: true` and the CORS allow-list (`CLIENT_ORIGIN`).

## Git (Steps 6–10)
```bash
git init && git add . && git commit -m "first version"
git checkout -b feature-page      # edit, commit
git checkout main && git merge feature-page
# conflict: edit the same line on two branches, merge both, fix the <<<<<<< markers, then
git add . && git commit -m "resolve merge conflict"
git branch -M main
git remote add origin https://github.com/<you>/techfest-portal.git
git push -u origin main
git log --oneline --graph --all   # screenshot this
```

## CI (Step 11)
`.github/workflows/ci.yml` runs server tests and the client build on every push.
Commit `package-lock.json` in both folders (the workflow uses `npm ci`).
Red/green demo: make `test/security.test.js` fail → push (red) → fix → push (green).

## Deploy (Steps 12–15)
| Part | Where | Settings |
|---|---|---|
| Database | MongoDB Atlas (free M0) | DB user + password, Network Access `0.0.0.0/0`, copy connection string |
| API | Render → New Web Service | Root dir `server`, Build `npm install`, Start `npm start`. Env: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_ORIGIN=<frontend URL, no trailing slash>` |
| Frontend | Netlify or Vercel | Root dir `client`, Build `npm run build`, Output `dist`. Env: `VITE_API_URL=<Render URL>`. Redirect rule is already included (`_redirects` / `vercel.json`) |

Set `CLIENT_ORIGIN` on Render **after** you know the frontend URL, then redeploy.
Render's free tier sleeps; open `/api/health` once before testing or taking screenshots.
Check: register on the live site → see the user in Atlas → Browse Collections → address bar shows 🔒 https.

## Performance (Steps 16–17)
Already done: route-level lazy loading (`Gallery`), `loading="lazy"` + width/height on images,
Vite minified build. Record sizes from `npm run build` output (add a "before" by importing Gallery normally).
Lighthouse: DevTools (F12) → Lighthouse → Analyze, in an Incognito window, on the **live** URL.
Save the "before" report, fix 4+ items (alt text, image size/WebP, meta description, contrast, etc.), run again.

## Final report checklist (Step 18)
- [ ] Architecture diagram (above)
- [ ] 3 URLs: frontend ______  API ______  Atlas cluster ______
- [ ] Injection + XSS before/after screenshots
- [ ] `git log --graph` screenshot, red and green CI screenshots
- [ ] Lighthouse before/after scores
- [ ] Live site on desktop + mobile (DevTools device mode) in Chrome, Firefox, Edge
