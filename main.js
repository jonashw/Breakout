var canvas, ctx, bricks, loopInterval;
var targetFPS = 60;
var refreshDelay = 1000 / targetFPS;
var arena = {
	height: 800
	,width: 600
};
var ball = {
	size: 10
	,x: 200
	,y: 300
	,dx: -10
	,dy: -5
	,isOutsideArenaX: function(){
		return this.x < 0 || (this.x + this.size) > arena.width
	}
	,isOutsideArenaTop: function(){
		return this.y < 0;
	}
	,isOutsideArenaBottom: function(){
		return (this.y + this.size) > arena.height;
	}
};
var paddle = {
	height: 30
	,width: 250
	,x: 20
	,y: arena.height - 30
	,isTouchingBall: function(ball){
		var ballX2 = ball.x + ball.size;
		var ballY2 = ball.y + ball.size;
		var x2 = (this.x + this.width);
		var y2 = (this.y + this.height);
		return rectanglesOverlap(ball.x, ballX2, ball.y, ballY2, this.x, x2, this.y, y2);
	}
};
function Brick(x,y){
	this.x = x;
	this.y = y;
	this.width = 50;
	this.height = 25;
}
function valueIsBetween(value, lowerBound, upperBound){
	return value > lowerBound && value < upperBound;
}
function rectanglesOverlap(aX1, aX2, aY1, aY2, bX1, bX2, bY1, bY2){
	var overlapX = valueIsBetween(aX1, bX1, bX2)  //ball's left is inside brick
				|| valueIsBetween(aX2, bX1, bX2); //ball's right is inside brick
	var overlapY = valueIsBetween(aY1, bY1, bY2)  //ball's top is inside brick
				|| valueIsBetween(aY2, bY1, bY2); //ball's bottom is inside brick
	return overlapX && overlapY;
}
var brickCollection = {
	bricks: (function(){
		var bs = [];
		for(var r=0; r<5; r++){
			for(var i=0; i<12; i++){
				bs.push(new Brick(i * 50, r * 25));
			}
		}
		return bs;
	 })()
	,bricksTouchingBall: function(ball){
		var ballX2 = ball.x + ball.size;
		var ballY2 = ball.y + ball.size;
		return this.bricks.filter(function(brick){
			var brickX2 = (brick.x + brick.width);
			var brickY2 = (brick.y + brick.height);
			return rectanglesOverlap(ball.x, ballX2, ball.y, ballY2, brick.x, brickX2, brick.y, brickY2);
		});
	}
	,removeMany: function(bricks){
		for(var i in bricks){
			var brick = bricks[i];
			var index = this.bricks.indexOf(brick);
			if(index >= 0){
				this.bricks.splice(index,1);
			}
		}
	}
};

function setupCanvas($el){
	canvas = $el;
	canvas
	   .css({
			height: arena.height + 'px'
		   ,width:  arena.width  + 'px'
	   })
	   .attr('height',arena.height)
	   .attr('width',arena.width);
	ctx = canvas[0].getContext('2d');
}
function setupControls(){
	var paddleMoveInterval = 50;
	$(document).on('keydown',function(e){
		switch(e.which){
			default:
				return;
			case 37://left
				paddle.x -= paddleMoveInterval;
				break;
			case 39://right
				paddle.x += paddleMoveInterval;
				break;

		}
		//keep the paddle inside the arena
		if(paddle.x < 0){
			paddle.x = 0;
		}
		if((paddle.x + paddle.width) > arena.width){
			paddle.x = arena.width - paddle.width;
		}
	});
}
function startLoop(){
	loopInterval = setInterval(function(){
		update();
		draw();
	}, refreshDelay);
}

function stopLoop(){
	clearInterval(loopInterval);
}

function resetBall(){
	ball.x = Math.floor(paddle.x + (paddle.width / 2));
	ball.y = arena.height - (paddle.height * 2);
	ball.dx = -10;
	ball.dy = -5;
}

function update(){
	ball.x += ball.dx;
	ball.y += ball.dy;
	if(ball.isOutsideArenaX()){
		ball.dx = -(ball.dx);
	}
	if(ball.isOutsideArenaTop()){
		ball.dy = -(ball.dy);
	}
	if(paddle.isTouchingBall(ball)){
		ball.dy = -(ball.dy);
		//apply english to ball (change in dx) according to what part of the paddle it hits:
		//       o                     Ball
		//   ==========|==========     Paddle
		//           - 0 +             1D coordinate system, with the paddle's center being zero
		//
		var maxChange = 3;
		var ballX = ball.x - paddle.x - (paddle.width / 2);
		var ballXPercent = ballX / (paddle.width / 2);
		//a hit directly on the center incurs no change
		//outside hits cause the largest change
		//hits in (-) makes the dx more negative
		//hits in (+) makes the dx more positive
		var thisChange = maxChange * ballXPercent;
		ball.dx += thisChange;
	}
	if(ball.isOutsideArenaBottom()){
		stopLoop();
		alert('oops! You dropped the ball.  Let me pick it back up for you...');
		resetBall();
		startLoop();
	}
	var touchedBricks = brickCollection.bricksTouchingBall(ball);
	if(touchedBricks.length > 0){
		ball.dy = -(ball.dy);
		brickCollection.removeMany(touchedBricks);
		if(brickCollection.bricks.length == 0){
			stopLoop();
			alert('you won!');
		}
	}
}
function draw(){
	ctx.save();
	//clear canvas
	ctx.clearRect(0,0,arena.width, arena.height);
	//draw arena border
	ctx.strokeRect(0,0,arena.width,arena.height);
	//draw paddle
	ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
	//draw ball
	ctx.fillRect(ball.x, ball.y, ball.size, ball.size);
	//draw bricks
	for(i in brickCollection.bricks){
		var brick = brickCollection.bricks[i];
		ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
		ctx.strokeStyle = '#ffffff';
		ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
	}
	ctx.restore();
}
