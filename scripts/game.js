"use strict";

const GameStates = {
    Menu: 0,
    Instructions: 1,
    Options: 2,
    Playing: 3,
    Paused: 4
};

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

let player = new Player(canvas.width / 2, canvas.height / 2);
let controller = new Controller();
let enemies = [];
let pickups = [];

// TESTING: spawn time pickup
pickups.push(new timePickup(560, 160));

setInterval(gameFrame, 30, viewport, canvas, ctx);

function gameFrame(viewport, canvas, ctx) {
    update();
    render(viewport, canvas, ctx);
}

let timer = 100;
let timerIntervalId;

let score = 0;

function countDown() {
    timer--;

    if (timer <= 0) {
        // TODO: Trigger game over
    }
}

function update() {

    if (gameState == GameStates.Playing) {
        player.update(controller);
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (enemies[i].health <= 0) { // Delete dead enemies
                enemies.splice(i, 1);
            } else {
                enemies[i].update(player);
            }
        }
        for (let i = pickups.length - 1; i >= 0; i--) {
            // Check if player has collected the pickup
            if (checkCollision(player, pickups[i])) {
                pickups[i].onPickup();
                pickups.splice(i, 1);
            } else if (pickups[i].duration <= 0) {
                pickups.splice(i, 1); // Delete expired pickups
            } else {
                pickups[i].update();
            }
        }
    }
}

function addTime(time) {
    timer += time;
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
    ctx.lineWidth = 10;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameState == GameStates.Menu || gameState == GameStates.Instructions
        || gameState == GameStates.Options || gameState == GameStates.Paused) {
        // Draw menu backdrop
        ctx.fillStyle = lightBlue;
        ctx.fillRect(canvas.width / 8, canvas.height / 8, canvas.width * (6 / 8), canvas.height * (6 / 8));

        // Draw Page Title
        ctx.fillStyle = black;
        ctx.font = "40px Arial"
        ctx.textAlign = "center";

        switch (gameState) {
            case GameStates.Menu:
                ctx.fillText("Space Shooter", canvas.width / 2, canvas.height * 7 / 32);
                break;
            case GameStates.Instructions:
                ctx.fillText("How To Play", canvas.width / 2, canvas.height * 7 / 32);
                // Draw close button
                ctx.beginPath();
                ctx.fillStyle = red;
                ctx.rect(canvas.width * 5 / 32, canvas.height * 11 / 64, canvas.width / 16, canvas.height / 16);
                ctx.stroke();
                ctx.fill();
                ctx.fillStyle = black;
                ctx.fillText("X", canvas.width * 6 / 32, canvas.height * 29 / 128);
                break;
            case GameStates.Options:
                ctx.fillText("Options", canvas.width / 2, canvas.height * 7 / 32);
                // Draw close button
                ctx.beginPath();
                ctx.fillStyle = red;
                ctx.rect(canvas.width * 5 / 32, canvas.height * 11 / 64, canvas.width / 16, canvas.height / 16);
                ctx.stroke();
                ctx.fill();
                ctx.fillStyle = black;
                ctx.fillText("X", canvas.width * 6 / 32, canvas.height * 29 / 128);
                break;
            case GameStates.Paused:
                ctx.fillText("Paused", canvas.width / 2, canvas.height * 7 / 32);
                ctx.beginPath();
                ctx.fillStyle = green;
                ctx.strokeStyle = black;
                ctx.rect(canvas.width / 4, canvas.height * 9 / 32, canvas.width / 2, canvas.height * 3 / 32);
                ctx.stroke();
                ctx.fill();

                ctx.fillStyle = white;
                ctx.fillText("Resume", canvas.width / 2, canvas.height * 45 / 128);
                break;
        }
    }

    //draw the menu
    if (gameState == GameStates.Menu) {
        // Draw "Start Game" button
        ctx.beginPath();
        ctx.fillStyle = green;
        ctx.strokeStyle = black;
        ctx.rect(canvas.width / 4, canvas.height * 9 / 32, canvas.width / 2, canvas.height * 3 / 32);
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = white;
        ctx.fillText("Start Game", canvas.width / 2, canvas.height * 45 / 128);

        // Draw "How to Play" button
        ctx.beginPath();
        ctx.fillStyle = green;
        ctx.strokeStyle = black;
        ctx.rect(canvas.width / 4, canvas.height * 14 / 32, canvas.width / 2, canvas.height * 3 / 32);
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = white;
        ctx.fillText("How To Play", canvas.width / 2, canvas.height * 65 / 128);

        // Draw "Options" button
        ctx.beginPath();
        ctx.fillStyle = green;
        ctx.strokeStyle = black;
        ctx.rect(canvas.width / 4, canvas.height * 19 / 32, canvas.width / 2, canvas.height * 3 / 32);
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = white;
        ctx.fillText("Options", canvas.width / 2, canvas.height * 85 / 128);
    } else if (gameState == GameStates.Playing) { // Render Gameplay
        // Render enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            enemies[i].render(viewport, canvas, ctx);
        }

        // Render pickups
        for (let i = pickups.length - 1; i >= 0; i--) {
            pickups[i].render(viewport, canvas, ctx);
        }

        // Render the player
        player.render(viewport, canvas, ctx);
    }

    // Draw the game UI
    if (gameState == GameStates.Playing || gameState == GameStates.Paused) {
        ctx.beginPath();
        ctx.textAlign = "center";
        ctx.fillStyle = white;
        ctx.font = "20px Arial";
        ctx.fillText("Time: " + timer, canvas.width / 2, canvas.height * 3 / 64);
        ctx.beginPath();
        ctx.textAlign = "left";
        ctx.fillText("Lives: " + player.lives, canvas.width / 64, canvas.height * 3 / 64);
        ctx.fillText("Score: " + score, canvas.width / 64, canvas.height * 6 / 64);
        ctx.fillText("Bombs: " + player.bombs, canvas.width / 64, canvas.height - (canvas.height / 64));
        if (player.shotType != 0) {
            ctx.fillText("Ammo: " + player.ammo, canvas.width / 64, canvas.height - (canvas.height * 3 / 64));
        }
        if (gameState == GameStates.Playing) {
            ctx.beginPath();
            ctx.textAlign = "center";
            ctx.strokeStyle = white;
            ctx.lineWidth = 5;
            ctx.rect(canvas.width - canvas.width * 18 / 256, canvas.height * 5 / 256,
                canvas.width * 12 / 256, canvas.width * 12 / 256);
            ctx.stroke();
            ctx.fillText("||", canvas.width - canvas.width * 12 / 256, canvas.height * 16 / 256);
        }

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
            timerIntervalId = setInterval(countDown, 1000);
            gameState = GameStates.Playing;
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
    } else if (gameState == GameStates.Instructions || gameState == GameStates.Options) {
        if (mouseX >= canvas.width * 5 / 32 && mouseX <= canvas.width * 7 / 32 &&
            mouseY >= canvas.height * 11 / 64 && mouseY <= canvas.height * 15 / 64) {
            gameState = GameStates.Menu;
        }
    } else if (gameState == GameStates.Playing) {
        if (mouseX >= (canvas.width - canvas.width * 18 / 256)
            && mouseX <= (canvas.width - canvas.width * 6 / 256)
            && mouseY >= (canvas.height * 5 / 256)
            && mouseY <= (canvas.height * 5 / 256 + canvas.width + 12 / 256)) {
            gameState = GameStates.Paused;
            clearInterval(timerIntervalId);
        }
    } else if (gameState == GameStates.Paused) {
        if (mouseX >= canvas.width / 4 && mouseX <= canvas.width * 3 / 4
            && mouseY >= canvas.height * 9 / 32 && mouseY <= canvas.height * 12 / 32) {
            gameState = GameStates.Playing;
            timerIntervalId = setInterval(countDown, 1000);
        }
    }
});

