(function() {
  // ---------- PRIZE INVENTORY (exact counts) ----------
  const rankAInventory = [
    { id: 'coding', label: 'Coding Class 10% Scholarship', count: 3, modalId: 'coding-modal' },
    { id: 'ielts', label: 'IELTS 30% Scholarship', count: 3, modalId: 'ielts-modal' },
    { id: 'ged', label: 'GED 50% Scholarship', count: 1, modalId: 'ged-modal' },
    { id: 'sat', label: 'SAT 20% Scholarship', count: 2, modalId: 'sat-modal' },
    { id: 'lcci', label: 'LCCI Level (1+2) 10% Scholarship', count: 1, modalId: 'lcci-modal' }
  ];

  const rankBInventory = [
    { id: 'tshirt', label: 'MSI T-Shirt', count: 5, modalId: 'tshirt-modal' },
    { id: 'cup', label: 'MSI Cup', count: 5, modalId: 'cup-modal' },
    { id: 'calendar', label: 'MSI Calendar', count: 6, modalId: 'calendar-modal' }
  ];

  function getTotalRankACount() {
    return rankAInventory.reduce((sum, p) => sum + p.count, 0);
  }
  function getTotalRankBCount() {
    return rankBInventory.reduce((sum, p) => sum + p.count, 0);
  }

  function updateCounters() {
    const rankACountSpan = document.getElementById('rankA-count');
    const rankBCountSpan = document.getElementById('rankB-count');
    if (rankACountSpan) rankACountSpan.textContent = getTotalRankACount();
    if (rankBCountSpan) rankBCountSpan.textContent = getTotalRankBCount();
  }

  function getAvailableRankA() { return rankAInventory.filter(p => p.count > 0); }
  function getAvailableRankB() { return rankBInventory.filter(p => p.count > 0); }

  function buildMatchPool() {
    const pool = [];
    const aAvailable = getAvailableRankA();
    if (aAvailable.length > 0) {
      const randomA = aAvailable[Math.floor(Math.random() * aAvailable.length)];
      pool.push({ rank: 'A', prize: { ...randomA } });
    } else {
      pool.push({ rank: 'Normal', prize: { id: 'notebook', label: 'MSI Notebook', modalId: 'normal-modal' } });
    }

    let bAvailable = getAvailableRankB();
    for (let i = 0; i < 2; i++) {
      if (bAvailable.length > 0) {
        const randomB = bAvailable[Math.floor(Math.random() * bAvailable.length)];
        pool.push({ rank: 'B', prize: { ...randomB } });
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

  const landing = document.getElementById('landing-overlay');
  const startBtn = document.getElementById('start-game-btn');
  const gameContent = document.getElementById('game-content');
  const chestContainer = document.getElementById('treasure-chest-container');
  const countdownBar = document.getElementById('modal-countdown-bar');

  const modalOverlays = {
    'normal-modal': document.getElementById('normal-modal'),
    'tshirt-modal': document.getElementById('tshirt-modal'),
    'cup-modal': document.getElementById('cup-modal'),
    'calendar-modal': document.getElementById('calendar-modal'),
    'coding-modal': document.getElementById('coding-modal'),
    'ielts-modal': document.getElementById('ielts-modal'),
    'ged-modal': document.getElementById('ged-modal'),
    'sat-modal': document.getElementById('sat-modal'),
    'lcci-modal': document.getElementById('lcci-modal')
  };

  let isModalOpen = false;
  let dismissTimer = null;
  const DISMISS_MS = 5000;

  function decrementPrize(rank, prizeId) {
    if (rank === 'A') {
      const target = rankAInventory.find(p => p.id === prizeId);
      if (target && target.count > 0) target.count--;
    } else if (rank === 'B') {
      const target = rankBInventory.find(p => p.id === prizeId);
      if (target && target.count > 0) target.count--;
    }
    updateCounters();
  }

  function showModalById(modalId) {
    if (isModalOpen) return;
    Object.values(modalOverlays).forEach(modal => modal.classList.add('hidden'));
    const target = modalOverlays[modalId];
    if (target) target.classList.remove('hidden');
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
    dismissTimer = setTimeout(() => {
      closeAllModalsAndReshuffle();
    }, DISMISS_MS);
  }

  function clearCountdown() {
    if (dismissTimer) clearTimeout(dismissTimer);
    countdownBar.classList.add('hidden');
    countdownBar.style.transition = 'none';
  }

  function closeAllModalsAndReshuffle() {
    clearCountdown();
    Object.values(modalOverlays).forEach(modal => modal.classList.add('hidden'));
    isModalOpen = false;
    generateNewMatch();
  }

  const NUM_CHESTS = 20;
  const TOP_SAFE = 22;
  const BOTTOM_SAFE = 15;
  const CHEST_W = 8.5;
  const CHEST_H = 11;
  const EDGE_PAD = 3.5;
  let placedRects = [];

  function isOverlap(box) {
    const pad = 1.0;
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
    const matchPool = buildMatchPool();

    for (let i = 0; i < NUM_CHESTS; i++) {
      let placed = false;
      let attempts = 0;
      let top = 0, left = 0;
      while (!placed && attempts < 200) {
        attempts++;
        top = TOP_SAFE + Math.random() * (100 - TOP_SAFE - BOTTOM_SAFE - CHEST_H);
        left = EDGE_PAD + Math.random() * (100 - EDGE_PAD * 2 - CHEST_W);
        const box = { top, left, w: CHEST_W, h: CHEST_H };
        if (!isOverlap(box)) {
          placed = true;
          placedRects.push(box);
        }
      }
      const chestData = matchPool[i];
      const img = document.createElement('img');
      img.src = 'pics/treasure_chest.png';
      img.className = 'treasure-chest';
      img.style.top = `${top}vh`;
      img.style.left = `${left}vw`;
      img.dataset.rank = chestData.rank;
      img.dataset.prizeId = chestData.prize.id;
      
      let modalId = 'normal-modal';
      if (chestData.rank === 'A' && chestData.prize.modalId) {
        modalId = chestData.prize.modalId;
      } else if (chestData.rank === 'B' && chestData.prize.modalId) {
        modalId = chestData.prize.modalId;
      }
      img.dataset.modalId = modalId;

      img.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isModalOpen) return;
        handleChestClick(img);
      });
      chestContainer.appendChild(img);
    }
  }

  function handleChestClick(img) {
    const rank = img.dataset.rank;
    const prizeId = img.dataset.prizeId;
    const modalId = img.dataset.modalId;
    decrementPrize(rank, prizeId);
    showModalById(modalId);
  }

  function bindCloseButtons() {
    const allCloseBtns = document.querySelectorAll('.close-modal-btn');
    allCloseBtns.forEach(btn => {
      btn.removeEventListener('click', closeAllModalsAndReshuffle);
      btn.addEventListener('click', closeAllModalsAndReshuffle);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalOpen) closeAllModalsAndReshuffle();
  });

  startBtn.addEventListener('click', () => {
    landing.classList.add('fade-out');
    gameContent.classList.remove('hidden');
    updateCounters();
    generateNewMatch();
    bindCloseButtons();
  });

  updateCounters();
})();