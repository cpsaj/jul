var game;
var gameOptions = {

    // player gravity
    playerGravity: 1900,

    // player horizontal speed
    playerSpeed: 200,

    // player force
    playerJump: 400,

    // enemy horizontal speed
    enemySpeed: 150
}
window.onload = function() {
    var gameConfig = {
        type: Phaser.CANVAS,
        width: 640,
        height: 192,
        backgroundColor: 0x444444,
        physics: {
            default: "arcade",
            arcade: {
                gravity: {
                    y: 0
                }
            }
        },
       scene: [preloadGame, playGame]
    }
    game = new Phaser.Game(gameConfig);
}
class preloadGame extends Phaser.Scene{
    constructor(){
        super("PreloadGame");
    }
    preload(){
        this.load.tilemapTiledJSON("level", "level.json");
        this.load.image("tile", "tile.png");
        this.load.image("hero", "hero.png");
        this.load.image("enemy", "enemy.png");
    }
    create(){
        this.scene.start("PlayGame");
    }
}
class playGame extends Phaser.Scene{
    constructor(){
        super("PlayGame");
    }
    create(){

        // creatin of "level" tilemap
        this.map = this.make.tilemap({
            key: "level"
        });

        // adding tiles (actually one tile) to tilemap
        var tile = this.map.addTilesetImage("tileset01", "tile");

        // tile 1 (the black tile) has the collision enabled
        this.map.setCollision(1);

        // which layer should we render? That's right, "layer01"
        this.layer = this.map.createStaticLayer("layer01", tile);

        // adding the hero sprite
        this.hero = this.physics.add.sprite(game.config.width / 2, 152, "hero");

        // setting hero gravity
        this.hero.body.gravity.y = gameOptions.playerGravity;

        // setting hero horizontal speed
        this.hero.body.velocity.x = gameOptions.playerSpeed;

        // adding the enemy sprite
        this.enemy = this.physics.add.sprite(game.config.width / 4, 152, "enemy");

        // setting enemy horizontal speed
        this.enemy.body.velocity.x = gameOptions.enemySpeed;

        // the hero can jump
        this.canJump = true;

        // waiting for player input
        this.input.on("pointerdown", this.handleJump, this);
    }
    handleJump(){

        // the hero can jump when:
        // canJump is true AND the hero is on the ground (blocked.down)
        if((this.canJump && this.hero.body.blocked.down)){

            // applying jump force
            this.hero.body.velocity.y = -gameOptions.playerJump;

            // hero can't jump anymore
            this.canJump = false;
        }
    }
    update(){

        // handling collision between the hero and the tiles
        this.physics.world.collide(this.hero, this.layer, function(hero, layer){

            // hero on the ground
            if(hero.body.blocked.down){

                // hero can jump
                this.canJump = true;
            }

            // hero on the ground and touching a wall on the right
            if(this.hero.body.blocked.right && this.hero.body.blocked.down){

                // horizontal flipping hero sprite
                this.hero.flipX = true;
            }

            // same concept applies to the left
            if(this.hero.body.blocked.left && this.hero.body.blocked.down){
                this.hero.flipX = false;
            }

            // adjusting hero speed according to the direction it's moving
            this.hero.body.velocity.x = gameOptions.playerSpeed * (this.hero.flipX ? -1 : 1);
        }, null, this);

        // handling collision between the enemy and the tiles
        this.physics.world.collide(this.enemy, this.layer, function(hero, layer){

            // enemy touching a wall on the right
            if(this.enemy.body.blocked.right){

                // horizontal flipping enemy sprite
                this.enemy.flipX = true;
            }

            // same concept applies to the left
            if(this.enemy.body.blocked.left){
                this.enemy.flipX = false;
            }

            // adjusting enemy speed according to the direction it's moving
            this.enemy.body.velocity.x = gameOptions.enemySpeed * (this.enemy.flipX ? -1 : 1);
        }, null, this);

        // handling collision between enemy and hero
        this.physics.world.collide(this.hero, this.enemy, function(hero, enemy){

            // hero is stomping the enemy if:
            // hero is touching DOWN
            // enemy is touching UP
            if(enemy.body.touching.up && hero.body.touching.down){

                // in this case just jump again
                this.hero.body.velocity.y =  -gameOptions.playerJump;
            }
            else{

                // any other way to collide on an enemy will restart the game
                this.scene.start("PlayGame");
            }
        }, null, this);
    }
}
