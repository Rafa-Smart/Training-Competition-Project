const CONFIG = {
  levels: {
    easy: 30,
    medium: 20,
    hard: 15,
  },
  points: {
    target1: 10,
    target2: 20,
    target3: 30,
  },
  guns: ["gun1", "gun2"],
  missPinalty: 5,
  initTargets: 3,
  maxTargets: 8,
  storageKey: "shooter_history",
};

const Global = {
  name: "",
  level: "",
  gunIdx: 1,
  target: "target1",
  score: 0,
  timeLeft: 0,
  running: false,
  paused: false,
  counting: false,
  // jadi paremater kedua di fungsi toggle itu kalo false artinay wajib di hapus
  // tapi kalo true artinyaw ajib di adain si clasnya
  // jadi pas setGameUi on = true aka tampilin semua (artinya gamenya mulia, jadi seua tampilan untuk ui game mulai itu akna di tampilkan)
  // tapi kalo engga mulai maka hapus semuanya karena on nya adalh false, jadi maksa untuk di hapus
  // ini agak kebalik ya soalnya kita pake !on
};

// ini penitng banget nanti ya jadi kita akan harus punya class bernama el lalu data-el jadi nanti kitakan pake ini aja
const el = Object.fromEntries(
  // disini kita pake ... karena queryeelctorall itu kembalin nodelist buakn array ya
  [...document.querySelectorAll("[data-el]")].map((e) => [e.dataset.el, e]),
  // jadi nanti hasilnya akna jadi gini, ya pas di map
  // [
  //   ["btnPlay", <button>],
  //   ["score", <div>]
  // ]
  // , dan akan cocok banget sama fromEntries
  // karena fromEntries itu mint  data array yang isina kunci aray yang isiny ada array yang saing jad kunci dan value
  // menjadi objek {
  // btnPlay: <button>,
  // score: <div>
  // }
);
