//Snake implementation object
define(['components/SnakeLinkedList'], function(SnakeLinkedList) { 

    //Constructor for the Snake Object
    var Snake = function(w, h, size) {
    
        var snake = null;
        
        //Direction constants
        var Direction = {
            LEFT: 0,
            UP: 1,
            RIGHT: 2,
            DOWN: 3
        };
        
        var boardWidth = w,
            boardHeight = h,
            blockSize = size,
            maxWidthBlocks = Math.floor(boardWidth / blockSize) - 1,
            maxHeightBlocks = Math.floor(boardHeight / blockSize) - 1,
            currentDirection = 0,        
            hadCollision = false;      
        
        //private function to check and see if the snake has collided with itself
        var headTailCollisionCheck = function() {
            var headBlock = snake.getHeadBlock();
            var thisBlock = headBlock.nextBlock;
            var foundCollision = false;
            
            do {       
                if ((thisBlock.position.x == headBlock.position.x) && (thisBlock.position.y == headBlock.position.y)) {
                    foundCollision = true;
                    console.log('collision');
                    console.log('head: ('+ headBlock.position.x + ', ' + headBlock.position.y + ')');
                    console.log('hitp: ('+ thisBlock.position.x + ', ' + thisBlock.position.y + ')');
                    break;
                }
                thisBlock = thisBlock.nextBlock;
            } while (thisBlock.nextBlock);
            
            return foundCollision;
        };
          
        return {
        
            //generate the snake object initial values
            init: function() {
            
                snake = new SnakeLinkedList();
                
                //pick a random point on the board
                var xStart = Math.floor(Math.random() * ((maxWidthBlocks - 3) - 3 + 1)) + 3,   //+ and -3 to keep it off the walls 
                    yStart = Math.floor(Math.random() * ((maxHeightBlocks - 3) - 3 + 1)) + 3, 
                    startAxis = Math.floor((Math.random() * 2));
                    growthX = 1, 
                    growthY = 1;
                  
                //set some starting rules about positioning, build the snake and set currentDirection
                var xMid = Math.floor(maxWidthBlocks / 2);
                var yMid = Math.floor(maxHeightBlocks / 2);      
                
                //change the direction that the snake grows if the initial spot is less than midpoint
                if (xStart < xMid) { 
                    growthX = -1;
                }
                if (yStart < yMid) {
                    growthY = -1;
                }
                
                //randomize the movement, sometimes start x-axis, sometimes start y-axis
                //build the snake blocks in the opposite direction of the movement
                switch(startAxis) {
                
                    case 0:     for (var sz=2; sz >= 0; sz--) { 
                                    var xPl = xStart + (growthX * sz);
                                    snake.addBlock(xPl, yStart);
                                }
                                currentDirection = Math.abs(growthX - 1);
                                break;
                                
                    case 1:     for (var sz=2; sz >= 0; sz--) { 
                                    var yPl = yStart + (growthY * sz);
                                    snake.addBlock(xStart, yPl);
                                }
                                currentDirection = Math.abs(growthY-2);
                                break;
                                
                    default:    break;
                }
                                     
            },
            
            moveSnake: function() {
                
                //remove the tail Element
                snake.removeLastBlock();

                var thisX = snake.getHeadBlock().position.x;
                var thisY = snake.getHeadBlock().position.y;      

                switch(currentDirection) {

                    case Direction.LEFT:    if (thisX > 0) { snake.addBlock(thisX - 1, thisY); }
                                            else { hadCollision = true; }
                                            break;

                    case Direction.UP:      if (thisY > 0) { snake.addBlock(thisX, thisY - 1); }
                                            else { hadCollision = true; }
                                            break;

                    case Direction.RIGHT:   if (thisX < maxWidthBlocks) { snake.addBlock(thisX + 1, thisY); }
                                            else { hadCollision = true; }
                                            break;

                    case Direction.DOWN:    if (thisY < maxHeightBlocks) { snake.addBlock(thisX, thisY + 1); }
                                            else { hadCollision = true; }
                                            break;

                    default:                break;

                }
                
                //if there was a wall collision, exit the function
                if (hadCollision) { return; }

                //Check for snake Head-Tail collision
                //NOTE: You don't need the "== true" here, but I like to do it on function calls 
                //      in order to easily show at a glance that a boolean response is expected 
                if (headTailCollisionCheck() == true) {
                    console.log('head-tail collision');
                    hadCollision = true;  
                }

            },

            getCurrentDirection: function() {
                return currentDirection;
            },
            
            changeDirection: function(newDirection) {       
                currentDirection = newDirection;
            },
            
            checkForSnakeCollision: function() {
                return hadCollision;
            },
            
            eatFoodBlock: function(x, y) {
                snake.addBlock(x,y);
            },
            
            getSnakeHeadBlock: function() {
                return snake.getHeadBlock();
            }
            
        };
    };
    
    return Snake;

});