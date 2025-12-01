let selectedImg = null;
let pieces = [];
let preview = false;
let pieceSize = 100;
let rows = 5;
let cols = 8;


function selectImage(el, src) {
document.querySelectorAll('.images img').forEach(i => i.classList.remove('selected'));
el.classList.add('selected');
selectedImg = src;
}


function startGame() {
if (!selectedImg) return alert("Выберите картинку!");
document.getElementById('menu').style.display = 'none';
document.getElementById('gameArea').style.display = 'block';
loadPuzzle();
}


function loadPuzzle() {
const img = new Image();
img.src = selectedImg;
img.onload = () => {
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
pieces = [];
const side = document.getElementById('sidePieces');
side.innerHTML = '';
for (let r = 0; r < rows; r++) {
for (let c = 0; c < cols; c++) {
const pieceCanvas = document.createElement('canvas');
pieceCanvas.width = pieceSize;
pieceCanvas.height = pieceSize;
const pctx = pieceCanvas.getContext('2d');
pctx.drawImage(img, c * pieceSize, r * pieceSize, pieceSize, pieceSize, 0, 0, pieceSize, pieceSize);
pieceCanvas.style.cursor = 'grab';
pieceCanvas.draggable = true;
pieceCanvas.dataset.row = r;
pieceCanvas.dataset.col = c;
pieceCanvas.ondragstart = e => {
e.dataTransfer.setData('row', r);
e.dataTransfer.setData('col', c);
};
pieces.push(pieceCanvas);
side.appendChild(pieceCanvas);
}
}
};
}


function shufflePieces() {
const side = document.getElementById('sidePieces');
const shuffled = [...pieces].sort(() => Math.random() - 0.5);
side.innerHTML = '';
shuffled.forEach(p => side.appendChild(p));
}


function togglePreview() {
preview = !preview;
const ctx = document.getElementById('gameCanvas').getContext('2d');
if (preview) {
const img = new Image();
img.src = selectedImg;
img.onload = () => {
ctx.globalAlpha = 0.4;
ctx.drawImage(img, 0, 0, 600, 600);
ctx.globalAlpha = 1;
};
} else {
ctx.clearRect(0, 0, 600, 600);
}
}
