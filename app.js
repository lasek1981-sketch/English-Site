// ====== Lekcje (rotacja dzienna) ======
// Kilka paczek na start. Możesz łatwo dopisać kolejne.
const LESSONS = [
  {
    words: [
      { id: 101, word: "concise", pl: "zwięzły", def: "brief but comprehensive", ex: "Keep your email concise and clear." },
      { id: 102, word: "robust", pl: "solidny", def: "strong and effective in all conditions", ex: "We need a robust sales process." },
      { id: 103, word: "leverage", pl: "wykorzystać", def: "use something to maximum advantage", ex: "Leverage existing clients to get referrals." },
      { id: 104, word: "nuance", pl: "niuans", def: "a subtle difference in meaning", ex: "He explained the nuance between the terms." },
      { id: 105, word: "tentative", pl: "wstępny", def: "not certain; subject to change", ex: "Let’s set a tentative meeting for Friday." },
    ],
    idioms: [
      { i: "hit the nail on the head", pl: "trafić w sedno", ex: "Your summary hit the nail on the head." },
      { i: "rule of thumb", pl: "praktyczna zasada", ex: "A good rule of thumb is to keep slides simple." },
    ],
    phrasals: [
      { p: "bring up", pl: "poruszyć temat", ex: "Feel free to bring up any concerns." },
      { p: "follow through", pl: "doprowadzić do końca", ex: "We must follow through on our promises." },
    ]
  },
  {
    words: [
      { id: 201, word: "tangible", pl: "namacalny", def: "real and measurable", ex: "We need tangible outcomes by Q4." },
      { id: 202, word: "make-or-break", pl: "kluczowy dla sukcesu", def: "decisive for success or failure", ex: "This pitch is make-or-break." },
      { id: 203, word: "pitfall", pl: "pułapka", def: "hidden or unsuspected danger", ex: "Let’s avoid common onboarding pitfalls." },
      { id: 204, word: "backlog", pl: "zaległości", def: "accumulated uncompleted work", ex: "Clear the support backlog first." },
      { id: 205, word: "poised", pl: "gotowy/przygotowany", def: "ready and prepared", ex: "We’re poised to launch." },
    ],
    idioms: [
      { i: "move the needle", pl: "zrobić realną różnicę", ex: "This feature moved the needle." },
      { i: "in the weeds", pl: "utknąć w detalach", ex: "We’re in the weeds—zoom out." },
    ],
    phrasals: [
      { p: "roll out", pl: "wdrożyć", ex: "We’ll roll out the update Monday." },
      { p: "scale up", pl: "zwiększyć skalę", ex: "We need to scale up capacity." },
    ]
  },
  {
    words: [
      { id: 301, word: "edge case", pl: "przypadek brzegowy", def: "rare condition at extremes", ex: "It fails on edge cases." },
      { id: 302, word: "workaround", pl: "obejście", def: "temporary fix", ex: "We used a quick workaround." },
      { id: 303, word: "trade-off", pl: "kompromis", def: "balance between two features", ex: "There’s a trade-off between speed and cost." },
      { id: 304, word: "backfire", pl: "odbić się rykoszetem", def: "have the opposite effect", ex: "The shortcut backfired." },
      { id: 305, word: "resilient", pl: "odporny/wytrzymały", def: "able to recover quickly", ex: "Build a resilient process." },
    ],
    idioms: [
      { i: "back to square one", pl: "wrócić do punktu wyjścia", ex: "The bug sent us back to square one." },
      { i: "on the same page", pl: "mieć wspólne zrozumienie", ex: "Let’s get on the same page." },
    ],
    phrasals: [
      { p: "figure out", pl: "rozgryźć", ex: "We need to figure it out." },
      { p: "roll back", pl: "wycofać zmianę", ex: "We rolled back the release." },
    ]
  }
];

// Wylicz indeks lekcji na podstawie daty (rotacja po wszystkich paczkach)
function getTodayLessonIdx() {
  const today = new Date();
  // Liczymy dni od 2025-01-01, by uzyskać stabilny, przewidywalny indeks
  const base = new Date(2025, 0, 1);
  const days = Math.floor((today - base) / (24*60*60*1000));
  const idx = ((days % LESSONS.length) + LESSONS.length) % LESSONS.length;
  return idx;
}

const TODAY_IDX = getTodayLessonIdx();
const TODAY = LESSONS[TODAY_IDX];

// ====== Ustawienia strony dzisiaj ======
const yearEl = document.getElementById("year");
const todayStrEl = document.getElementById("todayStr");
const lessonIdxEl = document.getElementById("lessonIdx");
yearEl.textContent = new Date().getFullYear();
todayStrEl.textContent = new Date().toLocaleDateString();
lessonIdxEl.textContent = String(TODAY_IDX + 1);

