// Selectors
const gridContainer = document.querySelector('.grid-container');
const movesCounter = document.getElementById('moves');
const timeCounter = document.getElementById('time');
const restartButton = document.getElementById('restart');
const hintButton = document.getElementById('hint');
const startButton = document.getElementById('start');
const levelSelector = document.getElementById('level');
const themeSelector = document.getElementById('theme');
const matchSound = document.getElementById('match-sound');
const mismatchSound = document.getElementById('mismatch-sound');
const winSound = document.getElementById('win-sound');

// Variables
let firstCard = null;
let secondCard = null;
let hasFlipped = false;
let lockBoard = false;
let moves = 0;
let timer = null;
let seconds = 0;
let minutes = 0;
let theme = 'animals';
let level = 'easy';  // Start at easy level
let hintUses = 3;

// Themes with image URLs
const themes = {
  animals: [
    'images/dog.png',
    'images/cat.jpg',
    'images/fox.jpg',
    'images/panda.jpg',
    'images/lion.jpg',
    'images/frog.jpg',
    'images/kangaroo.jpg',
    'images/chicken.jpg'
  ],
  emojis: [
    'emojies/star.jpg',
    'emojies/apple.jpg',
    'emojies/rocket.jpg',
    'emojies/confetti.jpg',
    'emojies/pumpkin.jpg',
    'emojies/heart.jpg',
    'emojies/rainbow.jpg',
    'emojies/fire.jpg'
  ],
  colors: [
    'color/red.jpg',
    'color/orange.jpg',
    'color/purple.jpg',
    'color/black.jpg',
    'color/yellow.jpg',
    'color/blue.png',
    'color/green.jpg',
    'color/white.jpg'
  ],
  fruits: [
    'fruits/apple.jpg',
    'fruits/banana.jpg',
    'fruits/cherry.jpg',
    'fruits/grapes.jpg',
    'fruits/orange.jpg',
    'fruits/pear.jpg',
    'fruits/strawberry.jpg',
    'fruits/pineapple.jpg'
  ],
  shapes: [
    'shapes/circle.jpg',
    'shapes/triangle.jpg',
    'shapes/square.jpg',
    'shapes/hexagon.jpg',
    'shapes/star.jpg',
    'shapes/rectangle.jpg',
    'shapes/heart.jpg',
    'shapes/fsdiamond.jpg'
  ],
};

// Dynamic Grid
const levels = {
  easy: 6,  // 9 tiles for easy level (3x3 grid)
  medium: 12,
  hard: 16
};

// Timer
const startTimer = () => {
  timer = setInterval(() => {
    seconds++;
    if (seconds === 60) {
      minutes++;
      seconds = 0;
    }
    timeCounter.textContent = `Time: ${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, 1000);
};

const stopTimer = () => clearInterval(timer);

// Update Moves
const updateMoves = () => {
  moves++;
  movesCounter.textContent = `Moves: ${moves}`;
};

// Shuffle Array
const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

// Create Cards
const createCards = () => {
  let icons = [];
  const totalCards = levels[level];

  // Set theme-specific icons based on selected theme
  if (theme === 'animals') {
    icons = themes.animals;
  } else if (theme === 'emojis') {
    icons = themes.emojis;
  } else if (theme === 'colors') {
    icons = themes.colors;
  } else if (theme === 'fruits') {
    icons = themes.fruits;
  } else if (theme === 'shapes') {
    icons = themes.shapes;
  }

  // For each level, select only half the icons to create pairs
  const selectedIcons = icons.slice(0, totalCards / 2);
  const cardData = [...selectedIcons, ...selectedIcons];
  shuffle(cardData);

  gridContainer.innerHTML = '';
  cardData.forEach(icon => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      <div class="card-front">
        <img src="qn.png" alt="?" class="card-image">
      </div>
      <div class="card-back">
        <img src="${icon}" alt="image" class="card-image">
      </div>
    `;
    card.addEventListener('click', flipCard);
    gridContainer.appendChild(card);
  });

  // Adjust grid layout based on the level's total cards (for 3x3 in easy level)
  const gridSize = Math.ceil(Math.sqrt(totalCards)); // Ensures even grid layout
  gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
};

// Flip Card
const flipCard = function () {
  if (lockBoard || this === firstCard || this.classList.contains('flip')) return; // Prevent flipping already flipped cards

  this.classList.add('flip');
  if (!hasFlipped) {
    hasFlipped = true;
    firstCard = this;
  } else {
    secondCard = this;
    checkMatch();
  }
};

// Check Match
const checkMatch = () => {
  lockBoard = true;
  const isMatch = firstCard.innerHTML === secondCard.innerHTML;

  setTimeout(() => {
    if (isMatch) {
      matchSound.play();
      firstCard.removeEventListener('click', flipCard);
      secondCard.removeEventListener('click', flipCard);
      firstCard.classList.add('match');
      secondCard.classList.add('match');
    } else {
      mismatchSound.play();
      firstCard.classList.remove('flip');
      secondCard.classList.remove('flip');
    }

    resetCards();

    if (document.querySelectorAll('.card:not(.flip)').length === 0) {
      winSound.play();
      stopTimer();

      // Prepare the winning details
      const timeFormatted = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

      // Redirect to win.html and pass the moves and time as URL parameters
      setTimeout(() => {
        window.location.href = `game-result.html?moves=${moves}&time=${timeFormatted}`;
      }, 500);

      restartButton.classList.remove('hide');
    } else {
      lockBoard = false;
    }
  }, 1000);

  updateMoves();
};

// Reset Cards
const resetCards = () => {
  hasFlipped = false;
  lockBoard = false;
  firstCard = null;
  secondCard = null;
};

// Start Game
const startGame = () => {
  theme = themeSelector.value;
  level = levelSelector.value;
  moves = 0;
  seconds = 0;
  minutes = 0;
  hintUses = 3;

  movesCounter.textContent = 'Moves: 0';
  timeCounter.textContent = 'Time: 00:00';
  restartButton.classList.add('hide');
  hintButton.classList.remove('hide');
  stopTimer();
  startTimer();
  createCards();
};

// Hint
hintButton.addEventListener('click', () => {
  if (hintUses > 0) {
    hintUses--;
    const flippedCards = document.querySelectorAll('.card:not(.flip):not(.match)');
    
    if (flippedCards.length > 0) {
      const cardToFlip = flippedCards[Math.floor(Math.random() * flippedCards.length)];
      cardToFlip.classList.add('flip');

      setTimeout(() => {
        cardToFlip.classList.remove('flip');
      }, 1000);
    }
  } else {
    alert('No hints left!');
  }
});

// Event Listeners
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

// Dropdown Menu
document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
  const header = dropdown.querySelector('.dropdown-header');
  const items = dropdown.querySelectorAll('.dropdown-item');

  header.addEventListener('click', () => {
    dropdown.classList.toggle('active');
  });

  items.forEach(item => {
    item.addEventListener('click', () => {
      header.textContent = item.textContent;
      dropdown.classList.remove('active');
      items.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
    });
  });
});

document.body.style.backgroundImage = "url('122.jpg')";
document.body.style.backgroundSize = "cover";
document.body.style.backgroundPosition = "center center";
document.body.style.backgroundRepeat = "no-repeat";
document.body.style.height = "100vh";
document.body.style.margin = "0"; // Optional: remove margin
