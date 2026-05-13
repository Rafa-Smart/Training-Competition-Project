// ══════════════════════════════════════════════════════
// CFG = Configuration (Konfigurasi Game)
// Ini tempat semua ANGKA PENTING dikumpulkan.
// Kenapa dikumpulkan di sini? Supaya kalau mau ubah,
// cukup ubah di satu tempat — tidak perlu cari-cari.
//
// levels   → berapa detik durasi tiap level
// points   → berapa poin dapat kalau kena target ini
// guns     → nama-nama file senjata (tanpa path/ekstensi)
// missPenalty → detik yang dipotong kalau tembakan meleset
// spawnMs  → jeda antar kemunculan target baru (ms)
// initTargets → berapa target langsung muncul saat mulai
// maxTargets  → batas target di layar sekaligus
// storageKey  → nama kunci di localStorage untuk simpan riwayat
// ══════════════════════════════════════════════════════
const CFG = {
  levels:      { easy: 30, medium: 20, hard: 15 },
  points:      { target1: 10, target2: 20, target3: 30 },
  guns:        ["gun1", "gun2"],
  missPenalty: 5,
  spawnMs:     3000,
  initTargets: 3,
  maxTargets:  8,
  storageKey:  "shooter_history",
};

// ══════════════════════════════════════════════════════
// G = Game State (Kondisi Game Saat Ini)
// Semua kondisi game yang bisa BERUBAH-UBAH disimpan di sini.
// Kalau kamu bingung "game lagi di mode apa?",
// cukup lihat G.
//
// name     → nama pemain yang diketik
// level    → level yang dipilih ("easy"/"medium"/"hard")
// gunIdx   → indeks senjata aktif (0 = gun1, 1 = gun2)
// target   → jenis target yang dipilih ("target1" dst)
// score    → skor saat ini
// timeLeft → waktu tersisa (detik)
// running  → true = game sedang berjalan
// paused   → true = game di-pause
// counting → true = sedang countdown (belum bisa tembak)
// timerID  → ID interval timer (disimpan agar bisa di-cancel)
// spawnID  → ID interval spawn target
// cdID     → ID interval countdown
// shots    → array riwayat tembakan sesi ini
// shotSort → urutan tampilan shots ("last" atau "score")
// mx, my   → posisi mouse terakhir (relatif ke #game)
// ══════════════════════════════════════════════════════
const G = {
  name: "", level: "easy", gunIdx: 0, target: "target1",
  score: 0, timeLeft: 0,
  running: false, paused: false, counting: false,
  timerID: null, spawnID: null, cdID: null,
  shots: [], shotSort: "last",
  mx: 500, my: 300,
};

// ══════════════════════════════════════════════════════
// el = Elements (Referensi ke Elemen HTML)
// Daripada nulis document.getElementById("hud") berulang,
// kita simpan sekali ke objek el.
// Setelah ini cukup tulis el.hud, el.board, dst.
// ══════════════════════════════════════════════════════
const el = {};
[
  "game","board","hud","sidebar","pointer","gun",
  "welcome","instruction","countdown","pause","gameover","history",
  "timeBar","playerName","levelSelect","btnPlay","btnInst",
  "btnContinue","btnSave","btnHistory","btnRestart",
  "hudName","hudScore","hudTime","sideGun","shotLog",
  "countNum","goName","goScore","historyBody","sortScore","sortLast",
].forEach(id => el[id] = document.getElementById(id));

// ══════════════════════════════════════════════════════
// OVERLAYS = daftar ID semua layar overlay.
// Dipakai oleh fungsi show() di bawah.
// ══════════════════════════════════════════════════════
const OVERLAYS = ["welcome","instruction","countdown","pause","gameover","history"];

