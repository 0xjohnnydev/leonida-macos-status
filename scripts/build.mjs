import { readFile, writeFile } from 'node:fs/promises';
import { renderStages } from '../stage-render.js';

const root = new URL('../', import.meta.url);
const status = JSON.parse(await readFile(new URL('status.json', root), 'utf8'));
const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="description" content="Follow the six stages of getting GTA VI running natively on a Mac, from checking the game files to playing a scene.">
  <title>GTA VI on Mac · Progress tracker</title>
  <link rel="stylesheet" href="./style.css?v=stages-1">
  <script type="module" src="./tracker.js?v=stages-1"></script>
</head>
<body>
  <header>
    <div class="wrap mast">
      <span>Leonida · Native Mac port</span>
      <span class="machine">Test machine · Apple M5 Pro</span>
    </div>
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
