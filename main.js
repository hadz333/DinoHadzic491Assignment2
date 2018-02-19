var AM = new AssetManager();
var sheetHeight = 504;
var right_lane = -160;
var left_lane = -400;
var middle_lane = -300;
var lane_size = 100;
var left_change = 0;
var right_change = 0;
var gameScore = 0;
var background_speed = 3;
var gameEngine = new GameEngine();
var hero_x = 255;
var closest_from_right_distance = 1000;
var closest_from_left_distance = 1000;

function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

// no inheritance
function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.speed = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
};

Background.prototype.draw = function () {
    //this.ctx.drawImage(this.spritesheet,
      //             this.x, this.y);
      // Pan background
      this.y += this.speed;
      this.ctx.drawImage(this.spritesheet,
                     this.x, this.y);

      // Draw another image at the top edge of the first image
      this.ctx.drawImage(this.spritesheet,
                     this.x, this.y - sheetHeight);

      // If the image scrolled off the screen, reset
      if (this.y >= sheetHeight)
        this.y = 0;
};

Background.prototype.update = function () {
};

function Hero(game, spritesheet) {
    this.leftAnimation = new Animation(spritesheet, 0, 0, 28.28, 31, 0.15, 6, true, false);
    this.rightAnimation = new Animation(AM.getAsset("./img/hero_right.png"), 28.28, 0, 28.28, 31, 0.15, 6, true, true);
    this.x = 255;
    this.y = 280;
    this.speed = 5;
    this.game = game;
    this.Right = true;
    this.Left = false;
    this.Up = false;
    this.currentTime = this.game.clockTick;
    this.prevTime = this.game.clockTick;
    this.prevTime2 = this.game.clockTick;
    this.ctx = game.ctx;
}

Hero.prototype.draw = function () {
  if (this.Left) {
    this.leftAnimation.drawFrame(this.game.clockTick, this.ctx, this.x + 150, this.y + 100, 2.5);
  } else {
    this.rightAnimation.drawFrame(this.game.clockTick, this.ctx, this.x + 150, this.y + 100, 2.5);
  }
}

Hero.prototype.update = function () {
    //if (this.animation.elapsedTime < this.animation.totalTime * 8 / 14)
    //this.x += this.game.clockTick * this.speed;
    //if (this.x > 400) this.x = 0;

    if (closest_from_left_distance < closest_from_right_distance) {
      this.Left = true;
      this.Right = false;
    } else {
      this.Right = true;
      this.Left = false;
    }

    this.currentTime += this.game.clockTick;
    var type = Math.floor(Math.random() * 1000) + 1;
    if (this.currentTime - this.prevTime2 >= type / 10) {
      var left_or_right = type % 2;
      switch (left_or_right) {
        case 0:
          gameEngine.addEntity(new Goomba_left(gameEngine, AM.getAsset("./img/goomba_sheet.png")));
          break;
        case 1:
          gameEngine.addEntity(new Goomba_right(gameEngine, AM.getAsset("./img/goomba_sheet.png")));
          break;
      }
      this.prevTime2 = this.currentTime;
    }

    if (this.Right) {
      // implement a timer here
      if (this.currentTime - this.prevTime >= 0.9) {
    		gameEngine.addEntity(new Bullet_right(gameEngine));
        this.prevTime = this.currentTime;
    	}
    }

    if (this.Left) {
      // implement a timer here
      if (this.currentTime - this.prevTime >= 0.9) {
    		gameEngine.addEntity(new Bullet_left(gameEngine));
        this.prevTime = this.currentTime;
    	}
    }
}

function Goomba_right(game, spritesheet) {
    this.rightAnimation = new Animation(spritesheet, 0, 64, 61.25, 64, 0.07, 4, true, false);
    this.x = -300;
    this.y = 285;
    this.speed = 1;
    this.game = game;
    this.Right = false;
    this.Left = false;
    this.Up = false;
    this.xButton = false;
    this.ctx = game.ctx;
}

Goomba_right.prototype.draw = function () {
    this.rightAnimation.drawFrame(this.game.clockTick, this.ctx, this.x + 150, this.y + 100, 1);
}

