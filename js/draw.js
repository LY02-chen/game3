// draw shadow
function drawShadow(x, y, width, height, colorLeft, colorRight, offset) {
    // draw left shadow
    ctx.fillStyle = colorLeft;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width - offset, y + offset);
    ctx.lineTo(x + offset, y + offset);
    ctx.lineTo(x + offset, y + height - offset);
    ctx.lineTo(x, y + height);
    ctx.closePath();
    ctx.fill();
    // draw right shadow
    ctx.fillStyle = colorRight;
    ctx.beginPath();
    ctx.moveTo(x + width, y);
    ctx.lineTo(x + width - offset, y + offset);
    ctx.lineTo(x + width - offset, y + height - offset);
    ctx.lineTo(x + offset, y + height - offset);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x + width, y + height);
    ctx.closePath();
    ctx.fill();
}
// draw grid rect
function drawGridRect(pos, colorLeft, colorRight, colorBG) {
    let thisX = gridSize * pos[0] + padding;
    let thisY = gridSize * pos[1] + padding ;
    
    drawShadow(thisX, thisY, gridSize, gridSize, colorLeft, colorRight, 3);
    ctx.fillStyle = colorBG;
    ctx.fillRect(thisX + 2.5, thisY + 2.5, gridSize - 5, gridSize - 5);
}
// draw grid open rect
function drawOpenRact(x, y, width, height, colorBG) {
    ctx.fillStyle = color["darkBG"];
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = colorBG;
    ctx.fillRect(x + 0.5, y + 0.5, width - 1, height - 1);
}
// draw flag
function drawFlag(pos) {
    let x = gridSize * pos[0] + padding;
    let y = gridSize * pos[1] + padding;

    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.moveTo(x + gridSize * 7 / 12, y + gridSize / 6);
    ctx.lineTo(x + gridSize * 2 / 3, y + gridSize / 6);
    ctx.lineTo(x + gridSize * 2 / 3, y + gridSize * 17 / 36);
    ctx.lineTo(x + gridSize * 7 / 12, y + gridSize * 17 / 36);
    ctx.lineTo(x + gridSize * 2 / 9, y + gridSize / 3);
    ctx.lineTo(x + gridSize * 2 / 9, y + gridSize * 11 / 36);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.lineTo(x + gridSize * 2 / 3, y + gridSize * 17 / 36);
    ctx.lineTo(x + gridSize * 2 / 3, y + gridSize * 11 / 18);
    ctx.lineTo(x + gridSize * 7 / 9, y + gridSize * 29 / 36);
    ctx.lineTo(x + gridSize * 2 / 9, y + gridSize * 29 / 36);
    ctx.lineTo(x + gridSize * 7 / 12, y + gridSize * 11 / 18);
    ctx.lineTo(x + gridSize * 7 / 12, y + gridSize * 17 / 36);
    ctx.closePath();
    ctx.fill();
}
// draw mine
function drawMine(pos) {
    let x = gridSize * pos[0] + padding;
    let y = gridSize * pos[1] + padding;

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.moveTo(x + gridSize * 5 / 12, y + gridSize / 12);
    ctx.lineTo(x + gridSize * 7 / 12, y + gridSize / 12);
    ctx.lineTo(x + gridSize * 7 / 12, y + gridSize * 11 / 12);
    ctx.lineTo(x + gridSize * 5 / 12, y + gridSize * 11 / 12);
    ctx.moveTo(x + gridSize / 12, y + gridSize * 5 / 12);
    ctx.lineTo(x + gridSize / 12, y + gridSize * 7 / 12);
    ctx.lineTo(x + gridSize * 11 / 12, y + gridSize * 7 / 12);
    ctx.lineTo(x + gridSize * 11 / 12, y + gridSize * 5 / 12);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x + gridSize / 2, y + gridSize / 2, gridSize * 7 / 24, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x + gridSize * 5 / 12, y + gridSize * 5 / 12, gridSize / 16, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}
// draw grid
function drawGrid() {
    for (let i in gridMine[0]) 
        for (let j in gridMine) 
            drawGridRect([i, j], color["lightBG"], color["darkBG"], color["BG"]);
}
// draw grid open
function drawGridOpen(pos, colorBG) {
    let x = pos[0];
    let y = pos[1];
    let thisX = gridSize * x + padding;
    let thisY = gridSize * y + padding;

    drawOpenRact(thisX, thisY, gridSize, gridSize, colorBG);
    
    if(gridMine[y][x]) {
        if (gridMine[y][x] == -1) 
            drawMine(pos);
        else {
            ctx.font = `${gridSize * 4 / 5}px Comic Sans MS`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = color[gridMine[y][x]];
            ctx.fillText(gridMine[y][x], thisX + gridSize / 2, thisY + gridSize / 2);
        }
    }
}
// draw BG when completed or game over
function drawChangeBG(colorBG) {
    for (let i in gridMine[0]) {
        for (let j in gridMine) {
            if (gridOpen[j][i]) 
                drawGridOpen([i, j], colorBG);
            else {
                drawGridRect([i, j], color["lightBG"], color["darkBG"], colorBG);
                if (gridFlag[j][i])
                    drawFlag([i, j]);
            }
        }
    }
}
// draw BG when completed or game over
function drawReBG() {
    for (let i in gridMine[0]) {
        for (let j in gridMine) {
            if (isGameOver && i == minePos[0] && j == minePos[1]) 
                continue;
            if (gridOpen[j][i]) 
                drawGridOpen([i, j], color["openBG"]);
            else {
                drawGridRect([i, j], color["lightBG"], color["darkBG"], color["BG"]);
                if (gridFlag[j][i]) 
                    drawFlag([i, j]);
            }
        }
    }
}
// draw BG when game over
function drawGameOver() {
    setTimeout('drawChangeBG(color["mineBG"])', 1);
    setTimeout(drawReBG, 130);
    setTimeout('drawChangeBG(color["mineBG"])', 260);
    setTimeout(drawReBG, 390);
}
// draw BG when completed
function drawCompleted() {
    setTimeout('drawChangeBG(color["lightBG"])', 1);
    setTimeout('drawChangeBG(color["darkBG"])', 130);
    setTimeout(drawReBG, 260);
}