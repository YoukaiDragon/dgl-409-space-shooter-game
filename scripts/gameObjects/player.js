class Player {
    constructor(x, y) {
        this.lives = 3;
        this.score = 0;
        this.x = x;
        this.y = y;
        this.speed = 0;
        this.maxSpeed = 60;
        this.angle = 10;
        this.bombs = 3;
        this.shotType = 0;
    }

    update(controller) {

        if(controller.upPressed && this.speed < this.maxSpeed) {
            this.speed++;
        } else if(controller.downPressed && this.speed > 0) {
            this.speed--;
        }

        if(controller.leftPressed) {
            this.angle--;
            // Keep angle within 360 degrees
            if (this.angle < 0) {
                this.angle += 360;
            }
        } else if(controller.rightPressed) {
            this.angle++;
            // Keep angle within 360 degrees
            if (this.angle >= 360) {
                this.angle -= 360;
            }
        }
    }

    render(viewport, canvas, ctx, displayX, displayY) {
        // Square being used as placeholder for player
        let width = viewport.width / 16;
        let height = width;
        ctx.beginPath();
        ctx.fillStyle = "white";
        //ctx.translate(displayX + width/2, displayY + height/2);
        ctx.rotate(this.angle * Math.PI/180);
        ctx.fillRect(displayX, displayY, width, height);
        ctx.rotate(-(this.angle * Math.PI/180));
        //ctx.translate(-(displayX + width/2), displayY + height/2);
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
}