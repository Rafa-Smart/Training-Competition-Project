// tahap 1
const config = {
  levels: { Easy: 30, Medium: 20, Hard: 15 },
  points: { target1: 10, target2: 20, target3: 30 },
  guns: ["gun1", "gun2"],
  missPinalty: 5,
  spawnMs: 3000,
  initTargets: 3,
  maxTargets: 8,
  key: "shooter_history",
};

const State = {
  name: "",
  level: "Easy",
  gunidx: 0,
  target: "target1",
  score: 0,
  timeLeft: 0,
  running: false,
  paused: false,
  counting: false,
  timerId: null,
  spawnId: null,
  intervalId: null,
  mx: 500,
  my: 300,
};

const el = Object.fromEntries(
  [...document.querySelectorAll("[data-el]")].map((e) => [e.dataset.el, e]),
);
console.log(el);

const Overlays = [
  "welcome",
  "instruksi",
  "countdown",
  "pause",
  "gameover",
  "history",
];

const show = (name) => {
  // jadi kalo tidak sama = false artinya akan di masukin hidden
  // kalo ternyata sama = true artinya akna di hapus hidenya
  Overlays.forEach((id) => el[id].classList.toggle("hidden", id != name));
};

const hideAll = () => Overlays.forEach((id) => el[id].classList.add("hidden"));

document.addEventListener("DOMContentLoaded", function (e) {
  el.namePemain.oninput = () =>
    (el.btnPlay.disabled = !el.namePemain.value.trim());
  el.btnPlay.onclick = () => preparedGame();
  el.btnContinue.onclick = () => resumeGame();
  el.btnSave.onclick = () => saveScore();
  el.btnHistory.onclick = () => showHistory("score");
  el.btnRestart.onclick = () => restart();
  el.lbSort.onchange = () => renderLeaderBoard();
  el.btnInstruksi.onclick = () => show('instruksi')

  //   tahap 2

  document.addEventListener("mousemove", function (e) {
    const relative = el.game.getBoundingClientRect();
    State.mx = e.clientX - relative.left;
    State.my = e.clientY - relative.top;

    if (State.running && !State.paused && !State.counting) movePointer();
  }); // b clientHeigt
  el.board.addEventListener("click", function (e) {
    if (!State.running || State.paused || State.counting) return;
    if (e.target == el.board) miss();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key == "Escape" && State.running && !State.counting) togglePause();

    // JADI GINI KALO E.KEY ITU AKAN NYARI NAMA KEYBOARD DARI NAMA YANG DI LIHAT DI KEYBOADNYA YA BERATI KALO KITA MAU PAKE .KEY ITU HARUS PAKE " " <- ITU SPASI BUKAN SPACE
    // NAH KALO MAU APKE SPACE ITU KITA PAKE .CODE KARENA IDA AKAN NGECK NAMA ASLI DARI KEYBAODNYA GITU
    if (e.code == "Space" && State.running && !State.paused && !State.counting) {
      e.preventDefault();
      switchGun(); //clearTarget
    }
  });
});

const setGameUi = (on) => {
  ["hud", "sidebar", "board", "pointer", "gun"].forEach((id) =>
    el[id].classList.toggle("hidden", !on),
  );
};

const format = (second) => {
  return `${String(Math.floor(second / 60)).padStart(2, "0")}:${String(second % 60).padStart(2, "0")}`;
};

const updateHud = () => {
  el.hudPlayer.textContent = State.name;
  el.hudScore.textContent = State.score;
  el.hudTime.textContent = format(State.timeLeft);
};

const movePointer = () => {
  el.pointer.style = `left:${State.mx}px;top:${State.my}px;`;
  el.gun.style = `left:${State.mx}px;top:${State.my}px;`;
};//clientWidth 

