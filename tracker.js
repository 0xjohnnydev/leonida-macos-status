import { renderStages } from './stage-render.js?v=6';

const board = document.getElementById('board');
const notice = document.getElementById('refresh-error');
document.getElementById('refresh-schedule').hidden = false;
let lastPayload = '';
let loading = false;

async function refresh() {
  if (loading || document.hidden) return;
  loading = true;
  try {
    const response = await fetch('./status.json?v=' + Date.now(), {
      cache: 'no-store', signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new Error('Status unavailable');

    const payload = await response.text();
    if (payload !== lastPayload) {
      const content = renderStages(JSON.parse(payload));
      board.innerHTML = content;
      lastPayload = payload;
    }
    notice.hidden = true;
  } catch {
    notice.hidden = false;
  } finally {
    loading = false;
  }
}

refresh();
setInterval(refresh, 30000);
document.addEventListener('visibilitychange', refresh);
window.addEventListener('focus', refresh);
