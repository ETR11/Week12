import Phaser from "phaser";

var config = {
    type: Phaser.CANVAS,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);

let platforms;
let player;
let stars;
let cursors;
let score = 0;
let scoreText;
let platVel = -200;
let starX = 750;

function preload () {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.spritesheet('dude', 
        'assets/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
}

function collectStar (player, star) {
    star.disableBody(true, true);
    score += 1;
    scoreText.setText('More stars, faster platforms. Stars: ' + score)
    platVel -= 50;
    if ((score % 2) == 0) {
        starX = 750
    } else {
        starX = 50
    }

    stars.create(starX, Phaser.Math.Between(200, 550), 'star')
}

function gameLost (player) {
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}

function addPlatform () {
    platforms.create(Phaser.Math.Between(700, 800), Phaser.Math.Between(0, 300), 'ground');
    platforms.create(Phaser.Math.Between(700, 800), Phaser.Math.Between(300, 600), 'ground');
    platforms.setVelocityX(platVel);
}

function create () {
    this.add.image(400, 300, 'sky');

    platforms = this.physics.add.group({
        immovable: true,
        allowGravity: false
    });

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    platforms.setVelocityX(-200)

    player = this.physics.add.sprite(100, 450, 'dude');

    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    this.time.addEvent({
        callback: addPlatform,
        callbackScope: this,
        delay: 2000,
        loop: true
    });

    stars = this.physics.add.staticGroup();
    stars.create(750, Phaser.Math.Between(200, 550), 'star')

    cursors = this.input.keyboard.createCursorKeys();

    scoreText = this.add.text(16, 16, 'More stars, faster platforms. Stars: 0', { fontSize: '32px', fill: '#000' });

    this.physics.add.collider(player, platforms);

    this.physics.add.overlap(player, stars, collectStar, null, this);

}

function update () {
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    }

    else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    }

    else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-400);
    }

    if (player.y > 575) gameLost();
}

//{}