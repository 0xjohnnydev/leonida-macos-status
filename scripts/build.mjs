import { readFile, writeFile } from 'node:fs/promises';
import { renderStages } from '../stage-render.js';

const root = new URL('../', import.meta.url);
const status = JSON.parse(await readFile(new URL('status.json', root), 'utf8'));
const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="description" content="Track the native Mac port of GTA VI, from arm64 startup and Metal shader tests to a game-rendered frame and a playable scene.">
  <title>GTA VI on Mac · Progress tracker</title>
  <link rel="stylesheet" href="./style.css?v=6">
  <script type="module" src="./tracker.js?v=7"></script>
</head>
<body>
  <header>
    <div class="wrap mast">
      <span>Leonida · Native Mac port</span>
      <span class="machine">Test machine · Apple M5 Pro</span>
    </div>
    <p class="wrap credit"><strong>Original porting project by the Leonida team and contributors.</strong> This Mac port builds on their shader translator, asset tools, and offline runtime.</p>
  </header>
  <main id="board" class="wrap">${renderStages(status)}
  </main>
  <p id="refresh-error" class="wrap notice" role="status" hidden>Showing the last published update. The tracker will check again.</p>
  <footer class="wrap">
    <span id="refresh-schedule" hidden>Checks for updates every 30 seconds.</span>
    <noscript>Refresh this page for the latest published update.</noscript>
  </footer>
</body>
</html>
`;
await writeFile(new URL('index.html', root), html);
