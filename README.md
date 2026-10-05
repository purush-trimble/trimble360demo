# Trimble 360 (hackathon demo)

Static **SolidJS + Vite** demo of an agent-driven Connect and WorksManager workspace. All data is mocked in the browser (no real Trimble APIs).

## Live demo — trimble360demo

**[trimble360demo on GitHub Pages](https://purush-trimble.github.io/trimble360demo/)**

Full URL: `https://purush-trimble.github.io/trimble360demo/` (project site for repo [purush-trimble/trimble360demo](https://github.com/purush-trimble/trimble360demo)).

For **GitHub Enterprise Cloud**, use the same repo name so Pages serves at `https://<org>.github.io/trimble360demo/`.

## Try it

1. Add **Trimble Connect** and **WorksManager** from the plugin launcher.
2. In chat, try:
   - `create a design`
   - `show my Connect files`
   - `show my designs`
3. Toggle mock subscriptions in the right panel.
4. Reset persisted demo state: append `?reset=1` to the URL.

## Local development

```bash
npm install
npm run dev
```

## Production build (matches GitHub Pages path)

```bash
# Windows PowerShell
$env:BASE_PATH="/trimble360demo/"; npm run build; npm run preview

# macOS / Linux
BASE_PATH=/trimble360demo/ npm run build && npm run preview
```

## Deploy

Pushes to `main` run [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml).

### One-time GitHub Pages setup

1. Open [Settings → Pages](https://github.com/purush-trimble/trimble360demo/settings/pages).
2. Under **Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch”).
3. Optional: set **About → Website** on the repo home to `https://purush-trimble.github.io/trimble360demo/`.
4. Re-run the latest **Deploy to GitHub Pages** workflow or push to `main`.

After setup, CI deploys the `dist` artifact built with `BASE_PATH=/trimble360demo/`.
