class Gawang {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 150;
    this.height = 250;
    this.image = loadImage("../assets/Goal - Side.png");
  }

  draw(ctx, isFlip = true) {
    if (this.image.complete) {
      // nah jadi kita tuh harus save dulu ya biar draw yang lain engga ke ikut ke flip
      ctx.save();
      if (isFlip) {
        ctx.translate((this.x  ) + this.width, this.y);
        // jadi harus kita ubah dulu ya originny dan haru sesuai si
        // objeknya kalo misalnya mau ubah objek di tempat oke
        // dan juga kalo kita langsung scale di ini maka nanit yang asanya originnya itu ad adi 0.0 (kiri atas)
        // maka seetelah scale itu langsng ada di kanan atas

        // makana harus pake traslate dulu da truh originny di titik objek tersebut, biar pas di flip itu hanya objek iu aja yang ke flip
        // karean akan ada perubahan atau dampak itu hanya ke koordinat dari si originnya ini
        // kalo 0.0 berati nanti semuanya kn dampak
        // dunia koordinatnya yang dibalik,
        // tapi karena kamu save() & restore(), efeknya terlihat hanya ke objek itu saja
        ctx.scale(-1, 1);
        // kalo udah pake origin berati jangan di set lagi untuk width dan heightnya
        ctx.drawImage(this.image,0 ,0, this.width, this.height);
        ctx.restore();
        return
      }

      // nah jadi disni kita itu perlu utuk trasnalte dulu si originnya
      // Semua operasi seperti scale, rotate, dll itu berputar / membalik berdasarkan titik (0,0) saat itu.
      ctx.drawImage(this.image, (this.x  ), this.y, this.width, this.height);
      ctx.restore();
    }
  }



}
