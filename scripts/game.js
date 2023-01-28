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

ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

setInterval((viewport, canvas, ctx) => {
    update();
    render(viewport, canvas, ctx);
}, 30);

function update() {

}

function render(viewport, canvas, ctx) {

}