const switchGun = () => {
  State.gunidx = (State.gunidx + 1) % config.guns.length;
  el.gun.src = `./Sprites/${config.guns[State.gunidx]}.png`;
  el.gun.animate([
         { transform: "translate(-40%, -10%) scale(1)" },
    { transform: "translate(-40%, -10%) scale(1.1) rotate(8deg)" },
    { transform: "translate(-40%, -10%) scale(1)" },
    
   
  ], { duration: 220 },);
};

const clearTimers = () => {
  [State.timerId, State.spawnId, State.intervalId].forEach(clearInterval);
  (State.timerId, State.spawnId, (State.intervalId = null));
}; // startGame

const preparedGame = () => {
  State.name = el.namePemain.value.trim();
  State.level = el.level.value;
  State.gunidx = config.guns.indexOf(
    document.querySelector('[name="gun"]:checked').value,
  );
  State.target = document.querySelector('[name="target"]:checked').value;
  State.score = 0; //GPU ./Sprites/gun${config.guns[State.gunidx]}.png spawnPointer
  State.timeLeft = config.levels[State.level];
  State.running = false;
  State.paused = false;
  State.counting = false;
  clearTimers();
  clearTargets();
  el.gun.src = `./Sprites/${config.guns[State.gunidx]}.png`;
  updateHud();
  show("countdown");
  runCountdown(startGame);
};

const runCountdown = (fungsi) => {
  let n = 3;
  el.countNum.textContent = n;
  State.intervalId = setInterval(() => {
    n--;
    if (n > 0) return void (el.countNum.textContent = n);
    // if(n<0) {
    // jadi void itu untuk rrturn null dn hanya jalanin ini aja
    // bsisa juga gini
    //      (el.countNum.textContent = 0)
    //      return
    // }
    if (n == 0) return void (el.countNum.textContent = "Go!");
    clearTimers();
    fungsi?.(); // ini itu kalo ada ya pake?.
  }, 1000);
};

const startGame = () => {
  hideAll();
  Object.assign(State, {
    running: true,
    paused: false,
    counting: false,
  });
  setGameUi(true);
  movePointer();
  spawnInitial();
  startLoops();
  updateHud();
  renderLeaderBoard();
};

const startLoops = () => {
  clearInterval(State.timerId);
  clearInterval(State.spawnId);

  State.timerId = setInterval(() => {
    if (!State.running || State.paused) return;
    State.timeLeft--;
    updateHud();
    if (State.timeLeft <= 0) endGame();
  }, 1000);
  State.spawnId = setInterval(() => {
    if (!State.running || State.paused) return;
    spawnTarget() //el.gun.src
  }, config.spawnMs);
};

const togglePause = () => {
  State.paused ? resumeGame() : pauseGame();
};

const pauseGame = () => {
  State.paused = true;
  clearTimers();
  show("pause");
};

const resumeGame = () => {
  State.counting = true;
  show("countdown");
  runCountdown(() => {
    Object.assign(State, { paused: false, counting: false });
    hideAll();
    setGameUi(true);
    startLoops();
  });
};

const endGame = () => {
  if (!State.running) return;
  Object.assign(State, {
    running: false,
    counting: false,
    paused: false,
  });
  clearTimers();
  clearTargets();
  setGameUi(false);
  el.goName.textContent = State.name;
  el.goScore.textContent = State.score;
  show("gameover");
};

const miss = () => {
  State.timeLeft = Math.max(0, State.timeLeft - config.missPinalty);
  if (State.timeLeft <= 0) endGame();
};

const restart = () => {
  clearTimers();
  clearTargets();
  Object.assign(State, {
    name: "",
    score: 0,
    level: 'Easy',
    gunidx: 0,
    target: "target1",
    timeLeft: 0,
    running: false,
    paused: false,
    counting: false,
  });
  ((el.namePemain.value = ""), (el.level.value = "Easy"));
  document.querySelector('[name="gun"][value="gun1"]').checked = true;
  document.querySelector('[name="target"][value="target1"]').checked = true;
  el.btnPlay.disabled = true;
  setGameUi(false);
  show("welcome");
};
const spawnInitial = () => {
  // ingat ya initTargets itu adalh angka bukan array fx
  for (let i = 0; i < config.initTargets; i++) {
    spawnTarget();
  }
};

