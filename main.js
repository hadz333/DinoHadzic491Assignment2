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
    this.x = 100;
    this.y = 280;
    this.speed = 5;
    this.game = game;
    this.Right = false;
    this.Left = false;
    this.Up = false;
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

    if (this.game.rightButton) {
      this.Right = true;
    } else {
      if (this.x >= 650 || this.Left) {
        right_change = 0;
        this.Right = false;
      }
    }
    if (this.Right) {
      if (this.x < 650) {
        this.x += this.speed;
        right_change += this.speed;
      } else {
        right_change = 0;
        this.Right = false;
      }
    }

    if (this.game.leftButton) {
      this.Left = true;
    } else {
      if (this.x <= -150 || this.Right) {
        left_change = 0;
        this.Left = false;
      }
    }
    if (this.Left) {
      if (this.x > -150) {
        this.x -= this.speed;
        left_change += this.speed;
      } else {
        left_change = 0;
        this.Left = false;
      }
    }

    if (this.game.upButton) {
      this.Up = true;
    } else {
      this.Up = false;
    }
    if (this.Up) {
      this.y -= this.game.clockTick * this.speed;
    }
}

function Puncher(game, spritesheet) {
    this.leftAnimation = new Animation(spritesheet, 0, 0, 61.25, 64, 0.07, 5, true, true);
    this.rightAnimation = new Animation(spritesheet, 0, 64, 61.25, 64, 0.05, 5, true, true);
    this.x = 10;
    this.y = 265;
    this.speed = 5;
    this.game = game;
    this.Right = false;
    this.Left = false;
    this.Up = false;
    this.xButton = false;
    this.ctx = game.ctx;
}

Puncher.prototype.draw = function () {
  if (this.xButton) {
    this.leftAnimation.drawFrame(this.game.clockTick, this.ctx, this.x + 150, this.y + 100, 1.5);
  } else {
	   this.rightAnimation.drawFrame(this.game.clockTick, this.ctx, this.x + 150, this.y + 100, 1.5);
  }
}

Puncher.prototype.update = function () {
    //if (this.animation.elapsedTime < this.animation.totalTime * 8 / 14)
    //this.x += this.game.clockTick * this.speed;
    //if (this.x > 400) this.x = 0;

    if (this.game.xButton) {
      this.xButton = true;
    } else {
      if (this.punchAnimation.isDone()) {
          this.punchAnimation.elapsedTime = 0;
          this.xButton = false;
      }
    }
    if (this.xButton) {
      if (this.punchAnimation.isDone()) {
          this.punchAnimation.elapsedTime = 0;
          this.xButton = false;
      }
    }

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
// AM.queueDownload("./img/goomba_sheet.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();
    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/rainy.gif")));
    gameEngine.addEntity(new Helicopter(gameEngine, AM.getAsset("./img/helicopter.png")));
    gameEngine.addEntity(new Hero(gameEngine, AM.getAsset("./img/hero.png")));
    // gameEngine.addEntity(new Puncher(gameEngine, AM.getAsset("./img/goomba_sheet.png")));

    console.log("All Done!");
});
