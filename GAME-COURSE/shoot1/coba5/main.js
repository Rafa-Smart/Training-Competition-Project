      // ════════════════════════════════════════════════════════
      //  KONFIGURASI — semua angka penting dikumpulkan di sini
      //  supaya mudah diubah tanpa harus cari-cari di bawah.
      // ════════════════════════════════════════════════════════
      const CFG = {
        levels: { easy: 30, medium: 20, hard: 15 }, // durasi (detik) tiap level
        points: { target1: 10, target2: 20, target3: 30 }, // poin per target
        guns: ["gun1", "gun2"],
        missPenalty: 5, // detik yang dikurangi kalau tembakan meleset
        spawnMs: 3000, // tiap berapa ms target baru muncul
        initTargets: 3, // target yang langsung muncul saat game mulai
        maxTargets: 8, // batas maksimal target di layar sekaligus
        storageKey: "shooter_history", // nama key di localStorage
      };

      // ════════════════════════════════════════════════════════
      //  STATE — semua kondisi game disimpan di satu objek ini.
      //  Kalau kamu mau tahu "game lagi ngapain sekarang?",
      //  lihat saja variabel-variabel di sini.
      // ════════════════════════════════════════════════════════
      const G = {
        // Pilihan pemain
        name: "",
        level: "easy",
        gunIdx: 0,
        target: "target1",

        // Kondisi saat ini
        score: 0,
        timeLeft: 0,
        running: false, // true = game sedang berjalan
        paused: false, // true = game di-pause
        counting: false, // true = sedang countdown (3,2,1,GO)

        // Timer ID — disimpan agar bisa di-cancel
        timerID: null, // interval tiap 1 detik (hitung waktu)
        spawnID: null, // interval tiap 3 detik (munculkan target baru)
        cdID: null, // interval countdown

        // Riwayat tembakan dalam satu sesi
        shots: [],
        shotSort: "last",

        // Posisi mouse relatif ke area game
        mx: 500,
        my: 300,
      };

      // ════════════════════════════════════════════════════════
      //  REFERENSI ELEMEN — dikumpulkan sekali supaya kode
      //  di bawah cukup tulis el.board, el.hud, dst.
      // ════════════════════════════════════════════════════════
      const el = {};
      [
        "game",
        "board",
        "hud",
        "sidebar",
        "pointer",
        "gun",
        "welcome",
        "instruction",
        "countdown",
        "pause",
        "gameover",
        "history",
        'timeBar',
        "playerName",
        "levelSelect",
        "btnPlay",
        "btnInst",
        "btnContinue",
        "btnSave",
        "btnHistory",
        "btnRestart",
        "hudName",
        "hudScore",
        "hudTime",
        "sideGun",
        "shotLog",
        "countNum",
        "goName",
        "goScore",
        "historyBody",
        "sortScore",
        "sortLast",
      ].forEach((id) => (el[id] = document.getElementById(id)));

      // ════════════════════════════════════════════════════════
      //  INISIALISASI — dijalankan sekali saat halaman dimuat
      // ════════════════════════════════════════════════════════
      document.addEventListener("DOMContentLoaded", () => {
        // Aktifkan tombol Play hanya jika nama sudah diisi
        el.playerName.addEventListener("input", () => {
          el.btnPlay.disabled = !el.playerName.value.trim();
        });

        el.btnInst.addEventListener("click", () => show("instruction"));
        el.btnPlay.addEventListener("click", prepareGame);
        el.btnContinue.addEventListener("click", resumeGame);
        el.btnSave.addEventListener("click", saveScore);
        el.btnHistory.addEventListener("click", () => showHistory("last"));
        el.btnRestart.addEventListener("click", restart);

        el.sortScore.addEventListener("click", () => {
          G.shotSort = "score";
          renderShots();
        });
        el.sortLast.addEventListener("click", () => {
          G.shotSort = "last";
          renderShots();
        });

        // Gerakkan kursor & senjata mengikuti mouse
        document.addEventListener("mousemove", (e) => {
          const r = el.game.getBoundingClientRect();
          G.mx = e.clientX - r.left;
          G.my = e.clientY - r.top;
          if (G.running && !G.paused && !G.counting) movePointer();
        });

        // Klik di board (bukan di target) = tembakan meleset
        el.board.addEventListener("click", (e) => {
          if (!G.running || G.paused || G.counting) return;
          if (e.target === el.board) miss();
        });

        // Keyboard: Esc = pause, Spasi = ganti senjata
        document.addEventListener("keydown", (e) => {
          if (e.code === "Escape" && G.running && !G.counting) togglePause();
          if (e.code === "Space" && G.running && !G.paused && !G.counting) {
            e.preventDefault();
            switchGun();
          }
        });
      });

      // ════════════════════════════════════════════════════════
      //  HELPER OVERLAY — hanya satu layar yang terlihat sekaligus
      // ════════════════════════════════════════════════════════
      const OVERLAYS = [
        "welcome",
        "instruction",
        "countdown",
        "pause",
        "gameover",
        "history",
      ];

      function show(name) {
        // Sembunyikan semua overlay, lalu tampilkan yang diminta
        OVERLAYS.forEach((id) =>
          el[id].classList.toggle("hidden", id !== name),
        );
      }

      function hideAll() {
        OVERLAYS.forEach((id) => el[id].classList.add("hidden"));
      }

      // ════════════════════════════════════════════════════════
      //  GAME UI — tampilkan/sembunyikan elemen saat bermain
      // ════════════════════════════════════════════════════════
      function setGameUI(on) {
        ["hud", "board", "sidebar", "pointer", "gun"].forEach((id) => {
          el[id].classList.toggle("hidden", !on);
        });
      }

      // ════════════════════════════════════════════════════════
      //  HUD — update tampilan skor, waktu, dan bar waktu
      // ════════════════════════════════════════════════════════
      function updateHUD() {
        el.hudName.textContent = G.name;
        el.hudScore.textContent = G.score;
        el.hudTime.textContent = G.timeLeft;

        const pct = Math.max(0, (G.timeLeft / CFG.levels[G.level]) * 100);
        const bar = el.timeBar.querySelector("span"); // elemen isian bar
        bar.style.width = `${pct}%`;
        bar.style.background =
          pct > 50 ? "#22c55e" : pct > 25 ? "#f59e0b" : "#ef4444";
      }

      // ════════════════════════════════════════════════════════
      //  KURSOR & SENJATA
      // ════════════════════════════════════════════════════════
      function movePointer() {
        el.pointer.style.left = `${G.mx}px`;
        el.pointer.style.top = `${G.my}px`;
        el.gun.style.left = `${G.mx}px`;
        el.gun.style.top = `${G.my + 42}px`;
      }

      function setGunImage() {
        const src = `Sprites/${CFG.guns[G.gunIdx]}.png`;
        el.gun.src = src;
        el.sideGun.src = src;
      }

      function switchGun() {
        G.gunIdx = (G.gunIdx + 1) % CFG.guns.length; // bergantian antara 0 dan 1
        setGunImage();
        el.gun.classList.remove("swap");
        void el.gun.offsetWidth; // paksa browser reset animasi
        el.gun.classList.add("swap");
        setTimeout(() => el.gun.classList.remove("swap"), 220);
      }

      // ════════════════════════════════════════════════════════
      //  ALUR UTAMA GAME
      // ════════════════════════════════════════════════════════

      // 1. Tombol Play ditekan → simpan pilihan pemain → countdown
      function prepareGame() {
        const name = el.playerName.value.trim();
        if (!name) return;

        // Simpan semua pilihan dari form ke state G
        G.name = name;
        G.level = el.levelSelect.value;
        G.gunIdx = CFG.guns.indexOf(
          document.querySelector('input[name="gun"]:checked').value,
        );
        G.target = document.querySelector('input[name="target"]:checked').value;
        G.score = 0;
        G.timeLeft = CFG.levels[G.level];
        G.shots = [];
        G.running = false;
        G.paused = false;
        G.counting = true;

        clearTimers();
        clearTargets();
        setGunImage();
        renderShots();
        updateHUD();

        show("countdown");
        runCountdown(startGame); // setelah countdown selesai → startGame()
      }

      // 2. Hitung mundur 3, 2, 1, GO! → lalu jalankan callback `done`
      function runCountdown(done) {
        let n = 3;
        el.countNum.textContent = n;

        G.cdID = setInterval(() => {
          n--;
          if (n > 0) {
            el.countNum.textContent = n;
            return;
          }
          if (n === 0) {
            el.countNum.textContent = "GO!";
            return;
          }
          clearTimers();
          done?.(); // panggil fungsi berikutnya (startGame atau resume)
        }, 1000);
      }

      // 3. Game dimulai sungguhan
      function startGame() {
        hideAll();
        G.running = true;
        G.paused = false;
        G.counting = false;

        setGameUI(true);
        movePointer();
        spawnInitial();
        startLoops();
        updateHUD();
      }

      // ════════════════════════════════════════════════════════
      //  TIMER & SPAWN — dua interval yang berjalan selama game
      // ════════════════════════════════════════════════════════
      function startLoops() {
        clearInterval(G.timerID);
        clearInterval(G.spawnID);

        // Kurangi 1 detik setiap 1 detik
        G.timerID = setInterval(() => {
          if (!G.running || G.paused) return;
          G.timeLeft--;
          updateHUD();
          if (G.timeLeft <= 0) endGame();
        }, 1000);

        // Munculkan target baru setiap 3 detik
        G.spawnID = setInterval(() => {
          if (G.running && !G.paused) spawnTarget();
        }, CFG.spawnMs);
      }

      function clearTimers() {
        clearInterval(G.timerID);
        clearInterval(G.spawnID);
        clearInterval(G.cdID);
        G.timerID = G.spawnID = G.cdID = null;
      }

      // ════════════════════════════════════════════════════════
      //  TARGET — munculkan dan hancurkan target
      // ════════════════════════════════════════════════════════
      function spawnInitial() {
        for (let i = 0; i < CFG.initTargets; i++) spawnTarget();
      }

      function spawnTarget() {
        // Jangan munculkan kalau sudah penuh
        if (el.board.querySelectorAll(".tgt").length >= CFG.maxTargets) return;

        const img = document.createElement("img");
        img.className = "tgt";
        img.src = `Sprites/${G.target}.png`;

        // Posisi acak dalam area board
        img.style.left = `${Math.random() * (el.board.clientWidth - 68)}px`;
        img.style.top = `${Math.random() * (el.board.clientHeight - 68)}px`;

        // Klik pada target = hit
        img.addEventListener("click", (e) => {
          e.stopPropagation();
          hitTarget(img);
        });

        el.board.appendChild(img);
      }

      function removeTarget(img) {
        // Efek ledakan visual
        const fx = document.createElement("div");
        fx.className = "boomfx";
        fx.style.left = img.style.left;
        fx.style.top = img.style.top;
        el.board.appendChild(fx);

        img.classList.add("boom");
        setTimeout(() => img.remove(), 240);
        setTimeout(() => fx.remove(), 350);
      }

      function clearTargets() {
        el.board.querySelectorAll(".tgt").forEach((t) => t.remove());
      }

      // ════════════════════════════════════════════════════════
      //  LOGIKA TEMBAKAN
      // ════════════════════════════════════════════════════════
      function hitTarget(img) {
        if (!G.running || G.paused || G.counting) return;

        const pts = CFG.points[G.target] || 0;
        G.score += pts;
        G.shots.push({ hit: true, pts, time: Date.now() });

        removeTarget(img);
        updateHUD();
        renderShots();
      }

      function miss() {
        // Tembakan meleset = kurangi waktu sebagai hukuman
        G.timeLeft = Math.max(0, G.timeLeft - CFG.missPenalty);
        G.shots.push({ hit: false, pts: 0, time: Date.now() });

        updateHUD();
        renderShots();
        if (G.timeLeft <= 0) endGame();
      }

      // ════════════════════════════════════════════════════════
      //  PAUSE & RESUME
      // ════════════════════════════════════════════════════════
      function togglePause() {
        G.paused ? resumeGame() : pauseGame();
      }

      function pauseGame() {
        G.paused = true;
        clearTimers();
        show("pause");
      }

      function resumeGame() {
        G.counting = true;
        show("countdown");
        runCountdown(() => {
          G.paused = false;
          G.counting = false;
          hideAll();
          setGameUI(true);
          startLoops();
        });
      }

      // ════════════════════════════════════════════════════════
      //  AKHIR GAME
      // ════════════════════════════════════════════════════════
      function endGame() {
        if (!G.running) return; // cegah dipanggil dua kali

        G.running = false;
        G.paused = false;
        G.counting = false;

        clearTimers();
        clearTargets();
        setGameUI(false);

        el.goName.textContent = G.name;
        el.goScore.textContent = G.score;
        show("gameover");
      }

      // ════════════════════════════════════════════════════════
      //  SIMPAN & RIWAYAT — pakai localStorage
      // ════════════════════════════════════════════════════════
      function saveScore() {
        const history = JSON.parse(
          localStorage.getItem(CFG.storageKey) || "[]",
        );
        history.push({
          name: G.name,
          score: G.score,
          level: G.level,
          gun: CFG.guns[G.gunIdx],
          target: G.target,
          date: new Date().toLocaleString(),
        });
        localStorage.setItem(CFG.storageKey, JSON.stringify(history));
        alert("Skor berhasil disimpan!");
      }

      function showHistory(mode = "last") {
        const data = JSON.parse(localStorage.getItem(CFG.storageKey) || "[]");

        // Urutkan: tertinggi atau terbaru
        const list =
          mode === "score"
            ? [...data].sort((a, b) => b.score - a.score)
            : [...data].reverse();

        el.historyBody.innerHTML = list.length
          ? list
              .map(
                (r, i) => `
        <tr>
          <td>${i + 1}</td><td>${r.name}</td><td>${r.score}</td>
          <td>${r.level}</td><td>${r.gun}</td><td>${r.target}</td><td>${r.date}</td>
        </tr>`,
              )
              .join("")
          : '<tr><td colspan="7">Belum ada riwayat</td></tr>';

        show("history");
      }

      // ════════════════════════════════════════════════════════
      //  RENDER RIWAYAT TEMBAKAN (sidebar)
      // ════════════════════════════════════════════════════════
      function renderShots() {
        const list = [...G.shots];

        if (G.shotSort === "score") {
          list.sort((a, b) => b.hit - a.hit || b.pts - a.pts);
        } else {
          list.reverse(); // "last" = terbaru di atas
        }

        el.shotLog.innerHTML = list.length
          ? list
              .map(
                (s, i) => `
        <div class="row ${s.hit ? "hit" : "miss"}">
          <span>#${i + 1} ${s.hit ? "Hit" : "Miss"}</span>
          <span>${s.hit ? "+" + s.pts : "-" + CFG.missPenalty + "s"}</span>
        </div>`,
              )
              .join("")
          : '<div class="row"><span>Belum ada tembakan</span><span>-</span></div>';
      }

      // ════════════════════════════════════════════════════════
      //  RESTART — kembalikan semuanya ke kondisi awal
      // ════════════════════════════════════════════════════════
      function restart() {
        clearTimers();
        clearTargets();

        // Reset state
        Object.assign(G, {
          name: "",
          level: "easy",
          gunIdx: 0,
          target: "target1",
          score: 0,
          timeLeft: 0,
          running: false,
          paused: false,
          counting: false,
          shots: [],
          shotSort: "last",
        });

        // Reset form
        el.playerName.value = "";
        el.levelSelect.value = "easy";
        document.querySelector('input[name="gun"][value="gun1"]').checked =
          true;
        document.querySelector(
          'input[name="target"][value="target1"]',
        ).checked = true;
        el.btnPlay.disabled = true;

        renderShots();
        updateHUD();
        setGameUI(false);
        show("welcome");
      }