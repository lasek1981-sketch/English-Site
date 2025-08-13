const WORDS = [
  { id: 1, word: "concise", def: "brief but comprehensive", pl: "zwięzły", ex: "Keep your email concise and clear." },
  { id: 2, word: "robust", def: "strong and effective in all conditions", pl: "solidny", ex: "We need a robust sales process." },
  { id: 3, word: "leverage", def: "use something to maximum advantage", pl: "wykorzystać", ex: "Leverage existing clients to get referrals." },
  { id: 4, word: "nuance", def: "a subtle difference in meaning", pl: "niuans", ex: "He explained the nuance between the terms." },
  { id: 5, word: "tentative", def: "not certain; subject to change", pl: "wstępny", ex: "Let’s set a tentative meeting for Friday." },
];

const IDIOMS = [
  { i: "hit the nail on the head", pl: "trafić w sedno", ex: "Your summary hit the nail on the head." },
  { i: "rule of thumb", pl: "praktyczna zasada", ex: "A good rule of thumb is to keep slides simple." },
  { i: "ballpark figure", pl: "szacunkowa wartość", ex: "Can you give me a ballpark figure?" },
];

const PHRASALS = [
  { p: "bring up", pl: "poruszyć temat", ex: "Feel free to bring up any concerns." },
  { p: "follow through", pl: "doprowadzić do końca", ex: "We must follow through on our promises." },
];

const STORAGE_KEY = "english_sprint_srs_v1";
function loadSRS() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  const boxes = {};
  WORDS.forEach(w => boxes[w.id] = { box: 1, next: Date.now() });
  const srs = { boxes, score: 0 };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(srs));
  return srs;
}
function saveSRS(srs) { localStorage.setItem(STORAGE_KEY, JSON.stringify(srs)); }

const INTERVALS = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 21 };

function schedule(id, quality) {
  const srs = loadSRS();
  const item = srs.boxes[id];
  if (!item) return;
  if (quality === "again") item.box = Math.max(1, item.box - 1);
  if (quality === "good") item.box = Math.min(5, item.box + 1);
  if (quality === "easy") item.box = Math.min(5, item.box + 2);
  const days = INTERVALS[item.box] ?? 0;
  item.next = Date.now() + days * 24 * 60 * 60 * 1000;
  saveSRS(srs);
}

const yearEl = document.getElementById("year");
const dueCountEl = document.getElementById("dueCount");
const totalCountEl = document.getElementById("totalCount");
const flashcardEl = document.getElementById("flashcard");
const fcFront = document.getElementById("fcFront");
const fcBack = document.getElementById("fcBack");
const againBtn = document.getElementById("againBtn");
const goodBtn = document.getElementById("goodBtn");
const easyBtn = document.getElementById("easyBtn");
const skipBtn = document.getElementById("skipBtn");
const themeToggle = document.getElementById("themeToggle");

const qEl = document.getElementById("question");
const aWrap = document.getElementById("answers");
const nextQ = document.getElementById("nextQ");
const scoreEl = document.getElementById("score");

const idiomList = document.getElementById("idiomList");
const phrasalList = document.getElementById("phrasalList");

yearEl.textContent = new Date().getFullYear();
totalCountEl.textContent = WORDS.length;

const THEME_KEY = "english_sprint_theme";
function loadTheme() { return localStorage.getItem(THEME_KEY) || "auto"; }
function applyTheme(mode) {
  document.documentElement.dataset.theme = mode;
}
function toggleTheme() {
  const cur = loadTheme();
  const next = cur === "dark" ? "light" : cur === "light" ? "auto" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}
applyTheme(loadTheme());
themeToggle.addEventListener("click", toggleTheme);

function renderLists() {
  idiomList.innerHTML = IDIOMS.map(x =>
    `<li><b>${x.i}</b> — ${x.pl}. <i>${x.ex}</i></li>`).join("");
  phrasalList.innerHTML = PHRASALS.map(x =>
    `<li><b>${x.p}</b> — ${x.pl}. <i>${x.ex}</i></li>`).join("");
}
renderLists();

function getDue() {
  const srs = loadSRS();
  const now = Date.now();
  const due = WORDS.filter(w => (srs.boxes[w.id]?.next ?? 0) <= now);
  dueCountEl.textContent = due.length;
  return due;
}

let current = null;
function pickCard() {
  const due = getDue();
  if (due.length === 0) {
    current = null;
    fcFront.textContent = "🎉 Wszystko powtórzone!";
    fcBack.textContent = "Dodaj nowe słówka lub wróć później.";
    flashcardEl.classList.remove("flipped");
    return;
  }
  current = due[Math.floor(Math.random() * due.length)];
  renderCard(current, false);
}

function renderCard(card, flipped) {
  flashcardEl.classList.toggle("flipped", !!flipped);
  fcFront.textContent = card.word;
  fcBack.innerHTML = `<b>${card.word}</b> — ${card.def} <br/><small>PL: ${card.pl}</small><br/><em>${card.ex}</em>`;
}

function flipCard() {
  flashcardEl.classList.toggle("flipped");
}

flashcardEl.addEventListener("click", flipCard);
flashcardEl.addEventListener("keydown", (e) => { if (e.code === "Space") { e.preventDefault(); flipCard(); }});
againBtn.addEventListener("click", () => { if (!current) return; schedule(current.id, "again"); pickCard(); });
goodBtn.addEventListener("click",  () => { if (!current) return; schedule(current.id, "good");  pickCard(); });
easyBtn.addEventListener("click",  () => { if (!current) return; schedule(current.id, "easy");  pickCard(); });
skipBtn.addEventListener("click",  () => { pickCard(); });
pickCard();

let score = Number(localStorage.getItem("english_sprint_score") || 0);
scoreEl.textContent = score;

function rand(n) { return Math.floor(Math.random() * n); }
function shuffle(arr) { return arr.map(v => [Math.random(), v]).sort((a,b)=>a[0]-b[0]).map(p=>p[1]); }

let qCurrent = null;
function makeQuestion() {
  const w = WORDS[rand(WORDS.length)];
  const options = shuffle([
    w.def,
    ...shuffle(WORDS.filter(x => x.id !== w.id)).slice(0, 3).map(x => x.def)
  ]);
  qCurrent = { w, options, correct: options.indexOf(w.def) };
  qEl.textContent = `Co znaczy: “${w.word}”?`;
  aWrap.innerHTML = options.map((opt, i) =>
    `<button class="btn answer" data-i="${i}">${opt}</button>`).join("");
  [...aWrap.querySelectorAll(".answer")].forEach(btn => {
    btn.addEventListener("click", () => handleAnswer(Number(btn.dataset.i), btn));
  });
}

function handleAnswer(i, btn) {
  const buttons = [...aWrap.querySelectorAll(".answer")];
  buttons.forEach(b => b.disabled = true);
  const correctBtn = buttons[qCurrent.correct];
  if (i === qCurrent.correct) {
    btn.classList.add("correct");
    score += 1;
  } else {
    btn.classList.add("wrong");
    correctBtn.classList.add("correct");
  }
  scoreEl.textContent = score;
  localStorage.setItem("english_sprint_score", String(score));
}
nextQ.addEventListener("click", makeQuestion);
makeQuestion();
