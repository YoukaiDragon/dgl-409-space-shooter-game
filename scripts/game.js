"use strict";

// Game background music via https://www.FesliyanStudios.com
// 'mixkit' Sound effects via https://mixkit.co/free-sound-effects/space-shooter/
// Other sound effects created using Bfxr

// Explosion animation images by macrovector on Freepik https://www.freepik.com/free-vector/video-game-explosion-animation-pixel-art-explosion-animation-frames_13437690.htm"

// Local storage high score list implemented with help of this page https://michael-karen.medium.com/how-to-save-high-scores-in-local-storage-7860baca9d68

const GameStates = {
    Menu: 0,
    Instructions: 1,
    Options: 2,
    Playing: 3,
    Paused: 4,
    GameOver: 5,
    HighScore: 6
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
ctx.lineWidth = 5;

let sliderWidth = canvas.width / 2;
let volumePercent = 1.0;
let sfxPercent = 1.0;

// Dimensions for the playable area
let gameWidth = 10000;
let gameHeight = 10000;

const viewport = {
    width: canvas.width,
    height: canvas.height,
    x: 0,
    y: 0,
    speed: 0,
    maxSpeed: 20,
}

let player;
let controller = new Controller();
let enemies;
let enemyBullets;
let hazards;
let pickups;
let effects;
let pickupSpawnTimer;
let pickupTimerBase;
let pickupTimerVariance;
let pickupMaxSpawnDistance;
let enemySpawnTimer;
let enemyTimerBase;
let enemyTimerVariance;
let enemyMaxSpawnDistance;
let asteroidSpawnTimer;
let asteroidTimerBase;
let asteroidTimerVariance;
let intensityTimer; // control when enemy / pickup spawn parameters change
let intensityLevel;
let intensityMax = 10;
let specialReady = false;

// For High Scores
const MAX_HIGH_SCORES = 5;
const HIGH_SCORES = 'spaceShooterHighScores';

let highScoreString;
let highScores;

let instructionPage = 1;
let maxInstructionPage = 7;

let timer;
let timerIntervalId;

let score;

let steeringControls = false;

// sounds and music
let gameMusic = new Audio("./Assets/sounds/2020-03-22_-_8_Bit_Surf_-_FesliyanStudios.com_-_David_Renda.mp3");
gameMusic.loop = true;
let collectSound = new Audio("./Assets/sounds/mixkit-space-coin-win-notification-271.wav");
let hitSound = new Audio("./Assets/sounds/mixkit-falling-hit-757.wav");
let menuButtonSound = new Audio("./Assets/sounds/mixkit-negative-game-notification-249.wav");
let gameOverSound = new Audio("./Assets/sounds/mixkit-arcade-fast-game-over-233.wav");
let shortLaserSound = new Audio("./Assets/sounds/mixkit-short-laser-gun-shot-1670.wav");
let whipLaserSound = new Audio("./Assets/sounds/mixkit-game-whip-shot-1512.wav");
let explosion1 = new Audio("./Assets/sounds/Explosion1.wav");
let explosion2 = new Audio("./Assets/sounds/Explosion2.wav");
let enemyHitSound = new Audio("./Assets/sounds/EnemyHit.wav");

let quietSoundBaseVolume = 0.5;
let weaponSoundBaseVolume = 0.2;

shortLaserSound.volume = weaponSoundBaseVolume;
explosion1.volume = quietSoundBaseVolume;
explosion2.volume = quietSoundBaseVolume;
hitSound.volume = quietSoundBaseVolume;
enemyHitSound.volume = quietSoundBaseVolume;

// Images
const background = document.getElementById("gameBackground");
let IMAGES = ['Background', 'player', 'asteroidA', 'asteroidB', 'BasicShooterEnemy', 'AdvancedShooterEnemy',
    'Turret', 'TwinshotEnemy', 'TripleshotEnemy', 'CargoEnemy', 'TimePickup', 'ScorePickup',
    'HealthPickup', 'TwinshotPickup', 'TripleshotPickup', 'ExplosionFrames', 'BombPickup'];
let images;

loadImages(IMAGES, startGame);

function startGame(imageList) {
    images = imageList;
    setInterval(gameFrame, 30, viewport, canvas, ctx);
}

function gameFrame(viewport, canvas, ctx) {
    update();
    render(viewport, canvas, ctx);
}

// Resets game variables / entity holders for a new game
function newGame() {
    score = 0;
    timer = 100;
    player = new Player(gameWidth / 2, gameHeight / 2, steeringControls);
    viewport.x = player.x - canvas.width / 2;
    viewport.y = player.y - canvas.height / 2;
    pickups = [];
    enemies = [];
    enemyBullets = [];
    hazards = [];
    effects = [];

    pickupMaxSpawnDistance = 3000;
    enemyMaxSpawnDistance = 6000;

    timerIntervalId = setInterval(countDown, 1000);
    pickupTimerBase = 20;
    pickupTimerVariance = 10;
    pickupSpawnTimer = Math.floor(Math.random() * pickupTimerVariance) + pickupTimerBase;
    enemyTimerBase = 30;
    enemyTimerVariance = 40;
    enemySpawnTimer = Math.floor(Math.random() * enemyTimerVariance) + enemyTimerBase;
    asteroidTimerBase = 50;
    asteroidTimerVariance = 50
    asteroidSpawnTimer = Math.floor(Math.random() * asteroidTimerVariance) + asteroidTimerBase;
    intensityLevel = 1;
    intensityTimer = 60;

    // spawn initial items / enemies
    for (let i = 0; i < 10; i++) {
        spawnEnemies();
    }
    for (let i = 0; i < 5; i++) {
        spawnPickups();
    }

    gameMusic.currentTime = 0;
    gameMusic.play();
    gameState = GameStates.Playing;
}

function countDown() {
    timer--;
    if (timer <= 0) { gameOver() }

    // Stop increasing intensity past max level
    if (intensityLevel == intensityMax) { return }
    intensityTimer--;
    if (intensityTimer <= 0) {
        intensityTimer = 60;
        intensityLevel++;
    }
}

function gameOver() {
    // Check if the score is a high score
    try {
        highScoreString = localStorage.getItem(HIGH_SCORES);
        highScores = highScoreString.split(',').map(function (score) {
            return parseInt(score, 10);
        })
    } catch {
        highScores = [0, 0, 0, 0, 0];
    }
    // Add the new score to the list, sort it, and remove the lowest score if the list is already full
    highScores.push(score);
    highScores.sort(function (a, b) { return b - a });
    if (highScores.length > MAX_HIGH_SCORES) { highScores.pop() }
    localStorage.setItem(HIGH_SCORES, highScores.toString());

    // Go to game over menu
    gameState = GameStates.GameOver;
    gameOverSound.play();
    gameMusic.pause();
    clearInterval(timerIntervalId);
}

function update() {
    if (gameState == GameStates.Playing) {
        if (player.hp > 0) {
            player.update(controller);
            // Move the viewport when the player gets too close to one side
            let playerDisplayX = player.x - viewport.x;
            let playerDisplayY = player.y - viewport.y;
            let targetAngle = getAngleToViewport(player);

            if (playerDisplayX < viewport.width * 1 / 3 || playerDisplayX > viewport.width * 2 / 3
                || playerDisplayY < viewport.height * 3 / 8 || playerDisplayY > viewport.height * 5 / 8) {
                viewport.speed < viewport.maxSpeed ? viewport.speed += 2 : viewport.speed = viewport.maxSpeed;
            } else {
                viewport.speed > 4 ? viewport.speed -= 4 : viewport.speed = 0;
            }

            viewport.x += Math.cos(targetAngle * Math.PI / 180) * viewport.speed;
            viewport.y += Math.sin(targetAngle * Math.PI / 180) * viewport.speed;

            // Keep the full area of the viewport within bounds
            if (viewport.x < 0) {
                viewport.x = 0;
            } else if (viewport.x > gameWidth - viewport.width) {
                viewport.x = gameWidth - viewport.width;
            }
            if (viewport.y < 0) {
                viewport.y = 0;
            } else if (viewport.y > gameHeight - viewport.height) {
                viewport.y = gameHeight - viewport.height;
            }
        }

        // Update enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (enemies[i].hp <= 0) { // Delete dead enemies
                enemies.splice(i, 1);
            } else {
                enemies[i].update();
            }
        }

        // Update enemy bullets
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            enemyBullets[i].update();
            if (roundCollision(enemyBullets[i], player)) {
                // Bullet collided with player
                player.damage();
                enemyBullets.splice(i, 1);
            } else if (enemyBullets[i].duration <= 0) {
                // Bullet timed out
                enemyBullets.splice(i, 1);
            }
        }

        // Update pickups
        for (let i = pickups.length - 1; i >= 0; i--) {
            // Check if player has collected the pickup
            if (collectPickups(pickups[i], player)) {
                pickups[i].onPickup();
                pickups.splice(i, 1);
            } else if (pickups[i].duration <= 0) {
                pickups.splice(i, 1); // Delete expired pickups
            } else {
                pickups[i].update();
            }
        }

        // Check for use of special weapon
        if (specialReady) {
            specialReady = false;
            player.bombs--;
            for (let i = enemies.length - 1; i >= 0; i--) {
                // Deal large damage to all enemies near the player
                if (enemies[i].getPlayerDistance() < 1200) {
                    enemies[i].damage(10);
                    if (enemies[i].hp <= 0) {
                        //Kill enemy
                        enemies[i].onDeath();
                        enemies.splice(i, 1);
                    }
                }
            }
            explosion2.currentTime = 0;
            explosion2.play();
        }

        // Check collisions between player bullets and enemies
        for (let i = player.bullets.length - 1; i >= 0; i--) {
            for (let j = enemies.length - 1; j >= 0; j--) {
                if (roundCollision(player.bullets[i], enemies[j])) {
                    enemies[j].damage();
                    if (enemies[j].hp <= 0) {
                        // Kill enemy
                        let itemSpawn = enemies[j].onDeath();
                        switch (itemSpawn) {
                            case 'scoreLG':
                                pickups.push(new scorePickup(enemies[j].x, enemies[j].y, 'lg'));
                                break;
                            case 'scoreMD':
                                pickups.push(new scorePickup(enemies[j].x, enemies[j].y, 'md'));
                                break;
                            case 'scoreSM':
                                pickups.push(new scorePickup(enemies[j].x, enemies[j].y, 'sm'));
                                break;
                            case 'time':
                                pickups.push(new timePickup(enemies[j].x, enemies[j].y));
                                break;
                            case 'health':
                                pickups.push(new healthPickup(enemies[j].x, enemies[j].y));
                                break;
                            case 'twinShot':
                                pickups.push(new twinShotPickup(enemies[j].x, enemies[j].y));
                                break;
                            case 'tripleShot':
                                pickups.push(new tripleShotPickup(enemies[j].x, enemies[j].y));
                                break;
                            case 'bomb':
                                pickups.push(new bombPickup(enemies[j].j, enemies[j].y));
                                break;
                            default:
                                // Spawn nothing
                                break;
                        }
                        enemies.splice(j, 1);
                    }
                    player.bullets.splice(i, 1);
                    break;
                }
            }
        }

        // Update hazards
        for (let i = hazards.length - 1; i >= 0; i--) {
            hazards[i].update();
            switch (hazards[i].type) {
                case "asteroid":
                    if (isOOB(hazards[i])) {
                        hazards.splice(i, 1);
                        break;
                    }
                    if (roundCollision(hazards[i], player)) {
                        player.damage();
                        if (player.x - player.width / 2 < hazards[i].x + hazards[i].radius) {
                            player.x = hazards[i].x + hazards[i].radius - player.width / 2;
                        } else if (player.x + player.width / 2 > hazards[i].x + 3 * hazards[i].radius) {
                            player.x = hazards[i].x + 3 * hazards[i].radius + player.width / 2;
                        }
                        if (player.y - player.height / 2 < hazards[i].y + hazards[i].radius) {
                            player.y = hazards[i].y + hazards[i].radius - player.height / 2;
                        } else if (player.y + player.height / 2 > hazards[i].y + 3 * hazards[i].radius) {
                            player.y = hazards[i].y + 3 * hazards[i].radius + player.height / 2;
                        }
                    }
                    for (let j = enemies.length - 1; j >= 0; j--) {
                        if (roundCollision(hazards[i], enemies[j])) {
                            if (enemies[j].x - enemies[j].width / 2 < hazards[i].x + hazards[i].radius) {
                                enemies[j].x = hazards[i].x + hazards[i].radius - enemies[j].width / 2;
                            } else if (enemies[j].x + enemies[j].width / 2 > hazards[i].x + 3 * hazards[i].radius) {
                                enemies[j].x = hazards[i].x + 3 * hazards[i].radius + enemies[j].width / 2;
                            }
                            if (enemies[j].y - enemies[j].height / 2 < hazards[i].y + hazards[i].radius) {
                                enemies[j].y = hazards[i].y + hazards[i].radius - enemies[j].height / 2;
                            } else if (enemies[j].y + enemies[j].height / 2 > hazards[i].y + 3 * hazards[i].radius) {
                                enemies[j].y = hazards[i].y + 3 * hazards[i].radius + enemies[j].height / 2;
                            }
                        }
                    }
                    break;
            }
        }

        // Check collisions between bullets and hazards
        for (let i = player.bullets.length - 1; i >= 0; i--) {
            for (let j = hazards.length - 1; j >= 0; j--) {
                if (roundCollision(hazards[j], player.bullets[i])) {
                    enemyHitSound.currentTime = 0;
                    enemyHitSound.play();
                    player.bullets.splice(i, 1);
                    break;
                }
            }
        }

        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            for (let j = hazards.length - 1; j >= 0; j--) {
                if (roundCollision(hazards[j], enemyBullets[i])) {
                    enemyHitSound.currentTime = 0;
                    enemyHitSound.play();
                    enemyBullets.splice(i, 1);
                    break;
                }
            }
        }

        // Update Effects
        for (let i = effects.length - 1; i >= 0; i--) {
            effects[i].update();
            if (effects[i].timer == 0) {
                effects.splice(i, 1);
            }
        }

        // spawn pickups
        pickupSpawnTimer--;
        if (pickupSpawnTimer == 0) {
            spawnPickups();
            pickupSpawnTimer = Math.floor(Math.random() * (pickupTimerVariance + intensityLevel)) + (pickupTimerBase + 2 * intensityLevel);
        }

        // spawn enemies
        enemySpawnTimer--;
        if (enemySpawnTimer == 0) {
            spawnEnemies();
            enemySpawnTimer = Math.floor(Math.random() * (enemyTimerVariance - intensityLevel)) + (enemyTimerBase - 2 * intensityLevel);
        }

        // spawn asteroids
        asteroidSpawnTimer--;
        if (asteroidSpawnTimer == 0) {
            spawnAsteroid();
            asteroidSpawnTimer = Math.floor(Math.random() * asteroidTimerVariance) + asteroidTimerBase;
        }
    }
}

