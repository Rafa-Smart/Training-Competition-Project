// ─────────────────────────────────────────
// CFG  — semua angka penting game
// ─────────────────────────────────────────
const CFG = {
  levels:      { easy: 30, medium: 20, hard: 15 },
  points:      { target1: 10, target2: 20, target3: 30 },
  guns:        ["gun1", "gun2"],
  missPenalty: 5,
  spawnMs:     3000,
  initTargets: 3,
  maxTargets:  8,
  key:         "shooter_history",
};

// ─────────────────────────────────────────
// G  — state game saat ini
// ─────────────────────────────────────────
const G = {
  name:"", level:"easy", gunIdx:0, target:"target1",
  score:0, timeLeft:0,
  running:false, paused:false, counting:false,
  timerID:null, spawnID:null, cdID:null,
  mx:500, my:300,
};

// ─────────────────────────────────────────
// el  — ambil semua elemen via data-el
// Cara baca: querySelectorAll("[data-el]"]
//   → map setiap elemen jadi [nama, elemen]
//   → Object.fromEntries buat jadi objek
// Hasil: el.hud, el.board, el.btnPlay, dst.
// ─────────────────────────────────────────
const el = Object.fromEntries(
  [...document.querySelectorAll("[data-el]")]
    .map(e => [e.dataset.el, e])
);

// ─────────────────────────────────────────
// OVERLAY  — daftar semua ID layar overlay
// ─────────────────────────────────────────
const OVERLAYS = ["welcome","instruction","countdown","pause","gameover","history"];

// Tampilkan satu overlay, sembunyikan sisanya
function show(name) {
  OVERLAYS.forEach(id => el[id].classList.toggle("hidden", id !== name));
}

// Sembunyikan semua overlay (saat game berjalan)
function hideAll() {
  OVERLAYS.forEach(id => el[id].classList.add("hidden"));
}

// ─────────────────────────────────────────
// INIT  — pasang semua event listener
// ─────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {

  // Play aktif hanya jika nama diisi
  el.playerName.addEventListener("input", () => {
    el.btnPlay.disabled = !el.playerName.value.trim();
  });

  el.btnInst.addEventListener("click", () => show("instruction"));
  el.btnPlay.addEventListener("click", prepareGame);
  el.btnContinue.addEventListener("click", resumeGame);
  el.btnSave.addEventListener("click", saveScore);
  el.btnHistory.addEventListener("click", () => showHistory("score"));
  el.btnRestart.addEventListener("click", restart);
  el.lbSort.addEventListener("change", renderLeaderboard);

  // Mouse → gerakkan pointer dan gun
  document.addEventListener("mousemove", e => {
    const r = el.game.getBoundingClientRect();
    G.mx = e.clientX - r.left;
    G.my = e.clientY - r.top;
    if (G.running && !G.paused && !G.counting) movePointer();
  });

  // Klik board kosong = miss
  el.board.addEventListener("click", e => {
    if (!G.running || G.paused || G.counting) return;
    if (e.target === el.board) miss();
  });

  // Esc = pause/resume, Space = ganti senjata
  document.addEventListener("keydown", e => {
    if (e.code === "Escape" && G.running && !G.counting) togglePause();
    if (e.code === "Space"  && G.running && !G.paused && !G.counting) {
      e.preventDefault();
      switchGun();
    }
  });
});

// ─────────────────────────────────────────
// UI HELPERS
// ─────────────────────────────────────────

// Tampilkan/sembunyikan elemen arena + hud + sidebar
function setGameUI(on) {
  ["hud","board","sidebar","pointer","gun"]
    .forEach(id => el[id].classList.toggle("hidden", !on));
}

// Format detik → "MM:SS"
function fmt(s) {
  return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
}

// Perbarui teks HUD
function updateHUD() {
  el.hudName.textContent  = G.name;
  el.hudScore.textContent = G.score;
  el.hudTime.textContent  = fmt(G.timeLeft);
}