// ══════════════════════════════════════════════════════
// show(name) — tampilkan SATU overlay, sembunyikan sisanya.
//
// Cara kerjanya:
// Loop semua overlay → tambahkan class "hidden" ke semua,
// KECUALI yang namanya sama dengan parameter name.
// toggle(className, force): kalau force=true tambah class,
// kalau force=false hapus class.
// ══════════════════════════════════════════════════════
function show(name) {
  OVERLAYS.forEach(id =>
    el[id].classList.toggle("hidden", id !== name)
  );
}

// ══════════════════════════════════════════════════════
// hideAll() — sembunyikan semua overlay sekaligus.
// Dipakai saat game mulai (tidak ada overlay yang muncul).
// ══════════════════════════════════════════════════════
function hideAll() {
  OVERLAYS.forEach(id => el[id].classList.add("hidden"));
}
// ══════════════════════════════════════════════════════
// DOMContentLoaded — dijalankan SEKALI saat HTML selesai
// dimuat. Semua event listener dipasang di sini supaya
// elemen HTML pasti sudah ada saat JS mulai berjalan.
// ══════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {

  // Tombol Play aktif hanya kalau nama sudah diisi.
  // .trim() menghapus spasi di awal/akhir agar nama
  // yang cuma spasi tidak dianggap valid.
  el.playerName.addEventListener("input", () => {
    el.btnPlay.disabled = !el.playerName.value.trim();
  });

  el.btnInst.addEventListener("click", () => show("instruction"));
  el.btnPlay.addEventListener("click", prepareGame);
  el.btnContinue.addEventListener("click", resumeGame);
  el.btnSave.addEventListener("click", saveScore);
  el.btnHistory.addEventListener("click", () => showHistory("last"));
  el.btnRestart.addEventListener("click", restart);

  // Tombol sort di sidebar
  el.sortScore.addEventListener("click", () => { G.shotSort = "score"; renderShots(); });
  el.sortLast.addEventListener("click",  () => { G.shotSort = "last";  renderShots(); });

  // ── Gerakkan pointer & gun mengikuti mouse ──────────
  // getBoundingClientRect() → posisi #game di layar.
  // e.clientX - r.left = posisi mouse RELATIF ke #game
  // (bukan ke seluruh layar).
  // Hanya digerakkan kalau game running dan tidak pause.
  document.addEventListener("mousemove", e => {
    const r = el.game.getBoundingClientRect();
    G.mx = e.clientX - r.left;
    G.my = e.clientY - r.top;
    if (G.running && !G.paused && !G.counting) movePointer();
  });

  // ── Klik di board kosong = tembakan meleset ─────────
  // e.target === el.board artinya yang diklik adalah
  // board itu sendiri, bukan target (target punya
  // handler sendiri yang pakai stopPropagation).
  el.board.addEventListener("click", e => {
    if (!G.running || G.paused || G.counting) return;
    if (e.target === el.board) miss();
  });

  // ── Keyboard shortcuts ──────────────────────────────
  document.addEventListener("keydown", e => {
    if (e.code === "Escape" && G.running && !G.counting) togglePause();
    if (e.code === "Space"  && G.running && !G.paused && !G.counting) {
      e.preventDefault();   // cegah halaman scroll ke bawah
      switchGun();
    }
  });
});

// ══════════════════════════════════════════════════════
// setGameUI(on) — tampilkan/sembunyikan elemen game.
// Dipanggil dengan true saat game mulai,
// dan false saat game berakhir/restart.
// ══════════════════════════════════════════════════════
function setGameUI(on) {
  ["hud","board","sidebar","pointer","gun"].forEach(id =>
    el[id].classList.toggle("hidden", !on)
  );
}