function isOOB(object) {
    // Return true if object is more than 100 units outside of the play area in any direction
    if (object.x < -100) { return true };
    if (object.y < -100) { return true };
    if (object.x > gameWidth + 100) { return true };
    if (object.y > gameHeight + 100) { return true };
    return false;
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

    // Draw the background
    if (gameState == GameStates.Playing || gameState == GameStates.Paused || gameState == GameStates.GameOver) {
        ctx.drawImage(images.Background, viewport.x, viewport.y, viewport.width, viewport.height, 0, 0, viewport.width, viewport.height);
    } else {
        ctx.drawImage(images.Background, 0, 0, viewport.width, viewport.height);
    }

    if (gameState == GameStates.Menu || gameState == GameStates.Instructions
        || gameState == GameStates.Options || gameState == GameStates.Paused
        || gameState == GameStates.GameOver || gameState == GameStates.HighScore) {
        // Draw menu backdrop
        ctx.fillStyle = lightBlue;
        ctx.fillRect(canvas.width / 8, canvas.height / 8, canvas.width * (6 / 8), canvas.height * (6 / 8));

        // Draw Page Title
        ctx.fillStyle = black;
        ctx.font = "40px Arial"
        ctx.textAlign = "center";

        switch (gameState) {
            case GameStates.Menu:
                ctx.fillText("Ace of Space", canvas.width / 2, canvas.height * 7 / 32);
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

                // Draw the page indicator
                ctx.fillText(`${instructionPage} / ${maxInstructionPage}`, canvas.width / 2, canvas.height * 108 / 128);
                ctx.fillText('<<', canvas.width * 3 / 16, canvas.height / 2);
                ctx.fillText('>>', canvas.width * 13 / 16, canvas.height / 2);

                // Display the instructions
                switch (instructionPage) {
                    case 1:
                        ctx.textAlign = "center";
                        ctx.font = "32px Arial";
                        ctx.fillText("Objective", canvas.width / 2, canvas.height * 5 / 16);

                        ctx.textAlign = "left";
                        ctx.font = "24px Arial";
                        ctx.fillText("Survive while collecting golden stars and", canvas.width / 4, canvas.height * 6 / 16);
                        ctx.fillText("powerups and destroying enemies to get", canvas.width / 4, canvas.height * 7 / 16);
                        ctx.fillText("as many points as possible before time", canvas.width / 4, canvas.height * 8 / 16);
                        ctx.fillText("runs out.", canvas.width / 4, canvas.height * 9 / 16);
                        break;
                    case 2:
                        ctx.textAlign = "center";
                        ctx.font = "32px Arial";
                        ctx.fillText("Controls", canvas.width / 2, canvas.height * 5 / 16);

                        ctx.textAlign = "left";
                        ctx.font = "20px Arial";
                        ctx.fillText("Steering Mode:    W / Up: Speed up", canvas.width / 4, canvas.height * 12 / 32);
                        ctx.fillText("                             S / Down: Slow down / Reverse", canvas.width / 4, canvas.height * 13 / 32);
                        ctx.fillText("                             A D / Left Right: Rotate", canvas.width / 4, canvas.height * 14 / 32);
                        ctx.fillText("8-Direction Mode: WASD / Arrow Keys: Move", canvas.width / 4, canvas.height * 16 / 32);
                        ctx.fillText("Spacebar / Left Mouse: Fire main weapon", canvas.width / 4, canvas.height * 18 / 32);
                        ctx.fillText("F / Right Mouse: Bomb (Heavy damage to nearby enemies)", canvas.width / 4, canvas.height * 20 / 32);
                        break;
                    case 3:
                        ctx.textAlign = "center";
                        ctx.font = "32px Arial";
                        ctx.fillText("Items", canvas.width / 2, canvas.height * 5 / 16);
                        ctx.textAlign = "left";
                        ctx.font = "20px Arial";
                        ctx.drawImage(images.ScorePickup, canvas.width / 4, canvas.height * 12 / 32, 50, 50);
                        ctx.fillText("Gain 5(sm)/10(md)/20(lg) points", canvas.width * 5 / 16, canvas.height * 27 / 64);
                        ctx.drawImage(images.TimePickup, canvas.width / 4, canvas.height * 16 / 32, 50, 50);
                        ctx.fillText("Increase remaining time by 10 seconds", canvas.width * 5 / 16, canvas.height * 35 / 64);
                        ctx.drawImage(images.HealthPickup, canvas.width / 4, canvas.height * 20 / 32, 50, 50);
                        ctx.fillText("Grants 1 additional HP", canvas.width * 5 / 16, canvas.height * 43 / 64);
                        break;
                    case 4:
                        ctx.textAlign = "center";
                        ctx.font = "32px Arial";
                        ctx.fillText("Items (cont.)", canvas.width / 2, canvas.height * 5 / 16);
                        ctx.textAlign = "left";
                        ctx.font = "20px Arial";
                        ctx.drawImage(images.TwinshotPickup, canvas.width / 4, canvas.height * 12 / 32, 50, 50);
                        ctx.fillText("Grants ammo and upgrades default weapon to", canvas.width * 5 / 16, canvas.height * 26 / 64);
                        ctx.fillText("fire 2 shots at once", canvas.width * 5 / 16, canvas.height * 28 / 64);
                        ctx.drawImage(images.TripleshotPickup, canvas.width / 4, canvas.height * 16 / 32, 50, 50);
                        ctx.fillText("Grants ammo and upgrades weapon to fire", canvas.width * 5 / 16, canvas.height * 34 / 64);
                        ctx.fillText("3 shots at once", canvas.width * 5 / 16, canvas.height * 36 / 64);
                        ctx.drawImage(images.BombPickup, canvas.width / 4, canvas.height * 20 / 32, 50, 50);
                        ctx.fillText("Grants 1 additional bomb", canvas.width * 5 / 16, canvas.height * 43 / 64);
                        break;
                    case 5:
                        ctx.textAlign = "center";
                        ctx.font = "32px Arial";
                        ctx.fillText("Enemies", canvas.width / 2, canvas.height * 5 / 16);
                        ctx.textAlign = "left";
                        ctx.font = "20px Arial";
                        ctx.drawImage(images.BasicShooterEnemy, canvas.width / 4, canvas.height * 12 / 32, 50, 50);
                        ctx.fillText("Basic enemy, fires 1 shot at a time", canvas.width * 5 / 16, canvas.height * 27 / 64);
                        ctx.drawImage(images.AdvancedShooterEnemy, canvas.width / 4, canvas.height * 16 / 32, 50, 50);
                        ctx.fillText("Stronger, tougher version of basic enemy", canvas.width * 5 / 16, canvas.height * 35 / 64);
                        ctx.drawImage(images.TwinshotEnemy, canvas.width / 4, canvas.height * 20 / 32, 50, 50);
                        ctx.fillText("Fires 2 shots in a 'V' pattern", canvas.width * 5 / 16, canvas.height * 43 / 64);
                        break;
                    case 6:
                        ctx.textAlign = "center";
                        ctx.font = "32px Arial";
                        ctx.fillText("Enemies (cont.)", canvas.width / 2, canvas.height * 5 / 16);
                        ctx.textAlign = "left";
                        ctx.font = "20px Arial";
                        ctx.drawImage(images.TripleshotEnemy, canvas.width / 4, canvas.height * 12 / 32, 50, 50);
                        ctx.fillText("Strong enemy, fires a 3 shot spread", canvas.width * 5 / 16, canvas.height * 27 / 64);
                        ctx.drawImage(images.Turret, canvas.width / 4, canvas.height * 16 / 32, 50, 50);
                        ctx.fillText("Stationary, fires 8 shots in a ring", canvas.width * 5 / 16, canvas.height * 35 / 64);
                        ctx.drawImage(images.CargoEnemy, canvas.width / 4, canvas.height * 20 / 32, 50, 50);
                        ctx.fillText("Runs away, drops strong pickups on death", canvas.width * 5 / 16, canvas.height * 43 / 64);
                        break;
                    case 7:
                        ctx.textAlign = "center";
                        ctx.font = "32px Arial";
                        ctx.fillText("Hazards", canvas.width / 2, canvas.height * 5 / 16);
                        ctx.textAlign = "left";
                        ctx.font = "20px Arial";
                        ctx.drawImage(images.asteroidA, canvas.width / 4, canvas.height * 12 / 32, 50, 50);
                        ctx.fillText("Blocks ships and bullets", canvas.width * 5 / 16, canvas.height * 26 / 64);
                        ctx.fillText("damages player on contact", canvas.width * 5 / 16, canvas.height * 28 / 64);
                        break;
                }
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

                // Draw the control mode buttons
                ctx.fillText("Control Style", canvas.width / 2, canvas.height * 10 / 32);
                ctx.fillText("8-Direction", canvas.width * 6 / 16, canvas.height * 55 / 128);
                ctx.fillText("Steering", canvas.width * 3 / 4, canvas.height * 55 / 128);
                ctx.beginPath();
                ctx.fillStyle = !steeringControls ? green : "gray";
                ctx.strokeStyle = black;
                ctx.arc(canvas.width * 7 / 32, canvas.height * 13 / 32, 30, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.fill();
                ctx.beginPath();
                ctx.fillStyle = steeringControls ? green : "gray";
                ctx.arc(canvas.width * 5 / 8, canvas.height * 13 / 32, 30, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.fill();

                // Draw volume control sliders
                ctx.beginPath();
                ctx.fillStyle = "gray";
                ctx.strokeStyle = black;
                ctx.rect(canvas.width / 4, canvas.height * 19 / 32, sliderWidth, canvas.height * 3 / 64);
                ctx.rect(canvas.width / 4, canvas.height * 25 / 32, sliderWidth, canvas.height * 3 / 64);
                ctx.stroke();
                ctx.fill();
                ctx.beginPath();
                ctx.fillStyle = green;
                ctx.fillRect(canvas.width / 4, canvas.height * 19 / 32, sliderWidth * volumePercent, canvas.height * 3 / 64);
                ctx.fillRect(canvas.width / 4, canvas.height * 25 / 32, sliderWidth * sfxPercent, canvas.height * 3 / 64);
                ctx.fillStyle = black;
                ctx.fillText("Music", canvas.width / 2, canvas.height * 18 / 32);
                ctx.fillText("Sound Effects", canvas.width / 2, canvas.height * 24 / 32);
                break;
            case GameStates.Paused:
                ctx.fillText("Paused", canvas.width / 2, canvas.height * 7 / 32);

                // Draw the resume and quit buttons
                ctx.beginPath();
                ctx.fillStyle = green;
                ctx.strokeStyle = black;
                ctx.rect(canvas.width / 4, canvas.height * 9 / 32, canvas.width / 2, canvas.height * 3 / 32);
                ctx.rect(canvas.width / 4, canvas.height * 24 / 32, canvas.width / 2, canvas.height * 3 / 32);
                ctx.stroke();
                ctx.fill();
                ctx.fillStyle = white;
                ctx.fillText("Resume", canvas.width / 2, canvas.height * 45 / 128);
                ctx.fillText("Quit Game", canvas.width / 2, canvas.height * 105 / 128);

                // Draw volume control sliders
                ctx.beginPath();
                ctx.fillStyle = "gray";
                ctx.strokeStyle = black;
                ctx.rect(canvas.width / 4, canvas.height * 15 / 32, sliderWidth, canvas.height * 3 / 64);
                ctx.rect(canvas.width / 4, canvas.height * 20 / 32, sliderWidth, canvas.height * 3 / 64);
                ctx.stroke();
                ctx.fill();
                ctx.beginPath();
                ctx.fillStyle = green;
                ctx.fillRect(canvas.width / 4, canvas.height * 15 / 32, sliderWidth * volumePercent, canvas.height * 3 / 64);
                ctx.fillRect(canvas.width / 4, canvas.height * 20 / 32, sliderWidth * sfxPercent, canvas.height * 3 / 64);
                ctx.fillStyle = black;
                ctx.fillText("Music", canvas.width / 2, canvas.height * 29 / 64);
                ctx.fillText("Sound Effects", canvas.width / 2, canvas.height * 19 / 32);
                break;
            case GameStates.GameOver:
                ctx.fillText("GAME OVER", canvas.width / 2, canvas.height * 7 / 32);
                ctx.fillText("Score: " + score, canvas.width / 2, canvas.height * 16 / 32);

                ctx.beginPath();
                ctx.fillStyle = green;
                ctx.strokeStyle = black;
                ctx.rect(canvas.width / 4, canvas.height * 20 / 32, canvas.width / 2, canvas.height * 3 / 32);
                ctx.stroke();
                ctx.fill();
                ctx.fillStyle = white;
                ctx.fillText("Main Menu", canvas.width / 2, canvas.height * 89 / 128);
                break;
            case GameStates.HighScore:
                ctx.fillText("High Scores", canvas.width / 2, canvas.height * 7 / 32);
                ctx.beginPath();
                ctx.fillStyle = red;
                ctx.rect(canvas.width * 5 / 32, canvas.height * 11 / 64, canvas.width / 16, canvas.height / 16);
                ctx.stroke();
                ctx.fill();
                ctx.fillStyle = black;
                ctx.fillText("X", canvas.width * 6 / 32, canvas.height * 29 / 128);

                ctx.fillStyle = black;
                ctx.textAlign = "left";
                // Print the top 5 scores, and leave entries blank if there are less than 5 scores saved
                ctx.fillText(`1: ${highScores[0]}`, canvas.width * 8 / 32, canvas.height * 45 / 128);
                ctx.fillText(`2: ${highScores[1] ?? ''}`, canvas.width * 8 / 32, canvas.height * 60 / 128);
                ctx.fillText(`3: ${highScores[2] ?? ''}`, canvas.width * 8 / 32, canvas.height * 75 / 128);
                ctx.fillText(`4: ${highScores[3] ?? ''}`, canvas.width * 8 / 32, canvas.height * 90 / 128);
                ctx.fillText(`5: ${highScores[4] ?? ''}`, canvas.width * 8 / 32, canvas.height * 105 / 128);
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
        ctx.rect(canvas.width / 4, canvas.height * 14 / 32, canvas.width / 2, canvas.height * 3 / 32);
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = white;
        ctx.fillText("How To Play", canvas.width / 2, canvas.height * 65 / 128);

        // Draw "Options" button
        ctx.beginPath();
        ctx.fillStyle = green;
        ctx.rect(canvas.width / 4, canvas.height * 19 / 32, canvas.width / 2, canvas.height * 3 / 32);
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = white;
        ctx.fillText("Options", canvas.width / 2, canvas.height * 85 / 128);

        // Draw "High Scores" button
        ctx.beginPath();
        ctx.fillStyle = green;
        ctx.rect(canvas.width / 4, canvas.height * 24 / 32, canvas.width / 2, canvas.height * 3 / 32);
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = white;
        ctx.fillText("High Scores", canvas.width / 2, canvas.height * 105 / 128);

    } else if (gameState == GameStates.Playing) { // Render Gameplay

        // Render enemy bullets
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            enemyBullets[i].render(viewport, ctx);
        }
        // Render enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            enemies[i].render(viewport, ctx);
        }

        // Render pickups
        for (let i = pickups.length - 1; i >= 0; i--) {
            pickups[i].render(viewport, ctx);
        }

        // Render hazards
        for (let i = hazards.length - 1; i >= 0; i--) {
            hazards[i].render(viewport, ctx);
        }

        // Render the player
        if (player.hp > 0) { player.render(viewport, ctx); }

        // Render effects
        for (let i = effects.length - 1; i >= 0; i--) {
            effects[i].render(viewport, ctx);
        }
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
        ctx.fillText("Health: " + player.hp, canvas.width / 64, canvas.height * 3 / 64);
        ctx.fillText("Score: " + score, canvas.width / 64, canvas.height * 6 / 64);
        ctx.fillText("Bombs: " + player.bombs, canvas.width / 64, canvas.height - (canvas.height / 64));
        if (player.shotType != 0) {
            ctx.fillText("Ammo: " + player.ammo, canvas.width / 64, canvas.height - (canvas.height * 3 / 64));
        }
        if (gameState == GameStates.Playing) {
            ctx.beginPath();
            ctx.textAlign = "center";
            ctx.strokeStyle = white;
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
        // Check if "Start" button was clicked
        if ((mouseY >= canvas.height * 9 / 32) && (mouseY <= canvas.height * 12 / 32)) {
            menuButtonSound.currentTime = 0;
            menuButtonSound.play();
            newGame();
        }

        // Check if "How To Play" button was clicked
        if ((mouseY >= canvas.height * 14 / 32) && (mouseY <= canvas.height * 17 / 32)) {
            gameState = GameStates.Instructions;
            instructionPage = 1;
            menuButtonSound.currentTime = 0;
            menuButtonSound.play();
        }

        // Check if "Options" button was clicked
        if ((mouseY >= canvas.height * 19 / 32) && (mouseY <= canvas.height * 22 / 32)) {
            gameState = GameStates.Options;
            menuButtonSound.currentTime = 0;
            menuButtonSound.play();
            canvas.addEventListener("mousemove", updateSlider);
        }

        // Check if "High Scores" button was clicked
        if ((mouseY >= canvas.height * 24 / 32) && (mouseY <= canvas.height * 27 / 32)) {
            gameState = GameStates.HighScore;
            try {
                highScoreString = localStorage.getItem(HIGH_SCORES);
                highScores = highScoreString.split(',').map(function (score) {
                    return parseInt(score, 10);
                });
            } catch {
                highScores = [0, 0, 0, 0, 0];
            }

            menuButtonSound.currentTime = 0;
            menuButtonSound.play();
        }
    } else if (gameState == GameStates.Instructions || gameState == GameStates.Options || gameState == GameStates.HighScore) {
        // Check for close button
        if (mouseX >= canvas.width * 5 / 32 && mouseX <= canvas.width * 7 / 32 &&
            mouseY >= canvas.height * 11 / 64 && mouseY <= canvas.height * 15 / 64) {
            gameState = GameStates.Menu;
            menuButtonSound.currentTime = 0;
            menuButtonSound.play();
            canvas.removeEventListener("mousemove", updateSlider);
        }

        // Check for instruction page buttons
        if (gameState == GameStates.Instructions) {
            if (mouseY >= canvas.height * 29 / 64 && mouseY <= canvas.height * 33 / 64) {
                if (mouseX >= canvas.width * 5 / 32 && mouseX <= canvas.width * 7 / 32) {
                    instructionPage == 1 ? instructionPage = maxInstructionPage : instructionPage--;
                    menuButtonSound.currentTime = 0;
                    menuButtonSound.play();
                } else if (mouseX >= canvas.width * 25 / 32 && mouseX <= canvas.width * 27 / 32) {
                    instructionPage == maxInstructionPage ? instructionPage = 1 : instructionPage++;
                    menuButtonSound.currentTime = 0;
                    menuButtonSound.play();
                }
            }
        }

        // Check for options page buttons
        if (gameState == GameStates.Options) {
            let btnCenterY = canvas.height * 13 / 32;
            let leftBtnCenterX = canvas.width * 7 / 32;
            let rightBtnCenterX = canvas.width * 5 / 8;
            let btnRadius = 30;
            if (mouseY >= (btnCenterY - btnRadius) && mouseY <= (btnCenterY + btnRadius)) {
                if (mouseX >= (leftBtnCenterX - btnRadius) && mouseX <= (leftBtnCenterX + btnRadius)) {
                    steeringControls = false;
                    menuButtonSound.currentTime = 0;
                    menuButtonSound.play();
                } else if (mouseX >= (rightBtnCenterX - btnRadius) && mouseX <= (rightBtnCenterX + btnRadius)) {
                    steeringControls = true;
                    menuButtonSound.currentTime = 0;
                    menuButtonSound.play();
                }
            }
        }
    } else if (gameState == GameStates.Playing) {
        if (mouseX >= (canvas.width - canvas.width * 18 / 256)
            && mouseX <= (canvas.width - canvas.width * 6 / 256)
            && mouseY >= (canvas.height * 5 / 256)
            && mouseY <= (canvas.height * 5 / 256 + canvas.width + 12 / 256)) {
            gameState = GameStates.Paused;
            clearInterval(timerIntervalId);
            menuButtonSound.currentTime = 0;
            menuButtonSound.play();
            canvas.addEventListener("mousemove", updateSlider);
        }
    } else if (gameState == GameStates.Paused) {
        if (mouseX < canvas.width / 4 || mouseX > canvas.width * 3 / 4) {
            // Mouse not within horizontal bounds of any button
            return;
        }
        if (mouseY >= canvas.height * 9 / 32 && mouseY <= canvas.height * 12 / 32) {
            // Resume Play
            gameState = GameStates.Playing;
            timerIntervalId = setInterval(countDown, 1000);
            menuButtonSound.currentTime = 0;
            menuButtonSound.play();
        } else if (mouseY >= canvas.height * 24 / 32 && mouseY <= canvas.height * 27 / 32) {
            // Quit game
            gameMusic.pause();
            clearInterval(timerIntervalId);
            gameState = GameStates.Menu;
        }
    } else if (gameState == GameStates.GameOver) {
        if (mouseX >= canvas.width / 4 && mouseX <= canvas.width * 3 / 4
            && mouseY >= canvas.height * 20 / 32 && mouseY <= canvas.height * 23 / 32) {
            gameState = GameStates.Menu;
            menuButtonSound.currentTime = 0;
            menuButtonSound.play();
        }
    }
});

function updateSlider(e) {
    if (!controller.mousePressed) { return; }
    let mouseX = e.offsetX;
    let mouseY = e.offsetY;
    // Detect mouse position past the slider on each end, then clamp to a range of 0 - 1
    if (mouseX >= canvas.width / 4 - 50 && mouseX <= canvas.width / 4 + sliderWidth + 50) {
        if (gameState == GameStates.Options) {
            if (mouseY >= canvas.height * 19 / 32
                && mouseY <= (canvas.height * 19 / 32) + (canvas.height * 3 / 64)) {
                // Update volume slider
                volumePercent = (mouseX - canvas.width / 4) / sliderWidth;
                volumePercent < 0 ? volumePercent = 0 : volumePercent;
                volumePercent > 1 ? volumePercent = 1 : volumePercent;
                gameMusic.volume = volumePercent;
            } else if (mouseY >= canvas.height * 25 / 32
                && mouseY <= (canvas.height * 25 / 32) + (canvas.height * 3 / 64)) {
                sfxPercent = (mouseX - canvas.width / 4) / sliderWidth;
                sfxPercent < 0 ? sfxPercent = 0 : sfxPercent;
                sfxPercent > 1 ? sfxPercent = 1 : sfxPercent;
                setSFXVolume();
            }
        } else if (gameState == GameStates.Paused) {
            if (mouseY >= canvas.height * 15 / 32
                && mouseY <= (canvas.height * 15 / 32) + (canvas.height * 3 / 64)) {
                // Update volume slider
                volumePercent = (mouseX - canvas.width / 4) / sliderWidth;
                volumePercent < 0 ? volumePercent = 0 : volumePercent;
                volumePercent > 1 ? volumePercent = 1 : volumePercent;
                gameMusic.volume = volumePercent;
            } else if (mouseY >= canvas.height * 20 / 32
                && mouseY <= (canvas.height * 20 / 32) + (canvas.height * 3 / 64)) {
                sfxPercent = (mouseX - canvas.width / 4) / sliderWidth;
                sfxPercent < 0 ? sfxPercent = 0 : sfxPercent;
                sfxPercent > 1 ? sfxPercent = 1 : sfxPercent;
                setSFXVolume();
            }
        }
    }
}

function setSFXVolume() {
    collectSound.volume = sfxPercent;
    hitSound.volume = quietSoundBaseVolume * sfxPercent;
    menuButtonSound.volume = sfxPercent;
    gameOverSound.volume = sfxPercent;
    shortLaserSound.volume = weaponSoundBaseVolume * sfxPercent;
    whipLaserSound.volume = weaponSoundBaseVolume * sfxPercent;
    explosion1.volume = quietSoundBaseVolume * sfxPercent
    explosion2.volume = quietSoundBaseVolume * sfxPercent;
    enemyHitSound.volume = quietSoundBaseVolume * sfxPercent;
}

window.addEventListener("mousedown", (e) => {
    controller.firePressed = true;
    controller.mousePressed = true;
})

window.addEventListener("mouseup", (e) => {
    if (!controller.spacePressed) { controller.firePressed = false };
    controller.mousePressed = false;
})

canvas.addEventListener("contextmenu", (e) => {
    if (gameState == GameStates.Playing && player.bombs > 0) {
        specialReady = true;
    }
})

window.addEventListener("keydown", (e) => {
    // Pause game when escape is pressed
    if (e.key == "Escape") {
        if (gameState == GameStates.Playing) {
            gameState = GameStates.Paused;
            clearInterval(timerIntervalId);
            menuButtonSound.currentTime = 0;
            menuButtonSound.play();
            canvas.addEventListener("mousemove", updateSlider);
        } else if (gameState == GameStates.Paused) {
            gameState = GameStates.Playing;
            timerIntervalId = setInterval(countDown, 1000);
            menuButtonSound.currentTime = 0;
            menuButtonSound.play();
        } else if (gameState != GameStates.Menu) {
            gameState = GameStates.Menu;
            menuButtonSound.currentTime = 0;
            menuButtonSound.play();
        }
    }

    // Handle controller inputs
    if (e.key == 'w' || e.key == 'W' || e.key == "ArrowUp") {
        controller.upPressed = true;
    }
    if (e.key == 'a' || e.key == 'A' || e.key == "ArrowLeft") {
        controller.leftPressed = true;

        if (gameState == GameStates.Instructions) {
            instructionPage == 1 ? instructionPage = maxInstructionPage : instructionPage--;
            menuButtonSound.currentTime = 0;
            menuButtonSound.play();
        }
    }
    if (e.key == 's' || e.key == 'S' || e.key == "ArrowDown") {
        controller.downPressed = true;
    }
    if (e.key == 'd' || e.key == 'D' || e.key == "ArrowRight") {
        controller.rightPressed = true;

        if (gameState == GameStates.Instructions) {
            instructionPage == maxInstructionPage ? instructionPage = 1 : instructionPage++;
            menuButtonSound.currentTime = 0;
            menuButtonSound.play();
        }
    }
    if (e.key == ' ') {
        e.preventDefault();
        controller.firePressed = true;
        controller.spacePressed = true;
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
    if (e.key == 'f' || e.key == 'F') {
        if (player.bombs > 0) {
            specialReady = true;
        }
    }
    if (e.key == ' ') {
        if (!controller.mousePressed) { controller.firePressed = false };
        controller.spacePressed = false;
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
function collectPickups(pickup, player) {
    if (pickup.x > (player.x + (player.width / 2))) {
        // Object A is past Object B on the right
        return false;
    }
    if ((pickup.x + pickup.width) < player.x - (player.width / 2)) {
        // Object A is past Object B on the left
        return false;
    }
    if (pickup.y > (player.y + (player.height / 2))) {
        // Object A is fully below Object B
        return false;
    }
    if ((pickup.y + pickup.height) < player.y - (player.height / 2)) {
        // Object A is fully above Object B
        return false;
    }
    return true;
}

function roundCollision(roundObject, object) {
    // The roundObject.radius added to the roundObject position on each check to offset
    // difference between the object origin and object center

    // Check for collision between two round objects
    if (object.hasOwnProperty('radius')) {
        // Check if roundObject is to the right of the other object
        if (object.x + object.radius < roundObject.x + roundObject.radius) {
            return false;
        }
        // Check if roundObject is to the left of the other object
        if (object.x - object.radius > roundObject.x + roundObject.radius * 3) {
            return false;
        }
        // Check if roundObject is below the other object
        if (object.y + object.radius < roundObject.y + roundObject.radius) {
            return false;
        }
        // Check if roundObject is above the other object
        if (object.y - object.radius > roundObject.y + roundObject.radius * 3) {
            return false;
        }
        return true;
    }

    // Check if roundObject is to the right of the other object
    if (object.x + object.width / 2 < roundObject.x + roundObject.radius) {
        return false;
    }
    // Check if roundObject is to the left of the other object
    if (object.x - object.width / 2 > roundObject.x + roundObject.radius * 3) {
        return false;
    }
    // Check if roundObject is below the other object
    if (object.y + object.height / 2 < roundObject.y + roundObject.radius) {
        return false;
    }
    // Check if roundObject is above the other object
    if (object.y - object.height / 2 > roundObject.y + roundObject.radius * 3) {
        return false;
    }
    return true;
}

function spawnPickups() {
    let spawnX;
    let spawnY;

    let spawnBuffer = 100 + (20 * (intensityLevel - 1));
    let spawnDistance = 0;

    // generate a random spawn location, then reject if too close to the player
    do {
        spawnX = Math.floor(Math.random() * gameWidth);
        spawnY = Math.floor(Math.random() * gameHeight);
        spawnDistance = Math.hypot(spawnX - player.x, spawnY - player.y);
    } while (spawnX > (viewport.x - spawnBuffer)
    && spawnX < (viewport.x + viewport.width + spawnBuffer)
    && spawnY > (viewport.y - spawnBuffer)
    && spawnY < (viewport.y + viewport.height + spawnBuffer)
        && spawnDistance > (pickupMaxSpawnDistance + 100 * intensityLevel));

    // spawn a random pickup
    let pickupType = Math.floor(Math.random() * 100);
    if (pickupType < 35) {
        pickups.push(new timePickup(spawnX, spawnY));
    } else if (pickupType < 70) {
        pickups.push(new scorePickup(spawnX, spawnY, 'sm'));
    } else if (pickupType < 90) {
        pickups.push(new scorePickup(spawnX, spawnY, 'md'));
    } else {
        pickups.push(new scorePickup(spawnX, spawnY, 'lg'));
    }
}

function spawnEnemies() {
    let spawnX;
    let spawnY;

    let spawnBuffer = 200;
    let spawnDistance = 0;

    // generate a random spawn location, then reject if too close to the player
    do {
        spawnX = Math.floor(Math.random() * gameWidth);
        spawnY = Math.floor(Math.random() * gameHeight);
        spawnDistance = Math.hypot(spawnX - player.x, spawnY - player.y);
    } while (spawnX > (viewport.x - spawnBuffer)
    && spawnX < (viewport.x + viewport.width + spawnBuffer)
    && spawnY > (viewport.y - spawnBuffer)
    && spawnY < (viewport.y + viewport.height + spawnBuffer)
        && spawnDistance > (enemyMaxSpawnDistance - 120 * intensityLevel));
    // Spawn a random enemy type
    let enemyType = Math.random() * 100 + intensityLevel;
    if (enemyType < 45) {
        enemies.push(new ShooterEnemy(spawnX, spawnY));
    } else if (enemyType < 60) {
        enemies.push(new AdvancedShooterEnemy(spawnX, spawnY));
    } else if (enemyType < 65) {
        enemies.push(new Turret(spawnX, spawnY));
    } else if (enemyType < 85) {
        enemies.push(new TwinshotEnemy(spawnX, spawnY));
    } else if (enemyType < 90) {
        enemies.push(new CargoEnemy(spawnX, spawnY));
    } else {
        enemies.push(new TripleshotEnemy(spawnX, spawnY));
    }

}

function spawnAsteroid() {
    let spawnX;
    let spawnY;
    let spawnBuffer = 30;

    // generate a random spawn location, then reject if too close to the player
    do {
        spawnX = Math.floor(Math.random() * gameWidth);
        spawnY = Math.floor(Math.random() * gameHeight);
    } while (spawnX > (viewport.x - spawnBuffer)
    && spawnX < (viewport.x + viewport.width + spawnBuffer)
    && spawnY > (viewport.y - spawnBuffer)
        && spawnY < (viewport.y + viewport.height + spawnBuffer));

    hazards.push(new Asteroid(spawnX, spawnY));
}

// Load image function from this web page https://codeincomplete.com/articles/javascript-game-foundations-loading-assets/
function loadImages(names, callback) {
    var n, name,
        result = {},
        count = names.length,
        onload = function () { if (--count == 0) callback(result); };

    for (n = 0; n < names.length; n++) {
        name = names[n];
        result[name] = document.createElement('img');
        result[name].addEventListener('load', onload);
        result[name].src = `./Assets/images/${name}.png`;
    }
}

// Returns the angle between two objects
function getAngleToViewport(object) {
    let dx = (object.x + object.width / 2) - (viewport.x + viewport.width / 2);
    let dy = (object.y + object.height / 2) - (viewport.y + viewport.height / 2);
    return (Math.atan2(dy, dx) * 180 / Math.PI);
}