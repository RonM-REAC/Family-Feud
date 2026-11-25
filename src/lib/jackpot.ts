export type JackpotAnswer = { text: string; points: number; revealed: boolean };
export type JackpotQuestion = { question: string; answers: JackpotAnswer[] };
export type JackpotState = {
  questions: JackpotQuestion[];
  currentQuestion: number;
  scores: [number, number];
  activePlayer: number;
  timerSeconds: number;
  timerRunning: boolean;
  timerStartedAt: number | null;
  scoresVisible: boolean;
  updatedAt?: string;
};

export const JACKPOT_SUPABASE_URL = "https://twzywooeefkbldrphsie.supabase.co";
export const JACKPOT_SUPABASE_KEY = "sb_publishable_A1gGz_adW1DT8zIoyBIoww_K3AP1RZd";
const TABLE_URL = JACKPOT_SUPABASE_URL + "/rest/v1/jackpot_state";

export const defaultJackpotState = (): JackpotState => ({
  questions: [{
    question: "Name something people bring to a party.",
    answers: [
      { text: "Food", points: 35, revealed: false },
      { text: "Drinks", points: 25, revealed: false },
      { text: "Music", points: 15, revealed: false },
      { text: "Dessert", points: 10, revealed: false },
      { text: "A gift", points: 8, revealed: false },
    ],
  }],
  currentQuestion: 0,
  scores: [0, 0],
  activePlayer: 0,
  timerSeconds: 20,
  timerRunning: false,
  timerStartedAt: null,
  scoresVisible: false,
});

const headers = () => ({
  apikey: JACKPOT_SUPABASE_KEY,
  Authorization: "Bearer " + JACKPOT_SUPABASE_KEY,
  "Content-Type": "application/json",
});

export async function loadJackpotState(): Promise<JackpotState> {
  const response = await fetch(TABLE_URL + "?select=state,updated_at&id=eq.main", { headers: headers() });
  if (!response.ok) throw new Error("Supabase read failed (" + response.status + "). Check that the JACKPOT SQL setup has been run.");
  const rows = (await response.json()) as Array<{ state: JackpotState; updated_at?: string }>;
  if (!rows.length) {
    const initial = defaultJackpotState();
    await saveJackpotState(initial);
    return initial;
  }
  return { ...defaultJackpotState(), ...rows[0].state, updatedAt: rows[0].updated_at };
}

export async function saveJackpotState(state: JackpotState): Promise<void> {
  const payload = { id: "main", state, updated_at: new Date().toISOString() };
  const response = await fetch(TABLE_URL + "?on_conflict=id", {
    method: "POST",
    headers: { ...headers(), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error("Supabase save failed (" + response.status + "): " + detail);
  }
}

export function getCurrentQuestion(state: JackpotState): JackpotQuestion | null {
  return state.questions[state.currentQuestion] ?? null;
}

export function getRemainingSeconds(state: JackpotState): number {
  if (!state.timerRunning || !state.timerStartedAt) return Math.max(0, state.timerSeconds);
  return Math.max(0, Math.ceil((state.timerSeconds * 1000 - (Date.now() - state.timerStartedAt)) / 1000));
}

export function resetTimer(state: JackpotState): JackpotState {
  return { ...state, timerSeconds: 20, timerRunning: false, timerStartedAt: null };
}

export function normalizeQuestion(question: string, answers: JackpotAnswer[]): JackpotQuestion {
  return {
    question: question.trim(),
    answers: answers
      .map((answer) => ({ text: answer.text.trim(), points: Math.max(0, Math.round(Number(answer.points) || 0)), revealed: Boolean(answer.revealed) }))
      .filter((answer) => answer.text)
      .slice(0, 10),
  };
}