// ══════════════════════════════════════════════════════
// updateHUD() — perbarui tampilan skor, waktu, bar.
//
// pct = persentase waktu tersisa (0–100).
// Bar berubah warna:
//   > 50% = hijau (aman)
//   > 25% = kuning (hati-hati)
//   ≤ 25% = merah (kritis)
// ══════════════════════════════════════════════════════
function updateHUD() {
  el.hudName.textContent  = G.name;
  el.hudScore.textContent = G.score;
  el.hudTime.textContent  = G.timeLeft;

  const pct = Math.max(0, (G.timeLeft / CFG.levels[G.level]) * 100);
  const bar = el.timeBar.querySelector("span");
  bar.style.width = `${pct}%`;
  bar.style.background = pct > 50 ? "#22c55e" : pct > 25 ? "#f59e0b" : "#ef4444";
}

// ══════════════════════════════════════════════════════
// movePointer() — pindahkan gambar pointer & gun
// ke posisi mouse saat ini (G.mx, G.my).
// Dipanggil setiap kali mouse bergerak.
// ══════════════════════════════════════════════════════
function movePointer() {
  el.pointer.style.left = `${G.mx}px`;
  el.pointer.style.top  = `${G.my}px`;
  el.gun.style.left = `${G.mx}px`;
  el.gun.style.top  = `${G.my + 42}px`;   // sedikit di bawah pointer
}

// ══════════════════════════════════════════════════════
// setGunImage() — ganti gambar senjata sesuai G.gunIdx.
// Mengubah src di dua tempat: di atas arena (el.gun)
// dan di sidebar (el.sideGun).
// ══════════════════════════════════════════════════════
function setGunImage() {
  const src = `Sprites/${CFG.guns[G.gunIdx]}.png`;
  el.gun.src = src;
  el.sideGun.src = src;
}

// ══════════════════════════════════════════════════════
// switchGun() — bergantian antara gun1 dan gun2.
//
// (G.gunIdx + 1) % CFG.guns.length:
//   gunIdx 0 → (0+1) % 2 = 1
//   gunIdx 1 → (1+1) % 2 = 0
// Jadi selalu berputar antara 0 dan 1.
//
// Animasi .swap: remove dulu supaya browser tahu
// animasi perlu diulang (void offsetWidth memaksa
// browser menghitung ulang layout).
// ══════════════════════════════════════════════════════
function switchGun() {
  G.gunIdx = (G.gunIdx + 1) % CFG.guns.length;
  setGunImage();
  el.gun.classList.remove("swap");
  void el.gun.offsetWidth;           // paksa reflow = reset animasi
  el.gun.classList.add("swap");
  setTimeout(() => el.gun.classList.remove("swap"), 220);
}

// ══════════════════════════════════════════════════════
// clearTimers() — hentikan semua interval aktif.
// Dipanggil saat game berakhir, di-pause, atau restart.
// Tanpa ini, interval lama terus berjalan di background
// dan membuat bug (waktu terus berkurang saat pause, dll).
// ══════════════════════════════════════════════════════
function clearTimers() {
  clearInterval(G.timerID);
  clearInterval(G.spawnID);
  clearInterval(G.cdID);
  G.timerID = G.spawnID = G.cdID = null;
}

// ══════════════════════════════════════════════════════
// ALUR UTAMA: prepareGame → runCountdown → startGame
// ══════════════════════════════════════════════════════

// 1. prepareGame() — dipanggil saat klik Play Game.
//    Tugasnya: ambil semua pilihan dari form,
//    simpan ke G, lalu mulai countdown.
function prepareGame() {
  const name = el.playerName.value.trim();
  if (!name) return;

  // Simpan pilihan pemain ke state G
  G.name     = name;
  G.level    = el.levelSelect.value;
  G.gunIdx   = CFG.guns.indexOf(document.querySelector('input[name="gun"]:checked').value);
  G.target   = document.querySelector('input[name="target"]:checked').value;
  G.score    = 0;
  G.timeLeft = CFG.levels[G.level];   // ambil durasi sesuai level
  G.shots    = [];
  G.running  = false;
  G.paused   = false;
  G.counting = true;   // sedang countdown, belum bisa main

  clearTimers();
  clearTargets();
  setGunImage();
  renderShots();
  updateHUD();

  show("countdown");
  runCountdown(startGame);   // setelah countdown selesai → startGame
}

