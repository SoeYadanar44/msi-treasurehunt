document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('treasure-chest-container');
  const instructionModalOverlay = document.getElementById('instruction-modal-overlay');
  const startGameBtn = document.getElementById('start-game-btn');
  const gameContent = document.getElementById('game-content');
  const resultModalOverlay = document.getElementById('result-modal-overlay');
  const closeResultBtn = document.getElementById('close-result-btn');
  const bombModalOverlay = document.getElementById('bomb-modal-overlay');
  const closeBombBtn = document.getElementById('close-bomb-btn');
  const rankAModalOverlay = document.getElementById('rank-a-modal-overlay');
  const rankBModalOverlay = document.getElementById('rank-b-modal-overlay');
  const closeButtons = document.querySelectorAll('.close-btn');

  const numChests = 12;
  const placedChests = [];
  let roundCount = 0;
  let isModalOpen = false;

  const CHEST_WIDTH_VW = 10;
  const CHEST_HEIGHT_VH = 10;

  function checkOverlap(newChestBox) {
    for (const existingChest of placedChests) {
      if (
        newChestBox.left < existingChest.left + existingChest.width &&
        newChestBox.left + newChestBox.width > existingChest.left &&
        newChestBox.top < existingChest.top + existingChest.height &&
        newChestBox.top + newChestBox.height > existingChest.top
      ) {
        return true;
      }
    }
    return false;
  }

  function createTreasureChests() {
    container.innerHTML = '';
    placedChests.length = 0;
    roundCount++;

    // Define the prize pool for this round
    const prizePool = [];
    prizePool.push('A'); // One Rank A prize every round
    prizePool.push('B', 'B', 'B'); // Three Rank B prizes every round
    prizePool.push('bomb', 'bomb'); // Two bombs

    // Fill the rest with Rank C prizes
    const numPrizes = prizePool.length;
    for (let i = 0; i < numChests - numPrizes; i++) {
      prizePool.push('C');
    }

    // Shuffle the prize pool
    for (let i = prizePool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [prizePool[i], prizePool[j]] = [prizePool[j], prizePool[i]];
    }

    const maxAttempts = 50;

    for (let i = 0; i < numChests; i++) {
      let attempts = 0;
      let positionFound = false;

      while (attempts < maxAttempts && !positionFound) {
        const randomTop = Math.random() * (100 - CHEST_HEIGHT_VH);
        const randomLeft = Math.random() * (100 - CHEST_WIDTH_VW);

        const newChestBox = {
          top: randomTop,
          left: randomLeft,
          width: CHEST_WIDTH_VW,
          height: CHEST_HEIGHT_VH,
        };

        if (!checkOverlap(newChestBox)) {
          const chest = document.createElement('img');
          chest.src = 'pics/treasure_chest.png';
          chest.classList.add('treasure-chest');
          chest.style.top = `${randomTop}vh`;
          chest.style.left = `${randomLeft}vw`;

          const prize = prizePool[i];
          chest.dataset.prize = prize;

          chest.addEventListener('click', () => {
            if (isModalOpen) return; // Prevent multiple modals
            let overlayToShow = null;
            switch (chest.dataset.prize) {
              case 'A':
                overlayToShow = rankAModalOverlay;
                break;
              case 'B':
                overlayToShow = rankBModalOverlay;
                break;
              case 'C':
                overlayToShow = resultModalOverlay;
                break;
              case 'bomb':
                overlayToShow = bombModalOverlay;
                break;
              default:
                console.error('Invalid prize type:', chest.dataset.prize);
            }
            if (overlayToShow) {
              isModalOpen = true;
              overlayToShow.classList.remove('hidden');
              overlayToShow.classList.add('overlay-visible');
              overlayToShow.setAttribute('aria-hidden', 'false');
              const modalFocusable = overlayToShow.querySelector('button, [tabindex], a, input') || overlayToShow.firstElementChild;
              if (modalFocusable && typeof modalFocusable.focus === 'function') modalFocusable.focus();
            }
          });

          container.appendChild(chest);
          placedChests.push(newChestBox);
          positionFound = true;
        }
        attempts++;
      }

      if (!positionFound) {
        console.warn(`Could not find a non-overlapping position for chest ${i + 1}.`);
      }
    }
  }

  function startGame() {
    instructionModalOverlay.classList.add('fade-out');
    gameContent.classList.remove('hidden');
    createTreasureChests();
  }

  function closeAllModals() {
    resultModalOverlay.classList.add('hidden');
    resultModalOverlay.classList.remove('overlay-visible');
    resultModalOverlay.setAttribute('aria-hidden', 'true');

    bombModalOverlay.classList.add('hidden');
    bombModalOverlay.classList.remove('overlay-visible');
    bombModalOverlay.setAttribute('aria-hidden', 'true');

    rankAModalOverlay.classList.add('hidden');
    rankAModalOverlay.classList.remove('overlay-visible');
    rankAModalOverlay.setAttribute('aria-hidden', 'true');

    rankBModalOverlay.classList.add('hidden');
    rankBModalOverlay.classList.remove('overlay-visible');
    rankBModalOverlay.setAttribute('aria-hidden', 'true');

    isModalOpen = false;
    setTimeout(createTreasureChests, 250);
  }

  startGameBtn.addEventListener('click', startGame);
  closeResultBtn.addEventListener('click', closeAllModals);
  closeBombBtn.addEventListener('click', closeAllModals);
  closeButtons.forEach(button => button.addEventListener('click', closeAllModals));
});