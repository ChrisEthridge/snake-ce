var topValue = 40;
var leftValue = 60;
var blockSize = 20;
var context = null;
var direction = 3;
var timerID;
var animationID;
var theSnake = null;
var theSpot = null;
var timerValue;
var isPaused;
var currentScore = 0;

LinkedList = function() {

    var headBlock = null, tailBlock = null;
    
    var newBlock = function(x, y) { 
        return { 
            position: { x: x, y: y }, 
            prevEl: null, 
            nextEl: null
        };        
    };
        
    return {
                
        addBlock: function(x, y) {
                    
            if (headBlock == null) { 
                headBlock = newBlock(x,y);
                tailBlock = headBlock;
            }
            else {
                //TODO: Refactor without the extra variables
                var currentHead = headBlock;
                var newHead = newBlock(x,y);
                currentHead.prevEl = newHead;
                newHead.nextEl = currentHead; 
                headBlock = newHead;
            }
            
        },
                    
        removeLastBlock: function() {       
           
            if (tailBlock.prevEl != null) {
                tailBlock = tailBlock.prevEl;
                tailBlock.nextEl = null;
            }
            //this handles the situation where there is only 1 or 0 elements in the list. 
            //if there is 1 element, if removes it, if there are 0 elements (empty list) it stays the same           
            //NOTE: This condition should never actually happen in this game, but included for thoroughness
            else {
                headBlock = null;
                tailBlock = null;
            }
        },
        
        //getter function for headBlock object
        getHeadBlock: function() {
            return headBlock;
        },
        
        //getter function for tailBlock object
        getTailBlock: function() {
            return tailBlock;
        }
                  
    };
}
                    
                      
function moveSnake() {

    
    //remove the tail Element
    theSnake.removeLastBlock();
    
    var thisX = theSnake.getHeadBlock().position.x;
    var thisY = theSnake.getHeadBlock().position.y;      
    
    //console.log(thisX + ', ' + thisY);
    switch(direction) {
    
        case 0:     if (thisX > 0) { theSnake.addBlock(thisX - 1, thisY); }
                    else { gameOver('GAME OVER'); }
                    break;
                    
        case 1:     if (thisY > 0) { theSnake.addBlock(thisX, thisY - 1); }
                    else { gameOver('GAME OVER'); }
                    break;
                    
        case 2:     if (thisX < 25) { theSnake.addBlock(thisX + 1, thisY); }
                    else { gameOver('GAME OVER'); }
                    break;
                   
        case 3:     if (thisY < 25) { theSnake.addBlock(thisX, thisY + 1); }
                    else { gameOver('GAME OVER'); }
                    break;
                    
        default:    break;
        
    }
    
    //check for snake head - tail collision
    //TODO:  Make sure this is working right, and possible abstract to a subroutine
    //       It seems like the end of the tail is allowing passthrough, but I'm not sure
    var headBlock = theSnake.getHeadBlock();
    var thisEl = headBlock.nextEl;
    var foundMatch = false;
    do {       
        if ((thisEl.position.x == headBlock.position.x) && (thisEl.position.y == headBlock.position.y)) {
            foundMatch = true;
        }
        thisEl = thisEl.nextEl;
    } while (thisEl.nextEl);
    
    if (foundMatch) {
        gameOver('GAME OVER. SNAKE COLLIDED WITH SELF');  
    }
    
    spotCheck();
    
}

function gameOver(message) {

    alert(message);
    clearInterval(timerID);
    window.cancelAnimationFrame(animationID);
}

function spotCheck() {

    var thisEl = theSnake.getHeadBlock();
       
    if ((thisEl.position.x == theSpot.position.x) && (thisEl.position.y == theSpot.position.y)) {
  
        clearInterval(timerID);
        
        switch(direction) {
            case 0:  theSnake.addBlock(thisEl.position.x - 1, thisEl.position.y);
                     break; 

            case 1:  theSnake.addBlock(thisEl.position.x, thisEl.position.y - 1);
                     break; 
                     
            case 2:  theSnake.addBlock(thisEl.position.x + 1, thisEl.position.y);
                     break;  
                     
            case 3:  theSnake.addBlock(thisEl.position.x, thisEl.position.y + 1);
                     break;                    
                     
            default: break;
        }
        
        
        currentScore = currentScore + 100;
        document.getElementById('currentscore').innerHTML = currentScore;
        theSpot = generateNewSpot();
        
        //increase the speed of the snake by 5% on each spot eaten
        var speedIncrease = Math.floor(timerValue * 0.08);
        timerValue = timerValue - speedIncrease;
        
        timerID = setInterval(moveSnake, timerValue);
        
    }
}

