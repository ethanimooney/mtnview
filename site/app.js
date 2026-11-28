(() => {
  'use strict';

  const AERIALS = [
    { src: 'assets/aerial-yosemite.jpg', title: 'Yosemite Valley', sub: 'California' },
    { src: 'assets/aerial-highlands.jpg', title: 'Scottish Highlands', sub: 'Scotland' }
  ];

  const ICONS = {
    appletv: '<svg class="tv-dev-svg" viewBox="0 0 160 100" aria-hidden="true"><path fill="currentColor" d="M53.6 30.2c2.5-3 4.2-7.1 3.7-11.2-3.6.2-8 2.4-10.6 5.4-2.3 2.6-4.3 6.8-3.8 10.8 4 .3 8.1-2 10.7-5zm3.7 6.4c-5.9-.3-10.9 3.3-13.7 3.3-2.8 0-7.1-3.1-11.8-3-6.1.1-11.7 3.5-14.8 9-6.3 11-1.6 27.2 4.5 36.1 3 4.4 6.6 9.2 11.3 9 4.5-.2 6.3-2.9 11.7-2.9 5.4 0 7 2.9 11.8 2.8 4.9-.1 8-4.4 11-8.8 3.5-5 4.9-9.9 5-10.1-.1-.1-9.6-3.7-9.7-14.6-.1-9.1 7.5-13.5 7.8-13.7-4.3-6.3-11-7-13.1-7.1z"/><path fill="currentColor" d="M95.2 35.8v11.4h8.2v6.7h-8.2v19.8c0 4.1 1.9 6 5.6 6 1.1 0 2.1-.1 2.6-.2v6.6c-.9.3-2.5.5-4.4.5-7.8 0-11.6-3.8-11.6-11.7V53.9h-6.2v-6.7h6.2V35.8h7.8zm13.4 11.4h8.2l9.1 29.8h.2l9.1-29.8h8l-13.1 38.8h-8.4l-13.1-38.8z"/></svg>',
    ps5: '<svg class="tv-dev-svg" viewBox="0 0 120 120" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="38,24 52,48 24,48"/><circle cx="82" cy="36" r="13"/><path d="M27 71l22 22M49 71L27 93"/><rect x="70" y="70" width="24" height="24" rx="2"/></g></svg>',
    switch: '<svg class="tv-dev-svg" viewBox="0 0 120 120" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M37 20C25.4 20 16 29.4 16 41v38c0 11.6 9.4 21 21 21h15c1.7 0 3-1.3 3-3V23c0-1.7-1.3-3-3-3H37zm10 7.5H37c-7.5 0-13.5 6-13.5 13.5v38c0 7.5 6 13.5 13.5 13.5h10v-65zM36.5 54a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17zm31.5-34c-1.7 0-3 1.3-3 3v74c0 1.7 1.3 3 3 3h15c11.6 0 21-9.4 21-21V41c0-11.6-9.4-21-21-21H68zm14.5 54a9 9 0 1 1 0-18 9 9 0 0 1 0 18z"/></svg>',
    tvsettings: '<svg class="tv-dev-svg" viewBox="0 0 120 120" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="5.5" stroke-linecap="round"><line x1="22" y1="34" x2="98" y2="34"/><circle cx="46" cy="34" r="8" fill="currentColor"/><line x1="22" y1="60" x2="98" y2="60"/><circle cx="76" cy="60" r="8" fill="currentColor"/><line x1="22" y1="86" x2="98" y2="86"/><circle cx="52" cy="86" r="8" fill="currentColor"/></g></svg>'
  };

  const CARDS = [
    { id: 'appletv', name: 'Apple TV', port: 'HDMI 1', active: true, verb: 'to watch', icon: 'appletv' },
    { id: 'ps5', name: 'PlayStation 5', port: 'HDMI 3', active: false, verb: 'to play', icon: 'ps5' },
    { id: 'switch', name: 'Nintendo Switch', port: 'HDMI 4', active: false, verb: 'to play', icon: 'switch' },
    { id: 'tvsettings', name: 'TV Settings', port: 'webOS', active: false, verb: 'to open', icon: 'tvsettings' }
  ];

  const state = {
    cardIdx: 0,
    aerialIdx: 0,
    ambient: false,
    nightDim: false,
    oledBlack: false,
    switching: false,
    settingsOpen: false
  };

  const $ = (id) => document.getElementById(id);
  const tvScreen = $('tvScreen');
  const tvCardRow = $('tvCardRow');
  const tvHeroTitle = $('tvHeroTitle');
  const tvPromptVerb = $('tvPromptVerb');
  const tvPromptMeta = $('tvPromptMeta');
  const tvPowerTag = $('tvPowerTag');
  const tvStageBody = $('tvStageBody');
  const tvSwitching = $('tvSwitching');
  const tvSwIcon = $('tvSwIcon');
  const tvSwTitle = $('tvSwTitle');
  const tvSettingsOverlay = $('tvSettingsOverlay');
  const tvAerialList = $('tvAerialList');
  const tvMiniImg = $('tvMiniImg');
  const tvMiniCaption = $('tvMiniCaption');
  const tvLocTitle = $('tvLocTitle');
  const tvLocSub = $('tvLocSub');
  const tvToast = $('tvToast');
  const tvLed = $('tvLed');
  const aerialImgs = [$('aerialImg0'), $('aerialImg1')];

  let toastTimer = null;
  let switchTimer = null;

  function showToast(msg) {
    tvToast.textContent = msg;
    tvToast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => tvToast.classList.remove('is-on'), 2100);
  }

  function updateClock() {
    const now = new Date();
    let h = now.getHours();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const m = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${h}:${m}`;
    $('tvTime').textContent = timeStr;
    $('tvAmPm').textContent = ampm;
    $('tvAmbTime').textContent = timeStr;
    $('tvAmbAmPm').textContent = ampm;
    $('tvAmbDate').textContent = now.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  }

  function renderCards() {
    tvCardRow.innerHTML = CARDS.map((card, i) => `
      <button type="button" class="tv-card${i === state.cardIdx ? ' is-focus' : ''}" data-idx="${i}" role="option" aria-selected="${i === state.cardIdx}">
        ${card.active ? '<span class="tv-dot" aria-label="Active"></span>' : ''}
        <div class="tv-card-art">${ICONS[card.icon]}</div>
        <div class="tv-card-label">${card.name}</div>
      </button>
    `).join('');

    const cur = CARDS[state.cardIdx];
    tvHeroTitle.textContent = cur.name;
    tvPromptVerb.textContent = cur.verb;
    tvPromptMeta.textContent = cur.port;
    tvPowerTag.hidden = !cur.active;
  }

  function renderSettingsList() {
    tvAerialList.innerHTML = AERIALS.map((a, i) => `
      <button type="button" class="tv-ov-item${i === state.aerialIdx ? ' is-selected' : ''}" data-aerial="${i}">
        <div>
          <strong>${a.title}</strong>
          <span>${a.sub}</span>
        </div>
        <span>${i === state.aerialIdx ? '✓' : ''}</span>
      </button>
    `).join('');
    tvMiniImg.src = AERIALS[state.aerialIdx].src;
    tvMiniCaption.textContent = AERIALS[state.aerialIdx].title;
  }

  function syncModes() {
    tvScreen.classList.toggle('is-ambient', state.ambient);
    tvScreen.classList.toggle('is-night-dim', state.nightDim);
    tvScreen.classList.toggle('is-oled-black', state.oledBlack);
    tvLed.classList.toggle('is-standby', state.oledBlack);

    $('remRed').classList.toggle('is-active', state.oledBlack);
    $('remGreen').classList.toggle('is-active', state.nightDim);
    $('remYellow').classList.toggle('is-active', state.ambient);

    tvSwitching.hidden = !state.switching;
    tvStageBody.hidden = state.switching;
    tvSettingsOverlay.hidden = !state.settingsOpen;
  }

  function setAerial(idx) {
    state.aerialIdx = (idx + AERIALS.length) % AERIALS.length;
    aerialImgs.forEach((img, i) => img.classList.toggle('is-active', i === state.aerialIdx));
    tvLocTitle.textContent = AERIALS[state.aerialIdx].title;
    tvLocSub.textContent = AERIALS[state.aerialIdx].sub;
    renderSettingsList();
  }

  function selectCard(idx) {
    state.cardIdx = (idx + CARDS.length) % CARDS.length;
    if (state.ambient) state.ambient = false;
    if (state.oledBlack) state.oledBlack = false;
    if (state.switching) cancelSwitch();
    renderCards();
    syncModes();
  }

  function activateCurrentCard() {
    if (state.oledBlack) {
      state.oledBlack = false;
      syncModes();
      return;
    }
    if (state.ambient) {
      state.ambient = false;
      syncModes();
      return;
    }
    const cur = CARDS[state.cardIdx];
    if (cur.id === 'tvsettings') {
      state.settingsOpen = true;
      renderSettingsList();
      syncModes();
      return;
    }
    state.switching = true;
    tvSwIcon.innerHTML = ICONS[cur.icon];
    tvSwTitle.textContent = cur.name;
    syncModes();
    clearTimeout(switchTimer);
    switchTimer = setTimeout(() => {
      cancelSwitch();
      showToast(`On an LG TV, this switches directly to ${cur.port}`);
    }, 2600);
  }

  function cancelSwitch() {
    clearTimeout(switchTimer);
    state.switching = false;
    syncModes();
  }

  // Card clicks
  tvCardRow.addEventListener('click', (e) => {
    const btn = e.target.closest('.tv-card');
    if (!btn) return;
    const idx = Number(btn.dataset.idx);
    if (idx === state.cardIdx) {
      activateCurrentCard();
    } else {
      selectCard(idx);
    }
  });

  // Settings overlay interactions
  $('tvSettingsBtn').addEventListener('click', () => {
    state.settingsOpen = true;
    state.ambient = false;
    renderSettingsList();
    syncModes();
  });

  $('tvOvBack').addEventListener('click', () => {
    state.settingsOpen = false;
    syncModes();
  });

  tvAerialList.addEventListener('click', (e) => {
    const item = e.target.closest('.tv-ov-item');
    if (!item) return;
    setAerial(Number(item.dataset.aerial));
  });

  $('tvOvAmbient').addEventListener('click', () => {
    state.settingsOpen = false;
    state.ambient = true;
    syncModes();
  });

  $('tvOvNight').addEventListener('click', () => {
    state.nightDim = !state.nightDim;
    syncModes();
    showToast(state.nightDim ? 'Night Dim on' : 'Night Dim off');
  });

  $('tvSwBack').addEventListener('click', cancelSwitch);

  $('tvOledBlack').addEventListener('click', () => {
    state.oledBlack = false;
    syncModes();
  });

  // Remote bar buttons
  $('remLeft').addEventListener('click', () => selectCard(state.cardIdx - 1));
  $('remRight').addEventListener('click', () => selectCard(state.cardIdx + 1));
  $('remOk').addEventListener('click', activateCurrentCard);

  $('remRed').addEventListener('click', () => {
    state.oledBlack = !state.oledBlack;
    syncModes();
  });

  $('remGreen').addEventListener('click', () => {
    state.oledBlack = false;
    state.nightDim = !state.nightDim;
    syncModes();
    showToast(state.nightDim ? 'Night Dim on' : 'Night Dim off');
  });

  $('remYellow').addEventListener('click', () => {
    state.oledBlack = false;
    state.settingsOpen = false;
    state.switching = false;
    state.ambient = !state.ambient;
    syncModes();
  });

  $('remBlue').addEventListener('click', () => {
    state.oledBlack = false;
    setAerial(state.aerialIdx + 1);
    showToast(`Aerial: ${AERIALS[state.aerialIdx].title}`);
  });

  // Keyboard navigation when TV screen is focused
  tvScreen.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); selectCard(state.cardIdx - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); selectCard(state.cardIdx + 1); }
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      state.ambient = !state.ambient;
      syncModes();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activateCurrentCard();
    } else if (e.key === 'Escape' || e.key === 'Backspace') {
      e.preventDefault();
      state.oledBlack = false;
      state.ambient = false;
      state.settingsOpen = false;
      cancelSwitch();
      syncModes();
    }
  });

  // Install tabs
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
      });
      $('panel-quick').hidden = target !== 'quick';
      $('panel-rooted').hidden = target !== 'rooted';
    });
  });

  // Copy rooted setup commands
  $('copyCodeBtn').addEventListener('click', async () => {
    const text = $('rootedSnippet').textContent;
    const btn = $('copyCodeBtn');
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy commands'; }, 1800);
    } catch {
      btn.textContent = 'Select & copy';
    }
  });

  // Init
  updateClock();
  setInterval(updateClock, 15000);
  renderCards();
  renderSettingsList();
  syncModes();
})();
