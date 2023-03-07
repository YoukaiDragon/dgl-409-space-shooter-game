class Enemy {

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.speed = 0;
        this.maxSpeed = 6;
        this.turnSpeed = 3;
        this.width = 40;
        this.height = this.width;
        this.hp = 1;
        this.fireRate = 120;
        this.bullets = [];
        this.nextShotTime = 0;
        this.points = 1; // Points gained when this enemy is killed
        this.aggroDistance = 2000; // Distance from the player where enemy is active.
        this.image;
    }

    update() {
        // Move enemy
        this.x += Math.cos(this.angle * (Math.PI / 180)) * this.speed;
        this.y += Math.sin(this.angle * (Math.PI / 180)) * this.speed;


        if (this.x > gameWidth) {
            this.x = gameWidth;
        }

        if (this.x < 0) {
            this.x = 0;
        }

        if (this.y > gameHeight) {
            this.y = gameHeight;
        }

        if (this.y < 0) {
            this.y = 0;
        }
    }

    render(viewport, ctx) {
        let displayX = this.x - viewport.x;
        let displayY = this.y - viewport.y;
        if (this.isVisible(viewport, displayX, displayY)) {
            ctx.beginPath();
            ctx.translate(displayX, displayY);
            ctx.rotate(this.angle * Math.PI / 180);
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.rotate(-(this.angle * Math.PI / 180));
            ctx.translate(-displayX, -displayY);
        }
    }

    damage(amount = 1) {
        this.hp -= amount;
        if (this.hp > 0) {
            enemyHitSound.currentTime = 0;
            enemyHitSound.play();
        }
    }

    // Each enemy should also return a value used to determine if they drop a pickup
    onDeath() {
        score += this.points;
        effects.push(new Explosion(this.x, this.y, this.width, this.height));
    }

    getPlayerDistance() {
        return Math.hypot(this.x - player.x, this.y - player.y);
    }

    getPlayerAngle() {
        let dx = player.x - this.x;
        let dy = player.y - this.y;
        let angle = Math.atan2(dy, dx);

        return angle * 180 / Math.PI // return angle in degrees
    }

    isVisible(viewport, displayX, displayY) {
        if (displayX - this.width / 2 > viewport.width) { return false }
        if (displayX + this.width / 2 < 0) { return false }
        if (displayY - this.height / 2 > viewport.height) { return false }
        if (displayY + this.height / 2 < 0) { return false }
        return true;
    }
}

class ShooterEnemy extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.width = 60;
        this.height = this.width;
        this.turnSpeed = 4;
        this.image = images.BasicShooterEnemy
    }

    update() {
        let distance = this.getPlayerDistance();
        if (distance <= this.aggroDistance) {
            // Accelerate to max speed
            if (distance <= 400 && this.speed > this.maxSpeed / 4) {
                // Keep some distance from the player
                this.speed--;
            } else if (this.speed < this.maxSpeed) { this.speed++; }

            // Turn to face player
            let angleToPlayer = this.getPlayerAngle();
            let angleDiff = (angleToPlayer - this.angle) % 360;
            if (angleDiff < 0) { angleDiff += 360 }
            if (angleDiff < this.turnSpeed || angleDiff > 360 - this.turnSpeed) {
                // When angle difference is less than turn speed, snap to face player
                this.angle = angleToPlayer;
            } else {
                // Pick shortest turn distance to player
                angleDiff < 180 ? this.angle += this.turnSpeed : this.angle -= this.turnSpeed;
            }

            // Fire bullets
            if (this.nextShotTime > 0) {
                this.nextShotTime--;
            } else {
                if (angleDiff < 30 || angleDiff > 330) {
                    enemyBullets.push(new Bullet(this.x, this.y, this.angle, 10, 6, false));
                    this.nextShotTime = this.fireRate;
                }
            }
        } else if (this.speed > 0) {
            this.speed--;
        }
        super.update();
    }

    onDeath() {
        super.onDeath();
        explosion1.currentTime = 0;
        explosion1.play();
        let dropValue = Math.random() * 10;
        if (dropValue > 7) { return 'scoreMD' }
        if (dropValue > 3) { return 'scoreSM' }
        return '';
    }
}

