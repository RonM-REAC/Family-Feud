/* JACKPOT TV board. Set the Supabase URL and anon/publishable key below. */
const JP_SUPABASE_URL = "https://twzywooeefkbldrphsie.supabase.co";
const JP_SUPABASE_KEY = "sb_publishable_A1gGz_adW1DT8zIoyBIoww_K3AP1RZd";
const JP = window.supabase.createClient(JP_SUPABASE_URL, JP_SUPABASE_KEY);
const ANSWER_COUNT = 5;
const $ = (id) => document.getElementById(id);
let state = null;
let primed = false;
let shown = [];

const soundBase = location.pathname.includes("/survey-showdown-site/") ? "../sounds/" : "sounds/";
const clips = {
  correct: new Audio(new URL(soundBase + "correctanswer.mp3", location.href).href),
  wrong: new Audio(new URL(soundBase + "wronganswer.mp3", location.href).href),
};
let soundReady = false;
let pendingSound = null;
let unlocking = false;

Object.values(clips).forEach((clip) => { clip.preload = "auto"; });

function soundButton() {
  return document.getElementById("enable-sound");
}

function markSound(on) {
  const button = soundButton();
  if (!button) return;
  button.textContent = on ? "Sound on" : "Enable sound";
  button.classList.toggle("on", on);
}

function playClip(name) {
  const clip = clips[name];
  if (!clip) return;
  if (!soundReady) {
    pendingSound = name;
    markSound(false);
    return;
  }
  clip.pause();
  clip.currentTime = 0;
  clip.play().catch(() => {
    soundReady = false;
    pendingSound = name;
    markSound(false);
  });
}

function enableSound() {
  if (soundReady || unlocking) return;
  unlocking = true;
  const clip = clips.correct;
  clip.muted = true;
  const started = clip.play();
  const done = () => {
    clip.pause();
    clip.currentTime = 0;
    clip.muted = false;
    soundReady = true;
    markSound(true);
    if (pendingSound) {
      const next = pendingSound;
      pendingSound = null;
      playClip(next);
    }
  };
  if (started && started.then) started.then(done).catch(() => { markSound(false); });
  else done();
}

document.addEventListener("pointerdown", enableSound);
window.addEventListener("keydown", enableSound);

function defaultState() {
  return {
    questions: [{
      question: "Name something people bring to a party.",
      answers: [
        { text: "Food", points: 35, revealed: false },
        { text: "Drinks", points: 25, revealed: false },
        { text: "Music", points: 15, revealed: false },
      ],
    }],
    currentQuestion: 0,
    scores: [0, 0],
    activePlayer: 0,
    timerSeconds: 25,
    timerRunning: false,
    timerStartedAt: null,
    scoresVisible: false,
  };
}

function currentQ() {
  return state?.questions?.[state.currentQuestion] || null;
}

/* null means no score entered; 0 is a real score. */
function scoreOf(answer) {
  const points = answer?.points;
  if (points === null || points === undefined || points === "") return null;
  return Number(points) || 0;
}

function render() {
  if (!state) return;
  const q = currentQ();
  $("question").textContent = q?.question || "No question selected";
  $("turnLabel").textContent = `PLAYER ${state.activePlayer + 1}'S TURN`;
  $("timer").textContent = remaining();
  $("score1").textContent = state.scores?.[0] ?? 0;
  $("score2").textContent = state.scores?.[1] ?? 0;
  document.querySelectorAll(".jp-score").forEach((el) => el.classList.toggle("masked", !state.scoresVisible));
  const ans = q?.answers || [];
  const changed = [];
  const next = [];
  $("answers").innerHTML = "";
  for (let i = 0; i < ANSWER_COUNT; i++) {
    const a = ans[i];
    const revealed = Boolean(a && a.revealed);
    const score = revealed ? scoreOf(a) : null;
    /* Snapshot of what viewers see, so a newly shown or updated answer can be detected. */
    next[i] = revealed ? JSON.stringify([a.text, score]) : null;
    if (primed && next[i] !== null && next[i] !== shown[i] && score !== null) changed.push(score);
    const card = document.createElement("div");
    card.className = "jp-answer" + (!revealed ? " jp-hidden" : "");
    card.innerHTML = `<div class="jp-number">${i + 1}</div><div class="jp-answer-text"></div><div class="jp-points"></div>`;
    card.querySelector(".jp-answer-text").textContent = a?.text || "";
    card.querySelector(".jp-points").textContent = score ?? "";
    $("answers").append(card);
  }
  shown = next;
  /* Each sound plays once per update, even if several answers changed together. */
  new Set(changed.map((score) => (score > 0 ? "correct" : "wrong"))).forEach(playClip);
  primed = true;
}

function remaining() {
  if (!state) return 25;
  if (!state.timerRunning || !state.timerStartedAt) return state.timerSeconds ?? 25;
  return Math.max(0, Math.ceil((state.timerSeconds * 1000 - (Date.now() - state.timerStartedAt)) / 1000));
}

async function load() {
  const { data, error } = await JP.from("jackpot_state").select("state").eq("id", "main").maybeSingle();
  if (error) {
    $("status").textContent = "Supabase connection failed. Check config and SQL.";
    return;
  }
  if (!data) {
    const init = defaultState();
    await JP.from("jackpot_state").insert({ id: "main", state: init });
    state = init;
  } else state = data.state || defaultState();
  primed = false;
  render();
}

JP.channel("jackpot-board-live").on("postgres_changes", { event: "*", schema: "public", table: "jackpot_state", filter: "id=eq.main" }, (payload) => {
  if (payload.new?.state) {
    const nextQuestion = payload.new.state.currentQuestion;
    const removed = state && payload.new.state.questions?.length < state.questions?.length;
    if (state && (nextQuestion !== state.currentQuestion || removed)) primed = false;
    state = payload.new.state;
    render();
  }
}).subscribe();

load();
setInterval(() => {
  if (state?.timerRunning) {
    const n = remaining();
    $("timer").textContent = n;
    if (n <= 0) {
      state.timerSeconds = 0;
      state.timerRunning = false;
      state.timerStartedAt = null;
      render();
    }
  }
}, 250);
