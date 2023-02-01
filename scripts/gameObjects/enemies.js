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

    }
    render() {

    }
}

class ShooterEnemy extends Enemy {
    constructor(x, y) {
        super(x,y);
    }
}
    constructor(x, y)
    super(x,y);
}