class Enemy {

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.speed = 0;
        this.maxSpeed = 6;
        this.turnSpeed = 3;
        this.width = 40;
        this.height = this.width;
        this.colour = "green"; // TO BE REPLACED WHEN SPRITES ARE USED INSTEAD OF SHAPES
        this.hp = 1;
        this.fireRate = 120;
        this.bullets = [];
        this.nextShotTime = 0;
        this.points = 1; // Points gained when this enemy is killed
        this.aggroDistance = 2000; // Distance from the player where enemy is active.
    }

    update() {
        // Move enemy
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

        //update projectiles
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update();
            if (this.bullets[i].duration <= 0) {
                this.bullets.splice(i, 1);
            }
        }
    }
    render(viewport, canvas, ctx) {
        let displayX;
        let displayY;
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

    damage(amount = 1) {
        this.hp -= amount;
    }

    // Each enemy should also return a value used to determine if they drop a pickup
    onDeath() {
        score += this.points;
    }

    getPlayerDistance() {
        return Math.hypot(this.x - player.x, this.y - player.y);
    }

    getPlayerAngle() {
        let dx = player.x - this.x;
        let dy = player.y - this.y;
        let angle = Math.atan2(dy, dx);

        return angle * 180 / Math.PI // return angle in degrees
    }

    move() {
        // Move character based on speed and angle
        // Formula based on https://stackoverflow.com/questions/36955714/calculating-cordanates-with-angles
        this.x += Math.cos(this.angle * (Math.PI / 180)) * this.speed;
        this.y += Math.sin(this.angle * (Math.PI / 180)) * this.speed;
    }
}

class ShooterEnemy extends Enemy {
    constructor(x, y) {
        super(x, y);
    }

    update() {
        let distance = this.getPlayerDistance();
        if (distance <= this.aggroDistance) {
            // Accelerate to max speed
            if (distance <= 400 && this.speed > this.maxSpeed / 4) {
                // Keep some distance from the player
                this.speed--;
            } else if (this.speed < this.maxSpeed) { this.speed++; }

            // Turn to face player
            let angleToPlayer = this.getPlayerAngle();
            let angleDiff = (angleToPlayer - this.angle) % 360;
            if (angleDiff < 0) { angleDiff += 360 }
            if (angleDiff < this.turnSpeed || angleDiff > 360 - this.turnSpeed) {
                // When angle difference is less than turn speed, snap to face player
                this.angle = angleToPlayer;
            } else {
                // Pick shortest turn distance to player
                angleDiff < 180 ? this.angle += this.turnSpeed : this.angle -= this.turnSpeed;
            }

            // Fire bullets
            if (this.nextShotTime > 0) {
                this.nextShotTime--;
            } else {
                if (angleDiff < 30 || angleDiff > 330) {
                    console.log(angleDiff);
                    this.bullets.push(new Bullet(this.x, this.y, this.angle, 20, 100, 6, false));
                    this.nextShotTime = this.fireRate;
                }
            }
        } else if (this.speed > 0) {
            this.speed--;
        }
        super.update();
    }

