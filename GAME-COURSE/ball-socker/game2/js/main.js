const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

class Game {
  constructor() {
    this.background = loadImage("../assets/background2.jpg");
    this.ball = new Ball(canvas.width / 2 - 50 / 2, canvas.height / 2 - 50 / 2);
    this.player1 = new Player(110, 350, false);
    this.player2 = new Player(760, 350, true);
    this.gawang1 = new Gawang(40, 270);
    this.gawang2 = new Gawang(200, 250);
  }

  start() {
    this.listener();
    requestAnimationFrame(() => this.render());
  }
  render() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.render());
  }
  draw() {
    this.drawBackground();
    this.drawGawang();
    this.drawBall();
    this.drawPlayer();
  }

  update() {
    this.player1.update();
    this.player2.update();
    this.ball.update(canvas);
    this.checkCollision(this.player1, this.ball);
    this.checkCollision(this.player2, this.ball);
  }

  drawBackground() {
    if (this.background.complete) {
      ctx.drawImage(this.background, 0, 0, canvas.width, canvas.height);
    }
  }

  drawPlayer() {
    this.player1.draw(ctx);
    this.player2.draw(ctx);
  }
  drawGawang() {
    this.gawang1.draw(ctx, false);
    this.gawang2.draw(ctx, true);
  }

  drawBall() {
    this.ball.draw(ctx);
  }

  checkCollision(player, ball) {
    if (
      player.x + player.width > ball.x &&
      ball.x + ball.width > player.x &&
      ball.y < player.y + player.height &&
      player.y < ball.y + ball.height
    ) {
      console.log("colliction");
      player.kick();
      //   gausha pake tihs ya karena sudha di kirim dari luar
      ball.dx = (ball.x - player.x) * 0.1; // jadi untuk kanan kirinya
      ball.dy = -10; // untuk atas bwahnya
      ball.y = player.y - ball.height;
    }
  }

  listener() {
    window.addEventListener("keydown", (e) => {
      console.log(e.key);
      if (e.key.toLowerCase() == "w") {
        if (this.player1.isOnGround) {
          this.player1.dy = this.player1.powerJump;
        }
      } else if (e.key.toLowerCase() == "a") {
        this.player1.dx = -this.player1.playerSpeed;
        this.player1.isBalik = true;
      } else if (e.key.toLowerCase() == "d") {
        this.player1.dx = this.player1.playerSpeed;
        this.player1.isBalik = false;
      } else if (e.key.toLowerCase() == "arrowup") {
        if (this.player2.isOnGround) {
          this.player2.dy = this.player2.powerJump;
        }
      } else if (e.key.toLowerCase() == "arrowleft") {
        this.player2.dx = -this.player2.playerSpeed;
        this.player2.isBalik = false;
      } else if (e.key.toLowerCase() == "arrowright") {
        this.player2.dx = this.player2.playerSpeed;
        this.player2.isBalik = true;
      }
    });

    window.addEventListener("keyup", (e) => {
      this.player1.dx = 0;
      this.player2.dx = 0;
      this.player1.isOnGround = false;
      this.player2.isOnGround = false;
    });
  }
}

const game = new Game();
game.start();
