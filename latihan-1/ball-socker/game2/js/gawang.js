class Gawang {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 150;
    this.height = 250;
    this.image = loadImage("../assets/Goal - Side.png");
  }

  draw(ctx, isFlip) {
    if (this.image.complete) {
      if (isFlip) {
        ctx.save();
        ctx.translate(this.x - this.width, this.y);
        ctx.scale(-1, 1)
        ctx.drawImage(this.image, -905, 20, this.width, this.height);
        ctx.restore();
        return;
      }
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);

    }
  }

  update() {}
}
