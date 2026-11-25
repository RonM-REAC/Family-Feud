import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import {
  loadSettings,
  loadSurveys,
  newSurvey,
  normalizeSurvey,
  pullCloud,
  pushCloud,
  saveSettings,
  saveSurveys,
  type Answer,
  type CloudSettings,
  type Survey,
} from "@/lib/surveys";

export const Route = createFileRoute("/admin")({ component: AdminPage });

const emptyAnswers = (): Answer[] => Array.from({ length: 10 }, () => ({ text: "", points: 0 }));

function AdminPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [draft, setDraft] = useState<Survey>({ id: "", question: "", answers: emptyAnswers() });
  const [settings, setSettings] = useState<CloudSettings>({ url: "", anonKey: "" });
  const [note, setNote] = useState("");

  useEffect(() => {
    setSurveys(loadSurveys());
    setSettings(loadSettings());
    setDraft({ ...newSurvey(), answers: emptyAnswers() });
  }, []);

  function persist(next: Survey[]) {
    setSurveys(next);
    saveSurveys(next);
  }

  function updateAnswer(i: number, patch: Partial<Answer>) {
    setDraft((prev) => {
      const answers = prev.answers.map((a, idx) => (idx === i ? { ...a, ...patch } : a));
      return { ...prev, answers };
    });
  }

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    const clean = normalizeSurvey(draft);
    if (!clean.question || clean.answers.length === 0) {
      setNote("Add a question and at least one answer.");
      return;
    }
    const exists = surveys.some((s) => s.id === clean.id);
    const next = exists ? surveys.map((s) => (s.id === clean.id ? clean : s)) : [...surveys, clean];
    persist(next);
    setDraft({ ...newSurvey(), answers: emptyAnswers() });
    setNote("Saved on this browser.");
  }

  function edit(survey: Survey) {
    const answers = emptyAnswers();
    survey.answers.forEach((a, i) => {
      if (i < 10) answers[i] = a;
    });
    setDraft({ ...survey, answers });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function remove(id: string) {
    persist(surveys.filter((s) => s.id !== id));
  }

  async function syncUp() {
    saveSettings(settings);
    if (!settings.url || !settings.anonKey) {
      setNote("Add a Supabase URL and anon key first.");
      return;
    }
    try {
      await pushCloud(settings, surveys);
      setNote("Uploaded to Supabase.");
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Upload failed");
    }
  }

  async function syncDown() {
    saveSettings(settings);
    if (!settings.url || !settings.anonKey) {
      setNote("Add a Supabase URL and anon key first.");
      return;
    }
    try {
      const rows = await pullCloud(settings);
      if (!rows.length) {
        setNote("Cloud table is empty.");
        return;
      }
      persist(rows);
      setNote(`Loaded ${rows.length} surveys from Supabase.`);
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Download failed");
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(surveys, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "surveys.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJson(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Survey[];
        const next = parsed.map((s) => normalizeSurvey(s)).filter((s) => s.question);
        persist(next);
        setNote(`Imported ${next.length} surveys.`);
      } catch {
        setNote("That file is not valid survey JSON.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <main className="min-h-screen bg-[#071422]">
      <SiteNav />
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
        <header>
          <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-wide text-[#f0c43a]">QUESTIONS</h1>
          <p className="text-[#c5d4e8]">
            Surveys stay in this browser. Optional: push them to a Supabase table named surveys.
          </p>
        </header>

        <form onSubmit={onSave} className="rounded-2xl border border-white/10 bg-[#10243f] p-4">
          <label className="text-sm font-bold text-[#9ec4ff]">Question</label>
          <textarea
            required
            value={draft.question}
            onChange={(e) => setDraft({ ...draft, question: e.target.value })}
            rows={2}
            className="mt-1 mb-4 w-full rounded-lg border border-white/15 bg-[#071422] px-3 py-2"
            placeholder="Name something people forget on a trip"
          />
          <div className="grid grid-cols-[1fr_5rem] gap-2 text-xs font-bold uppercase tracking-wide text-[#9ec4ff]">
            <span>Answer</span>
            <span>Points</span>
          </div>
          {draft.answers.map((answer, i) => (
            <div key={i} className="mt-2 grid grid-cols-[1fr_5rem] gap-2">
              <input
                value={answer.text}
                onChange={(e) => updateAnswer(i, { text: e.target.value })}
                className="rounded-lg border border-white/15 bg-[#071422] px-3 py-2"
                placeholder={`Answer ${i + 1}`}
              />
              <input
                type="number"
                min={0}
                value={answer.points || ""}
                onChange={(e) => updateAnswer(i, { points: Number(e.target.value) })}
                className="rounded-lg border border-white/15 bg-[#071422] px-2 py-2 text-center"
              />
            </div>
          ))}
          <button type="submit" className="mt-4 rounded-full bg-[#f0c43a] px-5 py-2 font-extrabold text-[#071422]">
            Save question
          </button>
        </form>

        <section className="rounded-2xl border border-white/10 bg-[#10243f] p-4">
          <h2 className="font-bold">Saved here ({surveys.length})</h2>
          <ul className="mt-3 flex flex-col gap-3">
            {surveys.map((survey) => (
              <li key={survey.id} className="rounded-xl bg-[#071422] p-3">
                <p className="font-bold">{survey.question}</p>
                <p className="mt-1 text-sm text-[#9ec4ff]">
                  {survey.answers.map((a) => `${a.text} (${a.points})`).join(" · ")}
                </p>
                <div className="mt-2 flex gap-2">
                  <button type="button" className="rounded-full bg-[#2563eb] px-3 py-1 text-sm" onClick={() => edit(survey)}>
                    Edit
                  </button>
                  <button type="button" className="rounded-full bg-[#e23d4a] px-3 py-1 text-sm" onClick={() => remove(survey.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="rounded-full border border-white/30 px-4 py-2 text-sm" onClick={exportJson}>
              Download JSON
            </button>
            <label className="rounded-full border border-white/30 px-4 py-2 text-sm">
              Import JSON
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) importJson(file);
                }}
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#10243f] p-4">
          <h2 className="font-bold">Optional Supabase</h2>
          <p className="mt-1 text-sm text-[#c5d4e8]">
            Create a public table called surveys with columns id (text), question (text), and answers (jsonb).
          </p>
          <label className="mt-3 block text-sm">Project URL</label>
          <input
            value={settings.url}
            onChange={(e) => setSettings({ ...settings, url: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/15 bg-[#071422] px-3 py-2"
            placeholder="https://your-project.supabase.co"
          />
          <label className="mt-3 block text-sm">Anon key</label>
          <input
            value={settings.anonKey}
            onChange={(e) => setSettings({ ...settings, anonKey: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/15 bg-[#071422] px-3 py-2"
            placeholder="eyJ..."
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="rounded-full bg-[#f0c43a] px-4 py-2 font-bold text-[#071422]" onClick={syncUp}>
              Upload
            </button>
            <button type="button" className="rounded-full border border-[#f0c43a] px-4 py-2" onClick={syncDown}>
              Download
            </button>
          </div>
          {note && <p className="mt-3 text-sm text-[#f0c43a]">{note}</p>}
        </section>
      </div>
    </main>
  );
}
