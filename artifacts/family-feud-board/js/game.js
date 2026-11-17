/* Family Feud Game Board Logic */

let questions = [];
let currentIndex = 0;
let currentQuestion = null;
let revealed = new Set();
let strikes = 0;
let team1Score = 0;
let team2Score = 0;
let activeTeam = 1;
let isSteal = false;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

async function init() {
  // Unlock audio on first interaction
  const unlockOnce = () => {
    Sound.unlock();
    document.removeEventListener('click', unlockOnce);
    document.removeEventListener('keydown', unlockOnce);
  };
  document.addEventListener('click', unlockOnce);
  document.addEventListener('keydown', unlockOnce);

  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      questions = getSampleQuestions();
      console.warn('No questions in Supabase – using sample data. Add questions via admin.html');
    } else {
      questions = data.map(q => ({
        id: q.id,
        question: q.question,
        answers: q.answers || [],
        points: q.points || []
      }));
    }

    $('#loading').classList.add('hidden');
    $('#game').classList.remove('hidden');
    loadQuestion(0);
    updateMuteButton();
  } catch (err) {
    console.error(err);
    questions = getSampleQuestions();
    $('#loading').classList.add('hidden');
    $('#game').classList.remove('hidden');
    loadQuestion(0);
    updateMuteButton();
    alert('Could not load from Supabase. Using sample questions.\n\nCheck your config.js keys and that the table exists.');
  }
}

function getSampleQuestions() {
  return [
    {
      question: "Name something people do when they can't sleep",
      answers: ["Count sheep", "Watch TV", "Read a book", "Drink warm milk", "Scroll phone", "Take melatonin", "Listen to music", "Worry"],
      points: [28, 22, 15, 12, 9, 6, 5, 3]
    },
    {
      question: "Name a reason people call in sick to work",
      answers: ["Actually sick", "Hangover", "Kids are sick", "Need a mental day", "Doctor appointment", "Too tired", "Weather", "Forgot alarm"],
      points: [35, 18, 14, 12, 8, 6, 4, 3]
    },
    {
      question: "Name something you find in a kitchen drawer",
      answers: ["Utensils", "Junk", "Batteries", "Takeout menus", "Rubber bands", "Tape", "Scissors", "Matches"],
      points: [32, 20, 14, 10, 8, 7, 5, 4]
    }
  ];
}

function loadQuestion(index) {
  if (index >= questions.length) {
    index = 0;
  }
  currentIndex = index;
  currentQuestion = questions[index];
  revealed = new Set();
  strikes = 0;
  isSteal = false;

  $('#question-text').textContent = currentQuestion.question;
  $('#round-info').textContent = `QUESTION ${index + 1} of ${questions.length}`;

  $$('.strike').forEach(el => el.classList.remove('active'));

  const board = $('#answer-board');
  board.innerHTML = '';

  const maxAnswers = 8;
  for (let i = 0; i < maxAnswers; i++) {
    const hasAnswer = i < currentQuestion.answers.length && currentQuestion.answers[i];
    const slot = document.createElement('div');
    slot.className = 'answer-slot' + (hasAnswer ? '' : ' empty');
    slot.dataset.index = i;

    slot.innerHTML = `
      <div class="answer-number">${i + 1}</div>
      <div class="answer-content">
        <div class="answer-text">${hasAnswer ? currentQuestion.answers[i] : ''}</div>
        <div class="answer-points">${hasAnswer ? currentQuestion.points[i] : ''}</div>
      </div>
    `;
    board.appendChild(slot);
  }

  // Soft sound when changing question
  Sound.next();
}

function revealAnswer(num) {
  const idx = num - 1;
  if (idx < 0 || idx >= currentQuestion.answers.length) return;
  if (revealed.has(idx)) return;

  revealed.add(idx);
  const slot = $(`.answer-slot[data-index="${idx}"]`);
  if (slot) {
    slot.classList.add('revealed');
  }

  Sound.reveal();
}

function addStrike() {
  if (strikes >= 3) return;
  strikes++;
  const el = $(`.strike[data-strike="${strikes}"]`);
  if (el) el.classList.add('active');

  // Big X
  const bigX = $('#big-x');
  bigX.classList.remove('hidden');
  setTimeout(() => bigX.classList.add('hidden'), 700);

  Sound.strike();
}

function resetStrikes() {
  strikes = 0;
  $$('.strike').forEach(el => el.classList.remove('active'));
}

function awardPoints(toTeam) {
  let total = 0;
  revealed.forEach(idx => {
    total += currentQuestion.points[idx] || 0;
  });

  if (total === 0) return;

  if (toTeam === 1) {
    team1Score += total;
    $('#team1-score').textContent = team1Score;
  } else {
    team2Score += total;
    $('#team2-score').textContent = team2Score;
  }

  // Flash the points
  const flash = $('#point-flash');
  flash.textContent = `+${total}`;
  flash.classList.remove('hidden');
  setTimeout(() => flash.classList.add('hidden'), 1100);

  Sound.points();
}

function nextQuestion() {
  loadQuestion(currentIndex + 1);
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen();
  }
}

function toggleMute() {
  const isMuted = Sound.toggleMute();
  updateMuteButton();
  return isMuted;
}

function updateMuteButton() {
  const btn = $('#mute-btn');
  if (!btn) return;
  if (Sound.isMuted()) {
    btn.textContent = '🔇';
    btn.title = 'Unmute sounds (M)';
    btn.classList.add('muted');
  } else {
    btn.textContent = '🔊';
    btn.title = 'Mute sounds (M)';
    btn.classList.remove('muted');
  }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  const key = e.key.toLowerCase();

  // 1-8 reveal
  if (key >= '1' && key <= '8') {
    revealAnswer(parseInt(key));
  }

  // Space = strike
  if (key === ' ' || key === 'x') {
    e.preventDefault();
    addStrike();
  }

  // N = next
  if (key === 'n') {
    nextQuestion();
  }

  // R = reset strikes
  if (key === 'r') {
    resetStrikes();
  }

  // S = award points
  if (key === 's') {
    if (e.shiftKey) {
      awardPoints(2);
    } else {
      awardPoints(1);
    }
  }

  // F = fullscreen
  if (key === 'f') {
    toggleFullscreen();
  }

  // M = mute toggle
  if (key === 'm') {
    toggleMute();
  }

  // Arrow keys
  if (key === 'arrowright') nextQuestion();
  if (key === 'arrowleft') loadQuestion(Math.max(0, currentIndex - 1));
});

// Click on answer slot also reveals
document.addEventListener('click', (e) => {
  const slot = e.target.closest('.answer-slot');
  if (slot && !slot.classList.contains('empty')) {
    const idx = parseInt(slot.dataset.index);
    revealAnswer(idx + 1);
  }
});

// Mute button
document.addEventListener('DOMContentLoaded', () => {
  const btn = $('#mute-btn');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMute();
    });
  }
});

// Start
init();
