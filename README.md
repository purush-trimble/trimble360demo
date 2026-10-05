# Trimble 360 (hackathon demo)

Static **SolidJS + Vite** demo of an agent-driven Connect and WorksManager workspace. All data is mocked in the browser (no real Trimble APIs).

## Live demo

**https://purush-trimble.github.io/trimble360demo/**

(GitHub repo: [trimble360demo](https://github.com/purush-trimble/trimble360demo))

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

**One-time setup:** Repository **Settings → Pages → Build and deployment → Source: GitHub Actions**.
