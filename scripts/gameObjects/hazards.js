class Asteroid {
    constructor(x, y) {
        this.type = "asteroid";
        this.x = x;
        this.y = y;
        this.radius = (Math.random() * 40 + 15);
        this.angle = (Math.floor(Math.random() * 360));
    }

    update() {

    }

    render(viewport, canvas, ctx) {
        let displayX = this.x + this.radius - viewport.x;
        let displayY = this.y + this.radius - viewport.y;
        if (this.isVisible(displayX, displayY, viewport)) {
            ctx.beginPath();
            ctx.fillStyle = "gray";
            ctx.arc(displayX + this.radius, displayY + this.radius, this.radius, 0, 2 * Math.PI);
            ctx.fill();
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