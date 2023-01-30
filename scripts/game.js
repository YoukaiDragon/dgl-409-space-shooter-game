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
let width = 960;
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
        ctx.fillRect(canvas.width / 8, canvas.height / 8, canvas.width * (6 / 8), canvas.height * (6 / 8));

        // Draw Title
        ctx.fillStyle = black;
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Space Shooter", canvas.width / 2, canvas.height * 2 / 8);

        // Draw "Start Game" button
        ctx.beginPath();
        ctx.fillStyle = green;
        ctx.strokeStyle = black;
        ctx.lineWidth = 30;
        ctx.rect(canvas.width / 4 , canvas.height * 10/32, canvas.width / 2, canvas.height * 3/32);
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = white;
        ctx.fillText("Start Game", canvas.width / 2, canvas.height * 49 / 128);

        // Draw "How to Play" button
        ctx.beginPath();
        ctx.fillStyle = green;
        ctx.strokeStyle = black;
        ctx.lineWidth = 30;
        ctx.rect(canvas.width / 4, canvas.height *  15/32, canvas.width / 2, canvas.height *  3/32);
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = white;
        ctx.fillText("How To Play", canvas.width / 2, canvas.height * 69/128);
    }
}

canvas.addEventListener("click", (e) => {
    let mouseX = e.offsetX;
    let mouseY = e.offsetY;
    if (gameState == GameStates.Menu) {
        // Check if Start button was clicked
        if ((mouseX > canvas.width / 4) && (mouseX < canvas.width * 3 / 4) 
            && (mouseY >= canvas.height * 10/32) 
            && (mouseY <= canvas.height * 13/32)) {
                console.log("START GAME");
                // TODO: switch game state and start the game
        }

        // Check if Start button was clicked
        if ((mouseX > canvas.width / 4) && (mouseX < canvas.width * 3 / 4) 
            && (mouseY >= canvas.height * 15/32) 
            && (mouseY <= canvas.height * 18/32)) {
                console.log("INSTRUCTIONS");
                // TODO: switch game state and load instructions
        }
    }
});