// Pindahkan pointer & gun ke posisi mouse
function movePointer() {
  el.pointer.style.cssText = `left:${G.mx}px;top:${G.my}px`;
  el.gun.style.cssText     = `left:${G.mx}px;top:${G.my}px`;
}

// Ganti senjata (Space) + animasi
function switchGun() {
  G.gunIdx = (G.gunIdx + 1) % CFG.guns.length;
  el.gun.src = `Sprites/${CFG.guns[G.gunIdx]}.png`;
  el.gun.classList.remove("swap");
  void el.gun.offsetWidth;          // reset animasi
  el.gun.classList.add("swap");
  setTimeout(() => el.gun.classList.remove("swap"), 220);
}

// Hentikan semua interval
function clearTimers() {
  [G.timerID, G.spawnID, G.cdID].forEach(clearInterval);
  G.timerID = G.spawnID = G.cdID = null;
}

// ─────────────────────────────────────────
// ALUR UTAMA:  prepareGame → countdown → startGame
// ─────────────────────────────────────────

// 1. Klik Play → simpan pilihan → countdown
function prepareGame() {
  G.name     = el.playerName.value.trim();
  G.level    = el.levelSelect.value;
  G.gunIdx   = CFG.guns.indexOf(document.querySelector('[name="gun"]:checked').value);
  G.target   = document.querySelector('[name="target"]:checked').value;
  G.score    = 0;
  G.timeLeft = CFG.levels[G.level];
  G.running  = false;
  G.paused   = false;
  G.counting = true;

  clearTimers();
  clearTargets();
  el.gun.src = `Sprites/${CFG.guns[G.gunIdx]}.png`;
  updateHUD();
  show("countdown");
  runCountdown(startGame);
}

// 2. Countdown 3,2,1,GO! → panggil done()
function runCountdown(done) {
  let n = 3;
  el.countNum.textContent = n;
  G.cdID = setInterval(() => {
    n--;
    if (n > 0)   return void (el.countNum.textContent = n);
    if (n === 0) return void (el.countNum.textContent = "GO!");
    clearTimers();
    done?.();
  }, 1000);
}

// 3. Mulai game
function startGame() {
  hideAll();
  Object.assign(G, { running:true, paused:false, counting:false });
  setGameUI(true);
  movePointer();
  spawnInitial();
  startLoops();
  updateHUD();
  renderLeaderboard();
}

// Dua interval: timer & spawn target
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
    if (G.running && !G.paused) spawnTarget();
  }, CFG.spawnMs);
}

// ─────────────────────────────────────────
// PAUSE / RESUME
// ─────────────────────────────────────────
function togglePause() { G.paused ? resumeGame() : pauseGame(); }

function pauseGame() {
  G.paused = true;
  clearTimers();
  show("pause");
}

function resumeGame() {
  G.counting = true;
  show("countdown");
  runCountdown(() => {
    Object.assign(G, { paused:false, counting:false });
    hideAll();
    setGameUI(true);
    startLoops();
  });
}

// ─────────────────────────────────────────
// GAME OVER
// ─────────────────────────────────────────
function endGame() {
  if (!G.running) return;
  Object.assign(G, { running:false, paused:false, counting:false });
  clearTimers();
  clearTargets();
  setGameUI(false);
  el.goName.textContent  = G.name;
  el.goScore.textContent = G.score;
  show("gameover");
}

// ─────────────────────────────────────────
// TARGET
// ─────────────────────────────────────────

// Munculkan 3 target awal
function spawnInitial() {
  for (let i = 0; i < CFG.initTargets; i++) spawnTarget();
}

// Munculkan satu target di posisi acak
function spawnTarget() {
  if (el.board.querySelectorAll(".tgt").length >= CFG.maxTargets) return;
  const img = document.createElement("img");
  img.className = "tgt";
  img.src = `Sprites/${G.target}.png`;
  img.style.left = `${Math.random() * (el.board.clientWidth  - 80)}px`;
  img.style.top  = `${Math.random() * (el.board.clientHeight - 80)}px`;
  img.onclick = e => { e.stopPropagation(); hitTarget(img); };
  el.board.appendChild(img);
}

