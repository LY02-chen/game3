window.addEventListener("mousedown", down, false);
window.addEventListener("mouseup", up, false);

// map the mouse coordinate to pos
const map = (x, y) => {
    let rect = puzzleCanvas.getBoundingClientRect();
    x -= rect.left + padding + window.scrollX;
    y -= rect.top + padding + window.scrollY;
    x = Math.floor(x / gridSize);
    y = Math.floor(y / gridSize);
    return [x, y];
}
// when mouse move out from the pos, recovery the grid
function mouseOut(pos) {
    if (gridFlag[pos[1]][pos[0]]) // for marked grid
        return;
    if (gridOpen[pos[1]][pos[0]]) { // for open grid
        let aroundPos = findPosAround(pos[0], pos[1]);
        for (let i in aroundPos) {
            let pos = aroundPos[i];
            if (!gridOpen[pos[1]][pos[0]] && !gridFlag[pos[1]][pos[0]]) 
                drawGridRect(pos, color["lightBG"], color["darkBG"], color["BG"]);
        }
    }
    else // for other grid
        drawGridRect(pos, color["lightBG"], color["darkBG"], color["BG"]);
}
// when mouse move over the pos, change the grid
function mouseOver(pos) {
    if (gridFlag[pos[1]][pos[0]]) // for marked grid
        return;
    if (gridOpen[pos[1]][pos[0]]) { // for open grid
        let aroundPos = findPosAround(pos[0], pos[1]);
        for (let i in aroundPos) {
            let pos = aroundPos[i].map(x => x);
            if (!gridOpen[pos[1]][pos[0]] && !gridFlag[pos[1]][pos[0]]) {
                let thisX = gridSize * pos[0] + padding;
                let thisY = gridSize * pos[1] + padding;
                drawOpenRact(thisX, thisY, gridSize, gridSize, color["openBG"]);
            }
        }
    }
    else { // for other grid
        let thisX = gridSize * pos[0] + padding;
        let thisY = gridSize * pos[1] + padding;
        drawOpenRact(thisX, thisY, gridSize, gridSize, color["openBG"]);
    }
}
// mouse move
function move(event) {
    let pos = map(event.pageX, event.pageY);

    if (isInGrid(pos)) { // in the grid
        // the pos != the last pos
        if (pos[0] != lastPos[0] || pos[1] != lastPos[1]) 
            mouseOut(lastPos);
        lastPos[0] = pos[0];
        lastPos[1] = pos[1];
        mouseOver(pos);
    }
    else // out of the grid
        mouseOut(lastPos);
}
// mouse down
function down(event) {
    // if configuration form is open, stop the game
    type.addEventListener("mouseover", (event) => gameStop = true, false);
    type.addEventListener("mouseout", (event) => gameStop = false, false);
    // mouse down is no use
    if (isGameOver || isCompleted || gameStop) 
        return;

    let pos = map(event.pageX, event.pageY);
    if (event.button == 0) { // for left button
        if (isInGrid(pos)) {
            mouseOver(pos);
            lastPos[0] = pos[0];
            lastPos[1] = pos[1];
        }
        // call the mouse move
        window.addEventListener("mousemove", move, false);
    }
    else if (event.button == 2) { // for tight button
        if (isInGrid(pos) && !gridOpen[pos[1]][pos[0]]) {
            if (gridFlag[pos[1]][pos[0]]) { // cancel marked
                marked--;
                gridFlag[pos[1]][pos[0]] = 0;
                drawGridRect(pos, color["lightBG"], color["darkBG"], color["BG"]);
            }
            else { // marked
                marked++;
                gridFlag[pos[1]][pos[0]] = 1;
                drawFlag(pos);
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
            }
            setStatusText(time);
            //check the pos around the pos which is marked     
            let aroundPos = findPosAround(pos[0], pos[1]);
            for (let i in aroundPos) {
                let pos = aroundPos[i];
                if (gridOpen[pos[1]][pos[0]]) 
                    checkFlag(pos);
            }
        }
    }
}
// mouse up
function up(event) {
    // mouse up is no use
    if (isGameOver || isCompleted || gameStop) 
        return;

    let pos = map(event.pageX, event.pageY);
    if (event.button == 0) { // for the left button
        if (isInGrid(pos)) {
            if (!gridOpen[pos[1]][pos[0]] && !gridFlag[pos[1]][pos[0]]) // for grid not open and not marked 
                // open only the pos
                expand(pos);
            else if (gridOpen[pos[1]][pos[0]] && gridMine[pos[1]][pos[0]] > 0) { // fot grid open
                // open the around pos
                let aroundPos = findPosAround(pos[0], pos[1]);
                // calculate the number of flags around the pos
                let cntFlag = 0;
                for (let i in aroundPos) {
                    let pos = aroundPos[i];
                    cntFlag += gridFlag[pos[1]][pos[0]];
                }
                // if the number of flags = the number of mines
                if (cntFlag == gridMine[pos[1]][pos[0]]) {
                    for (let i in aroundPos) {
                        let pos = aroundPos[i];
                        // open the pos not marked
                        if (!gridFlag[pos[1]][pos[0]]) 
                            expand(pos);
                    }
                }
                else 
                    mouseOut(pos);
            }
        }
        // remove the mouse move
        this.window.removeEventListener("mousemove", move, false);
    }
}
// click the "New game" button
document.getElementById("new").onclick = newGame;
// click the "Solve game" button
document.getElementById("solve").onclick = function(event) {
    // click no use
    if (isCompleted) 
        return;
    // click no use and alert
    if (!setted && !isGameOver) {
        alert("Game has not been started yet.");
        return;
    }
    if (isGameOver) { // for game over
        for (let i in gridMine[0]) {
            for (let j in gridMine) {
                // if the mine is correctly marked
                if (gridFlag[j][i] && gridMine[j][i] == -1) 
                    continue;
                // open the pos not open
                if (!gridOpen[j][i]) {
                    gridOpen[j][i] = 1;
                    drawGridOpen([i, j], color["openBG"]);
                }
            }
        }
    }
    else { // for game have not ended up
        marked = mines;
        setStatusText(time);
        for (let i in gridMine[0]) {
            for (let j in gridMine) {
                gridFlag[j][i] = gridMine[j][i] == -1 ? 1 : 0; 
                gridOpen[j][i] = gridMine[j][i] == -1 ? 0 : 1; 
                if (gridMine[j][i] == -1) // marked the pos mine is in
                    drawFlag([i, j]);
                else // open the pos mine is not in
                    drawGridOpen([i, j], color["openBG"]);
            }
        }
    }
};

