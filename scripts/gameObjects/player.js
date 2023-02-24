class Player {

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.lives = 3;
        this.score = 0;
        this.maxSpeed = 20;
        this.width = 30;
        this.height = this.width;
        this.speed = 0;
        this.turnSpeed = 0;
        this.maxTurnSpeed = 6;
        this.angle = 0;
        this.shotType = 0;
        this.ammo = 0; // Ammo for current special weapon
        // Index of fireRates entry is the shot type it is used for
        this.fireRates = [4];
        this.bullets = [];
        this.nextShotTime = 0;
        this.bombs = 3;
        this.invincibilityTime = 0;
        this.flickerVisible = true;

        /* 
            For testing the two potential control schemes

            when TRUE: up / down accelerate and decelerate, while left and right steer the player
            when FALSE: 8-directional movement (press one key to move in that direction, press up/down and left/right to move diagonally)
        */
        this.steeringControls = false;
    }

    update(controller) {
        if (this.invincibilityTime > 0) {
            this.invincibilityTime--;
            if (this.invincibilityTime % 4 == 0) {
                this.invincibilityTime == 0 ? this.flickerVisible = true : this.flickerVisible = !this.flickerVisible;
            }
        }
        // TESTING TWO CONTROL SCHEMES
        if (this.steeringControls) {
            // Adjust player velocity
            if (controller.upPressed) {
                if (this.speed < this.maxSpeed) {
                    this.speed++;
                }
            } else if (controller.downPressed) {
                if (this.speed > (this.maxSpeed / 2) * -1) {
                    this.speed--;
                }
            } else if (this.speed > 0) { // Adjust speed to neutral
                this.speed--;
            } else if (this.speed < 0) {
                this.speed++;
            }

            // Adjust player angle
            if (controller.leftPressed) {
                if (this.turnSpeed > 0) {
                    this.turnSpeed -= 2;
                } else {
                    this.turnSpeed--;
                    if (this.turnSpeed < this.maxTurnSpeed * -1) {
                        this.turnSpeed = this.maxTurnSpeed * -1;
                    }
                }

            } else if (controller.rightPressed) {
                if (this.turnSpeed < 0) {
                    this.turnSpeed += 2;
                } else {
                    this.turnSpeed++;
                    if (this.turnSpeed > this.maxTurnSpeed) {
                        this.turnSpeed = this.maxTurnSpeed;
                    }
                }
            } else if (this.turnSpeed > 0) { // Reset turn speed towards neutrals
                this.turnSpeed--;
            } else if (this.turnSpeed < 0) {
                this.turnSpeed++;
            }
            this.angle += this.turnSpeed;
            // Keep angle within 360 degrees
            if (this.angle < 0) {
                this.angle += 360;
            } else if (this.angle >= 360) {
                this.angle -= 360;
            }
        } else {
            // Get target angle
            if (controller.upPressed) {
                // Check for diagonal movement
                if (controller.leftPressed) {
                    this.angle = 225;
                } else if (controller.rightPressed) {
                    this.angle = 315;
                } else {
                    this.angle = 270;
                }
                this.speed > this.maxSpeed - 5 ? this.speed = this.maxSpeed : this.speed += 5;
            } else if (controller.downPressed) {
                // Check for diagonal movement
                if (controller.leftPressed) {
                    this.angle = 135;
                } else if (controller.rightPressed) {
                    this.angle = 45;
                } else {
                    this.angle = 90;
                }
                this.speed > this.maxSpeed - 5 ? this.speed = this.maxSpeed : this.speed += 5;
            } else if (controller.leftPressed) {
                this.angle = 180
                this.speed >this.maxSpeed - 5 ? this.speed = this.maxSpeed : this.speed += 5;
            } else if (controller.rightPressed) {
                this.angle = 0
                this.speed > this.maxSpeed - 5 ? this.speed = this.maxSpeed : this.speed += 5;
            } else {
                // No buttons pressed, slow to a stop
                this.speed > 5 ? this.speed -= 5 : this.speed = 0;
            }
        }

        // Move player based on speed and angle
        // Formula based on https://stackoverflow.com/questions/36955714/calculating-cordanates-with-angles
        this.x += Math.cos(this.angle * (Math.PI / 180)) * this.speed;
        this.y += Math.sin(this.angle * (Math.PI / 180)) * this.speed;


        if (this.x > gameWidth) {
            this.x = gameWidth;
        }

        if (this.x < 0) {
            this.x = 0;
        }

        if (this.y > gameHeight) {
            this.y = gameHeight;
        }

        if (this.y < 0) {
            this.y = 0;
        }

        // Fire projectiles
        if (this.nextShotTime > 0) {
            this.nextShotTime--;
        } else if (controller.firePressed) {
            // shoot bullets based on current shot type
            switch (this.shotType) {
                case 0:
                    shortLaserSound.currentTime = 0;
                    shortLaserSound.play();
                    this.bullets.push(new Bullet(this.x - this.width / 4, this.y - this.height / 4, this.angle, 35, 40, 6, true));
                    this.nextShotTime = this.fireRates[0];
                    break;
            }
        }

        if (this.bullets.length > 0) {
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                this.bullets[i].update();
                if (this.bullets[i].duration <= 0) {
                    this.bullets.splice(i, 1);
                }
            }
        }

    }

    render(viewport, canvas, ctx) {
        // Square being used as placeholder for player
        let displayX = this.x - viewport.x;
        let displayY = this.y - viewport.y;
        if (isVisible(displayX, displayY) && this.flickerVisible) {
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.translate(displayX, displayY);
            ctx.rotate(this.angle * Math.PI / 180);
            ctx.drawImage(images.player,
                -this.width /2 , -this.height / 2, this.width, this.height);
            //ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.rotate(-(this.angle * Math.PI / 180));
            ctx.translate(-displayX, -displayY);
        }


        // Draw projectiles
        for (let i = 0; i < this.bullets.length; i++) {
            displayX = this.bullets[i].x - viewport.x;
            displayY = this.bullets[i].y - viewport.y;
            if (isVisible(displayX, displayY)) {
                this.bullets[i].render(viewport, canvas, ctx,
                    displayX, displayY);
            }
        }
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    damage() {
        if (this.invincibilityTime == 0) {
            this.lives--;
            this.invincibilityTime = 40;
            if (this.lives > 0) {
                hitSound.currentTime = 0;
                hitSound.play();
            }
        }
    }
}