// Hapus target + efek ledakan
function removeTarget(img) {
  const fx = document.createElement("div");
  fx.className  = "boomfx";
  fx.style.left = img.style.left;
  fx.style.top  = img.style.top;
  el.board.appendChild(fx);
  img.remove();
  setTimeout(() => fx.remove(), 350);
}

// Hapus semua target
function clearTargets() {
  el.board.querySelectorAll(".tgt").forEach(t => t.remove());
}

// Target kena tembak
function hitTarget(img) {
  if (!G.running || G.paused || G.counting) return;
  G.score += CFG.points[G.target] || 0;
  removeTarget(img);
  updateHUD();
}

// Tembakan meleset
function miss() {
  G.timeLeft = Math.max(0, G.timeLeft - CFG.missPenalty);
  updateHUD();
  if (G.timeLeft <= 0) endGame();
}

// ─────────────────────────────────────────
// RESTART
// ─────────────────────────────────────────
function restart() {
  clearTimers();
  clearTargets();
  Object.assign(G, { name:"", level:"easy", gunIdx:0, target:"target1", score:0, timeLeft:0, running:false, paused:false, counting:false });
  el.playerName.value = "";
  el.levelSelect.value = "easy";
  document.querySelector('[name="gun"][value="gun1"]').checked    = true;
  document.querySelector('[name="target"][value="target1"]').checked = true;
  el.btnPlay.disabled = true;
  setGameUI(false);
  show("welcome");
}

// ─────────────────────────────────────────
// SIMPAN SKOR & RIWAYAT
// ─────────────────────────────────────────

// Ambil data dari localStorage
function getData() {
  return JSON.parse(localStorage.getItem(CFG.key) || "[]");
}

// Simpan skor ke localStorage
function saveScore() {
  const data = getData();
  data.push({ name:G.name, score:G.score, level:G.level, gun:CFG.guns[G.gunIdx], target:G.target, date:new Date().toLocaleString() });
  localStorage.setItem(CFG.key, JSON.stringify(data));
  alert("Score saved!");
  renderLeaderboard();
}

// Tampilkan tabel riwayat pertandingan
function showHistory(mode) {
  const list = sortData(getData(), mode);
  el.historyBody.innerHTML = list.length
    ? list.map((r,i) => `<tr><td>${i+1}</td><td>${r.name}</td><td>${r.score}</td><td>${r.level}</td><td>${r.gun}</td><td>${r.target}</td><td>${r.date}</td></tr>`).join("")
    : '<tr><td colspan="7">No history yet</td></tr>';
  show("history");
}

// ─────────────────────────────────────────
// LEADERBOARD SIDEBAR
// ─────────────────────────────────────────

// Urutkan data: score = tertinggi dulu, last = terbaru dulu
function sortData(data, mode) {
  return mode === "score"
    ? [...data].sort((a,b) => b.score - a.score)
    : [...data].reverse();
}

// Render daftar leaderboard di sidebar
function renderLeaderboard() {
  const list = sortData(getData(), el.lbSort.value);
  el.lbList.innerHTML = list.length
    ? list.map((r,i) => `
        <div class="lb-item">
          <div><strong>${r.name}</strong><small>Score : ${r.score}</small></div>
          <button onclick="showDetail(${i})">Detail</button>
        </div>`).join("")
    : '<p style="color:#aaa;font-size:12px;text-align:center;margin-top:8px">No data yet</p>';
}

// Tombol Detail → tampilkan info lengkap pemain itu
function showDetail(idx) {
  const list = sortData(getData(), el.lbSort.value);
  const r = list[idx];
  if (r) alert(`Name: ${r.name}\nScore: ${r.score}\nLevel: ${r.level}\nGun: ${r.gun}\nTarget: ${r.target}\nDate: ${r.date}`);
}