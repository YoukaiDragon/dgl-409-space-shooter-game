class Enemy {

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.speed = 0;
        this.maxSpeed = 40;
        this.width = viewport.width / 32;
        this.height = this.width;
        this.hp = 1;
        this.fireRate = 10;
        this.bullets = [];
        this.nextShotTime = 0;
        this.points = 1; // Points gained when this enemy is killed
    }

    update(player) {}
    render(viewport, canvas, ctx) {
        // Draw projectiles
        for (let i = 0; i < this.bullets.length; i++) {
            if (isVisible(this.bullets[i].x, this.bullets[i].y)) {
                this.bullets[i].render(viewport, canvas, ctx,
                    (this.bullets[i].x - viewport.x), (this.bullets[i].y - viewport.y));
            }
        }
    }

    damage() {
        this.hp--;
    }

    onDeath() {
        score += this.points;
    }

    getPlayerDistance(player) {
        return Math.hypot(this.x - player.x, this.y - player.y);
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
        super(x,y);
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