/* ==========================================================================
   Healthy Plate Coach — application logic
   Vanilla JS, hash-based router, no backend / accounts / external APIs.
   Progress is stored only in this browser via localStorage (no personal
   or sensitive data — just practice activity for this fictional app).
   ========================================================================== */

(function () {
  'use strict';

  /* ---------------------------- Storage helpers --------------------------- */
  const LS_KEYS = {
    draft: 'hpc_draft_v1',
    submissions: 'hpc_submissions_v1',
    learnViewed: 'hpc_learn_viewed_v1'
  };

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function saveJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable — app still works this session */ }
  }

  /* --------------------------------- State --------------------------------- */
  const emptyPlate = () => ({ grains: [], vegetables: [], fruits: [], protein: [], dairy: [] });

  const draft = loadJSON(LS_KEYS.draft, { challengeId: null, plate: emptyPlate(), explanation: '', saved: false });

  const state = {
    challengeId: draft.challengeId || null,
    plate: Object.assign(emptyPlate(), draft.plate || {}),
    explanation: draft.explanation || '',
    saved: !!draft.saved,
    learnViewed: new Set(loadJSON(LS_KEYS.learnViewed, [])),
    submissions: loadJSON(LS_KEYS.submissions, [])
  };

  function persistDraft() {
    saveJSON(LS_KEYS.draft, {
      challengeId: state.challengeId,
      plate: state.plate,
      explanation: state.explanation,
      saved: state.saved
    });
  }
  function persistLearnViewed() {
    saveJSON(LS_KEYS.learnViewed, Array.from(state.learnViewed));
  }
  function persistSubmissions() {
    saveJSON(LS_KEYS.submissions, state.submissions);
  }

  /* --------------------------------- Utils --------------------------------- */
  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function firstSentence(str) {
    const idx = str.indexOf('. ');
    return idx === -1 ? str : str.slice(0, idx + 1);
  }
  function plateTotal(plate) {
    return FOOD_GROUPS.reduce((sum, g) => sum + plate[g.id].length, 0);
  }
  function announce(msg) {
    const region = document.getElementById('live-region');
    if (region) region.textContent = msg;
  }
  function summarizeFoodNames(ids) {
    const counts = {};
    ids.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
    return Object.keys(counts).map(id => {
      const name = getFoodItem(id).name;
      return counts[id] > 1 ? `${name} (×${counts[id]})` : name;
    }).join(', ');
  }
  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  /* ---------------------------- Plate visualization ------------------------ */
  function polarToCartesian(cx, cy, r, angleDeg) {
    const a = (angleDeg - 90) * Math.PI / 180.0;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }
  function describeArc(cx, cy, r, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
  }
  function renderPlateSVG(plate, size) {
    const total = plateTotal(plate);
    const cx = 100, cy = 100, r = 92;
    if (total === 0) {
      return `<svg viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="Empty plate, no foods added yet">
        <circle cx="100" cy="100" r="94" fill="#FFFFFF" stroke="#CFE7F3" stroke-width="4"/>
        <circle cx="100" cy="100" r="68" fill="none" stroke="#CFE7F3" stroke-width="3" stroke-dasharray="3 9"/>
        <text x="100" y="105" text-anchor="middle" font-size="13" fill="#4C6B75" font-family="Inter, sans-serif">Your plate is empty</text>
      </svg>`;
    }
    let angle = 0;
    const parts = [];
    const groupsWithFood = FOOD_GROUPS.filter(g => plate[g.id].length > 0);
    const describeLabel = groupsWithFood.map(g => `${plate[g.id].length} ${g.name}`).join(', ');
    groupsWithFood.forEach(g => {
      const count = plate[g.id].length;
      const sweep = (count / total) * 360;
      const path = describeArc(cx, cy, r, angle, angle + sweep);
      parts.push(`<path d="${path}" fill="${g.color}" stroke="#FFFFFF" stroke-width="2"></path>`);
      angle += sweep;
    });
    return `<svg viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="Plate showing ${describeLabel}">
      <circle cx="100" cy="100" r="96" fill="#FFFFFF" stroke="#E3F1F7" stroke-width="4"/>
      ${parts.join('')}
      <circle cx="100" cy="100" r="30" fill="#FFFFFF"/>
    </svg>`;
  }

  /* ------------------------------ Feedback engine --------------------------- */
  function computeFeedback(plate) {
    const total = plateTotal(plate);
    const present = FOOD_GROUPS.filter(g => plate[g.id].length > 0);
    const missing = FOOD_GROUPS.filter(g => plate[g.id].length === 0);
    const overloaded = FOOD_GROUPS.filter(g => plate[g.id].length >= 4);

    let rating = 'Needs work';
    if (present.length >= 5 && overloaded.length === 0) rating = 'Excellent balance';
    else if (present.length >= 4 && overloaded.length === 0) rating = 'Good balance';
    else if (present.length >= 3) rating = 'Getting there';

    const strengths = present.map(g => {
      const counts = {};
      plate[g.id].forEach(id => { counts[id] = (counts[id] || 0) + 1; });
      const items = Object.keys(counts).map(id => {
        const name = getFoodItem(id).name;
        return counts[id] > 1 ? `${name} (×${counts[id]})` : name;
      }).join(', ');
      return { group: g, text: `${g.name} — ${items}. ${firstSentence(g.detail)}` };
    });

    const improvements = [];
    missing.forEach(g => {
      improvements.push({ group: g, text: `No ${g.name.toLowerCase()} yet. ${g.portionTip} ${firstSentence(g.detail)}` });
    });
    overloaded.forEach(g => {
      improvements.push({ group: g, text: `You have ${plate[g.id].length} ${g.name.toLowerCase()} items — that's a lot of one food group. Try swapping one for a food from a missing group instead.` });
    });
    if (total > 0 && total < 3) {
      improvements.push({ group: null, text: 'Your plate only has a couple of items. Add a few more foods so it makes a full meal.' });
    }

    return { rating, present, missing, overloaded, strengths, improvements, total };
  }

  function ratingClass(rating) {
    if (rating === 'Excellent balance') return 'rating-great';
    if (rating === 'Good balance') return 'rating-good';
    if (rating === 'Getting there') return 'rating-ok';
    return 'rating-low';
  }

  /* --------------------------------- Router --------------------------------- */
  const routes = {
    home: renderHome,
    learn: renderLearn,
    activity: renderActivity,
    results: renderResults,
    resources: renderResources,
    progress: renderProgress,
    about: renderAbout
  };

  function currentRoute() {
    const hash = location.hash.replace(/^#\/?/, '') || 'home';
    return routes[hash] ? hash : 'home';
  }

  function navigate(route) {
    location.hash = '#/' + route;
  }

  function renderApp() {
    const route = currentRoute();
    const container = document.getElementById('app-content');
    container.innerHTML = '';
    container.appendChild(routes[route]());

    document.title = 'Healthy Plate Coach · ' + document.querySelector('#app-content h1').textContent;

    document.querySelectorAll('#nav-list a').forEach(a => {
      const isActive = a.dataset.route === route;
      a.classList.toggle('active', isActive);
      if (isActive) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    closeDrawer();
    const main = document.getElementById('main-content');
    main.scrollTop = 0;
    main.focus();
  }

  /* ---------------------------------- Home ---------------------------------- */
  function renderHome() {
    const hasDraft = plateTotal(state.plate) > 0;
    const groupsMastered = state.learnViewed.size;
    const wrap = el(`<div class="screen screen-home">
      <section class="hero">
        <div class="hero-text">
          <p class="eyebrow-free">Health &amp; Career/Technical Education · Grades 6–8</p>
          <h1>Build a plate you'd actually want to eat — and that fuels you too.</h1>
          <p class="hero-sub">Healthy Plate Coach walks you through real food groups, then lets you build a balanced plate for a fictional friend facing a real scheduling squeeze: practice, dinner, or a rushed morning.</p>
          <div class="hero-actions">
            <button class="btn btn-primary" id="start-btn">${hasDraft ? 'Continue your plate' : 'Start with Learn'}</button>
            <button class="btn btn-ghost" id="skip-to-activity">Jump to Activity</button>
          </div>
        </div>
        <div class="hero-plate" aria-hidden="true">
          ${renderPlateSVG(hasDraft ? state.plate : { grains: ['x'], vegetables: ['x', 'x'], fruits: ['x'], protein: ['x'], dairy: ['x'] }, 220)}
        </div>
      </section>

      <section class="goals-panel">
        <h2>What you'll practice</h2>
        <ul class="goals-list">
          <li><span class="goal-icon" aria-hidden="true">🌾</span>Identify the major food groups and the role each one plays in a balanced meal.</li>
          <li><span class="goal-icon" aria-hidden="true">🍽️</span>Build a balanced meal plan for a real-life scenario and explain at least one of your choices.</li>
        </ul>
      </section>

      <section class="flow-panel">
        <h2>How it works</h2>
        <div class="flow-track">
          <a href="#/learn" class="flow-step"><span class="flow-num">1</span><span>Learn</span></a>
          <a href="#/activity" class="flow-step"><span class="flow-num">2</span><span>Activity</span></a>
          <a href="#/results" class="flow-step"><span class="flow-num">3</span><span>Results</span></a>
          <a href="#/resources" class="flow-step"><span class="flow-num">4</span><span>Resources</span></a>
          <a href="#/progress" class="flow-step"><span class="flow-num">5</span><span>Progress</span></a>
        </div>
      </section>

      <section class="snapshot-panel">
        <h2>Your snapshot</h2>
        <div class="snapshot-cards">
          <div class="snapshot-card">
            <span class="snapshot-value">${groupsMastered}/5</span>
            <span class="snapshot-label">Food groups explored in Learn</span>
          </div>
          <div class="snapshot-card">
            <span class="snapshot-value">${state.submissions.length}</span>
            <span class="snapshot-label">Meal plans saved</span>
          </div>
          <div class="snapshot-card">
            <span class="snapshot-value">${hasDraft ? plateTotal(state.plate) : 0}</span>
            <span class="snapshot-label">Foods on your current plate</span>
          </div>
        </div>
        <a class="text-link" href="#/progress">See full progress →</a>
      </section>
    </div>`);

    wrap.querySelector('#start-btn').addEventListener('click', () => navigate(hasDraft ? 'activity' : 'learn'));
    wrap.querySelector('#skip-to-activity').addEventListener('click', () => navigate('activity'));
    return wrap;
  }

  /* ---------------------------------- Learn ---------------------------------- */
  function renderLearn() {
    const wrap = el(`<div class="screen screen-learn">
      <h1>Learn: the food groups</h1>
      <p class="screen-intro">Expand each food group to see the role it plays in a balanced meal. You'll use this in the Activity screen next.</p>
      <div class="group-accordion" id="group-accordion"></div>

      <h2 class="section-subhead">Quick tips</h2>
      <ul class="tip-list">
        ${LEARN_TIPS.map(t => `<li><strong>${t.title}.</strong> ${t.body}</li>`).join('')}
      </ul>

      <div class="screen-actions">
        <button class="btn btn-primary" id="to-activity">I'm ready to build a plate</button>
      </div>
    </div>`);

    const accordion = wrap.querySelector('#group-accordion');
    FOOD_GROUPS.forEach((g, i) => {
      const viewed = state.learnViewed.has(g.id);
      const item = el(`<div class="group-item" style="--group-color:${g.color}">
        <h3>
          <button class="group-toggle" id="toggle-${g.id}" aria-expanded="false" aria-controls="panel-${g.id}">
            <span class="group-dot" aria-hidden="true"></span>
            <span class="group-toggle-text">${g.name}<span class="group-tagline">${g.tagline}</span></span>
            <span class="group-check" aria-hidden="true">${viewed ? '✓' : ''}</span>
            <span class="group-caret" aria-hidden="true">▾</span>
          </button>
        </h3>
        <div class="group-panel" id="panel-${g.id}" role="region" aria-labelledby="toggle-${g.id}" hidden>
          <p>${g.detail}</p>
          <p class="portion-tip"><strong>On the plate:</strong> ${g.portionTip}</p>
          <p class="example-foods"><strong>Examples: </strong>${FOOD_ITEMS.filter(f => f.group === g.id).map(f => f.name).join(', ')}</p>
        </div>
      </div>`);
      const toggleBtn = item.querySelector('.group-toggle');
      const panel = item.querySelector('.group-panel');
      toggleBtn.addEventListener('click', () => {
        const isOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
        toggleBtn.setAttribute('aria-expanded', String(!isOpen));
        panel.hidden = isOpen;
        if (!isOpen) {
          state.learnViewed.add(g.id);
          persistLearnViewed();
          item.querySelector('.group-check').textContent = '✓';
        }
      });
      accordion.appendChild(item);
    });

    wrap.querySelector('#to-activity').addEventListener('click', () => navigate('activity'));
    return wrap;
  }

  /* -------------------------------- Activity -------------------------------- */
  function renderActivity() {
    const wrap = el(`<div class="screen screen-activity">
      <h1>Activity: build a balanced plate</h1>
      <p class="screen-intro">Pick a meal challenge, then add foods from the gallery to build a plate that fits it.</p>

      <section class="challenge-picker" aria-label="Choose a meal challenge">
        <h2>1. Choose a meal challenge</h2>
        <div class="challenge-cards" id="challenge-cards"></div>
      </section>

      <div id="challenge-detail"></div>

      <section class="builder" id="builder-section" hidden>
        <h2>2. Add foods to the plate</h2>
        <div class="builder-grid">
          <div class="gallery" id="food-gallery" aria-label="Food card gallery"></div>
          <div class="plate-panel">
            <h3>Your plate</h3>
            <div class="plate-visual" id="plate-visual"></div>
            <ul class="plate-legend" id="plate-legend"></ul>
            <div class="placed-list" id="placed-list" aria-label="Foods on your plate"></div>
            <div class="plate-actions">
              <button class="btn btn-ghost" id="clear-plate">Clear plate</button>
              <button class="btn btn-primary" id="to-results">Get my results</button>
            </div>
            <p class="builder-hint" id="builder-hint" role="status"></p>
          </div>
        </div>
      </section>
    </div>`);

    const cardsWrap = wrap.querySelector('#challenge-cards');
    MEAL_CHALLENGES.forEach(c => {
      const card = el(`<button class="challenge-card" id="challenge-${c.id}" aria-pressed="${state.challengeId === c.id}">
        <span class="challenge-name">${c.name}</span>
        <span class="challenge-audience">${c.audience}</span>
      </button>`);
      card.addEventListener('click', () => selectChallenge(c.id));
      cardsWrap.appendChild(card);
    });

    function renderChallengeDetail() {
      const detailWrap = wrap.querySelector('#challenge-detail');
      detailWrap.innerHTML = '';
      if (!state.challengeId) return;
      const c = getChallenge(state.challengeId);
      detailWrap.appendChild(el(`<div class="challenge-detail-card">
        <h3>${c.name}</h3>
        <p>${c.scenario}</p>
        <p class="challenge-goal"><strong>Your goal: </strong>${c.goal}</p>
      </div>`));
      wrap.querySelector('#builder-section').hidden = false;
    }

    function selectChallenge(id) {
      if (state.challengeId === id) return;
      if (plateTotal(state.plate) > 0 && state.challengeId !== id) {
        const ok = confirm('Choosing a new challenge will clear your current plate. Continue?');
        if (!ok) return;
      }
      state.challengeId = id;
      state.plate = emptyPlate();
      state.saved = false;
      persistDraft();
      wrap.querySelectorAll('.challenge-card').forEach(btn => {
        btn.setAttribute('aria-pressed', btn.id === 'challenge-' + id ? 'true' : 'false');
      });
      renderChallengeDetail();
      renderGallery();
      renderPlateArea();
      announce('Challenge selected: ' + getChallenge(id).name);
    }

    function renderGallery() {
      const gallery = wrap.querySelector('#food-gallery');
      gallery.innerHTML = '';
      FOOD_GROUPS.forEach(g => {
        const section = el(`<div class="gallery-group" style="--group-color:${g.color}">
          <h4 class="gallery-group-title"><span class="group-dot" aria-hidden="true"></span>${g.name}</h4>
          <div class="food-cards"></div>
        </div>`);
        const foodCardsWrap = section.querySelector('.food-cards');
        FOOD_ITEMS.filter(f => f.group === g.id).forEach(f => {
          const card = el(`<div class="food-card">
            <div class="food-card-icon">${renderFoodIcon(f.id)}</div>
            <div class="food-card-name">${f.name}</div>
            <div class="food-card-controls">
              <button class="qty-btn qty-minus" aria-label="Remove one ${f.name} from plate">−</button>
              <span class="qty-count" id="qty-${f.id}" aria-live="off">0</span>
              <button class="qty-btn qty-plus" aria-label="Add ${f.name} to plate">+</button>
            </div>
          </div>`);
          card.querySelector('.qty-plus').addEventListener('click', () => addFood(f.id));
          card.querySelector('.qty-minus').addEventListener('click', () => removeFood(f.id));
          foodCardsWrap.appendChild(card);
        });
        gallery.appendChild(section);
      });
      syncQuantities();
    }

    function syncQuantities() {
      FOOD_ITEMS.forEach(f => {
        const countEl = wrap.querySelector('#qty-' + f.id);
        if (countEl) countEl.textContent = state.plate[f.group].filter(id => id === f.id).length;
      });
    }

    function addFood(id) {
      const item = getFoodItem(id);
      state.plate[item.group].push(id);
      state.saved = false;
      persistDraft();
      syncQuantities();
      renderPlateArea();
      announce(item.name + ' added to plate.');
    }
    function removeFood(id) {
      const item = getFoodItem(id);
      const arr = state.plate[item.group];
      const idx = arr.lastIndexOf(id);
      if (idx > -1) arr.splice(idx, 1);
      state.saved = false;
      persistDraft();
      syncQuantities();
      renderPlateArea();
      announce(item.name + ' removed from plate.');
    }

    function renderPlateArea() {
      wrap.querySelector('#plate-visual').innerHTML = renderPlateSVG(state.plate, 200);
      const legend = wrap.querySelector('#plate-legend');
      legend.innerHTML = FOOD_GROUPS.map(g => `<li style="--group-color:${g.color}"><span class="legend-dot" aria-hidden="true"></span>${g.name}: ${state.plate[g.id].length}</li>`).join('');

      const placedList = wrap.querySelector('#placed-list');
      const total = plateTotal(state.plate);
      if (total === 0) {
        placedList.innerHTML = '<p class="empty-note">No foods added yet. Use the + buttons to build your plate.</p>';
      } else {
        placedList.innerHTML = '<h4>On your plate</h4><ul class="placed-items">' +
          FOOD_GROUPS.flatMap(g => state.plate[g.id].map((id, i) => {
            const f = getFoodItem(id);
            return `<li>${f.name} <button class="chip-remove" data-id="${id}" aria-label="Remove ${f.name}">×</button></li>`;
          })).join('') + '</ul>';
        placedList.querySelectorAll('.chip-remove').forEach(btn => {
          btn.addEventListener('click', () => { removeFood(btn.dataset.id); });
        });
      }

      const hint = wrap.querySelector('#builder-hint');
      const toResultsBtn = wrap.querySelector('#to-results');
      const groupsCovered = FOOD_GROUPS.filter(g => state.plate[g.id].length > 0).length;
      if (total < 3 || groupsCovered < 2) {
        hint.textContent = 'Add at least 3 foods from 2 or more food groups to check your results.';
        toResultsBtn.disabled = true;
      } else {
        hint.textContent = total + ' foods added across ' + groupsCovered + ' food group' + (groupsCovered === 1 ? '' : 's') + '. Ready when you are.';
        toResultsBtn.disabled = false;
      }
    }

    wrap.querySelector('#clear-plate').addEventListener('click', () => {
      if (plateTotal(state.plate) === 0) return;
      const ok = confirm('Clear all foods from your plate?');
      if (!ok) return;
      state.plate = emptyPlate();
      state.saved = false;
      persistDraft();
      syncQuantities();
      renderPlateArea();
      announce('Plate cleared.');
    });
    wrap.querySelector('#to-results').addEventListener('click', () => navigate('results'));

    // initial paint
    renderChallengeDetail();
    if (state.challengeId) {
      renderGallery();
      renderPlateArea();
    }
    return wrap;
  }

  /* -------------------------------- Results ---------------------------------- */
  function renderResults() {
    const hasEnough = state.challengeId && plateTotal(state.plate) >= 3 && FOOD_GROUPS.filter(g => state.plate[g.id].length > 0).length >= 2;

    if (!hasEnough) {
      const wrap = el(`<div class="screen screen-results">
        <h1>Results &amp; Feedback</h1>
        <div class="empty-state">
          <p>You don't have a plate ready to check yet.</p>
          <button class="btn btn-primary" id="go-activity">Go build a plate</button>
        </div>
      </div>`);
      wrap.querySelector('#go-activity').addEventListener('click', () => navigate('activity'));
      return wrap;
    }

    const challenge = getChallenge(state.challengeId);
    const feedback = computeFeedback(state.plate);

    const wrap = el(`<div class="screen screen-results">
      <h1>Results &amp; Feedback</h1>
      <p class="screen-intro">Here's how your plate for <strong>${challenge.name}</strong> stacks up.</p>

      <section class="results-layout">
        <div class="results-plate">
          ${renderPlateSVG(state.plate, 200)}
          <span class="rating-badge ${ratingClass(feedback.rating)}">${feedback.rating}</span>
        </div>
        <div class="results-text">
          <h2>Strengths</h2>
          ${feedback.strengths.length ? `<ul class="feedback-list feedback-strengths">${feedback.strengths.map(s => `<li style="--group-color:${s.group.color}">${s.text}</li>`).join('')}</ul>` : '<p>Add some foods to see strengths here.</p>'}

          <h2>Possible improvements</h2>
          ${feedback.improvements.length ? `<ul class="feedback-list feedback-improvements">${feedback.improvements.map(s => `<li>${s.text}</li>`).join('')}</ul>` : '<p>Nice work — no major gaps found for this plate.</p>'}
        </div>
      </section>

      <section class="explain-panel">
        <h2>Explain one of your choices</h2>
        <label for="explain-input">Pick one food on your plate and explain why it's a good choice for ${challenge.audience.split(',')[0]}'s meal.</label>
        <textarea id="explain-input" rows="4" placeholder="Example: I added grilled chicken because Jordan needs protein to help muscles recover after soccer practice." aria-describedby="explain-help"></textarea>
        <p id="explain-help" class="field-help">Write at least one full sentence (10+ characters).</p>
        <div class="screen-actions">
          <button class="btn btn-primary" id="save-plan">Save my meal plan</button>
          <span id="save-status" role="status" class="save-status"></span>
        </div>
      </section>
    </div>`);

    const textarea = wrap.querySelector('#explain-input');
    textarea.value = state.explanation;
    textarea.addEventListener('input', () => {
      state.explanation = textarea.value;
      state.saved = false;
      persistDraft();
    });

    const saveStatus = wrap.querySelector('#save-status');
    if (state.saved) saveStatus.textContent = 'Saved to My Progress ✓';

    wrap.querySelector('#save-plan').addEventListener('click', () => {
      const text = textarea.value.trim();
      if (text.length < 10) {
        saveStatus.textContent = 'Add a bit more detail to your explanation before saving.';
        saveStatus.classList.add('save-status-error');
        textarea.focus();
        return;
      }
      saveStatus.classList.remove('save-status-error');
      const submission = {
        id: 'sub_' + Date.now(),
        date: new Date().toISOString(),
        challengeId: state.challengeId,
        challengeName: challenge.name,
        plate: JSON.parse(JSON.stringify(state.plate)),
        explanation: text,
        rating: feedback.rating
      };
      state.submissions.unshift(submission);
      persistSubmissions();
      state.saved = true;
      persistDraft();
      saveStatus.textContent = 'Saved to My Progress ✓';
      announce('Meal plan saved to My Progress.');
    });

    return wrap;
  }

  /* -------------------------------- Resources -------------------------------- */
  function renderResources() {
    const wrap = el(`<div class="screen screen-resources">
      <h1>Resources</h1>
      <p class="screen-intro">Reference material to revisit anytime — during the activity or after class.</p>

      <section class="resource-section">
        <h2>Food group quick-reference</h2>
        <div class="resource-grid">
          ${FOOD_GROUPS.map(g => `<div class="resource-card" style="--group-color:${g.color}">
            <span class="group-dot" aria-hidden="true"></span>
            <h3>${g.name}</h3>
            <p>${g.tagline}</p>
            <p class="portion-tip">${g.portionTip}</p>
          </div>`).join('')}
        </div>
      </section>

      <section class="resource-section">
        <h2>Try a different meal challenge</h2>
        <p>Head back to the Activity screen and pick a new scenario any time:</p>
        <ul class="resource-list">
          ${MEAL_CHALLENGES.map(c => `<li><strong>${c.name}</strong> — ${c.scenario}</li>`).join('')}
        </ul>
        <button class="btn btn-secondary" id="res-to-activity">Go to Activity</button>
      </section>

      <section class="resource-section">
        <h2>Glossary</h2>
        <dl class="glossary">
          <dt>Carbohydrate</dt><dd>A nutrient (found in grains and fruit) that your body breaks down into quick energy.</dd>
          <dt>Protein</dt><dd>A nutrient that builds and repairs muscle and other tissue.</dd>
          <dt>Fiber</dt><dd>A part of plant foods that supports digestion and helps you feel full.</dd>
          <dt>Calcium</dt><dd>A mineral, common in dairy, that supports bone strength.</dd>
        </dl>
      </section>

      <section class="resource-section">
        <h2>Outside reference</h2>
        <p>For an official, more detailed plate guide, see the U.S. Department of Agriculture's <a href="https://www.myplate.gov" target="_blank" rel="noopener">MyPlate.gov</a> (opens in a new tab).</p>
      </section>
    </div>`);
    wrap.querySelector('#res-to-activity').addEventListener('click', () => navigate('activity'));
    return wrap;
  }

  /* -------------------------------- Progress ---------------------------------- */
  function renderProgress() {
    const wrap = el(`<div class="screen screen-progress">
      <h1>My Progress</h1>
      <p class="screen-intro">Everything here is saved only in this browser — there are no accounts and nothing is sent anywhere.</p>

      <section class="progress-stats">
        <div class="snapshot-card">
          <span class="snapshot-value">${state.learnViewed.size}/5</span>
          <span class="snapshot-label">Food groups explored</span>
        </div>
        <div class="snapshot-card">
          <span class="snapshot-value">${state.submissions.length}</span>
          <span class="snapshot-label">Meal plans saved</span>
        </div>
        <div class="snapshot-card">
          <span class="snapshot-value">${state.submissions.filter(s => s.rating === 'Excellent balance' || s.rating === 'Good balance').length}</span>
          <span class="snapshot-label">Well-balanced plans</span>
        </div>
      </section>

      <section class="submissions-section">
        <h2>Saved meal plans</h2>
        <div id="submissions-list"></div>
      </section>
    </div>`);

    const list = wrap.querySelector('#submissions-list');
    if (state.submissions.length === 0) {
      list.innerHTML = '<div class="empty-state"><p>You haven\'t saved a meal plan yet.</p></div>';
    } else {
      state.submissions.forEach(sub => {
        const card = el(`<div class="submission-card">
          <div class="submission-header">
            <div>
              <h3>${sub.challengeName}</h3>
              <span class="submission-date">${formatDate(sub.date)}</span>
            </div>
            <span class="rating-badge ${ratingClass(sub.rating)}">${sub.rating}</span>
          </div>
          <div class="submission-foods">${summarizeFoodNames(FOOD_GROUPS.flatMap(g => sub.plate[g.id]))}</div>
          <p class="submission-explanation">“${sub.explanation}”</p>
          <button class="btn btn-ghost btn-small remove-sub" data-id="${sub.id}">Remove</button>
        </div>`);
        card.querySelector('.remove-sub').addEventListener('click', () => {
          const ok = confirm('Remove this saved meal plan?');
          if (!ok) return;
          state.submissions = state.submissions.filter(s => s.id !== sub.id);
          persistSubmissions();
          renderApp();
        });
        list.appendChild(card);
      });
    }
    return wrap;
  }

  /* --------------------------------- About ---------------------------------- */
  function renderAbout() {
    return el(`<div class="screen screen-about">
      <h1>About &amp; Help</h1>

      <section class="about-section">
        <h2>What is Healthy Plate Coach?</h2>
        <p>Healthy Plate Coach helps middle school students practice planning balanced meals. You'll compare food choices for a fictional friend's real-life scheduling squeeze, then build and evaluate a plate of your own.</p>
      </section>

      <section class="about-section">
        <h2>Learning goals</h2>
        <ul>
          <li>Identify the major food groups and the role each one plays in a balanced meal.</li>
          <li>Create a balanced meal plan and explain at least one choice.</li>
        </ul>
      </section>

      <section class="about-section">
        <h2>How to use this app</h2>
        <ol class="how-to-list">
          <li><strong>Learn:</strong> review each food group and what it contributes to a meal.</li>
          <li><strong>Activity:</strong> pick a meal challenge and add foods to build a plate.</li>
          <li><strong>Results &amp; Feedback:</strong> see strengths and possible improvements, then explain one choice.</li>
          <li><strong>Resources:</strong> revisit quick references any time.</li>
          <li><strong>My Progress:</strong> review meal plans you've saved in this browser.</li>
        </ol>
      </section>

      <section class="about-section">
        <h2>Privacy</h2>
        <p>This app has no accounts, logins, or servers. Your activity (foods chosen, explanations, and which topics you've viewed) is stored only in this browser using local storage, and is never sent anywhere. Clearing your browser data will remove it.</p>
      </section>

      <section class="about-section">
        <h2>Accessibility</h2>
        <p>Every screen is reachable by keyboard, controls have descriptive labels for screen readers, color is never the only way information is shown, and text meets contrast guidelines. If something is hard to use, please tell your teacher.</p>
      </section>

      <section class="about-section">
        <h2>Version</h2>
        <p>Healthy Plate Coach — Prototype v1.0. Built for Health &amp; Career/Technical Education, grades 6–8.</p>
      </section>
    </div>`);
  }

  /* ------------------------------- Nav / drawer ------------------------------- */
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const hamburger = document.getElementById('hamburger-btn');

  function openDrawer() {
    sidebar.classList.add('open');
    overlay.hidden = false;
    hamburger.setAttribute('aria-expanded', 'true');
  }
  function closeDrawer() {
    sidebar.classList.remove('open');
    overlay.hidden = true;
    hamburger.setAttribute('aria-expanded', 'false');
  }
  hamburger.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeDrawer() : openDrawer();
  });
  overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) closeDrawer();
  });

  /* ---------------------------------- Init ---------------------------------- */
  window.addEventListener('hashchange', renderApp);
  window.addEventListener('DOMContentLoaded', renderApp);
  if (document.readyState !== 'loading') renderApp();
})();