Goomba_right.prototype.update = function () {
    //if (this.animation.elapsedTime < this.animation.totalTime * 8 / 14)
    //this.x += this.game.clockTick * this.speed;
    //if (this.x > 400) this.x = 0;
    this.x += this.speed;
    var distance = hero_x - this.x;
    if (distance < closest_from_right_distance) {
      closest_from_right_distance = this.x;
    }
}

function Goomba_left(game, spritesheet) {
    this.leftAnimation = new Animation(spritesheet, 0, 0, 61.25, 64, 0.07, 4, true, false);
    this.x = 800;
    this.y = 285;
    this.speed = 1;
    this.game = game;
    this.Right = false;
    this.Left = false;
    this.Up = false;
    this.xButton = false;
    this.ctx = game.ctx;
}

Goomba_left.prototype.draw = function () {
    this.leftAnimation.drawFrame(this.game.clockTick, this.ctx, this.x + 150, this.y + 100, 1);
}

Goomba_left.prototype.update = function () {
    //if (this.animation.elapsedTime < this.animation.totalTime * 8 / 14)
    //this.x += this.game.clockTick * this.speed;
    //if (this.x > 400) this.x = 0;
    this.x -= this.speed;
    var distance = this.x - hero_x;
    if (distance < closest_from_left_distance) {
      closest_from_left_distance = this.x;
    }
}

function Bullet_left(game) {
  console.log("bullet left");
  // bullet going left animation here
  this.animation = new Animation(AM.getAsset("./img/hero_right.png"), 0, 0, 28.28, 31, 0.15, 1, true, true);
  this.x = 255;
  this.y = 280;
  this.speed = 3;
  this.game = game;
  this.ctx = game.ctx;
}

Bullet_left.prototype.draw = function () {
  this.animation.drawFrame(this.game.clockTick, this.ctx, this.x + 150, this.y + 100, 2);
}

Bullet_left.prototype.update = function () {
    this.x -= this.speed;
}

function Bullet_right() {
  console.log("bullet right");
  // bullet going right animation here
  this.animation = new Animation(AM.getAsset("./img/hero_right.png"), 0, 0, 28.28, 31, 0.15, 1, true, true);
  this.x = 255;
  this.y = 280;
  this.speed = 3;
  this.game = gameEngine;
  this.ctx = gameEngine.ctx;
}

Bullet_right.prototype.draw = function () {
  this.animation.drawFrame(this.game.clockTick, this.ctx, this.x + 150, this.y + 100, 2);
}

Bullet_right.prototype.update = function () {
    this.x += this.speed;
}

function Helicopter(game, spritesheet) {
    this.animation = new Animation(spritesheet, 0, 0, 423, 150, 0.2, 4, 1, true);
    this.speed = 350;
    this.y = 0;
    this.ctx = game.ctx;
    Entity.call(this, game, 0, 20);
}

Helicopter.prototype = new Entity();
Helicopter.prototype.constructor = Helicopter;

Helicopter.prototype.update = function () {
    this.x += this.game.clockTick * this.speed;
    if (this.x > 1000) this.x = -430;
    Entity.prototype.update.call(this);
}

Helicopter.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
}

AM.queueDownload("./img/rainy.gif");
AM.queueDownload("./img/hero.png");
AM.queueDownload("./img/hero_right.png");
AM.queueDownload("./img/helicopter.png");
AM.queueDownload("./img/goomba_sheet.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");


    gameEngine.init(ctx);
    gameEngine.start();
    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/rainy.gif")));
    gameEngine.addEntity(new Helicopter(gameEngine, AM.getAsset("./img/helicopter.png")));
    gameEngine.addEntity(new Hero(gameEngine, AM.getAsset("./img/hero.png")));
    gameEngine.addEntity(new Goomba_left(gameEngine, AM.getAsset("./img/goomba_sheet.png")));
    gameEngine.addEntity(new Goomba_right(gameEngine, AM.getAsset("./img/goomba_sheet.png")));

    console.log("All Done!");
});
