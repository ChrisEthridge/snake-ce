//Gameboard implementation object - 
define([
    'jquery',
    'underscore',
    'components/Block',
    'components/Snake',
    'text!templates/gameboard.html',
    'text!templates/gameovermodal.html'
], function($, _, Block, Snake, GameBoardTemplate, GameOverTemplate) { 

    var GameBoard = function() {
    
        var canvas = null,
            context = null,
            snake1 = null,
            foodBlock = null,
            timerID = null, 
            animationID = null,
            keydownHandler = null,
            mousedownHandler = null,  
            isTouch = false,
            options = {},
            config = {};
            
        var defaultOptions = {    
            currentScore: 0,
            highScore: 0,
            isPaused: false,
            boardWidth: 500,
            boardHeight: 500,
            timerSpeed: 250,
            timerIncrease: 0.08,
            foodSafeDistance: 4,
            blockSize: 20
        };
        
        var renderHTML = function() {
            
            var gbHTML = _.template(GameBoardTemplate);
            $('#boardwrapper').html(gbHTML({ boardWidth: options.boardWidth, boardHeight: options.boardHeight }));
                                                                        
            //document.getElementsByClassName('gameboard')[0].setAttribute('style','width:' + (options.boardWidth + 80) + 'px');
            $('.gameboard').css('width', (options.boardWidth + 80));
            $('#header').css('width', (options.boardWidth + 20));
            $('#controlmiddle').css('width', (options.boardWidth + 20));
            $('#canvaswrapper').css('height', options.boardHeight);
            $('#highscore').html(options.highScore);
        };
        
        var gameOver = function() {
            
            //stop the timer and animation first
            clearInterval(timerID);
            window.cancelAnimationFrame(animationID);
            $(window).off('keydown', keydownHandler);
            $('#snakegame').off('mousedown', mousedownHandler); 
            
            if (options.currentScore > options.highScore) {         
                options.highScore = options.currentScore; 
                $('#highscore').html(options.highScore);
                localStorage.setItem('highScore', options.highScore);
            }          
            
            $('#boardwrapper').html(GameOverTemplate);
            var playAgainHandler = _.bind(function() {
                 $('#playagain').off('click', playAgainHandler);                            
                  //reinit canvas with original config and startImmediatey = true
                  var restartConfig = _.extend(config, { highScore: options.highScore });
                  this.init(restartConfig);
            }, this);
            
            $('#playagain').on('click', playAgainHandler);
            
        }
              
        return {
        
            //initialize gameboard with config options
            init: function(cfg) {
            
                //set options to defaults
                options = _.clone(defaultOptions);
                
                //store initial config
                config = cfg;
                
                //update options with config
                options = _.extend(options, config);
                
                //build the HTML from our Template fragment
                renderHTML();
                
                canvas = document.getElementById('snakegame');
                context = canvas.getContext('2d');
                
                snake1 = new Snake(options.boardWidth, options.boardHeight, options.blockSize);
                snake1.init(); 
  
                foodBlock = this.generateNewFoodBlock();
                
                //assign these bound functions to private vars for easy removal at game end
                keydownHandler = _.bind(this.handleKeydown, this);
                mousedownHandler = _.bind(this.handleMousedown, this);
                                
                $(window).on('keydown', keydownHandler);
                $('#snakegame').on('mousedown', mousedownHandler);
                
                //add touch library
                var gameContext = this;
                require(['touchwipe'], function(TouchWipe) {
                    $('body').touchwipe({
                        wipeLeft: _.bind(gameContext.handleSwipe, gameContext, 0),
                        wipeDown: _.bind(gameContext.handleSwipe, gameContext, 1),  
                        wipeRight: _.bind(gameContext.handleSwipe, gameContext, 2), 
                        wipeUp: _.bind(gameContext.handleSwipe, gameContext, 3),
                        min_move_x: 20,
                        min_move_y: 20,
                         preventDefaultEvents: true
                    }); 
                        
                });
                
                window.focus();
                _.bind(this.startAnimationTimer, this)();
              
            },  
       
            //loops the canvas drawing
            startAnimationTimer: function() {             
                this.loopAnimation();
                timerID = setInterval(_.bind(this.doGameMechanics, this), options.timerSpeed);                                   
            },
            
            doGameMechanics: function() {
            
                //Move the Snake(s)
                snake1.moveSnake();              
            
                //check to see if the snake(s) hit a wall or self
                var hadCollision = snake1.checkForSnakeCollision();
                
                //if there was a collision, end the game
                if (hadCollision) {
                    _.bind(gameOver, this)();
                    return;
                }
                
                //check to see if the snake ate the food block, and if so
                //perform necessary operations
                this.checkForFoodBlockCollision(snake1);
               
            },
      
            //handles the canvas animation with requestAnimationFrame
            loopAnimation: function() {
                doLoop = _.bind(this.loopAnimation, this);
                animationID = window.requestAnimationFrame(doLoop);
                this.drawBoard(context);
            },
        
            drawBoard: function(context) {
 
                context.clearRect(0, 0, options.boardWidth, options.boardHeight);
                context.fillStyle = "rgb(200,0,0)";
    
                //draw the FoodBlock
                context.fillStyle = "rgb(0,0,200)";
                context.fillRect(foodBlock.position.x * options.blockSize, foodBlock.position.y * options.blockSize, options.blockSize, options.blockSize);
    
                //draw snake1
                context.fillStyle = "rgb(200,0,0)";
                var thisBlock = snake1.getSnakeHeadBlock();
                context.fillRect(thisBlock.position.x * options.blockSize, thisBlock.position.y * options.blockSize, options.blockSize, options.blockSize);
                while (thisBlock.nextBlock) {
                    thisBlock = thisBlock.nextBlock;
                    context.fillRect(thisBlock.position.x * options.blockSize, thisBlock.position.y * options.blockSize, options.blockSize, options.blockSize);
                }
                
            },
            
            //recursive function to generate new food block, continues to 
            //call itself if random block is on top of the snake or does
            //not fall far enough away from snakes and walls
            generateNewFoodBlock: function() {
    
                //instantiate with x=0, y=0 temporarily
                var newFoodBlock = new Block(0,0);
     
                //randomly generate a new spot position
                var boardX = options.boardWidth / options.blockSize,
                    boardY = options.boardHeight / options.blockSize,
                    xSpot = Math.floor((Math.random() * boardX) + 1), 
                    ySpot = Math.floor((Math.random() * boardY) + 1);
                
                //check the foodblock position to make sure it's not on a snake position
                var thisBlock = snake1.getSnakeHeadBlock();
                var badPlacement = false;                   
                
                //check for placement on or near snake
                var safeDist = options.foodSafeDistance;
                    
                //check to make sure food block is not on the snake
                do {                    
                    //if xSpot or ySpot are on the snake, get a new block
                    if ((thisBlock.position.x == xSpot) && (thisBlock.position.y == ySpot)) {
                        badPlacement = true;
                        break;
                    }                    

                    //check to make sure the food block is far enough from the snake's current position
                    var xRangeLow = thisBlock.position.x - safeDist,
                        xRangeHigh = thisBlock.position.x + safeDist,
                        yRangeLow = thisBlock.position.y - safeDist,
                        yRangeHigh = thisBlock.position.y + safeDist;
                     
                    //check and see if the     
                    if (((xSpot > xRangeLow) && (xSpot < xRangeHigh)) &&
                        ((ySpot > yRangeLow) && (ySpot < yRangeHigh))) {
                     
                        badPlacement = true;
                        break;
                    }                 
                 
                    thisBlock = thisBlock.nextBlock;                   
                } while (thisBlock.nextBlock);                
                
                //check the food block to make sure it is far enough from walls
                if ((xSpot < (safeDist + 1)) || (ySpot < (safeDist + 1))) {
                    badPlacement = true;
                }      
                if (((boardX - xSpot) < (safeDist + 1)) || ((boardY - ySpot) < (safeDist + 1))) {
                    badPlacement = true;
                }
                
                //if the new block is placed in an unallowed position,  
                //call this function recursively until we get one that is not
                if (badPlacement) {  
                    newFoodBlock = this.generateNewFoodBlock();
                }
                else {
                    newFoodBlock.position.x = xSpot;
                    newFoodBlock.position.y = ySpot;
                }

                return newFoodBlock;
            },
            
            
            //did the snake eat a food block?  if so, grow the snake size and increase the timer speed
            checkForFoodBlockCollision: function(thisSnake) {
                                 
                var thisBlock = thisSnake.getSnakeHeadBlock();

                if ((thisBlock.position.x == foodBlock.position.x) && (thisBlock.position.y == foodBlock.position.y)) {

                    clearInterval(timerID);

                    switch(thisSnake.getCurrentDirection()) {
                        case 0:  thisSnake.eatFoodBlock(thisBlock.position.x - 1, thisBlock.position.y);
                                 break; 

                        case 1:  thisSnake.eatFoodBlock(thisBlock.position.x, thisBlock.position.y - 1);
                                 break; 

                        case 2:  thisSnake.eatFoodBlock(thisBlock.position.x + 1, thisBlock.position.y);
                                 break;  

                        case 3:  thisSnake.eatFoodBlock(thisBlock.position.x, thisBlock.position.y + 1);
                                 break;                    

                        default: break;
                    }

                    options.currentScore = options.currentScore + 100;
                    $('#currentscore').html(options.currentScore);
                    foodBlock = this.generateNewFoodBlock();

                    //increase the speed of the snake by timerIncrease percentage value on each block eaten
                    var speedIncrease = Math.floor(options.timerSpeed * options.timerIncrease);
                    options.timerSpeed = options.timerSpeed - speedIncrease;

                    timerID = setInterval(_.bind(this.doGameMechanics, this), options.timerSpeed);

                }
            },
           
            //changes direction on a swipe, handles a situation where you swipe in the opposite
            //direction of the current direction, which is not allowed
            handleSwipe: function(newDirection) {
                var prevDirection = snake1.getCurrentDirection();
                if ((((newDirection + prevDirection) % 2) == 0) && (newDirection != prevDirection)){
                    return;
                }
                snake1.changeDirection(newDirection);
            },
            
            //arrow key and spacebar handler - changes direction and pauses
            handleKeydown: function(e) {

                e.preventDefault();

                var theKey = e.keyCode;
                //alert(theKey);
                
                //handle spacebar pausing
                if (theKey == 32) {
                    if (options.isPaused) {
                        options.isPaused = false;
                        timerID = setInterval(_.bind(this.doGameMechanics, this), options.timerSpeed);
                        this.loopAnimation();
                    } else {
                        options.isPaused = true;
                        clearInterval(timerID);
                        window.cancelAnimationFrame(animationID);
                    }
                }
                
                //other than spacebar, we only care about the arrow keys, get rid of other keypresses
                if ((theKey < 37) || (theKey > 40)) {
                    return;
                }

                //Snake cannot go back in the opposite direction it was traveling,
                //so we have to check for that and ignore that keypress
                var prevDirection = snake1.getCurrentDirection();
                var newDirection = e.keyCode - 37;

                //this checks to make sure the user hasn't pushed the key to go back 
                //in the opposite direction. allows for speed burst mode when pushing same direction
                if (newDirection != prevDirection) {
                    if (((newDirection + prevDirection) % 2) == 0) {
                        return;
                    }
                }
                
                //move the snake position immediately, don't wait for the next interval
                //this fixes a latency issue
                snake1.changeDirection(newDirection);
                _.bind(this.doGameMechanics, this)();

            },
            
            //canvas click handler - resets the game
            handleMousedown: function(e) {

                clearInterval(timerID);
                window.cancelAnimationFrame(animationID);
                $(window).off('keydown', keydownHandler);
                $('#snakegame').off('mousedown', mousedownHandler); 
                $('#playagain').off('click', mousedownHandler);
                
                //reinit canvas with original config and startImmediatey = true
                var restartConfig = _.extend(config, { highScore: options.highScore });
                this.init(restartConfig);
            }
  
        };
    };
    
    return GameBoard;

});