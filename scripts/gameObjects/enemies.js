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
        this.fireRate = 10;
        this.bullets = [];
        this.nextShotTime = 0;
        this.points = 1; // Points gained when this enemy is killed
        this.aggroDistance = 2000; // Distance from the player where enemy is active.
    }

    update() {
        if (this.getPlayerDistance() <= this.aggroDistance) {
            if (this.speed < this.maxSpeed) { this.speed++; }
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
        } else if (this.speed > 0) {
            this.speed--;
        }

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
    }
    render(viewport, canvas, ctx) {
        // Draw projectiles
        for (let i = 0; i < this.bullets.length; i++) {
            if (isVisible(this.bullets[i].x, this.bullets[i].y)) {
                this.bullets[i].render(viewport, canvas, ctx,
                    (this.bullets[i].x - viewport.x), (this.bullets[i].y - viewport.y));
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
        let dx = this.x - player.x;
        let dy = this.y - player.y;
        let angle = Math.atan2(dy, dx);

        return angle * 180 / Math.PI // return angle in degrees
    }

    move() {
        // Move character based on speed and angle
        // Formula based on https://stackoverflow.com/questions/36955714/calculating-cordanates-with-angles
        this.x += Math.cos(this.angle * (Math.PI / 180)) * this.speed;
        this.y += Math.sin(this.angle * (Math.PI / 180)) * this.speed;
    }

    moveBullets() {
        if (this.bullets.length > 0) {
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                this.bullets[i].update();
                if (this.bullets[i].duration <= 0) {
                    this.bullets.splice(i, 1);
                }
            }
        }
    }
}

class ShooterEnemy extends Enemy {
    constructor(x, y) {
        super(x, y);
    }

    update() {
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