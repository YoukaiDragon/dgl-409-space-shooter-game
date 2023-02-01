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
    render(viewport, canvas, ctx, displayX, displayY) { }
    onPickup() { }
}

class timePickup extends Pickup {
    constructor(x, y) {
        super(x, y);
    }

    update() {
        super.update();
    }

    render(viewport, canvas, ctx, displayX, displayY) {

    }

    onPickup() {
        time += 10;
    }
}