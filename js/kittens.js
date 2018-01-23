// This sectin contains some game constants. It is not super interesting
var GAME_WIDTH = 650;
var GAME_HEIGHT = 500;

var ENEMY_WIDTH = 75;
var ENEMY_HEIGHT = 100;
var MAX_ENEMIES = 3;

var PLAYER_WIDTH = 75;
var PLAYER_HEIGHT = 100;

var COND_WIDTH = 75;
var COND_HEIGHT = 100;
var MAX_COND = 3;

// These two constants keep us from using "magic numbers" in our code
var LEFT_ARROW_CODE = 37;
var RIGHT_ARROW_CODE = 39;
var DOWN_ARROW_CODE = 40;
var UP_ARROW_CODE = 38;
var P_KEY_CODE = 80;
var R_KEY_CODE = 82;


// These two constants allow us to DRY
var MOVE_UP = 'up';
var MOVE_DOWN = 'down';
var MOVE_LEFT = 'left';
var MOVE_RIGHT = 'right';

// Preload game images
var images = {};
['note.png', 'canvasStaff.png', 'conductor.png', 'condiment.png'].forEach(imgName => {
    var img = document.createElement('img');
    img.src = 'images/' + imgName;
    images[imgName] = img;
});

//preload game Sounds
var sounds = {};
['coin.mp3', 'level1.mp3', 'level2.mp3', 'level3.mp3', 'paused.mp3', 'gameOver.mp3', 'levelEnd.mp3', 'isDead.mp3', 'gameOver.mp3', 'hit.mp3'].forEach(fileName => {
    var audio = document.createElement('audio');
    audio.src = `sounds/${fileName}`;
    //  audio.setAttribute("preload", "auto");
    //  document.body.appendChild(audio);

    audio.setAttribute("controls", "none");
    audio.style.display = "none";

    sounds[fileName] = audio;
})




// This section is where you will be doing most of your coding
class Entity {
    render(ctx) {
        ctx.drawImage(this.sprite, this.x, this.y);
    }

}

class Enemy extends Entity{
    constructor(xPos, score) {
        super();
        this.x = GAME_WIDTH+ENEMY_WIDTH;
        this.y = xPos;
        this.sprite = images['note.png'];
        this.score = score;

         var modifier = (score > 25000) ? 1.9 : 1;
         (score > 50000) ? 1.8: 1;
         (score > 30000) ? 1.75: 1;
         (score > 20000) ? 1.5: 1;
         (score > 10000) ? 1.25: 1;
         (score > 5000) ? 1 : 1;

         // Each enemy should have a different speed
         this.speed = (Math.random() / 3 + .15) * modifier;
         console.log(this.speed)
    }

    update(timeDiff) {
        this.x = this.x - timeDiff * this.speed;
    }
}

class Player extends Entity {
    constructor() {
        super();
        this.x = 0 ;
        this.y = (GAME_HEIGHT/2)+50;
        this.sprite = images['conductor.png'];
        this.isDead = false;
    }

    // This method is called by the game engine when left/right arrows are pressed
    move(direction) {
        if (direction === MOVE_UP && this.y >= PLAYER_HEIGHT) {
            this.y = this.y - PLAYER_HEIGHT;

        } else if (direction === MOVE_DOWN && this.y < GAME_HEIGHT - PLAYER_HEIGHT) {
            this.y = this.y + PLAYER_HEIGHT;
        }

        if (direction === MOVE_LEFT && this.x > 0) {
            this.x = this.x - PLAYER_WIDTH;
        }
        else if (direction === MOVE_RIGHT && this.x < GAME_WIDTH - PLAYER_WIDTH) {
            this.x = this.x + PLAYER_WIDTH;
        }
    }

}

class Condiment extends Entity {
    constructor(xPos, yPos) { //, score) {
        super();
        this.x = xPos;
        this.y = yPos; //< GAME_HEIGHT - COND_HEIGHT) ? yPos : yPos - COND_HEIGHT;
        this.sprite = images['condiment.png'];
        // this.score = score

        // var modifier = (score > 20000) ? 2 : 1;
        // (score > 15000) ? 1.75 : 1;
        // (score > 10000) ? 1.5 : 1;
        // (score > 5000) ? 1.25 : 1;
        // (score > 2000) ? 1 : 1;

    }

    //update(timeDiff) {
    //    this.y = this.y + timeDiff * this.speed;
    //}

}



/*
This section is a tiny game engine.
This engine will use your Enemy and Player classes to create the behavior of the game.
The engine will try to draw your game at 60 frames per second using the requestAnimationFrame function
*/
class Engine {
    constructor(element) {
        // Setup the player
        this.player = new Player();
        this.currentLevel = 1;
        // Setup enemies, making sure there are always three
        this.setupEnemies();
        this.setupCondiments();

        // Setup the <canvas> element where we will be drawing
        var canvas = document.createElement('canvas');
        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;
        element.appendChild(canvas);

        this.ctx = canvas.getContext('2d');
        // Since gameLoop will be called out of context, bind it once here.
        this.gameLoop = this.gameLoop.bind(this);
        this.shouldAddCondiments = false;
        setTimeout(() => { this.shouldAddCondiments = true; }, 3000);
        
    }

