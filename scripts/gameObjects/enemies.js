class Enemy {

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.speed = 0;
        this.maxSpeed = 10;
        this.turnSpeed = 5;
        this.width = 40;
        this.height = this.width;
        this.hp = 1;
        this.fireRate = 100;
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
            if (distance <= 300 && this.speed >= 0) {
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
                if (angleDiff < 4 * this.turnSpeed || angleDiff > 360 - 4 * this.turnSpeed) {
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
            ctx.fillStyle = "green";
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
    }
}

class AdvancedShooterEnemy extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.hp = 10;
        this.fireRate = 5;
    }
}