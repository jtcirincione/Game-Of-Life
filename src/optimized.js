/**
 * maintain a set of live cells and next cells
 * count neighbors of each cell
 * update next generation
 * 
 */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const startSim = document.getElementById("start");
const resetGame = document.getElementById("reset");
const random = document.getElementById("random");

//config options
const GRID_SIZE = 1;
const gridWidth = canvas.width / GRID_SIZE;
const gridHeight = canvas.height / GRID_SIZE;
const OFFSETS = [
    -gridWidth - 1, -gridWidth, -gridWidth + 1,
    -1,             +1,
     gridWidth - 1,  gridWidth,  gridWidth + 1
  ];
const UPDATE_INTERVAL = 1;
const TOTAL_CELLS = gridWidth * gridHeight;
let lastUpdateTime = performance.now();

let lastFrameTime = performance.now();
let fps = 0;
let gameStarted = false;
const times = [];
const fpsCounter = document.getElementById("fps-counter");
let mouseRow;
let mouseCol;
let isMouseDown = false;
let rows = Math.floor(canvas.height / GRID_SIZE)
let cols = Math.floor(canvas.width / GRID_SIZE)

let liveCells = new Set();
let nextLiveCells;

const toggleCell = (row, col) => {
    liveCells.add(row * gridWidth + col);
};

canvas.addEventListener('mouseup', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseCol = Math.floor((event.clientX - rect.left) / GRID_SIZE);
    mouseRow = Math.floor((event.clientY - rect.top) / GRID_SIZE);
    toggleCell(mouseRow, mouseCol)
    console.log("toggled")
});

startSim.addEventListener('click', (e) => {
    gameStarted = gameStarted ? false : true;
});
random.addEventListener('click', (e) => {
    initialize(.95);
});

resetGame.addEventListener('click', (e) => {
    gameStarted = false;
    initialize(1);
});

function updateFPS() {
    const now = performance.now();
    times.push(now);

    // Remove timestamps older than 1 second
    while (times[0] <= now - 1000) {
      times.shift();
    }

    fps = times.length;
    fpsCounter.innerHTML = `${fps}fps`
}

const initialize = (val) => {
    liveCells = new Set();
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (val <= Math.random()) {
                liveCells.add(i * gridWidth + j)
            }   
        }
    }
}

const setup = () => {
    initialize(1);
    window.requestAnimationFrame(draw);
};

setup();

const drawGrid = () => {
    if (GRID_SIZE == 0) {return};
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    ctx.fillStyle = "green";

    //since key = row * width + col we can derive through mod and floor division
    for (const key of liveCells) {
        let col = key % gridWidth;
        let row = Math.floor(key / gridWidth);
        ctx.fillRect(col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    }
};
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function createLife() {
    let neighbors = new Map();
    for (const cell of liveCells) {
        const cellCol = cell % gridWidth;
        for (const offset of OFFSETS) {
            const n = cell + offset;
            let r = Math.floor(n / gridWidth);
            let c = n % gridWidth;
            if (r < 0 || c < 0 || r >= rows || c >= cols) {
                continue;
            }
            // Prevent horizontal wrap: neighbor column must be adjacent to source column
            if (Math.abs(c - cellCol) > 1) {
                continue;
            }
            neighbors.set(n, (neighbors.get(n) || 0) + 1);
        }

    }


    let nextLiveCells = new Set();

    for (const [cell, count] of neighbors) {
    const alive = liveCells.has(cell);
    // console.log("count = " + count)

    if (
        (alive && (count === 2 || count === 3)) ||
        (!alive && count === 3)
    ) {
        nextLiveCells.add(cell);
    }
    }
    // console.log(nextLiveCells)
    liveCells = structuredClone(nextLiveCells);
    // await sleep(4000)
}

function draw() {
    const now = performance.now();
    drawGrid();
    updateFPS();
    if (gameStarted) {
        if (now - lastUpdateTime >= UPDATE_INTERVAL) { // Only update at intervals
            lastUpdateTime = now;
            createLife();
        }
    }
    
    window.requestAnimationFrame(draw);
}