    render(viewport, canvas, ctx) {
        let displayX = this.x - viewport.x;
        let displayY = this.y - viewport.y;
        if (isVisible(displayX, displayY)) {
            ctx.beginPath();
            ctx.translate(displayX, displayY);
            ctx.rotate(this.angle * Math.PI / 180);
            ctx.drawImage(images.BasicShooterEnemy, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.rotate(-(this.angle * Math.PI / 180));
            ctx.translate(-displayX, -displayY);
        }

        super.render(viewport, canvas, ctx);
    }

    onDeath() {
        super.onDeath();
        explosion1.currentTime = 0;
        explosion1.play();
        let dropValue = Math.random() * 10;
        if (dropValue > 7) { return 'scoreMD' }
        if (dropValue > 3) { return 'scoreSM' }
        return '';
    }
}

class AdvancedShooterEnemy extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.hp = 5;
        this.fireRate = 60;
        this.turnSpeed = 4;
        this.points = 3;
        this.width = 60;
        this.height = this.width;
        this.colour = "purple";
    }

    update() {
        let distance = this.getPlayerDistance();
        if (distance <= this.aggroDistance) {
            // Accelerate to max speed
            if (distance <= 400 && this.speed > this.maxSpeed / 4) {
                // Keep some distance from the player
                this.speed--;
            } else if (this.speed < this.maxSpeed) { this.speed++; }

            // Turn to face player
            let angleToPlayer = this.getPlayerAngle();
            let angleDiff = (angleToPlayer - this.angle) % 360;
            if (angleDiff < 0) { angleDiff += 360 }
            if (angleDiff < this.turnSpeed || angleDiff > 360 - this.turnSpeed) {
                // When angle difference is less than turn speed, snap to face player
                this.angle = angleToPlayer;
            } else {
                // Pick shortest turn distance to player
                angleDiff < 180 ? this.angle += this.turnSpeed : this.angle -= this.turnSpeed;
            }

            // Fire bullets
            if (this.nextShotTime > 0) {
                this.nextShotTime--;
            } else {
                if (angleDiff < 30 || angleDiff > 330) {
                    console.log(angleDiff);
                    this.bullets.push(new Bullet(this.x, this.y, this.angle, 20, 100, 6, false));
                    this.nextShotTime = this.fireRate;
                }
            }
        } else if (this.speed > 0) {
            this.speed--;
        }
        super.update();
    }

    render(viewport, canvas, ctx) {
        let displayX = this.x - viewport.x;
        let displayY = this.y - viewport.y;
        if (isVisible(displayX, displayY)) {
            ctx.beginPath();
            ctx.translate(displayX, displayY);
            ctx.rotate(this.angle * Math.PI / 180);
            ctx.drawImage(images.AdvancedShooterEnemy, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.rotate(-(this.angle * Math.PI / 180));
            ctx.translate(-displayX, -displayY);
        }

        super.render(viewport, canvas, ctx);
    }

    onDeath() {
        super.onDeath();
        explosion1.currentTime = 0;
        explosion1.play();
        let dropValue = Math.random() * 10;
        if (this.points == 3) { dropValue += 3 } // Have Advanced Shooter Enemies drop better items
        if (dropValue > 6) { return 'scoreLG' }
        if (dropValue > 4) { return 'scoreMD' }
        if (dropValue > 0) { return 'scoreSM' }
        return '';
    }
}

class TwinshotEnemy extends Enemy {
    constructor(x, y) {
        super(x, y)
        this.maxSpeed = 4;
        this.turnSpeed = 2;
        this.width = 50;
        this.height = this.width;
        this.colour = "cyan"; // TO BE REPLACED WHEN SPRITES ARE USED INSTEAD OF SHAPES
        this.hp = 2;
        this.fireRate = 100;
        this.points = 2;
    }

    update() {
        let distance = this.getPlayerDistance();
        if (distance <= this.aggroDistance) {
            // Accelerate to max speed
            if (distance <= 600 && this.speed > this.maxSpeed / 4) {
                // Keep some distance from the player
                this.speed--;
            } else if (this.speed < this.maxSpeed) { this.speed++; }

            // Turn to face player
            let angleToPlayer = this.getPlayerAngle();
            let angleDiff = angleToPlayer - this.angle;
            angleDiff < 0 ? angleDiff += 360 : angleDiff;
            if (angleDiff < this.turnSpeed || angleDiff > 360 - this.turnSpeed) {
                // When angle difference is less than turn speed, snap to face player
                this.angle = angleToPlayer;
            } else {
                // Pick shortest turn distance to player
                angleDiff < 180 ? this.angle += this.turnSpeed : this.angle -= this.turnSpeed;
            }

            // Fire bullets
            if (this.nextShotTime > 0) {
                this.nextShotTime--;
            } else {
                if (angleDiff < 20 * this.turnSpeed || angleDiff > 360 - 20 * this.turnSpeed) {
                    this.bullets.push(new Bullet(this.x, this.y, (this.angle + 25) % 360, 25, 110, 6, false));
                    this.bullets.push(new Bullet(this.x, this.y, (360 + this.angle - 25) % 360, 25, 110, 6, false));
                    this.nextShotTime = this.fireRate;
                }
            }
        } else if (this.speed > 0) {
            this.speed--;
        }
        super.update();
    }

