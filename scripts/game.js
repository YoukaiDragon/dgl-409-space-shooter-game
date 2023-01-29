"use strict";

const GameStates = {
    Menu: 0,
    Playing: 1,
    Paused: 2
};

class Player {
    constructor(x, y) {
        this.lives = 3;
        this.score = 0;
        this.x = x;
        this.y = y;
        this.speed = 0;
        this.angle = 0;
        this.bombs = 3;
        this.shotType = 0;
    }

    update() {

    }

    render(viewport, canvas, ctx) {

    }
}

const canvas = document.getElementById("gameWindow");
const ctx = canvas.getContext("2d");
let gameState = GameStates.Menu;

const viewport = {
    width: canvas.width,
    height: canvas.height,
    x: 0,
    y: 0
}

setInterval(gameFrame, 30, viewport, canvas, ctx);

function gameFrame(viewport, canvas, ctx) {
    update();
    render(viewport, canvas, ctx);
}

function update() {

}

function render(viewport, canvas, ctx) {
    //colours
    let black = "rgb(0, 0, 0)";
    let white = "rgb(255, 255, 255)";
    let lightBlue = "rgb(118, 206, 222)";
    let green = "rgb(0, 166, 81)";
    let orange = "rgb(248, 153, 29)";
    let red = "rgb(239, 59, 57)";
    
    //draw the menu
    if (gameState == GameStates.Menu) {
        ctx.fillStyle = black;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = lightBlue;
        ctx.fillRect(canvas.width / 8, canvas.height / 8, canvas.width * (6/8), canvas.height * (6/8));
        
        ctx.fillStyle = black;
        ctx.font = "18px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Space Shooter", canvas.width/2, canvas.height * 2/8);
    }
}