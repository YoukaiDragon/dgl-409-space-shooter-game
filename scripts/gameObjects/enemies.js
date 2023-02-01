class Enemy {

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.speed = 0;
        this.maxSpeed = 40;
        this.width = viewport.width / 32;
        this.height = this.width;
        this.health = 1;
        this.fireRate = 10;
        this.bullets = [];
        this.nextShotTime = 0;
    }

    update() {
        // Move player based on speed and angle
        // Formula based on https://stackoverflow.com/questions/36955714/calculating-cordanates-with-angles
        this.x += Math.cos(this.angle * (Math.PI / 180)) * this.speed;
        this.y += Math.sin(this.angle * (Math.PI / 180)) * this.speed;
        if (this.bullets.length > 0) {
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                this.bullets[i].update();
                if (this.bullets[i].duration <= 0) {
                    this.bullets.splice(i, 1);
                }
            }
        }
    }
    render() {

    }

    damage() {
        this.hp--;
    }
}

class ShooterEnemy extends Enemy {
    constructor(x, y) {
        super(x,y);
    }
}

class AdvancedShooterEnemy extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.hp = 10;
        this.fireRate = 5;
    }
}