window.addEventListener("keydown", (e) => {
    // Pause game when escape is pressed
    if (e.key == "Escape") {
        if (gameState == GameStates.Playing) {
            gameState = GameStates.Paused;
            clearInterval(timerIntervalId);
            console.log("PAUSED");
        } else if (gameState == GameStates.Paused) {
            gameState = GameStates.Playing;
            timerIntervalId = setInterval(countDown, 1000);
            console.log("PLAYING");
        }
    }

    // Handle controller inputs
    if (e.key == 'w' || e.key == 'W' || e.key == "ArrowUp") {
        controller.upPressed = true;
    }
    if (e.key == 'a' || e.key == 'A' || e.key == "ArrowLeft") {
        controller.leftPressed = true;
    }
    if (e.key == 's' || e.key == 'S' || e.key == "ArrowDown") {
        controller.downPressed = true;
    }
    if (e.key == 'd' || e.key == 'D' || e.key == "ArrowRight") {
        controller.rightPressed = true;
    }
    if (e.key == ' ') {
        e.preventDefault();
        controller.firePressed = true;
    }
});

window.addEventListener("keyup", (e) => {
    // Handle controller inputs
    if (e.key == 'w' || e.key == 'W' || e.key == "ArrowUp") {
        controller.upPressed = false;
    }
    if (e.key == 'a' || e.key == 'A' || e.key == "ArrowLeft") {
        controller.leftPressed = false;
    }
    if (e.key == 's' || e.key == 'S' || e.key == "ArrowDown") {
        controller.downPressed = false;
    }
    if (e.key == 'd' || e.key == 'D' || e.key == "ArrowRight") {
        controller.rightPressed = false;
    }
    if (e.key == ' ') {
        controller.firePressed = false;
    }
});

// Returns if an object is within the viewport
function isVisible(x, y) {
    if (x < 0 || y < 0 || x > viewport.width || y > viewport.height) {
        return false;
    }
    return true;
}

// Returns if two objects are colliding with each other
function checkCollision(objectA, objectB) {
    if (objectA.x > (objectB.x + objectB.width)) {
        // Object A is past Object B on the right
        return false;
    }
    if ((objectA.x + objectA.width) < objectB.x) {
        // Object A is past Object B on the left
        return false;
    }
    if (objectA.y > (objectB.y + objectB.height)) {
        // Object A is fully below Object B
        return false;
    }
    if ((objectA.y + objectA.height) < objectB.y) {
        // Object A is fully above Object B
        return false;
    }
    return true;
}