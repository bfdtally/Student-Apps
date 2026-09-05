(() => {
  'use strict';

  const STORAGE_KEY = 'mathFactQuestProgressV1';
  const ROUND_SIZE = 8;
  const state = {
    family: null,
    questions: [],
    index: 0,
    correct: 0,
    currentStreak: 0,
    bestStreak: 0,
    locked: false,
  };

  const $ = (id) => document.getElementById(id);
  const screens = [...document.querySelectorAll('.screen')];
  const navButtons = [...document.querySelectorAll('.nav-btn')];

  function defaultProgress() {
    const families = {};
    for (let i = 0; i <= 12; i++) families[i] = { correct: 0, total: 0, rounds: 0 };
    return { families, totalRounds: 0, totalQuestions: 0, totalCorrect: 0 };
  }

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved || !saved.families) return defaultProgress();
      const base = defaultProgress();
      for (let i = 0; i <= 12; i++) {
        if (saved.families[i]) base.families[i] = { ...base.families[i], ...saved.families[i] };
      }
      base.totalRounds = Number(saved.totalRounds || 0);
      base.totalQuestions = Number(saved.totalQuestions || 0);
      base.totalCorrect = Number(saved.totalCorrect || 0);
      return base;
    } catch (_) {
      return defaultProgress();
    }
  }

  function saveProgress(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  function showScreen(name, focus = true) {
    screens.forEach(s => s.classList.toggle('active', s.id === `screen-${name}`));
    navButtons.forEach(b => b.classList.toggle('active', b.dataset.screen === name));
    if (name === 'progress') renderProgress();
    if (name === 'goals') renderFamilyGrid();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (focus) {
      const heading = document.querySelector(`#screen-${name} h1`);
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        setTimeout(() => heading.focus({ preventScroll: true }), 50);
      }
    }
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-screen]');
    if (trigger) showScreen(trigger.dataset.screen);
  });

  $('start-quest').addEventListener('click', () => showScreen('goals'));
  $('quit-round').addEventListener('click', () => showScreen('goals'));

  function accuracyFor(family, progress = loadProgress()) {
    const item = progress.families[family];
    return item.total ? Math.round((item.correct / item.total) * 100) : null;
  }

  function renderFamilyGrid() {
    const progress = loadProgress();
    const grid = $('family-grid');
    grid.innerHTML = '';
    for (let family = 0; family <= 12; family++) {
      const acc = accuracyFor(family, progress);
      const btn = document.createElement('button');
      btn.className = 'family-btn';
      btn.type = 'button';
      btn.setAttribute('aria-label', `${family}s multiplication fact family${acc === null ? ', not practiced yet' : `, ${acc}% accuracy`}`);
      btn.innerHTML = `<span>${family}s</span><small>fact family</small>${acc === null ? '' : `<span class="tiny-score">${acc}%</span>`}`;
      btn.addEventListener('focus', () => updateGoalTip(family, acc));
      btn.addEventListener('mouseenter', () => updateGoalTip(family, acc));
      btn.addEventListener('click', () => startRound(family));
      grid.appendChild(btn);
    }
  }

  function updateGoalTip(family, acc) {
    $('goal-tip-title').textContent = `${family}s family:`;
    if (acc === null) $('goal-tip-text').textContent = 'This family has not been practiced yet. Try one short round.';
    else if (acc >= 90) $('goal-tip-text').textContent = `You have ${acc}% accuracy here. Try to keep your strong score.`;
    else if (acc >= 75) $('goal-tip-text').textContent = `You have ${acc}% accuracy here. One more round can help make these facts stick.`;
    else $('goal-tip-text').textContent = `You have ${acc}% accuracy here. A focused round is a good next step.`;
  }

  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function buildQuestions(family) {
    // One round samples 8 distinct partner factors when possible.
    const partners = shuffle(Array.from({ length: 13 }, (_, i) => i)).slice(0, ROUND_SIZE);
    return partners.map((partner, idx) => {
      // Alternate orientation so learners see the commutative relationship.
      const flip = idx % 2 === 1 && family !== 0;
      return { a: flip ? partner : family, b: flip ? family : partner };
    });
  }

  function startRound(family) {
    state.family = family;
    state.questions = buildQuestions(family);
    state.index = 0;
    state.correct = 0;
    state.currentStreak = 0;
    state.bestStreak = 0;
    state.locked = false;
    $('round-label').textContent = `${family}s fact family`;
    showScreen('activity');
    renderQuestion();
  }

  function renderQuestion() {
    state.locked = false;
    const q = state.questions[state.index];
    const product = q.a * q.b;
    $('activity-title').textContent = `${q.a} × ${q.b} = ?`;
    $('question-hint').textContent = q.a === 0 || q.b === 0
      ? 'Think: zero groups or groups of zero make zero.'
      : `Think: ${q.a} equal group${q.a === 1 ? '' : 's'} of ${q.b}.`;
    $('question-count').textContent = `Question ${state.index + 1} of ${ROUND_SIZE}`;
    $('progress-fill').style.width = `${(state.index / ROUND_SIZE) * 100}%`;
    $('feedback-panel').hidden = true;
    $('feedback-panel').classList.remove('warm');

    renderArray(q.a, q.b);
    renderAnswers(product);
  }

  function renderArray(rows, cols) {
    const wrap = $('dot-array');
    wrap.innerHTML = '';
    $('array-label').textContent = rows === 0 || cols === 0 ? 'Zero groups make zero' : `${rows} row${rows === 1 ? '' : 's'} of ${cols}`;
    if (rows === 0 || cols === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-array';
      empty.textContent = '0 dots';
      wrap.appendChild(empty);
      wrap.style.gridTemplateColumns = '1fr';
      return;
    }
    wrap.style.gridTemplateColumns = `repeat(${Math.min(cols, 12)}, 14px)`;
    for (let i = 0; i < rows * cols; i++) {
      const dot = document.createElement('span');
      dot.className = 'dot';
      wrap.appendChild(dot);
    }
  }

  function makeDistractors(correct) {
    const candidates = new Set();
    const deltas = shuffle([-12,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,1,2,3,4,5,6,7,8,9,10,12]);
    for (const delta of deltas) {
      const value = correct + delta;
      if (value >= 0 && value <= 144 && value !== correct) candidates.add(value);
      if (candidates.size >= 3) break;
    }
    let fallback = 0;
    while (candidates.size < 3) {
      if (fallback !== correct) candidates.add(fallback);
      fallback++;
    }
    return [...candidates].slice(0, 3);
  }

  function renderAnswers(correct) {
    const choices = shuffle([correct, ...makeDistractors(correct)]);
    const grid = $('answer-grid');
    grid.innerHTML = '';
    choices.forEach(value => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'answer-btn';
      btn.textContent = value;
      btn.dataset.value = value;
      btn.addEventListener('click', () => checkAnswer(value, btn, correct));
      grid.appendChild(btn);
    });
  }

  function explanationFor(a, b, correct) {
    if (a === 0 || b === 0) return `Any number multiplied by 0 equals 0, so ${a} × ${b} = 0.`;
    if (a === 1) return `Multiplying by 1 keeps the other number the same, so 1 × ${b} = ${correct}.`;
    if (b === 1) return `Multiplying by 1 keeps the other number the same, so ${a} × 1 = ${correct}.`;
    if (a === 2 || b === 2) return `${a} × ${b} = ${correct}. A ×2 fact is the same as doubling the other factor.`;
    if (a === 5 || b === 5) return `${a} × ${b} = ${correct}. Products in the 5s family end in 0 or 5.`;
    if (a === 10 || b === 10) return `${a} × ${b} = ${correct}. A ×10 fact has a zero at the end.`;
    return `${a} × ${b} = ${correct}. You can picture ${a} equal groups of ${b}.`;
  }

  function checkAnswer(selected, button, correct) {
    if (state.locked) return;
    state.locked = true;
    const q = state.questions[state.index];
    const isCorrect = selected === correct;
    const buttons = [...document.querySelectorAll('.answer-btn')];
    buttons.forEach(btn => {
      btn.disabled = true;
      if (Number(btn.dataset.value) === correct) btn.classList.add('correct');
    });

    if (isCorrect) {
      state.correct++;
      state.currentStreak++;
      state.bestStreak = Math.max(state.bestStreak, state.currentStreak);
      $('feedback-icon').textContent = '✓';
      $('feedback-title').textContent = state.currentStreak >= 3 ? 'Great streak!' : 'Nice work!';
      $('feedback-message').textContent = explanationFor(q.a, q.b, correct);
    } else {
      state.currentStreak = 0;
      button.classList.add('incorrect');
      $('feedback-panel').classList.add('warm');
      $('feedback-icon').textContent = '↻';
      $('feedback-title').textContent = 'Good try — use the pattern.';
      $('feedback-message').textContent = `The answer is ${correct}. ${explanationFor(q.a, q.b, correct)}`;
    }

    $('feedback-panel').hidden = false;
    $('next-question').textContent = state.index === ROUND_SIZE - 1 ? 'See My Results' : 'Next Question';
    setTimeout(() => $('next-question').focus(), 70);
  }

  $('next-question').addEventListener('click', () => {
    if (state.index < ROUND_SIZE - 1) {
      state.index++;
      renderQuestion();
      setTimeout(() => $('activity-title').focus(), 40);
    } else {
      finishRound();
    }
  });

  function finishRound() {
    const progress = loadProgress();
    const fam = progress.families[state.family];
    fam.correct += state.correct;
    fam.total += ROUND_SIZE;
    fam.rounds += 1;
    progress.totalCorrect += state.correct;
    progress.totalQuestions += ROUND_SIZE;
    progress.totalRounds += 1;
    saveProgress(progress);

    const pct = Math.round((state.correct / ROUND_SIZE) * 100);
    $('results-title').textContent = pct >= 90 ? 'Quest mastered!' : pct >= 75 ? 'Strong progress!' : 'Good practice!';
    $('results-summary').textContent = `You practiced the ${state.family}s fact family.`;
    $('result-percent').textContent = `${pct}%`;
    $('result-correct').textContent = `${state.correct} / ${ROUND_SIZE}`;
    $('result-streak').textContent = state.bestStreak;
    $('result-rounds').textContent = progress.totalRounds;
    const ring = document.querySelector('.score-ring');
    ring.style.background = `conic-gradient(var(--ocean-700) ${pct * 3.6}deg, var(--sky-100) 0deg)`;

    const familyAccuracy = accuracyFor(state.family, progress);
    if (familyAccuracy < 75) {
      $('next-step-title').textContent = `Practice the ${state.family}s again`;
      $('next-step-text').textContent = `Your saved accuracy for this family is ${familyAccuracy}%. Another short round can help strengthen the facts that are still tricky.`;
    } else if (familyAccuracy < 90) {
      $('next-step-title').textContent = `One more ${state.family}s round`;
      $('next-step-text').textContent = `You are at ${familyAccuracy}% accuracy. Try another round and aim for 90% or better.`;
    } else {
      const next = suggestFamily(progress, state.family);
      $('next-step-title').textContent = next === state.family ? `Keep the ${state.family}s strong` : `Try the ${next}s fact family next`;
      $('next-step-text').textContent = `Your ${state.family}s are strong at ${familyAccuracy}% accuracy. Keep practicing or move to another family that needs attention.`;
    }
    $('progress-fill').style.width = '100%';
    showScreen('results');
  }

  $('practice-again').addEventListener('click', () => startRound(state.family));

  function suggestFamily(progress, exclude = null) {
    const scored = [];
    for (let i = 0; i <= 12; i++) {
      if (i === exclude) continue;
      const item = progress.families[i];
      const accuracy = item.total ? item.correct / item.total : -1;
      scored.push({ family: i, accuracy, total: item.total });
    }
    // First suggest an unpracticed family; otherwise lowest accuracy.
    const unpracticed = scored.find(x => x.total === 0);
    if (unpracticed) return unpracticed.family;
    scored.sort((a,b) => a.accuracy - b.accuracy || a.family - b.family);
    return scored[0]?.family ?? 0;
  }

  function renderProgress() {
    const progress = loadProgress();
    $('total-rounds').textContent = progress.totalRounds;
    $('total-questions').textContent = progress.totalQuestions;
    $('overall-accuracy').textContent = progress.totalQuestions ? `${Math.round(progress.totalCorrect / progress.totalQuestions * 100)}%` : '—';

    const list = $('progress-family-list');
    list.innerHTML = '';
    for (let i = 0; i <= 12; i++) {
      const item = progress.families[i];
      const acc = item.total ? Math.round(item.correct / item.total * 100) : null;
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'family-progress';
      row.setAttribute('aria-label', `${i}s family, ${acc === null ? 'not practiced' : `${acc}% accuracy`}. Practice this family.`);
      row.innerHTML = `<span class="family-name">${i}s</span><span class="bar"><span style="width:${acc ?? 0}%"></span></span><span class="family-score">${acc === null ? '—' : `${acc}%`}</span>`;
      row.addEventListener('click', () => startRound(i));
      list.appendChild(row);
    }

    if (progress.totalRounds === 0) {
      $('progress-next-title').textContent = 'Start with any family';
      $('progress-next-text').textContent = 'Pick a multiplication family from 0 through 12 and complete one short round.';
    } else {
      const next = suggestFamily(progress);
      const acc = accuracyFor(next, progress);
      $('progress-next-title').textContent = acc === null ? `Try the ${next}s fact family` : `Strengthen the ${next}s fact family`;
      $('progress-next-text').textContent = acc === null
        ? 'You have not practiced this family yet, so it is a good choice for your next quest.'
        : `This family currently has your lowest accuracy at ${acc}%. A focused round can help.`;
    }
  }

  $('reset-progress').addEventListener('click', () => {
    const ok = window.confirm('Reset all saved Math Fact Quest progress on this device?');
    if (!ok) return;
    localStorage.removeItem(STORAGE_KEY);
    renderProgress();
    renderFamilyGrid();
    showToast('Progress reset. You can start a fresh quest.');
  });

  function showToast(message) {
    const toast = $('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2400);
  }

  // Keyboard shortcut: Enter on feedback advances after an answer.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && ! $('feedback-panel').hidden && document.activeElement?.tagName !== 'BUTTON') {
      $('next-question').click();
    }
  });

  renderFamilyGrid();
  renderProgress();
})();
