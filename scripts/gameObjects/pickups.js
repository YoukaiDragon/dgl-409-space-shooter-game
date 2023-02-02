class Pickup {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width;
        this.height;
        this.duration = 2000;
    }

    update() {
        this.duration--;
    }
    render(viewport, canvas, ctx) { }
    onPickup() { }
}

class timePickup extends Pickup {
    constructor(x, y) {
        super(x, y);
        this.width = 20;
        this.height = 20;
    }

    update() {
        super.update();
    }

    render(viewport, canvas, ctx) {
        let displayX = this.x - viewport.x;
        let displayY = this.y - viewport.y;
        if (displayX < this.width * -1 || displayX > viewport.width
            || displayY < this.height * -1 || displayY > viewport.height) {
                return; // Out of viewport, do not display
        }
        ctx.beginPath();
        ctx.fillStyle = "orange";
        ctx.fillRect(displayX, displayY, this.width, this.height);
    }

    onPickup() {
        timer += 10;
    }
}