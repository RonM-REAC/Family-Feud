export type Answer = { text: string; points: number };

export type Survey = {
  id: string;
  question: string;
  answers: Answer[];
};

const KEY = "survey-showdown-v1";
const SETTINGS_KEY = "survey-showdown-settings";
const SCORES_KEY = "survey-showdown-scores";

export type CloudSettings = {
  url: string;
  anonKey: string;
};

export type ScoreState = {
  leftName: string;
  rightName: string;
  leftScore: number;
  rightScore: number;
};

const SAMPLES: Survey[] = [
  {
    id: "sample-sleep",
    question: "Name something people do when they cannot sleep",
    answers: [
      { text: "Count sheep", points: 28 },
      { text: "Watch TV", points: 22 },
      { text: "Read a book", points: 15 },
      { text: "Warm milk", points: 12 },
      { text: "Scroll a phone", points: 9 },
      { text: "Listen to music", points: 6 },
      { text: "Worry", points: 5 },
      { text: "Get a snack", points: 3 },
    ],
  },
  {
    id: "sample-sick",
    question: "Name a reason people call in sick",
    answers: [
      { text: "Actually sick", points: 35 },
      { text: "Need a day off", points: 18 },
      { text: "Kids are home", points: 14 },
      { text: "Doctor visit", points: 12 },
      { text: "Too tired", points: 8 },
      { text: "Bad weather", points: 6 },
      { text: "Overslept", points: 4 },
      { text: "Car trouble", points: 3 },
    ],
  },
  {
    id: "sample-drawer",
    question: "Name something you find in a kitchen drawer",
    answers: [
      { text: "Utensils", points: 32 },
      { text: "Junk mail", points: 20 },
      { text: "Batteries", points: 14 },
      { text: "Rubber bands", points: 10 },
      { text: "Tape", points: 8 },
      { text: "Scissors", points: 7 },
      { text: "Takeout menus", points: 5 },
      { text: "Matches", points: 4 },
    ],
  },
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function loadSurveys(): Survey[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return SAMPLES;
    const parsed = JSON.parse(raw) as Survey[];
    if (!Array.isArray(parsed) || parsed.length === 0) return SAMPLES;
    return parsed;
  } catch {
    return SAMPLES;
  }
}

export function saveSurveys(surveys: Survey[]) {
  localStorage.setItem(KEY, JSON.stringify(surveys));
}

export function newSurvey(): Survey {
  return {
    id: uid(),
    question: "",
    answers: Array.from({ length: 8 }, () => ({ text: "", points: 0 })),
  };
}

export function normalizeSurvey(input: Survey): Survey {
  const answers = (input.answers || [])
    .map((a) => ({
      text: (a.text || "").trim(),
      points: Math.max(0, Math.round(Number(a.points) || 0)),
    }))
    .filter((a) => a.text)
    .sort((a, b) => b.points - a.points)
    .slice(0, 8);
  return {
    id: input.id || uid(),
    question: input.question.trim(),
    answers,
  };
}

export function loadSettings(): CloudSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { url: "", anonKey: "" };
    const parsed = JSON.parse(raw) as CloudSettings;
    return { url: parsed.url || "", anonKey: parsed.anonKey || "" };
  } catch {
    return { url: "", anonKey: "" };
  }
}

export function saveSettings(settings: CloudSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadScores(): ScoreState {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    if (!raw) {
      return { leftName: "TEAM A", rightName: "TEAM B", leftScore: 0, rightScore: 0 };
    }
    return JSON.parse(raw) as ScoreState;
  } catch {
    return { leftName: "TEAM A", rightName: "TEAM B", leftScore: 0, rightScore: 0 };
  }
}

export function saveScores(scores: ScoreState) {
  localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
}

function restBase(url: string) {
  return url.replace(/\/+$/, "") + "/rest/v1/surveys";
}

export async function pullCloud(settings: CloudSettings): Promise<Survey[]> {
  const res = await fetch(
    restBase(settings.url) + "?select=id,question,answers&order=id.asc",
    {
      headers: {
        apikey: settings.anonKey,
        Authorization: `Bearer ${settings.anonKey}`,
      },
    },
  );
  if (!res.ok) throw new Error(`Cloud read failed (${res.status})`);
  const rows = (await res.json()) as Survey[];
  return rows.map((row) =>
    normalizeSurvey({
      id: String(row.id),
      question: row.question,
      answers: row.answers || [],
    }),
  );
}

export async function pushCloud(settings: CloudSettings, surveys: Survey[]) {
  const headers = {
    apikey: settings.anonKey,
    Authorization: `Bearer ${settings.anonKey}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates,return=minimal",
  };
  const res = await fetch(restBase(settings.url), {
    method: "POST",
    headers,
    body: JSON.stringify(
      surveys.map((s) => ({
        id: s.id,
        question: s.question,
        answers: s.answers,
      })),
    ),
  });
  if (!res.ok) throw new Error(`Cloud save failed (${res.status})`);
}
