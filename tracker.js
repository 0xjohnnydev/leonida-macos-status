'use strict';
const field = id => document.getElementById(id);
let lastUpdate = '';
let loading = false;
const localTime = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium', timeStyle: 'short'
});
function outcome(id, complete, pending, success) {
  const element = field(id);
  element.textContent = complete ? success : pending;
  element.className = complete ? 'verified' : 'pending';
}
function render(data) {
  field('headline').textContent = data.headline;
  field('current').textContent = data.currentWork;
  field('scope').textContent = data.graphicsStatus;
  const stamp = document.createElement('time');
  stamp.dateTime = data.updatedAt;
  stamp.textContent = localTime.format(new Date(data.updatedAt));
  stamp.title = new Date(data.updatedAt).toISOString();
  field('updated').replaceChildren('Last verified ', stamp, ' · your local time');
  outcome('initializers', data.initializers.complete, 'In progress',
          data.initializers.entries.toLocaleString() + ' / ' + data.initializers.entries.toLocaleString());
  outcome('frame', data.firstGameFrame, 'Pending', 'Presented');
  outcome('playable', data.playable, 'Pending', 'Verified');
  const rows = data.milestones.map(item => {
    const row = document.createElement('li');
    const title = document.createElement('strong');
    const detail = document.createElement('span');
    title.textContent = item.title;
    detail.textContent = item.detail;
    row.append(title, detail);
    return row;
  });
  field('history').replaceChildren(...rows);
}
async function refresh() {
  if (loading) return;
  loading = true;
  try {
    const response = await fetch('./status.json?v=' + Date.now(), {cache:'no-store'});
    if (!response.ok) throw new Error(String(response.status));
    const data = await response.json();
    if (data.updatedAt !== lastUpdate) { render(data); lastUpdate = data.updatedAt; }
    field('error').hidden = true;
  } catch {
    field('error').textContent = lastUpdate ? 'Update unavailable. Showing the last verified status.'
                                          : 'Status unavailable. The tracker will retry automatically.';
    field('error').hidden = false;
  } finally { loading = false; }
}
refresh();
setInterval(() => { if (!document.hidden) refresh(); }, 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
