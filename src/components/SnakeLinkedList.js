//SnakeLinkedList.js
//Special Snake Game Edition Doubly-Linked List implementation
//Provides data structure for the Snake using SnakeBlock objects
define(['components/SnakeBlock'], function(SnakeBlock) {

    var SnakeLinkedList = function() {
    
        //Private variables
        var headBlock = null, tailBlock = null;
        
        return {
                
            //Add a new block to the head of the snake
            addBlock: function(x, y) {
                        
                if (headBlock == null) { 
                    headBlock = new SnakeBlock(x,y);
                    tailBlock = headBlock;
                }
                else {
                    //TODO: Refactor without the extra variables
                    var currentHead = headBlock;
                    var newHead = new SnakeBlock(x,y);
                    currentHead.prevBlock = newHead;
                    newHead.nextBlock = currentHead; 
                    headBlock = newHead;
                }
            
            },
                    
            //Remove the last block from the tail of the snake
            removeLastBlock: function() {       
           
                if (tailBlock.prevBlock != null) {
                    tailBlock = tailBlock.prevBlock;
                    tailBlock.nextBlock = null;
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
            //NOTE: Not used, included for implementation thoroughness only
            getTailBlock: function() {
                return tailBlock;
            }
                      
        };
        
    }; 
    
    return SnakeLinkedList; 

});