class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    // disni juga si bolahnya kita kasih dy dna dx
    this.dx = 0;
    this.dy = 0;
    this.gravity = 0.5;
    this.width = 50;
    this.height = 50;
    this.image = loadImage("../assets/Ball 02.png");
  }

  draw(ctx) {
    // nah ingat kalo mau drwa image itu pake ini ya

    // atau kao mau benr bisa cari di sini itu ad acaranya beng benr bagus untuk gambar static
    // https://chatgpt.com/c/69e3811d-df90-8322-baaf-cf70c3ca09ab
    if (this.image.complete) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }

  update() {

    // ini dia alurnya ya kenapa dia ibsa jatuh terus mantul terus berkurang lagi pantulannya
    // https://claude.ai/chat/fa1dfbd5-9342-4b0b-bea3-eb10890a20e4

    // nah jadi dia tuh selalu di kurangin ama gravitsi ya
    this.dy += this.gravity // dia positif dan nambah berati akn selalu kebawh ya
    // soalnya kalo niali y nya maskin kecil itu akna ke atas
    // coba aja gini bayagin kalo nilai y = 0; dan x = 0; itu adalah pojok kiri atas


    // nahsekarnag tiap kali update mka akna jalanin penambahan posisi y dan juga x nya
    this.x += this.dx;
    this.y += this.dy;


    // ini biar dia mantul dari atas jatuh ke bawah ya
    // nah disini di cek jika kena lantai maka kita balik arahnya pake kali

    // baiklah ini tuh buat batasin dari bataas bawahnya ya
    if(this.y >= 490){
      // pertama kita posisiin duu dia agar ga nembus pake ini
      this.y = 490

      // jadi kan pas dia jatuh dan kena lantai 


      // OHH JADI GINI ALURNYA
      // KAN SI BOLA ITU ASALNYA DARI ATAS YA DARI TENGAH ANGGAP AJA DI TINGGI YANG 300 SOALNYA (400 ITU DI BAWAH)
      // nah KETIKA ITU DIA KAN SI X NYA AKNA DI TAMBAH DENGAN SI DY DAN SI DY INI TIAP LOOP NYA KAN SELALU D TAMBAH DNEGNA 0.5 (GRAVITASI)

      // NAH KETIAK DIA SUDAH MENAMBAHYA SI Y NYA DARI 300 -> 300.5 -> 301 -> 301.5
      // NAH SAMPE KE 400 DIA AKAN MASUK SINI KAN, NAH LANGSUNG DI SET JADI 400
      // TERUS UDAH ITU MISALNYA SI DY ITU ASALNYA 0 LALU DI TAMBAH TERUS SAMPAI SI Y NYA JADI 400 MAKA KAN DIA JADI MIAL AJA JADI 50 YA NAH TERUS DIA AKN DI KALI DNEGNA -1 MAKA JADI -50
      // NAH - 50 INI DIA AKNA MEMBUAT POSISI SI BOA JADI KE ATAS DNEGNAN CARA KURANGI SI Y NYA YANG ASALNYA DARI 400 KE 350 DLL 

      // NAH SETELAH ITU KETIKA SI BOLANYA DIATAS DAN DY NYA ITU -50 DAN Y NYA ADALAH 400
      // MAKA LANJUT LAGI DIA AKN TERUS DI TAMBHA SI DY NYA SAMA SI 0.5 JADI 49.5 TERUS SI Y NYA AKN DI TAMBAH DARI ASALNYA 400 DI TAMBAH -49.5 MAKA JADI 350.5 DAN SI DY NYA JUGA AKN TERUS BERKURANG JADI 49 

      // ini yang bekin mantul 
      this.dy *= -0.8;   
      this.dx *= -0.7 
    } 

    // sekrang saya mau batasin dari bats kanan dankri 

    // batas kanan 
    // jadi kita cek kalo misalnya si bola ya inagt ini ita tambahin lagi pake widthnya biar ps ke ujung bola 
    if(this.x + this.width >= canvas.width)
    {
      // sudah sampai ke titik paling kanan maka di panulin algi 
      // nah ini tuh buat apa, biar posisinya dia langsng kaya berhenti tepat dititik ujung si bola yang nyentuh si dinding kanan yabaru
      this.x = canvas.width - this.width
      // baru deh kita balikin si x nya pake kali biar dia kebalik lagi
      this.dx *= -0.8
      this.dy *= -0.8
    }

    // gini juga kalo yang kiri berati kita pek x 0 karea paling kiri itu x nya 0
    // tambah si width nya si ball biar yang pas kena ujungnya aja
    if(this.x + this.width <= 0 ){
      this.x = 0 + this.width // biar dia ada di ujung kiri dan ga nembus tembok
      // lalu kita balikin pake -1 
      this.dx *= -0.8;this.dy *= 0.8
    }

    // gitu juga kalo yang keatas
    if(this.y - this.height <= 0){
      this.y = 0 + this.height
      this.dy *= -0.8
      this.dx *= 0.8
    }



    // ingat ya if nya itu harus ad ad atas si penambahnnya
    // if (this.y >= 450) return;
    // this.y += 2;
  }

  reset(canvas){
    this.x = canvas.width/2 -this.width/2
    this.y = canvas.height/2 -this.height/2
    this.dx = 0;
    this.dy = 0;
  }
}
