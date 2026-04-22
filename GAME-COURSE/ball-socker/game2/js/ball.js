class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;
    this.gravity = 0.5;
    this.width = 50;
    this.height = 50;
    this.image = loadImage("../assets/Ball 02.png");
  }

  draw(ctx) {
    if (this.image.complete) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }

  update(canvas){
        this.dy += this.gravity;

        this.x += this.dx;
        this.y += this.dy

        if(this.y >= 450){
            this.y = 450;
            this.dy *= -0.8
            this.dx *= -0.8

        }

        // ini kita buat biar dia nanti mantul mantul
        // kalo kena atas
        if(this.y + this.height <= 0){
            this.y = this.heigth + 0
            this.dy *= -0.7
            this.dx *= -0.7
        }

        // ini untuk yang ke kiri
        if(this.x + this.width <= 0){
            this.x = this.width + this.x
            this.dx *= -0.8
            this.dy *= -0.8
        }

        if(this.x + this.width >= canvas.width){
            this.x = canvas.width - this.width
            this.dx *= -0.8
            this.dy *= -0.8
        }
  }
}
