const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const startSim = document.getElementById("start");
const resetGame = document.getElementById("reset");
const random = document.getElementById("random");


//config options
const GRID_SIZE = 1;
let CELL_SIZE = 1;
const UPDATE_INTERVAL = 2;
let lastUpdateTime = performance.now();

let lastFrameTime = performance.now();
let fps = 0;
const times = [];
let currArr = [];
let nextArr = [];
let mouseRow;
let mouseCol;
let isMouseDown = false;
let rows = Math.floor(canvas.height / GRID_SIZE)
let cols = Math.floor(canvas.width / GRID_SIZE)
const fpsCounter = document.getElementById("fps-counter");

let gameStarted = false;

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

function deepCopy2dArray(arr) {
    let cpy = [];
    for (let i = 0; i < arr.length; i++) {
        cpy[i] = [];
        for (let j = 0; j < arr[i].length; j++) {
            cpy[i][j] = arr[i][j];
        }
    }

    return cpy;
}

const toggleCell = (row, col) => {
    nextArr[row][col] = nextArr[row][col] == 1 ? 0 : 1;
};

const initializeArrays = (val) => {
    for (let i = 0; i < rows; i++) {
        currArr[i] = [];
        nextArr[i] = [];
        for (let j = 0; j < cols; j++) {
            if (val > Math.random()) {
                currArr[i][j] = 0;
                nextArr[i][j] = 0;
            }
            else {
                currArr[i][j] = 1;
                nextArr[i][j] = 1;
            }
            
        }
    }
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
    if (gameStarted) {
        currArr = deepCopy2dArray(nextArr);
    }
});
random.addEventListener('click', (e) => {
    candidates = initializeArrays(.95);
});

resetGame.addEventListener('click', (e) => {
    gameStarted = false;
    initializeArrays(1);
});

const drawGrid = (width, height) => {
    if (GRID_SIZE == 0) {return};
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);


    ctx.fillStyle = "green";
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let val = nextArr[i][j]
            if (val == 0) {
                continue;
            }

            ctx.fillRect(j * GRID_SIZE, i * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        }
    }

    // ctx.strokeStyle = "black"
    // for (let i = 0; i < width; i += GRID_SIZE) {
    //     //verticals
    //     ctx.beginPath();
    //     ctx.moveTo(i, 0);
    //     ctx.lineTo(i, height);
    //     ctx.stroke();
    //     // horizontals
    //     ctx.beginPath();
    //     ctx.moveTo(0, i);
    //     ctx.lineTo(canvas.width, i);
    //     ctx.stroke();

    // }
};

const setup = () => {
    initializeArrays(1);
    window.requestAnimationFrame(draw);
};

setup();

const hasTheRightNumberOfNeighbors = (row, col) => {
    let neighbors = 0
    let cellIsAlive = currArr[row][col] == 0 ? false : true
    
    for (let i = row - 1; i <= row + 1; i++) {
        for (let j = col - 1; j <= col + 1; j++) {
            //bounds checks
            if (i < 0 || j < 0 || j >= cols || i >= rows) {
                continue
            }
            if (currArr[i][j] == 1 && (i != row || j != col)) {
                neighbors++
            }
        }
        
    }
    if (cellIsAlive) {
        return neighbors >= 2 && neighbors <= 3 ? true : false
    }

    return neighbors == 3 ? true : false
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

function createLife() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            nextArr[i][j] = hasTheRightNumberOfNeighbors(i, j) ? 1 : 0
        }
    }
}


function draw() {
    const now = performance.now();
    drawGrid(canvas.width, canvas.height);
    updateFPS();
    if (gameStarted) {
        if (now - lastUpdateTime >= UPDATE_INTERVAL) { // Only update at intervals
            lastUpdateTime = now;
            createLife();
        }
    }
    currArr = deepCopy2dArray(nextArr);
    window.requestAnimationFrame(draw);
}