"use strict";

const GameStates = {
    Menu: 0,
    Instructions: 1,
    Options: 2,
    Playing: 3,
    Paused: 4
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

    // clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = black;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameState == GameStates.Menu || gameState == GameStates.Instructions || gameState == GameStates.Options) {
        // Draw menu backdrop
        ctx.fillStyle = lightBlue;
        ctx.fillRect(canvas.width / 8, canvas.height / 8, canvas.width * (6 / 8), canvas.height * (6 / 8));

        // Draw Page Title
        ctx.fillStyle = black;
        ctx.font = "40px Arial"
        ctx.textAlign = "center";

        switch(gameState) {
            case GameStates.Menu:
                ctx.fillText("Space Shooter", canvas.width / 2, canvas.height * 7/32);
                break;
            case GameStates.Instructions:
                ctx.fillText("How To Play", canvas.width / 2, canvas.height * 7/32);
                break;
            case GameStates.Options:
                ctx.fillText("Options", canvas.width / 2, canvas.height * 7/32);
                break;
        }
    }

    //draw the menu
    if (gameState == GameStates.Menu) {
        // Draw "Start Game" button
        ctx.beginPath();
        ctx.fillStyle = green;
        ctx.strokeStyle = black;
        ctx.lineWidth = 30;
        ctx.rect(canvas.width / 4, canvas.height * 9 / 32, canvas.width / 2, canvas.height * 3 / 32);
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = white;
        ctx.fillText("Start Game", canvas.width / 2, canvas.height * 45 / 128);

        // Draw "How to Play" button
        ctx.beginPath();
        ctx.fillStyle = green;
        ctx.strokeStyle = black;
        ctx.lineWidth = 30;
        ctx.rect(canvas.width / 4, canvas.height * 14 / 32, canvas.width / 2, canvas.height * 3 / 32);
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = white;
        ctx.fillText("How To Play", canvas.width / 2, canvas.height * 65 / 128);

        // Draw "Options" button
        ctx.beginPath();
        ctx.fillStyle = green;
        ctx.strokeStyle = black;
        ctx.lineWidth = 30;
        ctx.rect(canvas.width / 4, canvas.height * 19 / 32, canvas.width / 2, canvas.height * 3 / 32);
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = white;
        ctx.fillText("Options", canvas.width / 2, canvas.height * 85 / 128);
    }
}

canvas.addEventListener("click", (e) => {
    let mouseX = e.offsetX;
    let mouseY = e.offsetY;
    if (gameState == GameStates.Menu) {
        // return if mouse is not within the horizontal bounds of the menu buttons
        if (mouseX < canvas.width / 4 || mouseX > canvas.width * 3 / 4) {
            return;
        }
        // Check if Start button was clicked
        if ((mouseY >= canvas.height * 9 / 32) && (mouseY <= canvas.height * 12 / 32)) {
            console.log("START GAME");
            // TODO: switch game state and start the game
        }

        // Check if "How To Play" button was clicked
        if ((mouseY >= canvas.height * 14 / 32) && (mouseY <= canvas.height * 17 / 32)) {
            console.log("INSTRUCTIONS");
            gameState = GameStates.Instructions;
        }

        // Check if Options button was clicked
        if ((mouseY >= canvas.height * 19 / 32) && (mouseY <= canvas.height * 22 / 32)) {
            console.log("OPTIONS");
            gameState = GameStates.Options;
        }
    }
});