class AdvancedShooterEnemy extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.hp = 5;
        this.fireRate = 60;
        this.turnSpeed = 4;
        this.points = 3;
        this.width = 60;
        this.height = this.width;
        this.colour = "purple";
        this.image = images.AdvancedShooterEnemy;
    }

    update() {
        let distance = this.getPlayerDistance();
        if (distance <= this.aggroDistance) {
            // Accelerate to max speed
            if (distance <= 400 && this.speed > this.maxSpeed / 4) {
                // Keep some distance from the player
                this.speed--;
            } else if (this.speed < this.maxSpeed) { this.speed++; }

            // Turn to face player
            let angleToPlayer = this.getPlayerAngle();
            let angleDiff = (angleToPlayer - this.angle) % 360;
            if (angleDiff < 0) { angleDiff += 360 }
            if (angleDiff < this.turnSpeed || angleDiff > 360 - this.turnSpeed) {
                // When angle difference is less than turn speed, snap to face player
                this.angle = angleToPlayer;
            } else {
                // Pick shortest turn distance to player
                angleDiff < 180 ? this.angle += this.turnSpeed : this.angle -= this.turnSpeed;
            }

            // Fire bullets
            if (this.nextShotTime > 0) {
                this.nextShotTime--;
            } else {
                if (angleDiff < 30 || angleDiff > 330) {
                    enemyBullets.push(new Bullet(this.x, this.y, this.angle, 10, 6, false));
                    this.nextShotTime = this.fireRate;
                }
            }
        } else if (this.speed > 0) {
            this.speed--;
        }
        super.update();
    }

    onDeath() {
        super.onDeath();
        explosion1.currentTime = 0;
        explosion1.play();
        let dropValue = Math.random() * 10;
        if (this.points == 3) { dropValue += 3 } // Have Advanced Shooter Enemies drop better items
        if (dropValue > 6) { return 'scoreLG' }
        if (dropValue > 4) { return 'scoreMD' }
        if (dropValue > 0) { return 'scoreSM' }
        return '';
    }
}

class TwinshotEnemy extends Enemy {
    constructor(x, y) {
        super(x, y)
        this.maxSpeed = 4;
        this.turnSpeed = 2;
        this.width = 50;
        this.height = this.width;
        this.hp = 2;
        this.fireRate = 100;
        this.points = 2;
        this.image = images.TwinshotEnemy;
    }

    update() {
        let distance = this.getPlayerDistance();
        if (distance <= this.aggroDistance) {
            // Accelerate to max speed
            if (distance <= 600 && this.speed > this.maxSpeed / 4) {
                // Keep some distance from the player
                this.speed--;
            } else if (this.speed < this.maxSpeed) { this.speed++; }

            // Turn to face player
            let angleToPlayer = this.getPlayerAngle();
            let angleDiff = angleToPlayer - this.angle;
            angleDiff < 0 ? angleDiff += 360 : angleDiff;
            if (angleDiff < this.turnSpeed || angleDiff > 360 - this.turnSpeed) {
                // When angle difference is less than turn speed, snap to face player
                this.angle = angleToPlayer;
            } else {
                // Pick shortest turn distance to player
                angleDiff < 180 ? this.angle += this.turnSpeed : this.angle -= this.turnSpeed;
            }

            // Fire bullets
            if (this.nextShotTime > 0) {
                this.nextShotTime--;
            } else {
                if (angleDiff < 20 * this.turnSpeed || angleDiff > 360 - 20 * this.turnSpeed) {
                    enemyBullets.push(new Bullet(this.x, this.y, (this.angle + 25) % 360, 10, 6, false));
                    enemyBullets.push(new Bullet(this.x, this.y, (360 + this.angle - 25) % 360, 10, 6, false));
                    this.nextShotTime = this.fireRate;
                }
            }
        } else if (this.speed > 0) {
            this.speed--;
        }
        super.update();
    }

