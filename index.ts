const canvas = document.querySelector("canvas");
if (canvas === null) {
    throw new Error("Canvas not found!");
}

const ctx = canvas.getContext('2d');
if (ctx === null) {
   throw new Error('Could not initialize 2d context');
}

canvas.width =  800;
canvas.height = 800;

ctx.fillStyle = "#202020"
ctx.fillRect(0,0,canvas.width, canvas.height);


const gridSlider = document.getElementById("grid") as HTMLInputElement;
if (gridSlider === null) {
    throw new Error("Grid slider is missing");
}

let COLS = parseInt(gridSlider.value);
let ROWS = COLS;

let CELL_HEIGHT: number = canvas.height / ROWS
let CELL_WIDTH: number  =  canvas.width / COLS

const selectedPaintTool = document.querySelector('input[name="paint"]:checked') as HTMLInputElement;
if (selectedPaintTool == null) {
    throw new Error("No paint tool selected");
}

type Tool = "draw" | "erase";
let paint: Tool = selectedPaintTool.value as Tool;

function initCells() {
    CELL_HEIGHT =  canvas!.height / ROWS
    CELL_WIDTH  =  canvas!.width / COLS
}

initCells();

let playing = false;

type State = 1 | 0;
let grid: Array<Array<State>> = [];

function initGrid() {
    grid = [];
    for (let row = 0; row < ROWS; ++row) {
        let r: Array<State> = []
        for (let col = 0; col < COLS; ++col) {
            r.push(0);
        }
        grid.push(r);
    }
}

initGrid();

console.log(grid);

canvas.addEventListener("mousemove", (e) => {
    if(e.buttons == 1) {
        const row = Math.floor(e.offsetX/CELL_WIDTH);
        const col = Math.floor(e.offsetY/CELL_HEIGHT);

        if (paint == "draw") {
            grid[row][col] = 1;
        } else {
            grid[row][col] = 0;
        }
        drawGrid();
    }
})

const playButton = document.getElementById("play") as HTMLButtonElement;
const pauseButton = document.getElementById("pause") as HTMLButtonElement;
const resetButton = document.getElementById("reset") as HTMLButtonElement;


if (playButton === null) {
    throw new Error("Play button is missing");
}
if (pauseButton === null) {
    throw new Error("Pause button is missing");
}
if (resetButton === null) {
    throw new Error("Reset button is missing");
}

gridSlider.onchange = function() {
    let gridValue = parseInt(gridSlider.value);
    COLS = gridValue;
    ROWS = gridValue;
    initCells();
    initGrid();
    drawGrid();
}

pauseButton.disabled = true;

playButton.addEventListener("click", (e) => {
    playing = true;
    toggleDisabled();
    simulateLoop();
})

pauseButton.addEventListener("click", (e) => {
    playing = false;
    toggleDisabled();
})

resetButton.addEventListener("click", (e) => {
    initGrid();
    drawGrid();
})

function changePaintTool(tool: Tool) {
    paint = tool;
}

function toggleDisabled() {
    let isPlayDisabled = playButton.disabled as boolean
    if (isPlayDisabled) {
        playButton.disabled = false;
        pauseButton.disabled = true;
    } else {
        playButton.disabled = true;
        pauseButton.disabled = false;
    }
}

function simulateLoop() {
    if (playing) {
        setTimeout(function () {
            simulate();
            simulateLoop();
        }, 100)
    }
}

function simulate() {
   let tempBoard: Array<Array<State>> = []; 
   for (let r = 0; r < ROWS; ++r) {
        let rowArray: Array<State> = []
        for (let c = 0; c < COLS; ++c) {
            let currentState = stateAt(r,c);
            let newState = currentState;
            let count = calcNeighbors(r,c);
            switch(currentState) {
                case 1:
                    if ( count < 2 || count > 3) {
                        newState = 0;
                    }
                default:
                    if (count === 3) {
                        newState = 1;
                    }
            }
            rowArray.push(newState);
        }
        tempBoard.push(rowArray);
   }
   grid = tempBoard;
   drawGrid();
}

function drawGrid() {
    if (ctx === null) return
    for (let r = 0; r < ROWS; ++r) {
        for (let c = 0; c < COLS; ++c) {

            let x =  r * CELL_HEIGHT;
            let y  = c * CELL_WIDTH;

            if (stateAt(r,c) == 1) {
                ctx.fillStyle = "red";
            } else {
                ctx.fillStyle = "rgb(32,32,32)";
            }
            ctx.fillRect(x,y, CELL_WIDTH, CELL_HEIGHT);
        }
    }
}

function stateAt(row:number , col:number): State {
    return grid[row][col]
}

const NEIGHBORS: Array<Array<number>> = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1] , /* CURRENT */ [0, 1],
    [1, -1], [1, 0], [1, 1]
]

function lifeAt(row: number, col: number): boolean {
    return ( row > 0 && col > 0 && row < ROWS && col < COLS && grid[row][col] == 1)
}

function calcNeighbors(row: number, col: number): number {
    let count = 0;
    NEIGHBORS.forEach(n => {
        if(lifeAt(row + n[0], col + n[1])) {
            ++count;
        }
    });
    return count;
}