    /*
     The game allows for 5 horizontal slots where an enemy can be present.
     At any point in time there can be at most MAX_ENEMIES enemies otherwise the game would be impossible
     */
    setupEnemies() {
        if (!this.enemies) {
            this.enemies = [];
        }

        while (this.enemies.filter(e => !!e).length < MAX_ENEMIES) {
            this.addEnemy();
        }
    }

    addEnemy() {
        var enemySpots = (GAME_HEIGHT / ENEMY_HEIGHT);

        var enemySpot;
        // Keep looping until we find a free enemy spot at random
        while (!enemySpot === 0 || this.enemies[enemySpot]) {
            enemySpot = Math.floor(Math.random() * enemySpots);
        }

        this.enemies[enemySpot] = new Enemy(enemySpot * ENEMY_HEIGHT, this.score);

    }

    setupCondiments() {
         if (!this.condiments) {
             this.condiments = [];
         }

         while (this.condiments.filter(e => !!e).length < MAX_COND && this.shouldAddCondiments) {
             this.addCondiments();
         }
     }

         addCondiments() {
             var xCondimentSpots = GAME_WIDTH / COND_WIDTH;
             //console.log("xCondimentSpots" + xCondimentSpots)
             var yCondimentSpots = Math.floor((GAME_HEIGHT - COND_HEIGHT) / COND_HEIGHT);
             //console.log("yCondimentSpots" + yCondimentSpots)

             var condimentSpot;
             // Keep looping until we find a free enemy spot at random
             while (condimentSpot === undefined || this.condiments[condimentSpot[0]]) {
                 condimentSpot = [Math.floor(Math.random() * xCondimentSpots), Math.floor(Math.random() * yCondimentSpots)];
             }

             this.condiments[condimentSpot[0]] = new Condiment(condimentSpot[0] * COND_WIDTH, condimentSpot[1] * COND_HEIGHT); //, this.score);
             this.shouldAddCondiments = false;
             setTimeout(() => {
                 this.shouldAddCondiments = true;
             }, 3000);
         }


    // This method finds a random spot where there is no enemy, and puts one in there
    

    pausedMusic(){
        sounds['paused.mp3'].play();
    }

    pauseMusic() {
        var musicLevel = Math.floor((this.currentLevel + 1) / 2)
        sounds[`level${musicLevel}.mp3`].pause();
    }
    resumeMusic() {
        var musicLevel = Math.floor((this.currentLevel + 1) / 2)
        sounds[`level${musicLevel}.mp3`].play();
    }
    startMusic() {
        var musicLevel = Math.floor((this.currentLevel + 1) / 2)
        sounds[`level${musicLevel}.mp3`].currentTime = 0;
        sounds[`level${musicLevel}.mp3`].play();
    }

    gamePaused() {
           this.isPaused = !this.isPaused
        
       };
    
    gameRestart() {
        //console.log("gameRestart function activated")
        this.enemies = []
        this.player.y = (GAME_HEIGHT / 2) + 50;
        this.score = 0;
        this.lives = 3;
        MAX_ENEMIES = 3;
        this.gameOverStop();
        this.startMusic();
        this.currentLevel = 1;
        //console.log("I have restarted music");
       // this.isReset = !this.isReset;
        // this.start();


    };

    gameOverStop(){
        sounds["gameOver.mp3"].currentTime = 0;
        sounds["gameOver.mp3"].pause()
        }
    

    gameOver(){
       
          sounds["gameOver.mp3"].currentTime = 0;
          sounds["gameOver.mp3"].play();
          
        
    }

    // This method kicks off the game
    start() {
        this.isReset = false
        this.isPaused = false;
        this.currentLevel = 1;
        this.score = 0;
        this.lives = 3;
        this.lastFrame = Date.now();
        this.startMusic();

        // Listen for keyboard left/right and update the player

        document.addEventListener('keydown', e => {
           // console.log("keyboard", e.keyCode);
            if (e.keyCode === P_KEY_CODE){
                //console.log("Paused Key Pressed");
                this.pauseMusic();
                //console.log("I have pause music")
                this.gamePaused();
        
            };
                
            
            if (e.keyCode === R_KEY_CODE) {
                //console.log("Restart Key Pressed");
                this.gameRestart();
                if (this.player.isDead) {
                   // console.log("Im dead");
                    this.player.isDead = false;
                    this.gameLoop();
                }
            }

            if (e.keyCode === LEFT_ARROW_CODE) {
                this.player.move(MOVE_LEFT);
            }
            if (e.keyCode === RIGHT_ARROW_CODE) {
                this.player.move(MOVE_RIGHT);
            }
             if (e.keyCode === UP_ARROW_CODE) {
                 this.player.move(MOVE_UP);

             }
             if (e.keyCode === DOWN_ARROW_CODE) {
                 this.player.move(MOVE_DOWN);
             }
        });

        this.gameLoop();
    }

