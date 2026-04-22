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
    this.country = "Brazil";
    // nah jadi gini karena di nama filenya itu kita pake 000, 001, 002 maka ita bisa pake ini
    // jadi di padStart itu di param 1 itu adalh panjang maksimalnya, kemudian untuk param ke 2
    // adaalh untuk yang mengisi di awalnya agar selalu panangnya itu 3
    const frameNo = 0;

    // this.image = loadImage(
    //   `../assets/Characters/Character 01 - ${this.country}/${this.state}/${this.state}_${frameNo}.png`,
    // );

    // ini untuk animasi

    // jadi gni kan di player itu dia punya state, nah kita asih tau di sini statenya misalnya idle
    this.state = "Idle";
    // kan untk tipa state itu dia punya banyak gambar lagi, nah ini yang ke 0
    this.frameNo = 0; // fungsinya untuk tau frameno berapa saat ini
    // jadi jika statenya itu Idle dan frameNo nya 3, berati lagi nampilin idle_003

    this.frameTimer = 0;
    // dan nanti in tuh tiap frame gambar, akan terus di ++ nah ketika sudah sampai speed
    // maka dia akn di reset lagi
    // nah kita hanya akan menambah atau merubha ke gambar lain ijka hanya frameTiernya udha sampe frameSpeed

    // Ini adalah penghitung waktu / penghitung frame game.
    // Ingat, fungsi render() di Game dipanggil 60 kali per detik (60 FPS). Kalau kita ganti gambar setiap 1 frame game, animasinya akan terlalu cepat — kayak kartun yang diputar 60x per detik, pasti gak keliatan.
    // Makanya kita butuh frameTimer untuk memperlambat pergantian gambar.

    this.frameSpeed = 2;
    // jadi ini tuh untuk patokan aja
    // jadi ni tuh untuk ngasih tau berapa frame game yang di lewat setiap kali si gambar akan di ganti
    // jadi kan ada di gambar 1 pada frame 1, maka untuk bsia ganti ke gambar ke dua setelah frame ke 3
    // Jadi kalau 60 FPS, animasinya akan berjalan di 60 ÷ 5 = 12 gambar per detik.

    // /kita buat objek untuk tau maksimal frame yang ad apada tiap state itu ada berapa

    // jadi anti untuk looping untuk tiap statenya itu nanit pake ini max statenya
    this.maxFrame = {
      Idle: 17, // lagi diem
      Jump: 4,
      Kick: 8,
      "Move Backward": 9,
      "Move Forward": 9,
      "Falling Down": 4,
    };

    // disini kita tambahin juga coutry numbenrya
    this.countryNumber = {
      Brazil: "01",
      England: "02",
      Spain: "03",
      Japan: "04",
      Netherlands: "05",
      Portugal: "06",
      Germany: "07",
      Italy: "08",
    };
    // flag khusus untuk kick, karena kick itu harus selesai dulu
    // sebelum bisa melakukan animasi lain
    this.isKicking = false;

    this.animations = {};
    // nah jadi ini tuh akan di isi oleh fungsi loadAnimation contohnya
    // "Idle": [Image(Idle_000), Image(Idle_001), ..., Image(Idle_009)],
    // "Move Forward": [Image(MF_000), ..., Image(MF_007)],
    // "Jump": [Image(Jump_000), Image(Jump_001), Image(Jump_002)],

    // kita jalanin di sini untuk pertama kali ketiak objek player ini di instantiasi
    this.loadAnimations();
    // console.log(this.animations.animations);
  }

  //   kita perlu ctx untuk drawnya ya untuk draw dll
  // 8
  draw(ctx,isFlip=false) {

    // nah saya mau agar kalo dia flip maka akan gini
    if(isFlip){
      // pertama kita save dulu dan juga restore ya
      ctx.save();
    let gambar = this.animations[this.state][this.frameNo]
      // llau kita uabh si trasnlate nya atau originnya di si player ini
      ctx.translate(this.x + this.width, this.y);
      ctx.scale(-1,1)
      // ininya si x sama di y maka di 0 0 saja
      ctx.drawImage(gambar, 0, 0, this.width, this.height);
      ctx.restore();
      return
    }


    // jadi kita cek dulu, kalo misalna udah ke load si imagenya maka jaidnya itu langusng draw
    // ini harusnya ga boleh, karena masa di taruh di draw, berati nanti tiap frame akna panggil terus
    // this.image.onload = () => {
    // jadi pake ini aja Kode ini memeriksa apakah objek gambar (this.image) sudah selesai diunduh sepenuhnya oleh browser. Properti .complete akan bernilai true jika gambar sudah siap digunakan atau jika proses pemuatan gagal (gambar "broken").
    // jadi ga tergantung load
    // if (this.image.complete) {
    //   // https://chatgpt.com/c/69e3811d-df90-8322-baaf-cf70c3ca09ab
    //   // itu penjelasnanya
    //   // ingat ya kalo kita butuh this pada sebuah fungis yang ada di dalam fungsi lagi dan didalam calss maka kita harus pake arrow fungsi
    //   // liat ini tuh ada fungsi didalam fungsi onLoad yang ada didalam class
    //   // bair ga ilang context this nya
    //   ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    // }

    // sekarang kita pake ini aja ya

    // jadi kita akna ambil gambar dari state saat ini lalu ambil frameNonya
    let gambar = this.animations[this.state][this.frameNo]

    // nah di cek dulu kalo gambarya ada dna gambarnya udah comlete di render berati langsung aja di gambar / draw
    if(gambar && gambar.complete){
      ctx.drawImage(gambar, this.x, this.y, this.width, this.height);
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

    // kia selalu jalanin cekSteenya
      this.cekState()
  }

  // nah disni kita akn buat fungsi untuk ngeload seluruh animasi gambar yang ad a
  // dan di masukan kealam variable animations

  loadAnimations() {
    // ini untuk dapetin statesnya
    const states = Object.keys(this.maxFrame);
    // nah jadi si states ini akna berisi array yang isinya angka max framenya

    // baru kita loop terus si stateya terus kita buaat gambarnya lalu masukan kedalma animation

    states.forEach((state) => {
      // nah untuk tiap property itu kita kasih dia valuenya adlah [];
      this.animations[state] = [];
      // jaid kalo gitu tuh nanti akna gini ya
      // "state(bisa "Idle",'Jump')":[]

      // nah sekaran kita ambil number country dari countr yang di pilih
      const numberCountryNya = this.countryNumber[this.country];

      // nah baru di sini kita masukan kedalam array tersebut
      // dan akan di looping berdasarkan si maxframenya ini
      for (let i = 0; i < this.maxFrame[state]; i++) {
        // jadi untuk tiap i nya ini akna kita uabh ke string lalu kita tambahin 0
        // jadi aklo
        // 1 = 001, 2 = 002, ...  
        let nambah0 = i.toString().padStart(3, "0");
        let img = new Image();
        img.src = `../assets/Characters/Character ${numberCountryNya} - ${this.country}/${state}/${state}_${nambah0}.png`;
        console.log(img.src);

        // lalu push ke dalam animation
        this.animations[state].push(img);
      }
    });
    // setelah selesai, this.animations terisi:
    // "Idle":          [17 gambar] 
    // "Jump":          [4 gambar]
    // "Kick":          [8 gambar]
    // "Move Backward": [9 gambar]
    // "Move Forward":  [9 gambar]
    // "Falling Down":  [4 gambar]
  }

  setState(newState) {
    // nah disin itu di cek dulu
    // jika state saat ini tidak sama dnegna nilai stae yang baru maka
    // kita ganti statenya ke state yang baru dan kita reset frameNo nyabiar di state terbaru ini frame nya mulai dari 0 lagi
    // terus di reset frameTimernya biar nanti di itung ualng biar engga 60 itu 60 kali ganti
    // tapi 60 itu hanya 12 kali ganti aja biar ga berat

    if (this.state !== newState) {
      this.state = newState;
      this.frameNo = 0;
      this.frameTimer = 0;
    }
  }

  // nah terus kita taruh di setiap
  // kita udah ubah frame statenya

  updateFrame() {
    // nah jadi tiap fungsi ini di panggil maka akn selalu nambahin si frameTimernya buat pe loncat

    this.frameTimer++;

    // nah disni di cek jika frameImenya udah sama atau lebih dari frameSpeed
    // artinya akn kia udah jadi gni fungsi ini akna di  panggil setiap satu kali di refresh si rendernya
    // jadi kalo udha 6 kali frame berubah dan ga ad aapa apa karena belum di ubah statenya
    // baru ita udha, ini biar 60 frame per deik itu ganti gambarnya enga 60 kali
    // jadi hanya 12 kali aja

    if (this.frameTimer >= this.frameSpeed) {
      // nah kita tambahin si frameNonya biar di maju
      this.frameNo++;
      // lalu kita set lagi si frameTimernya jadi 0 lagi bar nanti di hitung lagi
      this.frameTimer = 0;
    }

    // nah ini kalo misalnya si frameNony udah sampai dan sudah mencapai maksimal framenya maka
    // kita reset algi jadi 0 jadi balilk lagi gitu

    if (this.frameNo >= this.maxFrame[this.state]) {
      this.frameNo = 0;
      //  this.frameSpeed=0;
      // itu gausah pake juga ga papa karena udah di reset akn pas sebelum masuk si ni juga
    }
  }

  cekState() {
    // jadi prioritasnya itu adalah
    // tendang, lompat dan jatuh, gerak kanan / kiri, diam saja
    if (this.isKicking) {
      // kalo lagi kick, nanit kick ini akan bisa kick ketika ada bola yang udah overlap ke player

      // kita set dlu jadi kick
      this.setState("Kick");

      // nah disini untuk kick itu khusus ya jadi da harus selasai dulu bru bisa ganti ke state yang lainnya
      // jadi cek dlu apkah sudah sampai ke frme yang terakhir
      //
      if (this.frameNo >= this.maxFrame[this.state] - 1) {
        // kalo iya maka kit set false si kickingnya jadi dia ga masuk sini lagi dan kita return
        // biar berhenti
        this.isKicking = false;
      }
      // llalu ikita updateFramenya lagi biar dia tmbh lagi si frameNonya
      this.updateFrame()  
      return;
    }

    // nah kita cek juga di sini ketika sudah engga nyentuh tanah
    if(!this.isOnGround){
            // cek lagi apkah dia kekanan atau ke kiri sekarang
      // jadi dari pada kitapasang di lisstnenrya jadi makin banyak
      // mending taruh disini aja

      if (this.dy < 0) {
        this.setState("Jump");
      } else if (this.dy > 0) {
        this.setState("Falling Down");
      } else {
        // dan kalo ga ad aberti lagi diam
        this.setState("Idle");
      }
    }

    // nah ini kaloo lagi di tanah
    if (this.isOnGround) {
 if (this.dx < 0) {
        // ini tahap ke tiga setlah prioritas  lompat dan jatuh
        // yang jump taruh atas ya

        // 1.cek jika lagi ke kiri artinya dx < 0 atau lagi min ya
        // lalu kita set dia lagi ke kiri dan kita pasang animasinya
        this.setState("Move Backward");
      } else if (this.dx > 0) {
        // dan gtiu juga yang ini
        this.setState("Move Forward");
      } else {
        // dan kalo ga ad aberti lagi diam
        this.setState("Idle");
      }

      // dan di tiap itu tuh kita harus update lagi si
      // updateFramenya ya
      // jadi agar tiap ganti maka akan terus di loop si frameNo nya setelah di 0 kan
      // adn nnanti frameNonya akn di pake buat loop di drawnya
      this.updateFrame()
    }
  }
  kick() {
    // hanya bisa mulai kick kalo dia agi a kick ya biar ga spam gitu

    if (!this.isKicking) {
      this.isKicking = true;
      // lalu kita akna reset frame no dan frame timernya
      // sebernnay ga usah sih soanya an nanti si cekStetenya ini akan sealu di render dan akan jalankna is kicking karna sudha true ya
      // nah diakan jalanin setState nah di setState nya snediri itu sudah di reset
      this.frameNo = 0;
      this.frameTimer = 0;
    }
  }
}
