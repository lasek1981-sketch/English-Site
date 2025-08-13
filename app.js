
const LESSONS = [{
  words: [
    { id: 1, word: "concise", pl: "zwięzły", def: "brief but comprehensive", ex: "Keep your email concise." },
    { id: 2, word: "robust", pl: "solidny", def: "strong and effective", ex: "We need a robust system." }
  ],
  idioms: [
    { i: "hit the nail on the head", pl: "trafić w sedno", ex: "You hit the nail on the head." }
  ],
  phrasals: [
    { p: "bring up", pl: "poruszyć temat", ex: "She brought up an interesting point." }
  ]
}];

const TODAY_IDX = 0;
const TODAY = LESSONS[TODAY_IDX];

document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("todayStr").textContent = new Date().toLocaleDateString();
document.getElementById("lessonIdx").textContent = TODAY_IDX + 1;

let voices = [];
function loadVoices() { voices = speechSynthesis.getVoices(); }
speechSynthesis.onvoiceschanged = loadVoices;
function speak(text) {
  let utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  let en = voices.find(v => v.lang.startsWith("en"));
  if (en) utter.voice = en;
  speechSynthesis.speak(utter);
}

let current = TODAY.words[0];
function renderCard(card) {
  document.getElementById("fcFront").innerHTML = `<span class='wordText'>${card.word}</span> <button class='speak btn ghost' id='fcSpeak'>🔊</button>`;
  document.getElementById("fcBack").innerHTML = `<div class='pl'>${card.pl}</div><div class='en'>${card.def}</div><div class='ex'>${card.ex}</div>`;
  document.getElementById("fcSpeak").onclick = () => speak(card.word);
}
renderCard(current);

document.getElementById("flashcard").addEventListener("click", () => {
  document.getElementById("flashcard").classList.toggle("flipped");
});

// Idioms & phrasals
function renderLists() {
  document.getElementById("idiomList").innerHTML = TODAY.idioms.map(x => `<li><button onclick='speak("${x.i}")'>🔊</button> ${x.i} - ${x.pl} (${x.ex})</li>`).join("");
  document.getElementById("phrasalList").innerHTML = TODAY.phrasals.map(x => `<li><button onclick='speak("${x.p}")'>🔊</button> ${x.p} - ${x.pl} (${x.ex})</li>`).join("");
}
renderLists();
