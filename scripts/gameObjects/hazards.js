class Asteroid {
    constructor(x, y) {
        this.type = "asteroid";
        this.x = x;
        this.y = y;
        this.radius = (Math.random() * 40 + 15);
        this.speed = (Math.random() * 6 + 0.1);
        this.angle = (Math.floor(Math.random() * 360));
        this.sprite = (Math.floor(Math.random() * 2));
    }

    update() {
        // Move based on speed and angle
        // Formula based on https://stackoverflow.com/questions/36955714/calculating-cordanates-with-angles
        this.x += Math.cos(this.angle * (Math.PI / 180)) * this.speed;
        this.y += Math.sin(this.angle * (Math.PI / 180)) * this.speed;
    }

    render(viewport, ctx) {
        let displayX = this.x + this.radius - viewport.x;
        let displayY = this.y + this.radius - viewport.y;
        if (this.isVisible(displayX, displayY, viewport)) {
            ctx.drawImage((this.sprite == 0 ? images.asteroidA : images.asteroidB),
                displayX, displayY, this.radius * 2, this.radius * 2);
        }

    }

    isVisible(x, y, viewport) {
        if (x < -2 * this.radius) {
            return false;
        }

        if (x > viewport.width) {
            return false;
        }

        if (y < -2 * this.radius) {
            return false;
        }

        if (y > viewport.height) {
            return false;
        }

        return true;
    }
}