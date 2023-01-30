class Player {
    constructor(x, y) {
        this.lives = 3;
        this.score = 0;
        this.x = x;
        this.y = y;
        this.speed = 0;
        this.angle = 0;
        this.bombs = 3;
        this.shotType = 0;
    }

    update() {

    }

    render(viewport, canvas, ctx, displayX, displayY) {
        // Drawing rotated shapes from https://stackoverflow.com/questions/8937727/rotate-square-on-its-axis-in-html5-canvas
        // Square being used as placeholder for player
        let width = viewport.width / 16;
        let height = width;
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.fillRect(displayX, displayY, width, height);
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
}