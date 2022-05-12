const puzzleCanvas = document.getElementById("puzzlecanvas"),
      ctx = puzzleCanvas.getContext("2d"),
      statusbar = document.getElementById("statusbarhold");

let gridCol = 9, // the column of grid
    gridRow = 9, // the row of grid
    mines = 10, // the number of mines
    cntGrid = gridCol * gridRow, // the number of grids
    width = gridSize * gridCol, // the width of grid
    height = gridSize * gridRow, // the height of grid
    gridMine = [], // -1: the mine; 0~8  the number of mines are around  
    gridOpen = [], // 0: is not open; 1: is open 
    gridFlag = [], // 0: is not marked; 1: is marked
    time = 0, // the time has passed
    marked = 0, // the number of flags
    expanded = 0, // the number of expanded grid
    setted = false, // true: the mine has been setted
    gameStop = false, // true: the game is stopped 
    isCompleted = false, // true: completed
    isGameOver = false // true game over
    minePos = [], // the pos of the mine which causes game over
    timer = null, // set timer
    lastPos = [0, 0]; // the pos which the mouse last in 

// set statusbar text
function setStatusText(time) {
    // keep number length = two
    const paddingLeft = (str, len) => {
        if (str.length >= len) 
            return str;
        return paddingLeft("0" + str, len);
    }

    let second = paddingLeft(`${time % 60}`, 2);
    time = Math.floor(time / 60);
    let minute = paddingLeft(`${time % 60}`, 2);
    time = Math.floor(time / 60);
    let hour = paddingLeft(`${time}`, 2);

    statusbar.innerText = `[${hour}:${minute}:${second}] `;
    if (isGameOver)
        statusbar.innerText += "Game Over!";
    else if (isCompleted)
        statusbar.innerText += "Complited!";
    else
        statusbar.innerText += `Marked: ${marked} / ${mines}`;
}
// determine whether the pos is in grid
function isInGrid(pos) {
    return pos[0] >= 0  && pos[0] < gridCol && pos[1] >= 0 && pos[1] < gridRow;
}
// find the set of pos around (x, y)
function findPosAround(x, y) {
    let result = [];
    for (let i in step) {
        let pos = [x + step[i][0], y + step[i][1]]
        if (isInGrid(pos)) 
            result.push(pos);    
    }
    return result;
}
// check the number of flags around the pos is correct
function checkFlag(pos) {
    let aroundPos = findPosAround(pos[0], pos[1]);
    let cntFlag = 0;
    for (let i in aroundPos) {
        let pos = aroundPos[i];
        cntFlag += gridFlag[pos[1]][pos[0]];
    }
    if (cntFlag > gridMine[pos[1]][pos[0]]) 
        drawGridOpen(pos, color["errorBG"]);
    else 
        drawGridOpen(pos, color["openBG"]);
}
// set the mines
function setMines(initX, initY) {
    const rand = (n) => Math.floor(Math.random() * n)
    // find the set of pos safe
    const posSafe = findPosAround(initX, initY);
    posSafe.push([initX, initY]);
    // determine whether the pos is safe
    const safe = (pos) => {
        for (let i in posSafe) 
            if (pos[0] == posSafe[i][0] && pos[1] == posSafe[i][1]) 
                return true;
        return false;
    }
    // set the mines and put their pos in a set
    let posMines = [];
    for (let i = 0; i < mines; i++) {
        let pos = [rand(gridCol), rand(gridRow)];
        while (gridMine[pos[1]][pos[0]] || safe(pos)) 
            pos = [rand(gridCol), rand(gridRow)];
        gridMine[pos[1]][pos[0]] = -1;
        posMines.push(pos);
    }
    // calculate the number of mines around the pos 
    for (let i in posMines) {
        let pos = findPosAround(posMines[i][0], posMines[i][1]);
        for (let j in pos)
            if (gridMine[pos[j][1]][pos[j][0]] != -1)
                gridMine[pos[j][1]][pos[j][0]]++;
    }
    // start the timer
    timer = setInterval("setStatusText(++time)", 1000);
}
// expand the pos
function expand(pos) {
    // if the game have not start set the mines
    if (!setted) {
        setted = true;
        setMines(pos[0], pos[1]);
    }
    // calculate the number of the pos expanded but have not been open
    expanded += gridOpen[pos[1]][pos[0]] ? 0 : 1;
    // set the status of the pos is open
    gridOpen[pos[1]][pos[0]] = 1;
    // if the mine is in the pos
    // game over
    if (gridMine[pos[1]][pos[0]] == -1) {
        drawGridOpen(pos, color["mineBG"]);
        minePos = pos;
        isGameOver = true;
        clearInterval(timer);
        drawGameOver();
        setStatusText(time);
        return;
    }
    // draw grid open and check flag
    drawGridOpen(pos, color["openBG"]);
    checkFlag(pos);
    // if expanded all of the pos which the mine is not in 
    // and mark all of the pos which mine is in
    // completed
    if (expanded + marked == cntGrid && marked == mines) {
        isCompleted = true;
        clearInterval(timer);
        drawCompleted();
        setStatusText(time);
        return;
    }
    // if the pos has been expanded 
    // skip
    if (gridMine[pos[1]][pos[0]]) 
        return;
    // expand the next pos which is not open and not marked and is around the pos
    let nextPos = findPosAround(pos[0], pos[1]);
    for (let i in nextPos) {
        let pos = nextPos[i];
        if (!gridOpen[pos[1]][pos[0]] && !gridFlag[pos[1]][pos[0]]) 
            expand(pos);
    }
}
// set a new game
function newGame() {
    width = gridSize * gridCol,
    height = gridSize * gridRow;
    
    puzzleCanvas.width = width + padding * 2;
    puzzleCanvas.height = height + padding * 2;
    statusbar.style.width = puzzleCanvas.width + "px";

    cntGrid = gridCol * gridRow;

    gridMine = Array.from({length : gridRow}, x => Array(gridCol).fill(0));
    gridOpen = Array.from({length : gridRow}, x => Array(gridCol).fill(0));
    gridFlag = Array.from({length : gridRow}, x => Array(gridCol).fill(0));

    time = 0;
    marked = 0;
    expanded = 0;
    setted = false;
    isCompleted = false;
    isGameOver = false;
    clearInterval(timer);

    drawShadow(padding - 4, padding - 4, width + 8, height + 8, color["darkBG"], color["lightBG"], 4);
    drawGrid();

    setStatusText(time);
}

newGame();