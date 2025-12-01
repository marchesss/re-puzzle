document.addEventListener('DOMContentLoaded', () => {
  const menu = document.getElementById('menu');
  const gameDiv = document.getElementById('game');
  const startBtn = document.getElementById('startBtn');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const showBtn = document.getElementById('showBtn');
  const canvas = document.getElementById('puzzleCanvas');
  const ctx = canvas.getContext('2d');

  let selectedImageSrc = '';
  let pieces = [];
  const rows = 5;
  const cols = 8;
  const snapTolerance = 40; // увеличенное притягивание
  let puzzleImage = new Image();
  let draggingPiece = null;
  let offsetX = 0;
  let offsetY = 0;

  let groups = []; // массив групп скрепленных кусочков

  // --- Выбор картинки ---
  const images = document.querySelectorAll('#image-selection img');
  images.forEach(img => {
    img.addEventListener('click', () => {
      selectedImageSrc = img.dataset.img || img.src;
      images.forEach(i => i.style.border = '2px solid #00fff7');
      img.style.border = '2px solid #ff00ff';
      console.log('Выбрана картинка:', selectedImageSrc);
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
    groups = [];
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

  // --- Перемешать ---
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

  // --- Перетаскивание (мышь и сенсор) ---
  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return {x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top};
    }
    return {x: e.clientX - rect.left, y: e.clientY - rect.top};
  }

  function startDrag(e) {
    const pos = getPos(e);

    for (let i = pieces.length - 1; i >= 0; i--) {
      const p = pieces[i];

      if (!p.placed &&
          pos.x > p.currentX && pos.x < p.currentX + p.width &&
          pos.y > p.currentY && pos.y < p.currentY + p.height) {

        // проверяем, входит ли кусочек в группу
        let group = groups.find(g => g.includes(p));
        if (group) {
          draggingPiece = group;
        } else {
          draggingPiece = [p];
        }

        offsetX = pos.x - p.currentX;
        offsetY = pos.y - p.currentY;

        draggingPiece.forEach(piece => {
          pieces.push(pieces.splice(pieces.indexOf(piece), 1)[0]);
        });
        break;
      }
    }
    e.preventDefault();
  }

  function moveDrag(e) {
    if (!draggingPiece) return;
    const pos = getPos(e);

    draggingPiece.forEach(p => {
      p.currentX = pos.x - offsetX + (p.currentX - draggingPiece[0].currentX);
      p.currentY = pos.y - offsetY + (p.currentY - draggingPiece[0].currentY);
    });

    drawPieces();
    e.preventDefault();
  }

  function endDrag() {
    if (!draggingPiece) return;

    // проверяем притягивание
    draggingPiece.forEach(p => {
      if (Math.abs(p.currentX - p.correctX) < snapTolerance &&
          Math.abs(p.currentY - p.correctY) < snapTolerance) {
        p.currentX = p.correctX;
        p.currentY = p.correctY;
        p.placed = true;
      }
    });

    // объединяем кусочки группы, если несколько прилипли
    const connected = draggingPiece.filter(p => p.placed);
    if (connected.length > 1 && !groups.includes(connected)) {
      groups.push(connected);
    }

    draggingPiece = null;
    drawPieces();
  }

  canvas.addEventListener('mousedown', startDrag);
  canvas.addEventListener('mousemove', moveDrag);
  canvas.addEventListener('mouseup', endDrag);
  canvas.addEventListener('mouseleave', endDrag);

  canvas.addEventListener('touchstart', startDrag);
  canvas.addEventListener('touchmove', moveDrag);
  canvas.addEventListener('touchend', endDrag);
});
