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


// Pixellation fix from https://www.geeksforgeeks.org/how-to-sharpen-blurry-text-in-html5-canvas/
let width  = 960;
let height = 640;
canvas.style.width = width + "px";
canvas.style.height = height + "px";

let scale = window.devicePixelRatio;
canvas.width = Math.floor(width * scale);
canvas.height = Math.floor(height * scale);
ctx.scale(scale, scale);

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

        // Draw menu backdrop
        ctx.fillStyle = lightBlue;
        ctx.fillRect(canvas.width / 8, canvas.height / 8, canvas.width * (6/8), canvas.height * (6/8));
        
        // Draw Title
        ctx.fillStyle = black;
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Space Shooter", canvas.width/2, canvas.height * 2/8);

        // Draw "Start Game" button
        ctx.fillStyle = green;
        ctx.strokeStyle = black;
        ctx.lineWidth = 20;
        ctx.rect(canvas.width / 4, canvas.height * 5/16, canvas.width / 2, canvas.height / 8);
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = white;
        ctx.fillText("Start Game", canvas.width/2, canvas.height * 51/128);

        
    }
}