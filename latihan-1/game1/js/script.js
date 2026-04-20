const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// kita ga boelh load image di rendre, karena akn erus di ualng ualng, makakita load iamgenya di sini aja

// NAH INGA TYA UTNUK PEREGERAKAN DAN BUKAN LOAD GAMABR ITU DI TARHUNYA DI FUNGIS UPDATE / LISTENER

const backgroudImage = loadImage("../assets/background2.jpg");
console.log(backgroudImage);
class Game {
  // 9
  constructor() {
    this.playerSpeed = 4;
    this.player1 = new Player(200, 400);
    this.player2 = new Player(600, 400);
    // kia kaish 50/2 karena width dan heigtnya ini 50 jaid biar pas di tengah kita /2
    this.ball = new Ball(canvas.width / 2 - 50 / 2, canvas.height / 2 - 50 / 2);
    this.gawangKiri = new Gawang(0, 270);
    this.gawangKanan = new Gawang(canvas.width - 150, 270);
  }

  // 1.
  start() {
    // nah karena di canvas itu ksosong, mka kita butuh utuk draw dulu backgroundnya dulu
    this.listener();
    // TODO : TANYAIN NANTI KENAP HARUS AD DISEBELUM REQUESTANIMATION
    requestAnimationFrame(() => this.render());
    // nah jadi untuk pertama kali itu kita akn panggil si render ini, baru nanti dia akn render terus menerus
  }

  //   2.
  render() {
    // ini kita bua biar ketika render, dia akn selalu ngedraw dan juga update  baru nanit di rendre lagi
    this.update(); // harus update dulu baru draw ya
    this.draw();

    requestAnimationFrame(() => this.render());
    // Browser, tolong panggil fungsi render() lagi di frame berikutnya
    // jadi awalnya it game hanya canvas kosong aja, makanya kta butuh mengulang ulang gambar tiap framenya pke ini
  }

  //   4.
  drawBackground() {
    // nah jadi param ke dua ituadlah x dan yang ektiga adaalh y dan keempat adalh kita akna muatin ke ukuran canvasnya dan begi juga yang param ke 5
    // ctx.drawImage(image, x, y, width, height);
    if (backgroudImage.complete) {
      ctx.drawImage(backgroudImage, 0, 0, canvas.width, canvas.height);
    }
  }

  //   5
  // untuk draw element
  draw() {
    this.drawBackground();
    // kita juga harus liat dulu komponent yang ada di gamenya ini apa aja
    // baru ktia panggil lagi disini
    this.drawGawang();
    this.drawPlayers();
    this.drawBall();
  }

  drawGawang() {
    // biar gampang untuk cek golal di gwang mana soalna kalo pkae obje yang sama maka susah
    this.gawangKiri.draw(ctx, false); // hadap kanan
    this.gawangKanan.draw(ctx, true); // hadap kiri
  }

  drawPlayers() {
    this.player1.draw(ctx);
    this.player2.draw(ctx);
  }
  drawBall() {
    this.ball.draw(ctx);
  }

  // untuk ngeupdate posisi/state element
  update() {
    // nah jadi apapun yang fungisnya untuk gerakin mak di truh di update ya atau di listener

    // gausah gini ya, ktia pisahin ke dalam class ball dan kita panggil ke sini
    this.ball.update();
    this.player1.update();
    this.player2.update();

    // nah jadi gini, bola itu kan akan kena gravitasi, jaid posisi y dari bolanya akna berkurang terus terusan
    // this.ball.y += 2

    // nah jadi disii kita kasih batasan gitu ibar ga sampe bawah dan hilang
    // jadi pas udah nyampe dia akan berhenti
    // if(this.ball.y == canvas.height/2)

    this.checkCollision(this.player1, this.ball);
    this.checkCollision(this.player2, this.ball);
    this.checkGoal();
  }

  // jadi gini ini tuh bener bener harus overlap atau harus numpuk gitu
  // jadi yang pertam apakah si bola itu ada di samping kiri apa kanan ? dan harus bener apakah dia ada di atas atau bawah
  //
  // checkCollision(player, ball) {
  //   if (
  //     player.x < ball.x + ball.width && //kanan
  //     player.x + player.width > ball.x &&
  //     player.y < ball.y + ball.height &&
  //     player.y + player.height > ball.y
  //   ) {
  //     //  arah horizontal (biar natural)
  //     ball.dx = (ball.x - player.x) * 0.05;

  //     //  sundul ke atas
  //     ball.dy = -10;

  //     //  cegah nempel
  //     ball.y = player.y - ball.height;
  //   }
  // }

