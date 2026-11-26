/* JACKPOT TV board. Set the Supabase URL and anon/publishable key below. */
const JP_SUPABASE_URL = "https://twzywooeefkbldrphsie.supabase.co";
const JP_SUPABASE_KEY = "sb_publishable_A1gGz_adW1DT8zIoyBIoww_K3AP1RZd";
const JP = window.supabase.createClient(JP_SUPABASE_URL, JP_SUPABASE_KEY);
const $ = (id) => document.getElementById(id);
let state = null;
let primed = false;
let shown = [];

const soundBase = location.pathname.includes("/survey-showdown-site/") ? "../sounds/" : "sounds/";
const clips = {
  correct: new Audio(soundBase + "correctanswer.mp3"),
  wrong: new Audio(soundBase + "wronganswer.mp3"),
};
Object.values(clips).forEach((clip) => { clip.preload = "auto"; });

function playClip(clip) {
  clip.currentTime = 0;
  clip.play().catch(() => {});
}

window.addEventListener("pointerdown", () => {
  clips.correct.play().then(() => {
    clips.correct.pause();
    clips.correct.currentTime = 0;
  }).catch(() => {});
}, { once: true });

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

function hasScore(answer) {
  return Number(answer?.points) > 0;
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
  const fresh = [];
  $("answers").innerHTML = "";
  for (let i = 0; i < 10; i++) {
    const a = ans[i];
    const revealed = Boolean(a && a.revealed);
    if (primed && revealed && !shown[i]) fresh.push(a);
    const card = document.createElement("div");
    card.className = "jp-answer" + (!revealed ? " jp-hidden" : "");
    card.innerHTML = `<div class="jp-number">${i + 1}</div><div class="jp-answer-text"></div><div class="jp-points"></div>`;
    card.querySelector(".jp-answer-text").textContent = a?.text || "";
    card.querySelector(".jp-points").textContent = revealed && hasScore(a) ? a.points : "";
    $("answers").append(card);
  }
  shown = ans.map((a) => Boolean(a && a.revealed));
  while (shown.length < 10) shown.push(false);
  if (primed) fresh.forEach((a) => playClip(hasScore(a) ? clips.correct : clips.wrong));
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
    if (state && nextQuestion !== state.currentQuestion) primed = false;
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
