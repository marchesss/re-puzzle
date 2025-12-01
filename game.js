const menu = document.getElementById('menu');
const gameDiv = document.getElementById('game');
const startBtn = document.getElementById('startBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const showBtn = document.getElementById('showBtn');
const canvas = document.getElementById('puzzleCanvas');
const ctx = canvas.getContext('2d');

let selectedImageSrc = '';
let pieces = [];
let rows = 5;
let cols = 8;
let puzzleImage = new Image();

let draggingPiece = null;
let offsetX = 0;
let offsetY = 0;
const snapTolerance = 15; // расстояние для автопритягивания

// --- Выбор картинки ---
document.querySelectorAll('#image-selection img').forEach(img => {
  img.addEventListener('click', () => {
    selectedImageSrc = img.dataset.img;
    document.querySelectorAll('#image-selection img').forEach(i => i.style.border = '2px solid #00fff7');
    img.style.border = '2px solid #ff00ff';
  });
});

// --- Старт игры ---
startBtn.addEventListener('click', () => {
  if (!selectedImageSrc) {
    alert('Выберите картинку!');
    return;
  }
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

// --- Создание кусочков ---
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
        currentY: Math.random() * (canvas.height - h),
        placed: false
      });
    }
  }
}

// --- Рисуем кусочки ---
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

// --- Перемешать кусочки ---
shuffleBtn.addEventListener('click', () => {
  pieces.forEach(p => {
    if (!p.placed) {
      p.currentX = Math.random() * (canvas.width - p.width);
      p.currentY = Math.random() * (canvas.height - p.height);
    }
  });
  drawPieces();
});

// --- Показать картинку ---
showBtn.addEventListener('mousedown', () => drawPieces(true));
showBtn.addEventListener('mouseup', () => drawPieces());

// --- Работа с мышью (перетаскивание) ---
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  for (let i = pieces.length - 1; i >= 0; i--) {
    const p = pieces[i];
    if (!p.placed &&
        mx > p.currentX && mx < p.currentX + p.width &&
        my > p.currentY && my < p.currentY + p.height) {
      draggingPiece = p;
      offsetX = mx - p.currentX;
      offsetY = my - p.currentY;
      // чтобы перетаскиваемый кусочек рисовался поверх
      pieces.push(pieces.splice(i, 1)[0]);
      break;
    }
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (draggingPiece) {
    const rect = canvas.getBoundingClientRect();
    draggingPiece.currentX = e.clientX - rect.left - offsetX;
    draggingPiece.currentY = e.clientY - rect.top - offsetY;
    drawPieces();
  }
});

canvas.addEventListener('mouseup', () => {
  if (draggingPiece) {
    // автопритягивание
    if (Math.abs(draggingPiece.currentX - draggingPiece.correctX) < snapTolerance &&
        Math.abs(draggingPiece.currentY - draggingPiece.correctY) < snapTolerance) {
      draggingPiece.currentX = draggingPiece.correctX;
      draggingPiece.currentY = draggingPiece.correctY;
      draggingPiece.placed = true;
    }
    draggingPiece = null;
    drawPieces();
  }
});

canvas.addEventListener('mouseleave', () => {
  draggingPiece = null;
});
