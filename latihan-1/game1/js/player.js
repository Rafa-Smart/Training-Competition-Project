// 7

// JADI YANG HARUSNYA DI GERAKIN ITU ADALAH DX DAN DY NYA BUKAN SI S ATAU Y NYA
class Player {
  constructor(x, y) {
    this.gravity = 0.5;
    this.jumpPower = -15; // nah ini tuh biar dia cepet naik keatasnya ya si y
    this.isOnGround = false; // ini biar tau apakah udah di tanah apa belum, jadi dia hanya akn bisa lompat etika sudah ada di tanh atau ketika si ini nya true
    this.x = x;
    this.y = y;
    this.dx = 0; //  nah ini kita sete dlu jadi 0, jadi dia ga akan bergerak, nah tpi kalo kit ubah dia jadi 1 makaakna bergerak 1 x per frame
    this.dy = 0;
    this.width = 160;
    this.height = 160;
    // jadi gni kan di player itu dia punya state, nah kita asih tau di sini statenya misalnya idle
    this.state = "Idle";
    // kan untk tipa state itu dia punya banyak gambar lagi, nah ini yang ke 0
    this.frameNo = 0;
    this.country = "Brazil";
    // nah jadi gini karena di nama filenya itu kita pake 000, 001, 002 maka ita bisa pake ini
    // jadi di padStart itu di param 1 itu adalh panjang maksimalnya, kemudian untuk param ke 2
    // adaalh untuk yang mengisi di awalnya agar selalu panangnya itu 3
    const frameNo = this.frameNo.toString().padStart(3, "0");

    this.image = loadImage(
      `../assets/Characters/Character 01 - ${this.country}/${this.state}/${this.state}_${frameNo}.png`,
    );
  }

  //   kita perlu ctx untuk drawnya ya untuk draw dll
  // 8
  draw(ctx) {
    // jadi kita cek dulu, kalo misalna udah ke load si imagenya maka jaidnya itu langusng draw

    // ini harusnya ga boleh, karena masa di taruh di draw, berati nanti tiap frame akna panggil terus
    // this.image.onload = () => {

    // jadi pake ini aja Kode ini memeriksa apakah objek gambar (this.image) sudah selesai diunduh sepenuhnya oleh browser. Properti .complete akan bernilai true jika gambar sudah siap digunakan atau jika proses pemuatan gagal (gambar "broken").

    // jadi ga tergantung load
    if (this.image.complete) {
      // https://chatgpt.com/c/69e3811d-df90-8322-baaf-cf70c3ca09ab
      // itu penjelasnanya
      // ingat ya kalo kita butuh this pada sebuah fungis yang ada di dalam fungsi lagi dan didalam calss maka kita harus pake arrow fungsi 
      // liat ini tuh ada fungsi didalam fungsi onLoad yang ada didalam class
      // bair ga ilang context this nya
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }

  update() {
    // nah jadi kalo gini tuh artina si x akan selalu berubah berdasarkan dari perubahan si dx nya, begitu pula yang y dan dy

    // ssebenerya bisa gini ya
    // this.x += this.dx; tapi kalo gini tuh kan nanti aiya ga akan bisa stop dan selallu ke kanan
    // maka kita mau dia agar bisa berubah uabh makanya kita pake variable
    // dan ingat kalo dx dn dy nya itu 0 artinya kan ga gerak karea selalu di tambah 0 si / y nya

    // JADI NANIT DI SINI KUNCINYA KALO SI DX NYA -4 MAKA THIS.X (-4) MAKA TIAP PERULANGAN AKAN DI KURANG 4
    // DAN BEGITU PULAN YANG +4, DAN NILAI -4 ATAU +4 INI BISA DI UBAH DI LISTENER YANG AD ADI SCRIPT.JS

    // nah jadi gini kita akn terus pasang si gravitasinya jadi akan terus selalu kebawha ya
    // nh INI INGAT YA, SI PLAYER ITU GA AKAN SAMPE NEMBUS KEBAWH KARENA KITA UDAH AD AIF DI SINI
    // BUAT NGECEK KALO DIA UDAH SAMPE 400 MAKA DIA AKN TERUS STOP DISANA
    this.dy += this.gravity;

    this.x += this.dx;
    this.y += this.dy;

    // nah terus sekarang cek kalo misalnya lagi ad adi lantai yang akan kita st si y nya ini jadi 400 (lantai)
    // maka
    // 1kita buat si y nya ini bener ber di tanah;
    // 2kita set si dy nya 0 jadinya ga ada gravitasinya
    // 3kita set si isOnGround nya jadi true

    // klo engga isGoundnya jadi false

    // // disni juga kita kasih batasn atasnya biar engga nembus ya kalo di spam
    // if(this.y == 200){
    //   this.y = 400;
    //   this.dy = -10;
    //   this.isOnGround = false
    // }

    if (this.y >= 400) {
      // artinay itu kallo 405 artinay udah nembus tanah ya
      this.y = 400;
      this.dy = 0;
      this.isOnGround = true;
    } else {
      this.isOnGround = false;
    }
  }
}
