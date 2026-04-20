class Player {
  constructor(x, y, isFlip) {
    this.x = x;
    this.y = y;
    this.isFlip = isFlip;
    this.playerSpeed = 5;
    this.width = 150;
    this.height = 200;
    this.dy = 0;
    this.dx = 0;
    this.isBalik = false;
    this.powerJump = -15;
    this.gravity = 0.5;
    this.isOnGround = 0;
    this.isKicking = 0;
    this.country = "Japan";
    this.frameNo = 0;
    this.frameTimer = 0;
    this.frameSpeed = 6;
    this.state = "Idle";
    this.animations = {};
    this.maxFrame = {
      "Falling Down": 4,
      Idle: 17,
      Jump: 4,
      Kick: 8,
      "Move Backward": 9,
      "Move Forward": 9,
    };
    this.countryNumber = {
      Brazil: "01",
      England: "02",
      Spain: "03",
      Japan: "04",
      Netherlands: "05",
      Portugas: "06",
      Germany: "07",
      Italy: "08",
    };
    this.loadAnimation();
  }

  update() {
    this.dy += this.gravity;

    this.x += this.dx;
    this.y += this.dy;

    if (this.y >= 350) {
      this.y = 350;
      this.dy = 0;
      this.isOnGround = true;
    } else {
      this.isOnGround = false;
    }

    this.cekState();
  }

  draw(ctx) {
    if (this.isBalik) {
      ctx.save();
      if (this.isFlip) {
        const gambar = this.animations[this.state][this.frameNo];
        ctx.drawImage(gambar, this.x, this.y, this.width, this.height);
        ctx.restore();

        return;
      }
      const gambar = this.animations[this.state][this.frameNo];
      ctx.translate(this.x + this.width, this.y);
      ctx.scale(-1, 1);
      ctx.drawImage(gambar, 0, 0, this.width, this.height);
      ctx.restore();
      return;
    }

    if (this.isFlip) {
      ctx.save();
      const gambar = this.animations[this.state][this.frameNo];
      ctx.translate(this.x + this.width, this.y);
      ctx.scale(-1, 1);
      ctx.drawImage(gambar, 0, 0, this.width, this.height);
      ctx.restore();
      return;
    }
    const gambar = this.animations[this.state][this.frameNo];
    ctx.drawImage(gambar, this.x, this.y, this.width, this.height);
    return;
  }

  loadAnimation() {
    const states = Object.keys(this.maxFrame);

    states.forEach((state, index) => {
      this.animations[state] = [];
      const numberCountryNya = this.countryNumber[this.country];
      for (let i = 0; i < this.maxFrame[state]; i++) {
        let number0 = i.toString().padStart(3, "0");
        const img = new Image();
        img.src = `../assets/Characters/Character ${numberCountryNya} - ${this.country}/${state}/${state}_${number0}.png`;
        console.log(img.src);
        this.animations[state].push(img);
      }
      // setelah selesai, this.animations terisi:
      // "Idle":          [17 gambar]
      // "Jump":          [4 gambar]
      // "Kick":          [8 gambar]
      // "Move Backward": [9 gambar]
      // "Move Forward":  [9 gambar]
      // "Falling Down":  [4 gambar]
    });
  }

  setState(newState) {
    if (this.state !== newState) {
      this.frameNo = 0;
      this.frameTimer = 0;
      this.state = newState;
    }
  }

  updateFrame() {
    this.frameTimer++;

    if (this.frameTimer >= this.frameSpeed) {
      this.frameNo++;
      this.frameTimer = 0;
    }

    if (this.frameNo >= this.maxFrame[this.state]) {
      this.frameNo = 0;
    }
  }

  cekState() {
    // ini yng pertama di prioritasin
    if (this.isKicking) {
      this.setState("Kick");
      //   NHA BEDANYA YANG CEK INI SAMA CEK YANG ADA DI DALAM UPDATEFRAME
      // ITU LIAT COBA KALO PANJANGNYA IUT BEDA, JADI AKN DULUAN DI FALSE IN DULU DI SINI
      if (this.frameNo >= this.maxFrame[this.state] - 1) {
        this.isKicking = false;
      }
      this.updateFrame();
      return;
    }
    //   ini yang lompat dan jath

    if (!this.isOnGround) {
      // ini tuh dy ya soalnya kalo dy itu cuma - atau +
      if (this.dy < 0) {
        this.setState("Jump");
      } else if (this.dy > 0) {
        this.setState("Falling Down");
      } else {
        this.setState("Idle");
      }
    }

    // ini buat yang lagi di tanah jadi kanan atau kiri
    if (this.isFlip) {
      if (this.isOnGround) {
        if (this.dx < 0) {
          this.setState("Move Forward");
        } else if (this.dx > 0) {
          this.setState("Move Backward");
        } else {
          this.setState("Idle");
        }
      }
    } else {
      if (this.isOnGround) {
        if (this.dx < 0) {
          this.setState("Move Backward");
        } else if (this.dx > 0) {
          this.setState("Move Forward");
        } else {
          this.setState("Idle");
        }
      }
    }

    // nah ini tuh untuk yang if yng idOnGround dan !isOnGround
    this.updateFrame();
  }
  kick() {
    if (!this.isKicking) {
      this.isKicking = true;
      this.frameNo = 0;
      this.frameTimer = 0;
    }
  }
}
