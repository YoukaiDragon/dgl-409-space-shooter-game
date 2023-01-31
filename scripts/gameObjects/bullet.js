class Bullet {
    constructor(x, y, angle, speed, duration, size, playerOwned) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.duration = duration;
        this.size = size;
        this.playerOwned = playerOwned;
    }

    update() {
        // Move based on speed and angle
        // Formula based on https://stackoverflow.com/questions/36955714/calculating-cordanates-with-angles
        this.x += Math.cos(this.angle*(Math.PI/180)) * this.speed;
        this.y += Math.sin(this.angle*(Math.PI/180)) * this.speed;

        this.duration--;
    }

    render(viewport, canvas, ctx, displayX, displayY) {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(displayX + size/2, displayY + size/2);
        ctx.fill();
    }
}