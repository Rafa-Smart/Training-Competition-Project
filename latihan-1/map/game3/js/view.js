class View {
  constructor({ area, container, linesEl, pinsEl }) {
    this.area = area;
    this.container = container;
    this.linesEl = linesEl;
    this.pinsEl;
    this.scale = 1;
    this.ox = 0;
    this.oy = 0;
    this.dragging = false;
  }

  fitTolayer(w, h) {
    // ini nanit dari app yang w dan h nya adlah data dari class app
    const aw = this.area.clientWidth; // inget ya berai sekarang si clientWidth dan height ini udah di kurang dengan ukuran si side bar
    const ah = this.area.clientHeight;
    this.scale = Math.max(aw - w, ah - h);
    // nah jadi sebenrnya ini tuh kita akn cari misalnya ukuran asli layar map itu aalh 1200 dan heightnya adlah 800
    // namun untuk yang w itu hanya 1000, dan juga h nya hanya 500
    // nah kiata tuh car selisihnya gitu, nah nanti udah dapet selisinya ini di pake buat kita kali si ukuran h dan w nya dengna ukuran yang tadi paling gede, biar dia gedenya pas
    // cari yang paling gede biar bisa menyesuaika ke paling bear biar bisa enuhin layar

    // misalnya untuk yang aw itu 1.2 dan ah itu 1.6
    //  Kalau pakai 1.2:
    // width: 1000 * 1.2 = 1200 pas
    // height: 500 * 1.2 = 600  masih kosong (padahal layar 800)
    //  Akan ada ruang kosong atas bawah

    // Kalau pakai 1.6:

    // width: 1000 * 1.6 = 1600  lebih besar dari layar // ini nanti kepotong dikit gapapa
    // height: 500 * 1.6 = 800 pas

    // jadi mending ke potong dikit gapapa

    // nah jadi ox dan oy ini tuh fungsi nya biar bisa geer geser
    // jadi gini kan mialnya ternyata lebar si map setelah di kali dnegn ascale yang tadi kelebihan
    // jadi ukuran si mapnya itu 1600 dan kuran tempatnya adlah  hanya 1200, nah berati sekrang kita perlu untuk geser dong kan ya, biar dia ketengah nah pake ini perhitunganya
    this.ox =
      aw -
      (w * this.scale) / // hitung dulu nah nanti setal terlalu gede jadi 1600, makaaakn
        // kita akna kurangi ukuran tempat yang sudah ad andegan lebar yang udah di scale
        // nah hasilnya kan ada tuh, nah kemudian kita bagi 2 biar ke tengah
        // yang nanti nya nilainya ini akna di transform dan juga di scale ya ingat
        2;

    this.oy = ah - (h * this.scale) / 2;

    // nanti si ox dan oy nya ini akan di trasnlateX/Y dan juga scalenya
    // Menentukan seberapa jauh peta digeser agar center
  }

  //   nah ini baru fugnsi untuk memenuhi dan implementasi si fitToLayer
  applyTransform(w, h) {
    // disini kita ambil containernya ya ingat ya container ini adalah si map-container
    // lalu kita posisinya
    this.container.style.transform = `translate(${this.ox}px, ${this.oy}px);scale(${this.scale})`;

    // lalu kita harus set si lines elemen yaitu lines-layer ya
    // bair benr benr ukurnya itu sama kaya map, karan kan kita butuh nanti hitung koordinat berdasarka ukuran peta ya bukan ukuran map-area
    this.linesEl.setAttribute("width", w);
  }

  //   kita sekarnag buat fungis biar pas zoom itu ngikutin si kursor
  // saolnya kita udah set si map-conainer ini itu di 0 0 jadi kiri atas
  // harusnya kalo di zoom itu ati bakal ad di kiri atas

  zoomAt(cursorX, cursorY, factor, w, h) {
    const ukuranMap = this.area.getBoundingClientRect()
    // ngambil posisi map di layar
    // jadi dia punya atribut left, top, dll

    // 
  }
}
