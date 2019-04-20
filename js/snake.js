var level = new Array();
var snake = new Array();

var current_level = 1;
var cicle = 200;
var score = 0;

var constants = {
	map_passable: "0",
	map_wall	: "1",
	map_snake	: "2",
	map_unpassable: " ",
	direction_left: 97,
	direction_up: 119,
	direction_right: 100,
	direction_down: 115,
	css_wall: "wall",
	css_snake: "snake",
	css_col: "col",
	css_row: "row",
	css_food: "food",
	css_unpassable: "unpassable"
};

var direction;
var dinamicDirection = constants.direction_right;
var gameOver = false;

$(document).ready(function(){
	init();
});

function init(){
	level = new Array();
	snake = new Array();

	//current_level = 1;
	cicle = 200;
	//score = 0;
	
	dinamicDirection = constants.direction_right;
	gameOver = false;
	
	$("body").children().remove();
	generateGameLevel(current_level);
	$(document).keypress(function(e){
		//alert(e.keyCode);
		var arrowsPressed = e.keyCode == constants.direction_left ||
							e.keyCode == constants.direction_right ||
							e.keyCode == constants.direction_up ||
							e.keyCode == constants.direction_down;
							
		if (direction != e.keyCode && Math.abs(e.keyCode - direction) != 2 && arrowsPressed){
			dinamicDirection = e.keyCode;
		}else if (e.keyCode == 0){
			alert("PAUSED");
		}
	});
}

function init_game(){
	generateGameScore();
	alert("Hit Ok to Start");
	giveFood();
	next();
}

function next(){
	var newFirst;
	direction = dinamicDirection;
	var snakeFirst = snake[snake.length-1];
	var snakeLast = snake[0];
	var positionLast = getSnakeMemberPosition(snakeLast);
	var positionFirst = getSnakeMemberPosition(snakeFirst);
	var nextElement = peakNextElement(positionFirst);
	if(shouldMove(positionFirst)){
		level[positionLast.row][positionLast.col].removeClass(constants.css_snake).addClass(constants.css_col);
		newFirst = nextElement.removeClass(constants.css_col).addClass(constants.css_snake);
		//BORRO EL ULTIMO
		snake.splice(snake.lenght,1);
		//AGREGO EL NUEVO
		snake.push(newFirst);
	}else{
		gameOver = nextElement.hasClass(constants.css_wall) || nextElement.hasClass(constants.css_snake);
		if(nextElement.hasClass(constants.css_food)){
			newFirst = nextElement.removeClass(constants.css_food).addClass(constants.css_snake);
			snake.push(newFirst);
			giveFood();
			cicle = parseInt(Math.floor(cicle/(11/10)));
			giveScore();
			//CHANGE LEVEL
			if(parseInt(Math.floor(score/10)) > (current_level-1)){
				current_level = current_level + 1;
				init();
				return;
			}
		}
	}
	if (!gameOver){
		setTimeout("next()",cicle);
	}else{
		alert("GAME OVER");
	}
}

function giveScore(){
	var scoreContainerScore = $("#score-container-score");
	score = score + 1;
	scoreContainerScore.html(score);
}

function giveFood(){
	var x = parseInt(Math.round(Math.random() * (level.length-1)));
	var y = parseInt(Math.round(Math.random() * (level[0].length-1)));
	if (!level[x][y].hasClass(constants.css_snake) && !level[x][y].hasClass(constants.css_wall) && !level[x][y].hasClass(constants.css_unpassable)){
		level[x][y].removeClass(constants.css_col).addClass(constants.css_food);
	}else{
		giveFood();
	}
}

function peakNextElement(position){
	if(direction == constants.direction_up){
		return level[position.row-1][position.col];
	}else if(direction == constants.direction_right){
		return level[position.row][position.col+1];
	}else if(direction == constants.direction_down){
		return level[position.row+1][position.col];
	}else if(direction == constants.direction_left){
		return level[position.row][position.col-1];
	}
}

function shouldMove(position){
	var nextElement = peakNextElement(position);
	return 	!nextElement.hasClass(constants.css_wall) && 
			!nextElement.hasClass(constants.css_food) && 
			!nextElement.hasClass(constants.css_snake);
}

function getSnakeMemberPosition(snakeMember){
	var id = snakeMember.attr("id");
	return {
		row:parseInt(id.substring(id.indexOf("r-")+2,id.indexOf("_"))),
		col:parseInt(id.substring(id.indexOf("c-")+2,id.length))
	};
}

function generateGameScore(){
	var scoreContainer = $("<div id='score-container'></div>").prependTo("#level-container");
	scoreContainer.append("<span class='score-label'>Score: </span>");
	scoreContainer.append("<span class='score-result' id='score-container-score'>0</span>");
}

function generateGameLevel(levelNumber){
	$.ajax({
	  url: "levels/"+levelNumber+".txt",
	  success: function(data){
		var lines = data.split("\n");
		var levelContainer = $("<div id='level-container'></div>").appendTo("body");
		var div = "<div id='{id}'></div>";
		for (var i=0; i < lines.length; i++){
			level.push(new Array());
			var row = $(div.replace("{id}","r-"+i)).appendTo(levelContainer).addClass(constants.css_row);
			for (var j=0; j <= lines[i].length; j++){
				var col;
				var line = lines[i];
				if (line[j] == constants.map_passable){ //no wall
					col = $(div.replace("{id}","r-"+i+"_c-"+j)).appendTo(row).addClass(constants.css_col);
				}else if (line[j] == constants.map_wall){ //wall
					col = $(div.replace("{id}","r-"+i+"_c-"+j)).appendTo(row).addClass(constants.css_wall);
				}else if (line[j] == constants.map_snake){ //snake
					col = $(div.replace("{id}","r-"+i+"_c-"+j)).appendTo(row).addClass(constants.css_snake);
					snake.push(col);
				}else if (line[j] == constants.map_unpassable){ //unpassable
					col = $(div.replace("{id}","r-"+i+"_c-"+j)).appendTo(row).addClass(constants.css_unpassable);
				}
				level[i].push(col);
			}
		}
		init_game();
	  },
	  dataType: 'html'
	});
}
