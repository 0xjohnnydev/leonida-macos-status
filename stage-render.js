const stateNames = {complete: 'Complete', current: 'In progress', upcoming: 'Upcoming'};

function escapeText(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function formatDetail(value) {
  return escapeText(value).replace(/`([A-Za-z][A-Za-z0-9_]*)`/g, '<code>$1</code>');
}

function testDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('Invalid test date');
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
  }).format(date);
}

export function renderStages(data) {
  const stages = data.stages;
  if (!Array.isArray(stages) || !stages.length || stages.some(stage =>
    !Object.hasOwn(stateNames, stage.state) || !stage.title || !stage.detail
  )) throw new Error('Invalid stage list');

  const currentIndex = stages.findIndex(stage => stage.state === 'current');
  const completed = stages.filter(stage => stage.state === 'complete').length;
  const upcoming = stages.filter(stage => stage.state === 'upcoming').length;
  const active = currentIndex < 0 ? null : stages[currentIndex];
  if (active && (!active.blocker || !active.nextTest)) throw new Error('Incomplete current stage');
  if (completed + upcoming + Number(Boolean(active)) !== stages.length) {
    throw new Error('Multiple current stages');
  }

  const totals = {complete: completed, current: Number(Boolean(active)), upcoming};
  const statusLinks = Object.entries(totals).filter(([, count]) => count > 0).map(([state, count]) => {
    const first = stages.findIndex(stage => stage.state === state) + 1;
    return `<a class="state state-${state}" href="#stage-${first}">${count} ${stateNames[state].toLowerCase()}</a>`;
  }).join('\n          ');
  const summary = completed === stages.length ? '<p>All stages complete</p>'
    : `<nav class="stage-summary" aria-label="Jump to stages by status">${statusLinks}</nav>`;

  let coverage = '';
  const measured = data.translationCoverage;
  if (measured && Number.isSafeInteger(measured.done) && Number.isSafeInteger(measured.total) &&
      measured.done >= 0 && measured.total > 0 && measured.done <= measured.total &&
      Number.isSafeInteger(measured.modules) && measured.modules > 0) {
    const format = new Intl.NumberFormat('en-US');
    const percent = (100 * measured.done / measured.total).toFixed(1);
    coverage = `<section class="coverage" aria-labelledby="coverage-title">
      <h2 id="coverage-title">Native code translation</h2>
      <p><strong>${percent}% of indexed function starts translated</strong></p>
      <progress aria-label="Translated function entry points" value="${measured.done}" max="${measured.total}">${percent}%</progress>
      <p>${format.format(measured.done)} of ${format.format(measured.total)} translated · ${format.format(measured.total - measured.done)} remaining</p>
      <p class="coverage-note">Measured across ${measured.modules} game modules on ${escapeText(testDate(measured.measuredAt))}. A translated entry can still have untranslated branches. Startup may use only part of the index.</p>
    </section>`;
  }
  const shaders = data.packageComputeCoverage;
  if (shaders && Number.isSafeInteger(shaders.done) && Number.isSafeInteger(shaders.total) &&
      shaders.total > 0 && shaders.done >= 0 && shaders.done <= shaders.total) {
    const format = new Intl.NumberFormat('en-US');
    coverage += `<section class="coverage" aria-labelledby="compute-coverage-title">
      <h2 id="compute-coverage-title">Compute shaders in the package’s pipeline library</h2>
      <p><strong>${format.format(shaders.done)} of ${format.format(shaders.total)} compiled for Metal</strong></p>
      <progress aria-label="Package compute shaders compiled for Metal" value="${shaders.done}" max="${shaders.total}"></progress>
      <p>${format.format(shaders.total - shaders.done)} remaining in this library</p>
      <p class="coverage-note">Each count represents a distinct program with its thread-group settings. The first-frame ETA depends on which programs startup requests.</p>
    </section>`;
  }
  const current = active ? `
    <section class="focus" aria-labelledby="current-title">
      <div class="focus-head">
        <p class="stage-count">Current stage · ${currentIndex + 1} of ${stages.length}</p>
        <h2 id="current-title">${escapeText(active.title)}</h2>
      </div>
      <div class="focus-notes">
        ${data.headline ? `<div><h3>Latest verified result</h3><p>${formatDetail(data.headline)}</p></div>` : ''}
        <div><h3>Current status</h3><p>${formatDetail(active.blocker)}</p></div>
        <div><h3>Next test</h3><p>${formatDetail(active.nextTest)}</p></div>
      </div>
    </section>` : '';
  const rows = stages.map((stage, i) => `
    <li id="stage-${i + 1}" class="stage stage-${stage.state}"${stage.state === 'current' ? ' aria-current="step"' : ''}>
      <span class="number"><span class="sr-only">Stage </span>${i + 1}</span>
      <div class="step-body">
        <h3>${escapeText(stage.title)}</h3>
        <p>${formatDetail(stage.detail)}</p>
      </div>
      <span class="state state-${stage.state}">${stateNames[stage.state]}</span>
    </li>`).join('');
  return `
    <div class="heading">
      <h1>GTA VI on Mac</h1>
      <p class="tested">Last tested <time datetime="${escapeText(data.updatedAt)}">${escapeText(testDate(data.updatedAt))}</time></p>
    </div>${current}${coverage}
    <section class="roadmap" aria-labelledby="stages-title">
      <div class="roadmap-head">
        <h2 id="stages-title">Steps to a playable scene</h2>
        ${summary}
      </div>
      <ol role="list">${rows}</ol>
    </section>`;
}