const type = document.getElementById("gametype");
// the list of tag = "li" in id = "gametype"
const selectList = Array.from({length : 7}, (val, i) => type.children[i]); 
const selectSet = [
    [9, 9, 10], [9, 9, 35],
    [16, 16, 40], [16, 16, 99],
    [30, 16, 99], [30, 16, 170]
];
// click the button under the "Type..."
type.onclick = function(event) {
    const select = event.target;
    // -1: "Custom"; 0~6: has been definded
    const selectIndex = select.getAttribute("data-index"); 

    if (selectIndex != -1) { // for index = 0~6
        for (let i in selectList) 
            selectList[i].children[0].style.color = "transparent";
        gridCol = selectSet[selectIndex][0];
        gridRow = selectSet[selectIndex][1];
        mines = selectSet[selectIndex][2];
        select.children[0].style.color = "inherit";
        newGame();
    }
    else { //for index = -1
        gameStop = true;
        configuration();
    }
};
// set the configuration form
function configuration() {
    // creat a dark background div
    let backgroundDiv = document.createElement("div");
    backgroundDiv.id = "backgroundDiv";

    let styleDiv = backgroundDiv.style;
    styleDiv.width = "100%";
    styleDiv.height = "100%";
    styleDiv.background = "#000";
    styleDiv.position = "fixed";
    styleDiv.opacity = "0.3";
    styleDiv.left = "0px";
    styleDiv.top = "0px";
    styleDiv.zIndex = "99";

    document.body.appendChild(backgroundDiv);
    // create a form
    let configurationForm = document.createElement("form");
    configurationForm.id = "configurationForm";

    let styleForm = configurationForm.style;
    styleForm.width = "70%";
    styleForm.opacity = "1";
    styleForm.background = "#fff";
    styleForm.color = "#000";
    styleForm.border = "2px solid black";
    styleForm.padding = "20px";
    styleForm.margin = "auto";
    styleForm.position = "absolute";
    styleForm.left = "10%";
    styleForm.top = "10%";
    styleForm.zIndex = "100";

    configurationForm.innerHTML += '<p style="margin-top: 0px;">Mines configuration</p>';
    configurationForm.innerHTML += `<p>Width<input type="text" onkeyup="value=value.replace(/[^\\d]/g,'')" onbeforepaste="clipboardData.setData('text',clipboardData.getData('text').replace(/[^\\d]/g,''))"></p>`;
    configurationForm.innerHTML += `<p>Height<input type="text" onkeyup="value=value.replace(/[^\\d]/g,'')" onbeforepaste="clipboardData.setData('text',clipboardData.getData('text').replace(/[^\\d]/g,''))"></p>`;
    configurationForm.innerHTML += `<p>Mines<input type="text" onkeyup="value=value.replace(/[^\\d]/g,'')" onbeforepaste="clipboardData.setData('text',clipboardData.getData('text').replace(/[^\\d]/g,''))"></p>`;
    configurationForm.innerHTML += '<input type="button" value="OK">';
    configurationForm.innerHTML += '<input type="button" value="Cancel">';

    document.body.appendChild(configurationForm);
    // if form is created, stop the game
    document.getElementById("configurationForm").addEventListener("mouseover", (event) => gameStop = true, false);
    document.getElementById("backgroundDiv").addEventListener("mouseover", (event) => gameStop = true, false);
    // get the tag = "input"
    let inputWidth = configurationForm.children[1].children[0];
    let inputHeight = configurationForm.children[2].children[0];
    let inputMines = configurationForm.children[3].children[0];
    let inputOK = configurationForm.children[4];
    let inputCancel = configurationForm.children[5];
    // initialize the input
    inputWidth.value = gridCol;
    inputHeight.value = gridRow;
    inputMines.value = mines;
    // click "OK" button 
    inputOK.onclick = function(event) {
        setConfiguration(parseInt(inputWidth.value), parseInt(inputHeight.value), parseInt(inputMines.value))
    };
    // click "Cancel" button
    inputCancel.onclick = function(event) {
        closeForm()
    };
}
// close the form
function closeForm() {
    document.getElementById("configurationForm").remove();
    document.getElementById("backgroundDiv").remove();
    gameStop = false;
}
// reset the column, row, mines
function setConfiguration(inputWidth, inputHeight, inputMines) {
    for (let i in selectList) 
        selectList[i].children[0].style.color = "transparent";
    // if the set is in selectSet
    for (let i in selectSet) {
        if (inputWidth == selectSet[i][0] && inputHeight == selectSet[i][1] && inputMines == selectSet[i][2]) {
            gridCol = selectSet[i][0];
            gridRow = selectSet[i][1];
            mines = selectSet[i][2];
            selectList[i].children[0].style.color = "inherit";
            closeForm();
            newGame();
            return;    
        }
    }
    // if the column = 0 or the row = 0
    if (!inputWidth || !inputHeight) {
        alert("Width and height must both be greater than zero.");
        return;
    }
    // if the mines > the number of grids
    if (inputWidth * inputHeight - 9 < inputMines && inputMines) {
        alert("To many mines.");
        return;
    }

    gridCol = inputWidth;
    gridRow = inputHeight;
    mines = inputMines;
    type.children[6].children[0].style.color = "inherit";
    closeForm();
    newGame();
}