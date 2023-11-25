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

const COLS = 32;
const ROWS = COLS;

const CELL_HEIGHT = canvas.height / ROWS
const CELL_WIDTH =  canvas.width / COLS

type State = 1 | 0;
let grid: Array<Array<State>> = [];
for (let row = 0; row < ROWS; ++row) {
    let r: Array<State> = []
    for (let col = 0; col < COLS; ++col) {
        r.push(0);
    }
    grid.push(r);
}

console.log(grid);

canvas.addEventListener("click", (e) => {
    const row = Math.floor(e.offsetX/CELL_WIDTH);
    const col = Math.floor(e.offsetY/CELL_HEIGHT);

    if (stateAt(row,col) === 1) {
        grid[row][col] = 0;
    } else {
        grid[row][col] = 1;
    }
    drawGrid();
})

const playButton = document.getElementById("play");
if (playButton === null) {
    throw new Error("Play button is missing");
}

playButton.addEventListener("click", (e) => {
        simulate();
})

function simulate() {
   let tempBoard: Array<Array<State>> = []; 
   for (let r = 0; r < ROWS; ++r) {
        let rowArray: Array<State> = []
        for (let c = 0; c < COLS; ++c) {
            let currentState = stateAt(r,c);
            let newState = currentState;
            let count = calcNeighbors(r,c);
            console.log(count);
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