// 2. runCountdown(done) — hitung mundur 3, 2, 1, GO!
//    Parameter done = fungsi yang dijalankan setelah selesai.
//    (Ini disebut "callback" — fungsi yang dikirim sebagai argumen.)
//
//    setInterval → jalankan kode tiap 1000ms (1 detik).
//    n-- → kurangi n setelah dicek.
//    Urutan: n=3 tampil → n=2 tampil → n=1 tampil →
//            n=0 tampil "GO!" → n=-1 selesai, panggil done().
function runCountdown(done) {
  let n = 3;
  el.countNum.textContent = n;

  G.cdID = setInterval(() => {
    n--;
    if (n > 0)  { el.countNum.textContent = n;     return; }
    if (n === 0){ el.countNum.textContent = "GO!"; return; }
    clearTimers();
    done?.();   // ?. = panggil kalau done bukan undefined/null
  }, 1000);
}

// 3. startGame() — game sungguhan dimulai.
//    Sembunyikan semua overlay, tampilkan elemen game,
//    lalu jalankan loop timer dan spawn.
function startGame() {
  hideAll();
  G.running  = true;
  G.paused   = false;
  G.counting = false;

  setGameUI(true);
  movePointer();
  spawnInitial();   // akan dibuat di Tahap 3
  startLoops();
  updateHUD();
}

// ══════════════════════════════════════════════════════
// startLoops() — jalankan dua interval utama:
//
// timerID: kurangi G.timeLeft setiap 1 detik.
//   → kalau sudah 0, game over.
//
// spawnID: munculkan target baru setiap CFG.spawnMs ms.
//   (akan ada isinya setelah Tahap 3)
// ══════════════════════════════════════════════════════
function startLoops() {
  clearInterval(G.timerID);
  clearInterval(G.spawnID);

  G.timerID = setInterval(() => {
    if (!G.running || G.paused) return;
    G.timeLeft--;
    updateHUD();
    if (G.timeLeft <= 0) endGame();
  }, 1000);

  G.spawnID = setInterval(() => {
    if (G.running && !G.paused) spawnTarget();  // ada di Tahap 3
  }, CFG.spawnMs);
}

// ══════════════════════════════════════════════════════
// PAUSE & RESUME
// ══════════════════════════════════════════════════════

// togglePause() — dipanggil saat tekan Esc.
// Kalau sedang pause → resume. Kalau belum pause → pause.
function togglePause() {
  G.paused ? resumeGame() : pauseGame();
}

// pauseGame() — hentikan timer, tampilkan layar pause.
function pauseGame() {
  G.paused = true;
  clearTimers();
  show("pause");
}

// resumeGame() — countdown lagi sebelum lanjut.
// Supaya pemain punya waktu siap-siap setelah pause.
function resumeGame() {
  G.counting = true;
  show("countdown");
  runCountdown(() => {
    G.paused   = false;
    G.counting = false;
    hideAll();
    setGameUI(true);
    startLoops();   // nyalakan timer lagi
  });
}

// ══════════════════════════════════════════════════════
// endGame() — dipanggil saat waktu habis (timeLeft ≤ 0).
//
// G.running dicek dulu untuk mencegah endGame
// dipanggil dua kali (dari timer dan dari miss).
// ══════════════════════════════════════════════════════
function endGame() {
  if (!G.running) return;

  G.running  = false;
  G.paused   = false;
  G.counting = false;

  clearTimers();
  clearTargets();
  setGameUI(false);

  el.goName.textContent  = G.name;
  el.goScore.textContent = G.score;
  show("gameover");
}

