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
    onPickup() {
        collectSound.currentTime = 0;
        collectSound.play();
     }
}

class timePickup extends Pickup {
    constructor(x, y) {
        super(x, y);
        this.width = 30;
        this.height = this.width;
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
        ctx.drawImage(images.TimePickup, displayX, displayY, this.width, this.height);
    }

    onPickup() {
        super.onPickup();
        timer += 10;
    }
}

class scorePickup extends Pickup {
    constructor(x, y, size = 'sm') {
        super(x, y);
        switch(size) {
            case 'lg':
                this.width = 40;
                this.height= 40;
                this.points = 20;
                break;
            case 'md':
                this.width = 20;
                this.height = 20;
                this.points = 10;
                break;
            case 'sm':
            default:
                this.width = 10;
                this.height = 10;
                this.points = 5;
                break;    
        }
        this.duration = 2000;
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
        ctx.fillStyle = "yellow";
        ctx.fillRect(displayX, displayY, this.width, this.height);
    }

    onPickup() {
        super.onPickup();
        score += this.points;
    }
}