    /*
    This is the core of the game engine. The `gameLoop` function gets called ~60 times per second
    During each execution of the function, we will update the positions of all game entities
    It's also at this point that we will check for any collisions between the game entities
    Collisions will often indicate either a player death or an enemy kill

    In order to allow the game objects to self-determine their behaviors, gameLoop will call the `update` method of each entity
    To account for the fact that we don't always have 60 frames per second, gameLoop will send a time delta argument to `update`
    You should use this parameter to scale your update appropriately
     */
    gameLoop() {
        
        if (this.isPaused){
            requestAnimationFrame(this.gameLoop);
        } else {this.resumeMusic();
            // if (this.isReset){
            //     // delete this.enemies;
            //     // this.setupEnemies();

            // } else {
            
        // Check how long it's been since last frame
        var currentFrame = Date.now();
        
        var timeDiff = currentFrame - this.lastFrame;
           
        if (timeDiff > 20) {
             timeDiff = 20;
        }

        // Increase the score!
        this.score += timeDiff;

        // Call update on all enemies
        this.enemies.forEach(enemy => enemy.update(timeDiff));

        // Draw everything!
        this.ctx.drawImage(images['canvasStaff.png'], 0, 0); // draw the star bg
        this.enemies.forEach(enemy => enemy.render(this.ctx)); // draw the enemies
        this.player.render(this.ctx); // draw the player
        this.condiments.forEach(condiments => condiments.render(this.ctx));


        // Check if any enemies should die
        this.enemies.forEach((enemy, enemyIdx) => {
            if (enemy.x < 0) {
                delete this.enemies[enemyIdx];
            }
        });
        this.setupEnemies();

        if (this.isCondimentsCollided()) {
            this.score = this.score + 2000;
            this.condiments.forEach((condiment, Idx) => {
                if (condiment.shouldRemove) {
                    delete this.condiments[Idx];
                }
            });

        }
        this.setupCondiments();

        // Check if player is dead
        if (this.isPlayerDead()) {
            // If they are dead, then it's game over!
            this.ctx.font = 'bold 30px Impact';
            this.ctx.fillStyle = '#000000';
            this.ctx.fillText(this.score + ' GAME OVER', 250, 250)
            //console.log("I'm playing funeral music");
            this.pauseMusic();
            this.gameOver();
        }
        else {
            // If player is not dead, then draw the score
            this.ctx.font = 'bold 30px Impact';
            this.ctx.fillStyle = '#000000';
            this.ctx.fillText(this.score, 5, 30);
            this.ctx.fillText("Lives: " + this.lives, 275, 30);
            

            // Set the time marker and redraw
            this.lastFrame = Date.now();
            requestAnimationFrame(this.gameLoop);
        }
    }
    }

    isCondimentsCollided() {
        //logic to see if this.condiment - collided

        var amIcondiment = (condiment) => {
            if ((this.player.x === condiment.x) && (this.player.y <= condiment.y + COND_HEIGHT) &&
                (this.player.y >= condiment.y)) {
                sounds["levelEnd.mp3"].currentTime = 0;
                sounds["levelEnd.mp3"].play();
                condiment.shouldRemove = true;
                return true;
            }
        }

        return this.condiments.some(amIcondiment);



    }

    isPlayerDead() {
        
        var enemyHit = (enemy, enemyIdx) => { 
            //console.log("player y:" + this.player.y)
            //console.log("player x:" + this.player.x) 
            //console.log("enemy x:" + enemy.x)
            
        
            if (
                enemy.y === this.player.y &&
                enemy.x <= this.player.x + 70 &&
                enemy.x > this.player.x - 70

            )    { 

                console.log("enemy hit");
                sounds["hit.mp3"].currentTime = 0;
                sounds["hit.mp3"].play();

                if(this.lives > 0){
                    delete this.enemies[enemyIdx]
                    this.lives--;
                    return false
                }
                else {
               this.player.isDead = true;
                return true;
            }}
        };

        return this.enemies.some(enemyHit);

    }
        
        
    
}





// This section will start the game
var gameEngine = new Engine(document.getElementById('app'));

// This starts the game when you click start
var gameStart = (onclick) => {
    //console.log("game has been started") 
    var x = document.getElementById("btn");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
    gameEngine.start();}

//This restarts the game when you click restart
// var gameRestart = (onclick) => {
//     console.log("game has been restarted")
//     gameEngine.start();
// }