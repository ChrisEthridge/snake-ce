//Block.jj
//An object representing a single block space on the board
define(function(require) {

    //Constructor for a new Block object
    var Block = function(x, y) { 
        return { 
            position: { x: x, y: y },
        };        
    };
    
    return Block;
    
});