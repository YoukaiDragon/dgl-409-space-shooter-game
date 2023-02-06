class Player {

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.lives = 3;
        this.score = 0;
        this.maxSpeed = 30;
        this.width = viewport.width / 16;
        this.height = this.width;
        this.speed = 0;
        this.angle = 0;
        this.shotType = 0;
        this.ammo = 0; // Ammo for current special weapon
        // Index of fireRates entry is the shot type it is used for
        this.fireRates = [4];
        this.bullets = [];
        this.nextShotTime = 0;
        this.bombs = 3;
    }

    update(controller) {

        if (controller.upPressed && this.speed < this.maxSpeed) {
            this.speed++;
        } else if (controller.downPressed && this.speed > 0) {
            this.speed--;
        }

        if (controller.leftPressed) {
            this.angle -= 8;
            // Keep angle within 360 degrees
            if (this.angle < 0) {
                this.angle += 360;
            }
        } else if (controller.rightPressed) {
            this.angle += 8;
            // Keep angle within 360 degrees
            if (this.angle >= 360) {
                this.angle -= 360;
            }
        }

        // Move player based on speed and angle
        // Formula based on https://stackoverflow.com/questions/36955714/calculating-cordanates-with-angles
        this.x += Math.cos(this.angle * (Math.PI / 180)) * this.speed;
        this.y += Math.sin(this.angle * (Math.PI / 180)) * this.speed;

        if(this.x > gameWidth) {
            this.x = gameWidth;
        }

        if(this.x < 0) {
            this.x = 0;
        }

        if(this.y > gameHeight) {
            this.y = gameHeight;
        }

        if(this.y < 0) {
            this.y = 0;
        }

        // Fire projectiles
        if (this.nextShotTime > 0) {
            this.nextShotTime--;
        } else if (controller.firePressed) {
            // shoot bullets based on current shot type
            switch (this.shotType) {
                case 0:
                    this.bullets.push(new Bullet((this.x),
                        (this.y), this.angle, 10, 40, 6, true));
                    this.nextShotTime = this.fireRates[0];
                    break;
            }
        }


        if (this.bullets.length > 0) {
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                this.bullets[i].update();
                if (this.bullets[i].duration <= 0) {
                    this.bullets.splice(i, 1);
                }
            }
        }

    }

    render(viewport, canvas, ctx) {
        // Square being used as placeholder for player
        let displayX = this.x - viewport.x;
        let displayY = this.y - viewport.y;
        if (isVisible(displayX, displayY)) {
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.translate(displayX, displayY);
            ctx.rotate(this.angle * Math.PI / 180);
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.rotate(-(this.angle * Math.PI / 180));
            ctx.translate(-displayX, -displayY);
        }


        // Draw projectiles
        for (let i = 0; i < this.bullets.length; i++) {
            if (isVisible(this.bullets[i].x, this.bullets[i].y)) {
                this.bullets[i].render(viewport, canvas, ctx,
                    (this.bullets[i].x - viewport.x), (this.bullets[i].y - viewport.y));
            }
        }
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
}