    onDeath() {
        super.onDeath();
        explosion1.currentTime = 0;
        explosion1.play();
        let dropValue = Math.random() * 100;
        if (dropValue > 95) { return 'health' }
        if (dropValue > 80) { return 'time' }
        if (dropValue > 70) { return 'scoreLG' }
        if (dropValue > 50) { return 'scoreMD' }
        if (dropValue > 30) { return 'scoreSM' }
        return '';
    }
}

class TripleshotEnemy extends Enemy {
    constructor(x, y) {
        super(x, y)
        this.maxSpeed = 5;
        this.turnSpeed = 3;
        this.width = 70;
        this.height = this.width;
        this.hp = 3;
        this.fireRate = 100;
        this.points = 4;
        this.image = images.TripleshotEnemy;
    }

    update() {
        let distance = this.getPlayerDistance();
        if (distance <= this.aggroDistance) {
            // Accelerate to max speed
            if (distance <= 600 && this.speed > this.maxSpeed / 4) {
                // Keep some distance from the player
                this.speed--;
            } else if (this.speed < this.maxSpeed) { this.speed++; }

            // Turn to face player
            let angleToPlayer = this.getPlayerAngle();
            let angleDiff = angleToPlayer - this.angle;
            angleDiff < 0 ? angleDiff += 360 : angleDiff;
            if (angleDiff < this.turnSpeed || angleDiff > 360 - this.turnSpeed) {
                // When angle difference is less than turn speed, snap to face player
                this.angle = angleToPlayer;
            } else {
                // Pick shortest turn distance to player
                angleDiff < 180 ? this.angle += this.turnSpeed : this.angle -= this.turnSpeed;
            }

            // Fire bullets
            if (this.nextShotTime > 0) {
                this.nextShotTime--;
            } else {
                if (angleDiff < 20 * this.turnSpeed || angleDiff > 360 - 20 * this.turnSpeed) {
                    enemyBullets.push(new Bullet(this.x, this.y, this.angle, 10, 6, false));
                    enemyBullets.push(new Bullet(this.x, this.y, (this.angle + 25) % 360, 10, 6, false));
                    enemyBullets.push(new Bullet(this.x, this.y, (360 + this.angle - 25) % 360, 10, 6, false));
                    this.nextShotTime = this.fireRate;
                }
            }
        } else if (this.speed > 0) {
            this.speed--;
        }
        super.update();
    }

    onDeath() {
        super.onDeath();
        explosion1.currentTime = 0;
        explosion1.play();
        let dropValue = Math.random() * 100;
        if (dropValue > 85) { return 'health' }
        if (dropValue > 65) { return 'time' }
        if (dropValue > 35) { return 'scoreLG' }
        if (dropValue > 10) { return 'scoreMD' }
        return 'scoreSM';
    }
}

class Turret extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.width = 180;
        this.height = this.width;
        this.maxSpeed = 0;
        this.turnSpeed = 0;
        this.hp = 5;
        this.fireRate = 40;
        this.points = 4; // Points gained when this enemy is killed
        this.aggroDistance = 1000; // Distance from the player where enemy is active
        this.image = images.Turret;
    }

    update() {
        let distance = this.getPlayerDistance();
        if (this.nextShotTime > 0) { this.nextShotTime--; }
        if (distance <= this.aggroDistance && this.nextShotTime == 0) {
            let bulletRadius = 12;
            // Adjust height using bullet radius so spawning bullets line up properly with the sprite
            enemyBullets.push(new Bullet(this.x, this.y - bulletRadius, 0, 10, bulletRadius, false));
            enemyBullets.push(new Bullet(this.x, this.y, 45, 10, 800, 12, false));
            enemyBullets.push(new Bullet(this.x - bulletRadius, this.y, 90, 10, bulletRadius, false));
            enemyBullets.push(new Bullet(this.x - bulletRadius, this.y - bulletRadius, 135, 10, bulletRadius, false));
            enemyBullets.push(new Bullet(this.x, this.y - bulletRadius, 180, 10, bulletRadius, false));
            enemyBullets.push(new Bullet(this.x, this.y - bulletRadius, 225, 10, bulletRadius, false));
            enemyBullets.push(new Bullet(this.x - bulletRadius, this.y, 270, 10, bulletRadius, false));
            enemyBullets.push(new Bullet(this.x - bulletRadius, this.y - bulletRadius, 315, 10, bulletRadius, false));
            this.nextShotTime = this.fireRate;
        }

        super.update();
    }

    onDeath() {
        super.onDeath();
        explosion1.currentTime = 0;
        explosion1.play();
        let dropValue = Math.random() * 100;
        if (dropValue > 90) { return 'health' }
        if (dropValue > 80) { return 'time' }
        if (dropValue > 75) { return 'scoreLG' }
        if (dropValue > 50) { return 'scoreMD' }
        if (dropValue > 20) { return 'scoreSM' }
        return '';
    }
}