// ====== Dane na dziś ======
const WORDS = TODAY.words;
const IDIOMS = TODAY.idioms;
const PHRASALS = TODAY.phrasals;

// ====== SRS w localStorage (wspólne dla wszystkich dni) ======
const STORAGE_KEY = "english_sprint_srs_v2";
function loadSRS() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  const boxes = {};
  // Zainicjalizuj tylko słowa z dzisiejszej lekcji (reszta doda się przy pierwszym spotkaniu)
  WORDS.forEach(w => boxes[w.id] = { box: 1, next: Date.now() });
  const srs = { boxes, score: 0 };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(srs));
  return srs;
}
function saveSRS(srs) { localStorage.setItem(STORAGE_KEY, JSON.stringify(srs)); }

const INTERVALS = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 21 };

function ensureItem(id) {
  const srs = loadSRS();
  if (!srs.boxes[id]) {
    srs.boxes[id] = { box: 1, next: Date.now() };
    saveSRS(srs);
  }
}

function schedule(id, quality) {
  const srs = loadSRS();
  ensureItem(id);
  const item = srs.boxes[id];
  if (quality === "again") item.box = Math.max(1, item.box - 1);
  if (quality === "good") item.box = Math.min(5, item.box + 1);
  if (quality === "easy") item.box = Math.min(5, item.box + 2);
  const days = INTERVALS[item.box] ?? 0;
  item.next = Date.now() + days * 24 * 60 * 60 * 1000;
  saveSRS(srs);
}

// ====== DOM ======
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

totalCountEl.textContent = WORDS.length;

// Motyw
const THEME_KEY = "english_sprint_theme";
function loadTheme() { return localStorage.getItem(THEME_KEY) || "auto"; }
function applyTheme(mode) { document.documentElement.dataset.theme = mode; }
function toggleTheme() {
  const cur = loadTheme();
  const next = cur === "dark" ? "light" : cur === "light" ? "auto" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}
applyTheme(loadTheme());
themeToggle.addEventListener("click", toggleTheme);

// Listy
function renderLists() {
  idiomList.innerHTML = IDIOMS.map(x =>
    `<li><b>${x.i}</b> — ${x.pl}. <i>${x.ex}</i></li>`).join("");
  phrasalList.innerHTML = PHRASALS.map(x =>
    `<li><b>${x.p}</b> — ${x.pl}. <i>${x.ex}</i></li>`).join("");
}
renderLists();

// Kolejka due
function getDue() {
  const srs = loadSRS();
  const now = Date.now();
  WORDS.forEach(w => ensureItem(w.id));
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
    fcBack.innerHTML = "Codzienna paczka opanowana. Wróć jutro!";
    flashcardEl.classList.remove("flipped");
    return;
  }
  current = due[Math.floor(Math.random() * due.length)];
  renderCard(current, false);
}

function renderCard(card, flipped) {
  flashcardEl.classList.toggle("flipped", !!flipped);
  fcFront.textContent = card.word;
  // Na odwrocie najpierw TŁUMACZENIE PL, dopiero potem definicja EN i przykład
  fcBack.innerHTML = `
    <div class="pl">${card.pl}</div>
    <div class="en">${card.def}</div>
    <div class="ex">${card.ex}</div>
  `;
}

function flipCard() { flashcardEl.classList.toggle("flipped"); }

flashcardEl.addEventListener("click", flipCard);
flashcardEl.addEventListener("keydown", (e) => { if (e.code === "Space") { e.preventDefault(); flipCard(); }});
againBtn.addEventListener("click", () => { if (!current) return; schedule(current.id, "again"); pickCard(); });
goodBtn.addEventListener("click",  () => { if (!current) return; schedule(current.id, "good");  pickCard(); });
easyBtn.addEventListener("click",  () => { if (!current) return; schedule(current.id, "easy");  pickCard(); });
skipBtn.addEventListener("click",  () => { pickCard(); });
pickCard();

// ====== Quiz ======
let score = Number(localStorage.getItem("english_sprint_score") || 0);
scoreEl.textContent = score;

function rand(n) { return Math.floor(Math.random() * n); }
function shuffle(arr) { return arr.map(v => [Math.random(), v]).sort((a,b)=>a[0]-b[0]).map(p=>p[1]); }

let qCurrent = null;
function makeQuestion() {
  const w = WORDS[rand(WORDS.length)];
  const options = shuffle([
    w.pl, // pytamy o tłumaczenie PL
    ...shuffle(WORDS.filter(x => x.id !== w.id)).slice(0, 3).map(x => x.pl)
  ]);
  qCurrent = { w, options, correct: options.indexOf(w.pl) };
  qEl.textContent = `Tłumaczenie słowa: “${w.word}” to…?`;
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