  checkCollision(player, ball) {
    // nah disini kita akan cek overlap
    if (
      player.x + player.width > ball.x &&
      //artinya apakah sisi paling kanan player itu lebih besar dari pada sisi paling kiri bola ?
      // artinya bola udah masuk dari bagian kanan player
      player.x < ball.x + ball.width &&
      // artinua apakah sisi oaling kanan player itu lebih kecil dari pada sisi paling kanan bola ?
      // artinya udah masuk dari bagian kirinya player
      player.y < ball.y + ball.height &&
      // artinya apaakh sisi paling atas dari player itu ebih kecil dari pada sisi paling atas si bola ?
      // artinya bola sudha masuk dan overlap dari arah atas si player
      player.y + player.height > ball.y
      // artinya issi paling baway y itu sudah lebih besar dari pada sisi pailng bawah dari sisi paling bawah si ball
      // artinya si ball udah masuk dari pagian bawah player

      // kalo semua terpenuhi artinya bola overlap
    ) {
      // dan di cek aja sekarnag apakah lebih condong ke kanan apa kekiri
      //  arah horizontal (biar natural)
      // kalo lebih kecil / - berati kan contong ke kiri dn kalo conodng ke kanan / +  allu akli 0.5

      // nah jadi kallo si titik x dari ball lebih kecil, artinyakan lagi ada di kiri\
      // da di kali dnenga 0.5 maka akan minus
      // nah tapi kalo si titik x dari ball lebih besar artinya kan lagi di kanan
      // dan kalo di kali dnegna 0.5 maka akan jadi plus
      ball.dx = (ball.x - player.x) * 0.05;

      //  sundul ke atas
      ball.dy = -10;

      //  cegah nempel dnegna cara di reset posisinyabiar ada di atas kepala si player
      // di kruang dnegna
      ball.y = player.y - ball.height;
    }
  }
  checkGoal() {
    const ball = this.ball;
    // console.log('test')
    // gini RMUS UNTUK CEK COLLICTION ITU, JAID TETEP YA X KE X Y KE Y
    // NAH JADI UNTUK THIS.Y + THIS.WIDTH NAH JADI APAPUNYANG DI TAMBAH SAMA THIS.WIDTH MAKA
    // KONDISINYAHARUS LEBIH BSAR UDAH ITU AJA

    // jika kena gawang kiri
    if (
      this.ball.x < this.gawangKiri.x + this.gawangKiri.width &&
      this.ball.x + this.ball.width > this.gawangKiri.x &&
      this.ball.y < this.gawangKiri.y + this.gawangKiri.height &&
      this.ball.y + this.ball.height > this.gawangKiri.y
    ) {
      console.log("masuk goal kiri");
      this.ball.reset(canvas);
    }
    // jika kena gawang kanan
    if (
      this.ball.x < this.gawangKanan.x + this.gawangKanan.width &&
      this.ball.x + this.ball.width > this.gawangKanan.x &&
      this.ball.y < this.gawangKanan.y + this.gawangKanan.height &&
      this.ball.y + this.ball.height > this.gawangKanan.y
    ) {
      console.log("masuk goal kanan");
      this.ball.reset(canvas);
    }
  }