const spawnTarget = () => {
  if (el.board.querySelectorAll(".target").length >= config.maxTargets) return;
  //   let img = `<img src="./Sprites/${State.target}.png"/>`;
  // ga bisa giu ya soalnya itu adalh string buakn objek
  const img = document.createElement("img");
  img.className = "target";
  img.src = `./Sprites/${State.target}.png`;
  // disni 80 adalah ukuran tinggi dan lebar dari si target ya innerHtml
  img.style.left = `${Math.random() * (el.board.clientWidth - 80)}px`;
  img.style.top = `${Math.random() * (el.board.clientHeight - 80)}px`;
  // disni kita stop progtion ya biar engga kena sama layar yang ga ada target nanit malah jalanin si mss lagi
  img.onclick = (e) => {
    e.stopPropagation();
    hitTarget(img);
  };
  el.board.append(img);
}; //fx

const removeTarget = (img) => {
  let fx = document.createElement("div");
  fx.className = "boomfx";
  // ini biar ukurannya itu sama kaya si img target ya innerHtml
  fx.style.left = img.style.left;
  fx.style.top = img.style.top;
  el.board.append(fx);
  img.remove();
  setTimeout(() => fx.remove(), 250);
};

const clearTargets = () => {
  el.board.querySelectorAll(".target").forEach((e) => e.remove());
};
const hitTarget = (img) => {
  if (!State.running || State.paused || State.counting) return;
  State.score += config.points[State.target] || 0;
  removeTarget(img);
  updateHud();
};

const getData = () => {
  return JSON.parse(localStorage.getItem(config.key)) || [];
};

const saveScore = () => {
  const data = getData();
  data.push({
    name: State.name,
    score: State.score,
    level: State.level,
    gun: config.guns[State.gunidx],
    target: State.target,
    date: new Date().toLocaleDateString(),
  });
  localStorage.setItem(config.key, JSON.stringify(data));
  alert("udah save y");
  renderLeaderBoard();
};

const showHistory = (mode) => {
  //renderLeaderBoard
  const list = sortData(getData(), mode);
  el.historyBody.innerHTML =
    list.length >= 1
      ? list.map((e, index) => {
          return `
    <tr>
                        <th>${index + 1}</th>
                        <th>${e.name}</th>
                        <th>${e.score}</th>
                        <th>${e.level}</th>
                        <th>${e.gun}</th>
                        <th>${e.target}</th>
                        <th>${e.date}</th>
                    </tr>
    `;
        })
      : `<tr>
                       <th colspan="7">Not Yet</th>
                    </tr>`;
  show("history");
};

const sortData = (data, mode) => {
  return mode == "score"
    ? [...data].sort((a, b) => a.score - b.score)
    : [...data].reverse();
};
//lsSort (State.timeLeft <= 0)
const renderLeaderBoard = () => {
  const list = sortData(getData(), el.lbSort.value);
  el.leaderboardList.innerHTML =
    list.length >= 1
      ? list
          .map((e, index) => {
            return `
            <div class='lb-item'>
            <div><strong>${e.name}</strong><small>Score: ${e.score}</small></div>
            <button onclick="showDetail(${index})">Detail</button>
            </div>
        `;
          })
          .join("")
      : `<p>no data</p>`;
};

const showDetail = (index) => {
  const list = sortData(getData(), el.lbSort.value);
  const r = list[index];
  if (r)
    alert(
      `Name: ${r.name}\nScore: ${r.score}\nLevel: ${r.level}\nGun: ${r.gun}\nTarget: ${r.target}\nDate: ${r.date}`,
    );
};
