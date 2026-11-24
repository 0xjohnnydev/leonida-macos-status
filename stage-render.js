const stateNames = {complete: 'Complete', current: 'In progress', upcoming: 'Upcoming'};

function escapeText(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
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
  const progress = completed === stages.length ? 'All stages complete'
    : `${completed} complete · ${upcoming} upcoming`;
  if (active && (!active.blocker || !active.nextTest)) throw new Error('Incomplete current stage');
  if (completed + upcoming + Number(Boolean(active)) !== stages.length) {
    throw new Error('Multiple current stages');
  }

  const current = active ? `
    <section class="focus" aria-labelledby="current-title">
      <div class="focus-head">
        <p class="stage-count">Current stage · ${currentIndex + 1} of ${stages.length}</p>
        <h2 id="current-title">${escapeText(active.title)}</h2>
      </div>
      <div class="focus-notes">
        <div><h3>Where it stops</h3><p>${escapeText(active.blocker)}</p></div>
        <div><h3>Next test</h3><p>${escapeText(active.nextTest)}</p></div>
      </div>
    </section>` : '';
  const rows = stages.map((stage, i) => `
    <li class="stage stage-${stage.state}"${stage.state === 'current' ? ' aria-current="step"' : ''}>
      <span class="number"><span class="sr-only">Stage </span>${i + 1}</span>
      <div class="step-body">
        <h3>${escapeText(stage.title)}</h3>
        <p>${escapeText(stage.detail)}</p>
      </div>
      <span class="state state-${stage.state}">${stateNames[stage.state]}</span>
    </li>`).join('');
  return `
    <div class="heading">
      <h1>GTA VI on Mac</h1>
      <p class="tested">Last tested <time datetime="${escapeText(data.updatedAt)}">${escapeText(testDate(data.updatedAt))}</time></p>
    </div>${current}
    <section class="roadmap" aria-labelledby="stages-title">
      <div class="roadmap-head">
        <h2 id="stages-title">Steps to a playable scene</h2>
        <p>${escapeText(progress)}</p>
      </div>
      <ol role="list">${rows}</ol>
    </section>`;
}
