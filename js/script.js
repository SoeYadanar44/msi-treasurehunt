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
    if (roundCount % 3 === 0) {
      prizePool.push('A'); // One Rank A prize every 3 rounds
    }
    prizePool.push('B', 'B'); // Two Rank B prizes every round
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
            switch (chest.dataset.prize) {
              case 'A':
                rankAModalOverlay.classList.remove('hidden');
                break;
              case 'B':
                rankBModalOverlay.classList.remove('hidden');
                break;
              case 'C':
                resultModalOverlay.classList.remove('hidden');
                break;
              case 'bomb':
                bombModalOverlay.classList.remove('hidden');
                break;
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
    bombModalOverlay.classList.add('hidden');
    rankAModalOverlay.classList.add('hidden');
    rankBModalOverlay.classList.add('hidden');
    setTimeout(createTreasureChests, 250);
  }

  startGameBtn.addEventListener('click', startGame);
  closeResultBtn.addEventListener('click', closeAllModals);
  closeBombBtn.addEventListener('click', closeAllModals);
  closeButtons.forEach(button => button.addEventListener('click', closeAllModals));
});