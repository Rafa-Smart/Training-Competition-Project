// tahap 1
const config = {
  levels: { Easy: 30, Medium: 20, hard: 15 },
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
  Overlays.forEach((id) => el[id].classList.toggle("hidden", on != name));
};

const hideAll = () => Overlays.forEach((id) => el[id].classList.add("hidden"));

document.addEventListener("DOMContentLoaded", function (e) {
  el.namaPemain.oninput = () =>
    (el.btnPlay.disabled = !el.namaPemain.value.trim());
  el.btnPlay.onclick = () => preparedGame();
  el.btnContinue.onclick = () => resumeGame();
  el.btnSave.onclick = () => saveScore();
  el.btnHistory.onclick = () => showHistory("score");
  el.btnRestart.onclick = () => restart();
  el.lsSort.onchange = () => renderLeaderBoard();

  //   tahap 2

  document.addEventListener("mousemove", function (e) {
    const relative = el.game.getBoundingClientRect();
    State.mx = e.clientX - relative.left;
    State.my = e.clientY - relative.top;

    if (State.running && !State.paused && !State.counting) pointerMove();
  });
  el.board.addEventListener("click", function (e) {
    if (!State.running || State.paused || State.counting) return;
    if (e.target == el.board) miss();
  });
  document.addEventListener("keydown", function () {
    if ((e.key = "Escape" && State.running && !State.counting)) togglePause();
    if (e.key == "Space" && State.running && !State.paused && !State.counting) {
      e.preventDefault();
      switchGun();
    }
  });
});

const setGameUi = (on) => {
  ["hud", "sidebar", "board", "pointer", "gun"].forEach((id) =>
    el[id].classList.toggle("hidden", !on),
  );
};

const format = (second) => {
    return `${String(Math.floor(second/60)).padStart(2,'0')}:${String(second%60).padStart(2, '0')}`
}

const updateHud = ()=> {
    el.hudPlayer.textContent = State.name;
    el.hudScore.textContent=State.score;
    el.hudTime.textContent=format(State.timeLeft)
}

const movePointer = () => {
    el.pointer.style = `left:${State.mx}px;top:${State.my}px;`;
    el.gun.style = `left:${State.mx}px;top:${State.my};`
}