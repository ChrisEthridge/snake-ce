//Application Main - starting point, acts as settings gatherer and game manager.  
//Loads the Gameboard dynamically based on user selections

requirejs.config({

    urlArgs: "nocache=" + (new Date()).getTime(),
    
    paths: {
        'underscore':   '../assets/js/underscore',
        'jquery':       '../assets/js/jquery-1.11.2',
        'touchwipe':    '../assets/js/jquery.touchwipe.1.1.1'
    },
    
    shim: {
        'underscore': {
            exports: '_'
        }
    }
});

require(['underscore','jquery','text!templates/welcomemodal.html'], function(_, $, WelcomeModalTemplate) {

    $(document).ready(function () {
    
        SnakeGame = {
        
            sizeSelected: null,
            
            speedSelected: null,
            
            blockSize: 20,
            
            hasTouch: false,
            
            start: function() {
              
                var screenOptions = this.calculateScreenOptions();
                
                var wmHTML = _.template(WelcomeModalTemplate);
                var welcomeModal = wmHTML({ isMobile: screenOptions.isMobile });
                
                $('<div/>', {
                    id: 'modalcontainer',
                    html: welcomeModal
                }).appendTo('#boardwrapper');
                       
                
                var scopedButtonHandler = _.bind(this.handleButtonClick, this);
                //make it available for removal/cleanup later
                this.scopedButtonHandler = scopedButtonHandler;
                
                $('[id^=button_]').each(function() {
                    $(this).on('click', scopedButtonHandler);
                });

                this.scopedGameBoardHandler = _.bind(this.buildGameBoard, this);
                $('#newgame').on('click', screenOptions, this.scopedGameBoardHandler);        
         
            },
     
            buildGameBoard: function(opts) {
                  
                //remove and cleanup event handlers on all the buttons
                $('#newgame').off('click', this.scopedGameBoardHandler);
                var scopedButtonHandler = this.scopedButtonHandler;
                $('[id^=button_]').each(function() {
                    $(this).off('click', scopedButtonHandler);
                });
                          
                $('#newgame').html('Loading...');
            
                //set some configurable speed values based on user selection
                if (this.speedSelected == 'fast') {
                    opts.data.timerSpeed = 140;
                    //do this so the faster speed doesn't increase as quickly
                    //this is to make game play last just a little longer on fast speed
                    opts.data.timerIncrease = 0.05;
                }
                else {
                    opts.data.timerSpeed = 260;
                    opts.data.timerIncrease = 0.08;
                }
                
                opts.data.canvasWidth = opts.data.boardSizes[this.sizeSelected].canvasWidth;
                opts.data.canvasHeight = opts.data.boardSizes[this.sizeSelected].canvasHeight;
                opts.data.foodSafeDistance = opts.data.boardSizes[this.sizeSelected].foodSafeDistance;
                
                //Lad GameBoard dependencies with config from user selections and screen calcs
                require(['components/GameBoard'], function(GameBoard) {
                            
                    var gb1 = new GameBoard();
                
                    //check browser localstorage for a pre-existing high score. 
                    var highScore = null;
                    if (localStorage) {                    
                        highScore = localStorage.getItem('highScore');
                    }
                
                    gb1.init({ 
                        boardWidth: Math.floor(opts.data.canvasWidth),    //NOTE: Using Math.floor in case the pixelRatio is not a whole number,
                        boardHeight: Math.floor(opts.data.canvasHeight),  //      which usually occurs when screens are zoomed
                        blockSize: Math.floor(opts.data.blockSize),                        
                        highScore: (highScore ? highScore : 0),
                        timerSpeed: opts.data.timerSpeed,
                        timerIncrease: opts.data.timerIncrease,
                        foodSafeDistance: opts.data.foodSafeDistance
                    });
                
                    $('#modalcontainer').remove();
                });
            },
        
            calculateScreenOptions: function() {

                //Do some screen math here, figure out some viable options for board sizes
                var viewportWidth = window.innerWidth,
                    viewportHeight = window.innerHeight;
                    
                //alert('dpr = ' + window.devicePixelRatio + '  actual viewport = ' + viewportWidth + ', ' + viewportHeight);
                //divide by blocksize, take the floor (to avoid float values) and multiply by blocksize
                //this gives us a normalized canvas size based on the blocksize
                var adjustedWidth = (Math.floor(viewportWidth / this.blockSize) * this.blockSize) - 80,
                    adjustedHeight = (Math.floor(viewportHeight / this.blockSize) * this.blockSize) - 240;
 
                //define some board sizes
                var boardSizes = [];
                var isMobile = false;
                
                //larger than mobile size (normalized 768 or less) allows for multiple board options, 
                //while mobile or small windowed browsers get only one board size           
                if (adjustedWidth > 768) {
                
                    //this is basically the smallest acceptable board size that stills plays well
                    boardSizes['small'] = { 
                        canvasWidth: 300,
                        canvasHeight: 300,
                        foodSafeDistance: 2
                    },
                    
                    boardSizes['medium'] = { 
                        canvasWidth: (Math.floor((viewportWidth * 0.70) / this.blockSize) * this.blockSize) - 80,
                        canvasHeight: (Math.floor((viewportHeight * 0.70) / this.blockSize) * this.blockSize) - 200,
                        foodSafeDistance: 3
                    }  
                     
                }
                else {
                    isMobile = true;
                    this.sizeSelected = 'large';
                }
                
                //everyone gets the largest size for the available screen
                boardSizes['large'] = { 
                    canvasWidth: adjustedWidth,
                    canvasHeight: adjustedHeight,
                    foodSafeDistance: (adjustedWidth > 768) ? 4 : 2
                };
                
                //board size rules
                return {
                    isMobile: isMobile,
                    boardSizes: boardSizes,
                    blockSize: this.blockSize
                }

            },
            
            handleButtonClick: function(e) {

                var targetID = e.currentTarget.id,
                    targetSep1 = targetID.indexOf('_'),
                    targetSep2 = targetID.lastIndexOf('_'),
                    targetType = targetID.substring(targetSep1 + 1, targetSep2),
                    targetValue = targetID.substring(targetSep2 + 1);

                if (targetType == 'speed') {                                      
                    this.speedSelected = targetValue;
                    $('[id^=button_speed]').removeClass('selected-option');
                }
                else {;
                    this.sizeSelected = targetValue;
                    $('[id^=button_size]').removeClass('selected-option');
                }
                
                $(e.currentTarget).addClass('selected-option');
                
                if (this.speedSelected && this.sizeSelected) {
                    $('#newgame').prop('disabled',false);
                }
                
            }
        };
        
        SnakeGame.start();
        
    });
        
    
});