    render(viewport, canvas, ctx) {
        let displayX = this.x - viewport.x;
        let displayY = this.y - viewport.y;
        if (isVisible(displayX, displayY)) {
            ctx.beginPath();
            ctx.fillStyle = this.colour;
            ctx.translate(displayX, displayY);
            ctx.rotate(this.angle * Math.PI / 180);
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.rotate(-(this.angle * Math.PI / 180));
            ctx.translate(-displayX, -displayY);
        }

        super.render(viewport, canvas, ctx);
    }

    onDeath() {
        super.onDeath();
        explosion1.currentTime = 0;
        explosion1.play();
        let dropValue = Math.random() * 100;
        if (dropValue > 95) { return 'health' }
        if (dropValue > 80) { return 'time' }
        if (dropValue > 70) { return 'scoreLG' }
        if (dropValue > 50) { return 'scoreMD' }
        if (dropValue > 30) { return 'scoreSM' }
        return '';
    }
}

class TripleShotEnemy extends Enemy {
    constructor(x, y) {
        super(x, y)
        this.maxSpeed = 5;
        this.turnSpeed = 3;
        this.width = 70;
        this.height = this.width;
        this.colour = "silver"; // TO BE REPLACED WHEN SPRITES ARE USED INSTEAD OF SHAPES
        this.hp = 3;
        this.fireRate = 100;
        this.points = 4;
    }

    update() {
        let distance = this.getPlayerDistance();
        if (distance <= this.aggroDistance) {
            // Accelerate to max speed
            if (distance <= 600 && this.speed > this.maxSpeed / 4) {
                // Keep some distance from the player
                this.speed--;
            } else if (this.speed < this.maxSpeed) { this.speed++; }

            // Turn to face player
            let angleToPlayer = this.getPlayerAngle();
            let angleDiff = angleToPlayer - this.angle;
            angleDiff < 0 ? angleDiff += 360 : angleDiff;
            if (angleDiff < this.turnSpeed || angleDiff > 360 - this.turnSpeed) {
                // When angle difference is less than turn speed, snap to face player
                this.angle = angleToPlayer;
            } else {
                // Pick shortest turn distance to player
                angleDiff < 180 ? this.angle += this.turnSpeed : this.angle -= this.turnSpeed;
            }

            // Fire bullets
            if (this.nextShotTime > 0) {
                this.nextShotTime--;
            } else {
                if (angleDiff < 20 * this.turnSpeed || angleDiff > 360 - 20 * this.turnSpeed) {
                    this.bullets.push(new Bullet(this.x, this.y, this.angle, 25, 110, 6, false));
                    this.bullets.push(new Bullet(this.x, this.y, (this.angle + 25) % 360, 25, 110, 6, false));
                    this.bullets.push(new Bullet(this.x, this.y, (360 + this.angle - 25) % 360, 25, 110, 6, false));
                    this.nextShotTime = this.fireRate;
                }
            }
        } else if (this.speed > 0) {
            this.speed--;
        }
        super.update();
    }

    render(viewport, canvas, ctx) {
        let displayX = this.x - viewport.x;
        let displayY = this.y - viewport.y;
        if (isVisible(displayX, displayY)) {
            ctx.beginPath();
            ctx.fillStyle = this.colour;
            ctx.translate(displayX, displayY);
            ctx.rotate(this.angle * Math.PI / 180);
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.rotate(-(this.angle * Math.PI / 180));
            ctx.translate(-displayX, -displayY);
        }

        super.render(viewport, canvas, ctx);
    }

    onDeath() {
        super.onDeath();
        explosion1.currentTime = 0;
        explosion1.play();
        let dropValue = Math.random() * 100;
        if (dropValue > 85) { return 'health' }
        if (dropValue > 65) { return 'time' }
        if (dropValue > 35) { return 'scoreLG' }
        if (dropValue > 10) { return 'scoreMD' }
        return 'scoreSM';
    }
}