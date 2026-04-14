# Luma AI Website

Standalone landing + signup page for Luma AI.

## Run locally

Option 1 (quick):
- Open `index.html` directly in your browser.

Option 2 (recommended):
- Run a static server from this folder:
  - `python -m http.server 8080`
- Visit `http://localhost:8080`

## Notes

- This website is intentionally separate from the app.
- Signup currently stores submissions in browser `localStorage` under key:
  - `luma_waitlist_leads`
- Later, replace the local storage block in `app.js` with your API call.