class CargoEnemy extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.width = 75;
        this.height = this.width;
        this.maxSpeed = 30;
        this.angle = Math.floor(Math.random() * 360)
        this.turnSpeed = 6;
        this.hp = 3;
        this.points = 10;
        this.aggroDistance = 750;
        this.image = images.CargoEnemy;
    }

    update() {
        let distance = this.getPlayerDistance();
        if (distance > this.aggroDistance) {
            this.speed < this.maxSpeed ? this.speed += 2 : this.speed = this.maxSpeed;
        } else {
            if (this.speed > this.maxSpeed / 3) {
                this.speed--;
            } else if (this.speed < this.maxSpeed / 3) {
                this.speed++;
            }
        }

        // Turn to face away from player
        let targetAngle = (this.getPlayerAngle() + 180) % 360;
        let angleDiff = targetAngle - this.angle;
        angleDiff < 0 ? angleDiff += 360 : angleDiff;
        if (angleDiff < this.turnSpeed || angleDiff > 360 - this.turnSpeed) {
            // When angle difference is less than turn speed, snap to face player
            this.angle = targetAngle;
        } else {
            // Pick shortest turn distance to player
            angleDiff < 180 ? this.angle += this.turnSpeed : this.angle -= this.turnSpeed;
        }

        super.update();
    }

    onDeath() {
        super.onDeath();
        explosion1.currentTime = 0;
        explosion1.play();
        let dropValue = Math.random() * 100;
        if (dropValue > 90) { return 'health' }
        if (dropValue > 70) { return 'tripleShot' }
        if (dropValue > 25) { return 'twinShot' }
        if (dropValue > 10) { return 'time' }
        return 'scoreLG'
    }
}

class Explosion {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.timer = 24;
        this.width = width;
        this.height = height;
    }

    update() {
        this.timer--;
    }

    render(viewport, ctx) {
        let displayX = this.x - viewport.x;
        let displayY = this.y - viewport.y;
        let image = images.ExplosionFrames;
        ctx.beginPath();
        if (this.timer > 20) {
            ctx.drawImage(image, 0, 0, image.width / 3,
                image.height / 2, displayX - this.width / 2, displayY - this.height / 2,
                this.width, this.height)
        } else if (this.timer > 16) {
            ctx.drawImage(image, image.width * 1 / 3, 0, image.width / 3,
                image.height / 2, displayX - this.width / 2, displayY - this.height / 2,
                this.width, this.height)
        } else if (this.timer > 12) {
            ctx.drawImage(image, image.width * 2 / 3, 0, image.width / 3,
                image.height / 2, displayX - this.width / 2, displayY - this.height / 2,
                this.width, this.height)
        } else if (this.timer > 8) {
            ctx.drawImage(image, 0, image.height / 2, image.width / 3,
                image.height / 2, displayX - this.width / 2, displayY - this.height / 2,
                this.width, this.height)
        } else if (this.timer > 4) {
            ctx.drawImage(image, image.width * 1 / 3, image.height / 2, image.width / 3,
                image.height / 2, displayX - this.width / 2, displayY - this.height / 2,
                this.width, this.height)
        } else {
            ctx.drawImage(image, image.width * 2 / 3, image.height / 2, image.width / 3,
                image.height / 2, displayX - this.width / 2, displayY - this.height / 2,
                this.width, this.height)
        }
    }
}