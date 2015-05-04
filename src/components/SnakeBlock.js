//SnakeBlock implementation object
//Type of Block object with nextEl and preEl values for the Snake
define(['underscore', 'components/Block'], function(_, Block) { 

    //Constructor for a new SnakeBlock object, extends Block using underscore
    var SnakeBlock = _.extend(Block, {
        nextBlock: null,
        prevBlock: null
    });
    
    return SnakeBlock;
});
        