// ══════════════════════════════════════════════════════
// renderShots() — tampilkan riwayat tembakan di sidebar.
//
// G.shots adalah array berisi objek:
//   { hit: true/false, pts: angka, time: timestamp }
//
// Diurutkan sesuai G.shotSort:
//   "score" → hit dulu, lalu poin terbesar
//   "last"  → terbaru di atas (reverse)
// ══════════════════════════════════════════════════════
function renderShots() {
  const list = [...G.shots];   // salin array agar sort tidak ubah aslinya

  if (G.shotSort === "score") {
    list.sort((a, b) => b.hit - a.hit || b.pts - a.pts);
  } else {
    list.reverse();
  }

  el.shotLog.innerHTML = list.length
    ? list.map((s, i) => `
        <div class="row ${s.hit ? "hit" : "miss"}">
          <span>#${i+1} ${s.hit ? "Hit" : "Miss"}</span>
          <span>${s.hit ? "+" + s.pts : "-" + CFG.missPenalty + "s"}</span>
        </div>`).join("")
    : '<div class="row"><span>Belum ada tembakan</span><span>-</span></div>';
}

// ══════════════════════════════════════════════════════
// miss() — dipanggil saat klik di area board kosong.
// Hukumannya: kurangi waktu (bukan skor).
// Math.max(0, ...) memastikan waktu tidak jadi negatif.
// ══════════════════════════════════════════════════════
function miss() {
  G.timeLeft = Math.max(0, G.timeLeft - CFG.missPenalty);
  G.shots.push({ hit: false, pts: 0, time: Date.now() });
  updateHUD();
  renderShots();
  if (G.timeLeft <= 0) endGame();
}

// ══════════════════════════════════════════════════════
// restart() — kembalikan game ke kondisi awal.
// Reset state G, reset form HTML, tampilkan welcome.
// ══════════════════════════════════════════════════════
function restart() {
  clearTimers();
  clearTargets();

  Object.assign(G, {
    name: "", level: "easy", gunIdx: 0, target: "target1",
    score: 0, timeLeft: 0,
    running: false, paused: false, counting: false,
    shots: [], shotSort: "last",
  });

  el.playerName.value = "";
  el.levelSelect.value = "easy";
  document.querySelector('input[name="gun"][value="gun1"]').checked = true;
  document.querySelector('input[name="target"][value="target1"]').checked = true;
  el.btnPlay.disabled = true;

  renderShots();
  updateHUD();
  setGameUI(false);
  show("welcome");
}
// ══════════════════════════════════════════════════════
// spawnInitial() — munculkan sejumlah target pertama kali
// saat game baru mulai (sesuai CFG.initTargets = 3).
// ══════════════════════════════════════════════════════
function spawnInitial() {
  for (let i = 0; i < CFG.initTargets; i++) spawnTarget();
}

// ══════════════════════════════════════════════════════
// spawnTarget() — munculkan SATU target baru di posisi acak.
//
// Dicek dulu: kalau target di layar sudah ≥ maxTargets,
// tidak ditambah lagi (cegah penuh).
//
// Math.random() → angka acak 0–1
// * (lebar board - 68) → posisi tidak melebihi tepi
// (68 = lebar gambar target)
//
// e.stopPropagation() di klik target → mencegah event
// klik "naik" ke board (yang akan memanggil miss()).
// ══════════════════════════════════════════════════════
function spawnTarget() {
  if (el.board.querySelectorAll(".tgt").length >= CFG.maxTargets) return;

  const img = document.createElement("img");
  img.className = "tgt";
  img.src = `Sprites/${G.target}.png`;

  img.style.left = `${Math.random() * (el.board.clientWidth  - 68)}px`;
  img.style.top  = `${Math.random() * (el.board.clientHeight - 68)}px`;

  img.addEventListener("click", e => {
    e.stopPropagation();   // jangan sampai event naik ke board → miss()
    hitTarget(img);
  });

  el.board.appendChild(img);
}