  // untuk listen event keyboard
  listener() {
    // nanit akn kit pnagil di start ya
    // TODO : NANI TANYA KENAPA HARUS DI START DI TARUHNYA

    // nah dinsi kita akn memubaut untuk bis ngegerakin

    // jadi gerakin player 1 pake wasd dan player 2 pake arrow

    // nah ingat, kalo kita pake fungsi didalam ungsi yang adadidalem class
    // dan mau akses this, maka kita harus pake arrow function ya
    window.addEventListener("keydown", (e) => {
      // JADI GINI YANG KITA UBH ITU ADALAH SI DX DAN DY NYA BUKA SI S ATAU Y NYA GITU
      // https://chatgpt.com/c/69e48530-2ddc-8321-a01a-6d1c703c6044
      // karena kalo kita ubah dx itu akn dia akna selau berubah karan di aurh di fungis updae, sedangkan kalo kita ubah d x itu akan aneh dan patha patha dan ga smooth karen kita ga taurh di update -> updat itu kan akna di jalanakn terus menerus makanya bsia jadi smooth
      // WASD UNTUK PLYER 1 DAN WRROR UNTUK PLAYER 2
      // if (e.key.toLowerCase() == "w") {
      //   // nah jadi gini, kalo kita klik w berati akn akna pindha ke atas ya si y nya berati
      //   // si y nya kita -- (kurangin)
      //   // dan ini tuh nanti untuk lompat ya anti ktia ini in
      //   this.player1.dy -= this.playerSpeed;
      //   // begitu setrusnya ya
      //   // nah ini juga keren nih, nanti tambahin agar ketika saya ketik shift maka akna bertambah speednya
      //   // /jadi nanti buat atribut shiftSpeed 5 terus kalo ketik shift dna salah satu abjad ini maka akn nambha speednya
      // } else if (e.key.toLowerCase() == "a") {
      //   this.player1.dx -= this.playerSpeed;
      // } else if (e.key.toLowerCase() == "s") {
      //   // ini gusah ya karen ga ada bawah
      //   // this.player1.dy += this.playerSpeed;
      // } else if (e.key.toLowerCase() == "d") {
      //   this.player1.dx += this.playerSpeed;
      //   // } else if (e.key.toLowerCase() == "arrowUp") { // ga bisa ya KARENA TO LOWER CASE IU ARTINYA SEMUA JADI arrowup
      // }
      // // } else if (e.key.toLowerCase() == "arrowUp") { // ga bisa ya KARENA TO LOWER CASE IU ARTINYA SEMUA JADI arrowup
      // else if (e.key.toLowerCase() == "arrowup") {
      //   this.player2.dy -= this.playerSpeed;
      // } else if (e.key.toLowerCase() == "arrowdown") {
      //   // ini gusah ya karen ga ada bawah
      //   // this.player1.y += this.playerSpeed;
      // } else if (e.key.toLowerCase() == "arrowright") {
      //   this.player2.dx += this.playerSpeed;
      // } else if (e.key.toLowerCase() == "arrowleft") {
      //   this.player2.dx -= this.playerSpeed;
      // }
      // jadi itu tuh ada bebrapa masalah ya yaitu
      // 1 ingat ya bukan -= ini mah artinay nanti ketika kita klik kanan sekali lalu jalan terus terusan
      // maka ketik kit klik kiri mala berhenti
      // 2 dn jug yang kedua initekan D → dx = 4
      // tekan D lagi → dx = 8
      // tekan D lagi → dx = 12
      // nah saya itu maunya ketika klik kiri maka langsung ke kiri anpa henti lagi
      // dan juga ga usah nambah speed tiap kali di kklik double jadinya itu yang di buat min adalah si dx / dy nya
      // bukan tambah atapun kuragi

      // dan ingat harus -this.playerSpeed biar kalo di lklik 2 kali g makin kenceng karna kalo yang biasa itu
      // klik 2 kali berati akna terus d tambah yaa
      if (e.key.toLowerCase() == "w") {
        // this.player1.dy = -this.playerSpeed;

        if (this.player1.isOnGround) {
          // jadi si is groud ini itu hanya flag aja jadi nanti ketika di keyup dia akn false lagi
          // jadi anit ga akan terus otomatis ke atas terus jika di spam
          this.player1.dy = this.player1.jumpPower;
        }

        // ini ga efektif ya
        // setTimeout(() => {
        //   // nah jadi setelah 500 milisecond dia akn jadi plus artinya dia akna turun
        //   this.player1.dy = this.playerSpeed
        //   // nah setelah dia turun kita cegah lagi
        //   // jadi ketiak dia udah turun selama 500 miliecond, kita set dy nya jadi 0 maka dia akn berhentikann
        //   setTimeout(() => {
        //     this.player1.dy =0;
        //   }, 500)
        // }, 500)

        // jadi kita harus pake ini
        // yang udah di jelasin juga di class player
        // if (this.player1.isOnGround) {
        //   // nah jadi dia aakn lompat hanya ketika sudah menyentuh tanah
        //   this.player1.dy = this.player1.jumpPower;
        //   // nah jadi alurnya ketika sudah kita set si dy pake jump popwer ka nanti dia tuh akna
        //   // tinggi ya karena -dy nanti dia akn terus terusan kena gravitasinya jadinya teuru skebwaah sampai nanti dia ke titik y di 400 maka ak di hentikan
        // }
      } else if (e.key.toLowerCase() == "a") {
        this.player1.dx = -this.playerSpeed;
      } else if (e.key.toLowerCase() == "s") {
      } else if (e.key.toLowerCase() == "d") {
        this.player1.dx = this.playerSpeed;
      } else if (e.key.toLowerCase() == "arrowup") {
        if (this.player2.isOnGround) {
          this.player2.dy = this.player2.jumpPower;
        }
      } else if (e.key.toLowerCase() == "arrowdown") {
      } else if (e.key.toLowerCase() == "arrowright") {
        this.player2.dx = this.playerSpeed;
      } else if (e.key.toLowerCase() == "arrowleft") {
        this.player2.dx = -this.playerSpeed;
      }
    });

    // nah jadi gini, kita itu nanti ketika kita klik misalnya kanan maka kan akan terus kekanan
    // padahal kitaudah lepas jari nah makana biar dia pas di lepas itu langsung diem maka kit akasih lagi add event listennerya yang keyup

    // ingat ya karena kita itu mau akses this didalma sebuah fungsi yang ada didalam fungs yang ada didalam class
    // maka kita harus pake arrow function
    window.addEventListener("keyup", (e) => {
      //  if (e.key.toLowerCase() == "w" || e.key.toLowerCase() == "arrowup") {
      //  this.player1.dx = 0;
      //} else if (e.key.toLowerCase() == "a" || e.key.toLowerCase() == "arrowdown") {
      //  this.player1.dy = 0;
      //}

      this.player1.isOnGround = false;
      this.player1.dx = 0;
      this.player2.isOnGround = false;
      this.player2.dx = 0;
    });
  }
}
// 6
const game = new Game();
// ini kita pnggil
game.start();
