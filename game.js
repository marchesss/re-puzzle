const menu = document.getElementById('menu');
const gameDiv = document.getElementById('game');
const startBtn = document.getElementById('startBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const showBtn = document.getElementById('showBtn');
const canvas = document.getElementById('puzzleCanvas');
const ctx = canvas.getContext('2d');

let selectedImageSrc = '';
let pieces = [];
let pieceSize = 100;
let rows = 5;
let cols = 8;
let puzzleImage = new Image();

// Выбор картинки
document.querySelectorAll('#image-selection img').forEach(img => {
  img.addEventListener('click', () => {
    selectedImageSrc = img.dataset.img;
    document.querySelectorAll('#image-selection img').forEach(i => i.style.border = '2px solid #00fff7');
    img.style.border = '2px solid #ff00ff';
  });
});

// Старт игры
startBtn.addEventListener('click', () => {
  if (!selectedImageSrc) return alert('Выберите картинку!');
  menu.style.display = 'none';
  gameDiv.style.display = 'block';
  puzzleImage.src = selectedImageSrc;
  puzzleImage.onload = () => {
    canvas.width = puzzleImage.width;
    canvas.height = puzzleImage.height;
    createPieces();
    drawPieces();
  };
});

// Создание кусочков
function createPieces() {
  pieces = [];
  const w = puzzleImage.width / cols;
  const h = puzzleImage.height / rows;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      pieces.push({
        x: x * w,
        y: y * h,
        correctX: x * w,
        correctY: y * h,
        width: w,
        height: h,
        currentX: Math.random() * (canvas.width - w),
        currentY: Math.random() * (canvas.height - h)
      });
    }
  }
}

// Рисуем кусочки
function drawPieces(showAll=false) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pieces.forEach(p => {
    ctx.drawImage(
      puzzleImage,
      p.x, p.y, p.width, p.height,
      showAll ? p.correctX : p.currentX,
      showAll ? p.correctY : p.currentY,
      p.width, p.height
    );
  });
}

// Перемешать кусочки
shuffleBtn.addEventListener('click', () => {
  pieces.forEach(p => {
    p.currentX = Math.random() * (canvas.width - p.width);
    p.currentY = Math.random() * (canvas.height - p.height);
  });
  drawPieces();
});

// Показать картинку
showBtn.addEventListener('mousedown', () => drawPieces(true));
showBtn.addEventListener('mouseup', () => drawPieces());
