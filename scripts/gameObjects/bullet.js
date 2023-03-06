class Bullet {
    constructor(x, y, angle, speed, duration, radius, playerOwned) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.duration = duration;
        this.radius = radius;
        this.playerOwned = playerOwned;
    }

    update() {
        // Move based on speed and angle
        // Formula based on https://stackoverflow.com/questions/36955714/calculating-cordanates-with-angles
        this.x += Math.cos(this.angle * (Math.PI / 180)) * this.speed;
        this.y += Math.sin(this.angle * (Math.PI / 180)) * this.speed;

        this.duration--;
    }

    render(viewport, ctx) {
        let displayX = this.x - viewport.x;
        let displayY = this.y - viewport.y;
        if (isVisible(displayX, displayY)) {
            this.playerOwned ? ctx.fillStyle = "white" : ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(displayX + this.radius, displayY + this.radius, this.radius, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}