// ══════════════════════════════════════════════════════
// removeTarget(img) — hancurkan target dengan animasi.
//
// Dua elemen yang dibuat:
//   img.boom → animasi target membesar+menghilang
//   fx (.boomfx) → gambar ledakan yang muncul di posisi sama
//
// setTimeout 240ms: hapus elemen img setelah animasinya selesai.
// setTimeout 350ms: hapus elemen fx setelah animasinya selesai.
// ══════════════════════════════════════════════════════
function removeTarget(img) {
  const fx = document.createElement("div");
  fx.className = "boomfx";
  fx.style.left = img.style.left;
  fx.style.top  = img.style.top;
  el.board.appendChild(fx);

  img.classList.add("boom");
  setTimeout(() => img.remove(), 240);
  setTimeout(() => fx.remove(),  350);
}

// ══════════════════════════════════════════════════════
// clearTargets() — hapus semua target dari board.
// Dipanggil saat game over atau restart.
// ══════════════════════════════════════════════════════
function clearTargets() {
  el.board.querySelectorAll(".tgt").forEach(t => t.remove());
}

// ══════════════════════════════════════════════════════
// hitTarget(img) — dipanggil saat target diklik.
//
// CFG.points[G.target] → ambil poin sesuai jenis target.
//   target1 = 10, target2 = 20, target3 = 30.
//
// G.shots.push({...}) → tambah catatan tembakan ke array.
// Date.now() → timestamp (ms sejak 1970) untuk pengurutan.
// ══════════════════════════════════════════════════════
function hitTarget(img) {
  if (!G.running || G.paused || G.counting) return;

  const pts = CFG.points[G.target] || 0;
  G.score += pts;
  G.shots.push({ hit: true, pts, time: Date.now() });

  removeTarget(img);
  updateHUD();
  renderShots();
}

// ══════════════════════════════════════════════════════
// saveScore() — simpan hasil game ke localStorage.
//
// localStorage = penyimpanan di browser yang bertahan
// meski halaman ditutup/di-refresh.
//
// JSON.parse → ubah string di storage jadi array JS.
// "[]" adalah default kalau belum ada data sebelumnya.
// history.push → tambah data game ini.
// JSON.stringify → ubah array kembali jadi string untuk disimpan.
// ══════════════════════════════════════════════════════
function saveScore() {
  const history = JSON.parse(localStorage.getItem(CFG.storageKey) || "[]");
  history.push({
    name:   G.name,
    score:  G.score,
    level:  G.level,
    gun:    CFG.guns[G.gunIdx],
    target: G.target,
    date:   new Date().toLocaleString(),
  });
  localStorage.setItem(CFG.storageKey, JSON.stringify(history));
  alert("Skor berhasil disimpan!");
}

// ══════════════════════════════════════════════════════
// showHistory(mode) — tampilkan tabel riwayat semua game.
//
// mode "score" → urutkan dari skor tertinggi.
//   [...data].sort → salin dulu agar data asli tidak berubah.
//
// mode "last" → urutkan dari yang paling baru.
//   .reverse() → balik urutan (item terakhir ditambah = terbaru)
//
// el.historyBody.innerHTML → isi <tbody> dengan baris-baris tabel.
// list.map → ubah setiap item data jadi baris HTML <tr>.
// .join("") → gabungkan semua baris jadi satu string HTML.
// ══════════════════════════════════════════════════════
function showHistory(mode = "last") {
  const data = JSON.parse(localStorage.getItem(CFG.storageKey) || "[]");

  const list = mode === "score"
    ? [...data].sort((a, b) => b.score - a.score)
    : [...data].reverse();

  el.historyBody.innerHTML = list.length
    ? list.map((r, i) => `
        <tr>
          <td>${i+1}</td><td>${r.name}</td><td>${r.score}</td>
          <td>${r.level}</td><td>${r.gun}</td><td>${r.target}</td><td>${r.date}</td>
        </tr>`).join("")
    : '<tr><td colspan="7">Belum ada riwayat</td></tr>';

  show("history");
}