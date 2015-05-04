SNAKE
=====

Javascript-based implementation of the Snake game.

NOTES:

Since Snake is very much an 8-bit style early video game, I chose an 80's arcade/console feel - a woodgrain panel design reminiscent of the Atari 2600 or older standup arcade games.

## Required Features/Implementation Details:

* Uses Javasript
* Runs on Chrome, Safari, Firefox browsers (recent versions)
* Uses Canvas 2D
* Uses requestAnimationFrame
* Supports screen pixel ratios 
* Implements arrow keys to change direction
* Increases the length of the snake for every food block it eats
* Increases the speed of the snake by 8% on slow speed, 6% on fast speed when food block is eaten. (speed value is object configurable, of course)
* When food block is eaten, a new block is randomly placed away from snake's curent position by 2, 3, or 4 depending on board size selected (object configurable)
* Ends game when Snake hits a wall or hits itself

## "Shoulds"
* Uses underscore
* Keeps Score (100 points per food block eaten)
* Game Pauses with Spacebar
* Game resets when canvas area is clicked
* Game uses Javascript objects and inheritence using (_.extend). Inheritence was limited in this implementation but was used

## "Coulds"
* Uses jQuery - both for event binding and DOM manipulation for the surrounding theme and user selection screens
* Uses requireJS for dependency injection, load main objects on deman
* Saves high score to browser localstorage
* Two difficulty speeds
* Three board sizes 

## Additional features:
* Works on Chrome mobile (swipe in the direction you want the snake to go) - tested on iPad Air 2 Chrome, iPad mini Chrome, and Samsung S5 Chrome - has some issues on iPad Safari, does not work on iPhone 6 Safari
* Speed boost option - hold down arrow key to increase speed in current direction (I always liked this feature when it shows up in versions of the game)

## Thoughts on other features:
* Two player could be implementated by generating a second snake object and give the GameBoard object understanding of AWSD keys and snake-tosnake collisions, plus include snake2 in the drawBoard routine.

## Implementation Notes:

* I tried to show range, using various techniques. and play into the idea of the game.  
* High Score is the single highest number.  This should probably be separated out by board size and speed (difficulty).
* High pixel density was supported by meta viewport tag. Considered window.devicePixelRatio, but research suggest many problems with that approach.  I only had the iPad Air 2 with a Retina, but I also had a friend test on his Macbook Pro.  Worked well on both, correctly proportioned.
* Chrome Mobile (and browser windows sized less than 768 pixels) only get one board size - still fun! 
  