function initSnake() {

    var xStart = Math.floor((Math.random() * 12) + 4); 
    var yStart = Math.floor((Math.random() * 12) + 4); 
    
    theSnake = new LinkedList();
    //TODO: Handle Snake creation better (random start direction, etc..)
    
    theSnake.addBlock(xStart, yStart);
    theSnake.addBlock(xStart, yStart+1);
    theSnake.addBlock(xStart, yStart+2);
    
}

function generateNewSpot() {

    var newSpot = { position: { x: null, y: null } };
    
    //randomly generate a new spot position
    var xSpot = Math.floor((Math.random() * 14) + 2); 
    var ySpot = Math.floor((Math.random() * 14) + 2);
    
    //check the spot position to make sure it's not on a snake position
    //TODO: Is there a better way to handle the logic here
    var thisEl = theSnake.getHeadBlock();
    var foundMatch = false;
    do {       
        if ((thisEl.position.x == xSpot) && (thisEl.position.y == ySpot)) {
            foundMatch = true;
        }
        thisEl = thisEl.nextEl;
    } while (thisEl.nextEl);
    
    //if the new point is on a snake position, call this function 
    //recursively until we get one that is not
    if (foundMatch) {
        newSpot = generateNewSpot();
    }
    else {
        newSpot.position.x = xSpot;
        newSpot.position.y = ySpot;
    }
    
    return newSpot;
}

function initBoard() {

    initSnake();
    theSpot = generateNewSpot();
    isPaused = false;
    timerValue = 250;
    direction = 3;
    currentScore = 0;
    timerID = setInterval(moveSnake, timerValue);
    loopAnimation(); 
}

function loopAnimation() {
    animationID = window.requestAnimationFrame(loopAnimation);
    drawSegment(context);
}
    
    
function drawSegment(context) {
 
    context.clearRect(0, 0, 500, 500);
    context.fillStyle = "rgb(200,0,0)";
    
    //draw the spot
    context.fillStyle = "rgb(0,0,200)";
    context.fillRect(theSpot.position.x * blockSize, theSpot.position.y * blockSize, blockSize, blockSize);
    
    //draw the snake
    context.fillStyle = "rgb(200,0,0)";
    var thisEl = theSnake.getHeadBlock();
    context.fillRect(thisEl.position.x * blockSize, thisEl.position.y * blockSize, blockSize, blockSize);
    while (thisEl.nextEl) {
        thisEl = thisEl.nextEl;
        context.fillRect(thisEl.position.x * blockSize, thisEl.position.y * blockSize, blockSize, blockSize);
    }
        
}

function handleKeydown(e) {

    e.preventDefault();

    var theKey = e.keyCode;
    
    //handle spacebar pausing
    if (theKey == 0) {
        if (isPaused) {
            isPaused = false;
            timerID = setInterval(moveSnake, timerValue);
            loopAnimation();
        } else {
            isPaused = true;
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
    var prevDirection = direction;
    direction = e.keyCode - 37;
    
    //this checks to make sure the user hasn't pushed the key to go back 
    //in the opposite direction.
    if (((direction + prevDirection) % 2) == 0) {
        direction = prevDirection;
    }
    
    //move the snake position immediately, don't wait for the next interval
    //this fixes a latency issue
    moveSnake();

}


function handleMousedown(e) {

    clearInterval(timerID);
    window.cancelAnimationFrame(animationID);
    initBoard();
    
}    


function startGame() {

    var canvas = document.getElementById('snakegame');
    context = canvas.getContext('2d');

    window.addEventListener("keydown", handleKeydown, false);
    canvas.addEventListener("mousedown", handleMousedown, false);  
    
    initBoard();
}
  
