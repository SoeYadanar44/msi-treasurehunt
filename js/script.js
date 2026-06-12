// script.js — MSI Treasure Hunt (Performance Optimized)
(function () {
  // ===== PRIZE INVENTORY =====
  const rankAInventory = [
    { id: 'coding', label: 'Coding Class 10% Scholarship', count: 3, modalId: 'coding-modal' },
    { id: 'ielts',  label: 'IELTS 30% Scholarship',         count: 3, modalId: 'ielts-modal'  },
    { id: 'ged',    label: 'GED 50% Scholarship',           count: 1, modalId: 'ged-modal'    },
    { id: 'sat',    label: 'SAT 20% Scholarship',           count: 2, modalId: 'sat-modal'    },
    { id: 'lcci',   label: 'LCCI Level (1+2) 10% Scholarship', count: 1, modalId: 'lcci-modal' }
  ];

  const rankBInventory = [
    { id: 'tshirt',   label: 'MSI T-Shirt',  count: 5, modalId: 'tshirt-modal' },
    { id: 'cup',      label: 'MSI Cup',      count: 5, modalId: 'cup-modal' },
    { id: 'calendar', label: 'MSI Calendar', count: 6, modalId: 'calendar-modal' }
  ];

  const totalA = () => rankAInventory.reduce((s, p) => s + p.count, 0);
  const totalB = () => rankBInventory.reduce((s, p) => s + p.count, 0);

  function bumpCounter(el, value) {
    if (!el) return;
    if (el.textContent == value) return;
    el.textContent = value;
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  }

  function updateCounters() {
    bumpCounter(document.getElementById('rankA-count'), totalA());
    bumpCounter(document.getElementById('rankB-count'), totalB());
  }

  const availableA = () => rankAInventory.filter(p => p.count > 0);
  const availableB = () => rankBInventory.filter(p => p.count > 0);

  function buildMatchPool() {
    const pool = [];
    const aAv = availableA();
    if (aAv.length > 0) {
      const r = aAv[Math.floor(Math.random() * aAv.length)];
      pool.push({ rank: 'A', prize: { ...r } });
    } else {
      pool.push({ rank: 'Normal', prize: { id: 'notebook', label: 'MSI Notebook', modalId: 'normal-modal' } });
    }

    const bAv = availableB();
    for (let i = 0; i < 2; i++) {
      if (bAv.length > 0) {
        const r = bAv[Math.floor(Math.random() * bAv.length)];
        pool.push({ rank: 'B', prize: { ...r } });
      } else {
        pool.push({ rank: 'Normal', prize: { id: 'notebook', label: 'MSI Notebook', modalId: 'normal-modal' } });
      }
    }

    while (pool.length < 20) {
      pool.push({ rank: 'Normal', prize: { id: 'notebook', label: 'MSI Notebook', modalId: 'normal-modal' } });
    }

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  }

  // ===== DOM REFS =====
  const landing       = document.getElementById('landing-overlay');
  const startBtn      = document.getElementById('start-game-btn');
  const gameContent   = document.getElementById('game-content');
  const chestContainer= document.getElementById('treasure-chest-container');
  const countdownBar  = document.getElementById('modal-countdown-bar');
  const burstLayer    = document.getElementById('burst-layer');

  const modalIds = ['normal-modal','tshirt-modal','cup-modal','calendar-modal',
                    'coding-modal','ielts-modal','ged-modal','sat-modal','lcci-modal'];
  const modalOverlays = Object.fromEntries(modalIds.map(id => [id, document.getElementById(id)]));

  let isModalOpen = false;
  let dismissTimer = null;
  const DISMISS_MS = 5000;

  // ===== PRIZE DECREMENT =====
  function decrementPrize(rank, prizeId) {
    if (rank === 'A') {
      const t = rankAInventory.find(p => p.id === prizeId);
      if (t && t.count > 0) t.count--;
    } else if (rank === 'B') {
      const t = rankBInventory.find(p => p.id === prizeId);
      if (t && t.count > 0) t.count--;
    }
    updateCounters();
  }

  // ===== CONFETTI BURST =====
  const RANK_COLORS = {
    A: ['#ffe27a', '#ffd24a', '#fff3a0', '#ffb347', '#ffffff'],
    B: ['#aee0ff', '#5aa0e0', '#ffffff', '#b6f0ff', '#dfeeff'],
    Normal: ['#cfd8ec', '#9fb0d0', '#ffffff', '#e8eef9']
  };
  function spawnBurst(x, y, rank) {
    const colors = RANK_COLORS[rank] || RANK_COLORS.Normal;
    const count = rank === 'A' ? 32 : (rank === 'B' ? 24 : 16);
    for (let i = 0; i < count; i++) {
      const c = document.createElement('span');
      c.className = 'confetti';
      const angle = Math.random() * Math.PI * 2;
      const dist = 80 + Math.random() * (rank === 'A' ? 220 : 160);
      const cx = Math.cos(angle) * dist;
      const cy = Math.sin(angle) * dist - 40;
      c.style.left = x + 'px';
      c.style.top  = y + 'px';
      c.style.background = colors[Math.floor(Math.random() * colors.length)];
      c.style.setProperty('--cx', cx + 'px');
      c.style.setProperty('--cy', cy + 'px');
      c.style.setProperty('--cr', (Math.random() * 720 - 360) + 'deg');
      c.style.width = c.style.height = (4 + Math.random() * 8) + 'px';
      c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      c.style.animationDuration = (700 + Math.random() * 500) + 'ms';
      burstLayer.appendChild(c);
      setTimeout(() => c.remove(), 1300);
    }
  }

  // ===== MODAL CONTROL =====
  function showModalById(modalId) {
    if (isModalOpen) return;
    Object.values(modalOverlays).forEach(m => {
      m.classList.add('hidden');
      m.classList.remove('active', 'closing');
    });

    const target = modalOverlays[modalId];
    if (target) {
      target.classList.remove('hidden');
      requestAnimationFrame(() => target.classList.add('active'));
    }
    isModalOpen = true;
    startCountdown();
  }

  function startCountdown() {
    if (dismissTimer) clearTimeout(dismissTimer);
    countdownBar.classList.remove('hidden');
    countdownBar.style.transition = 'none';
    countdownBar.style.width = '100%';
    void countdownBar.offsetWidth;
    countdownBar.style.transition = `width ${DISMISS_MS}ms linear`;
    countdownBar.style.width = '0%';

    dismissTimer = setTimeout(() => closeAllModalsAndReshuffle(), DISMISS_MS);
  }

  function clearCountdown() {
    if (dismissTimer) clearTimeout(dismissTimer);
    countdownBar.classList.add('hidden');
    countdownBar.style.transition = 'none';
  }

  function closeAllModalsAndReshuffle() {
    if (!isModalOpen) return;
    clearCountdown();
    Object.values(modalOverlays).forEach(m => {
      if (m.classList.contains('active')) {
        m.classList.add('closing');
        m.classList.remove('active');
        setTimeout(() => {
          m.classList.add('hidden');
          m.classList.remove('closing');
        }, 300);
      }
    });
    isModalOpen = false;

    setTimeout(() => generateNewMatch(), 350);
  }

  // ===== CHEST LAYOUT =====
  const NUM_CHESTS = 20;
  const TOP_SAFE = 22;
  const BOTTOM_SAFE = 18;
  const CHEST_W = 8.5;
  const CHEST_H = 11;
  const EDGE_PAD = 4;
  let placedRects = [];

  function isOverlap(box) {
    const pad = 1.5;
    return placedRects.some(b =>
      box.left < b.left + b.w + pad &&
      box.left + box.w > b.left - pad &&
      box.top < b.top + b.h + pad &&
      box.top + box.h > b.top - pad
    );
  }

  function generateNewMatch() {
    chestContainer.innerHTML = '';
    placedRects = [];
    const pool = buildMatchPool();
    const chestElements = [];

    for (let i = 0; i < NUM_CHESTS; i++) {
      let placed = false, attempts = 0, top = 0, left = 0;
      while (!placed && attempts < 300) {
        attempts++;
        top  = TOP_SAFE + Math.random() * (100 - TOP_SAFE - BOTTOM_SAFE - CHEST_H);
        left = EDGE_PAD + Math.random() * (100 - EDGE_PAD * 2 - CHEST_W);
        const box = { top, left, w: CHEST_W, h: CHEST_H };
        if (!isOverlap(box)) { placed = true; placedRects.push(box); }
      }

      const data = pool[i];
      const img = document.createElement('img');
      img.src = 'pics/treasure_chest.png';
      img.className = 'treasure-chest chest-entrance';
      img.style.top = `${top}vh`;
      img.style.left = `${left}vw`;

      img.dataset.rank = data.rank;
      img.dataset.prizeId = data.prize.id;
      img.dataset.modalId = (data.rank !== 'Normal' && data.prize.modalId) ? data.prize.modalId : 'normal-modal';

      img.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isModalOpen) return;
        handleChestClick(img, e);
      });
      chestContainer.appendChild(img);
      chestElements.push(img);
    }
    
    requestAnimationFrame(() => {
      chestElements.forEach(img => {
        img.classList.add('visible');
      });
    });
  }

  function handleChestClick(img, ev) {
    if (isModalOpen) return;

    const rect = img.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    spawnBurst(cx, cy, img.dataset.rank);

    img.classList.add('chest-opening');
    setTimeout(() => {
      const rank = img.dataset.rank;
      const prizeId = img.dataset.prizeId;
      const modalId = img.dataset.modalId;

      decrementPrize(rank, prizeId);
      showModalById(modalId);
      img.style.visibility = 'hidden';
    }, 380);
  }

  function preloadImages() {
    const images = [
      'pics/notebook.png', 'pics/tee.png', 'pics/cup.png', 'pics/calendar.png',
      'pics/coding.png', 'pics/ielts.png', 'pics/ged.png', 'pics/sat.png', 'pics/lcci.png',
      'pics/treasure_chest.png', 'pics/mascot.png', 'pics/logo.png'
    ];
    images.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
      const imgCache = new Image();
      imgCache.src = src;
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalOpen) closeAllModalsAndReshuffle();
  });
  Object.values(modalOverlays).forEach(overlay => {
    overlay.addEventListener('click', () => {
      if (isModalOpen) closeAllModalsAndReshuffle();
    });
  });

  startBtn.addEventListener('click', () => {
    landing.classList.add('fade-out');
    setTimeout(() => {
      gameContent.classList.remove('hidden');
      updateCounters();
      generateNewMatch();
    }, 700);
  });

  preloadImages();
  updateCounters();
})();