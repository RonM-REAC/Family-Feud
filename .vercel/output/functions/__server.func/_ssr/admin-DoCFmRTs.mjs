import { i as __toESM } from "../_runtime.mjs";
import { q as require_react, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as SiteNav } from "./site-nav-BEvhEbmb.mjs";
import { a as normalizeSurvey, i as newSurvey, l as saveSettings, n as loadSettings, o as pullCloud, r as loadSurveys, s as pushCloud, u as saveSurveys } from "./surveys-CWnq072e.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-DoCFmRTs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var emptyAnswers = () => Array.from({ length: 8 }, () => ({
	text: "",
	points: 0
}));
function AdminPage() {
	const [surveys, setSurveys] = (0, import_react.useState)([]);
	const [draft, setDraft] = (0, import_react.useState)({
		id: "",
		question: "",
		answers: emptyAnswers()
	});
	const [settings, setSettings] = (0, import_react.useState)({
		url: "",
		anonKey: ""
	});
	const [note, setNote] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setSurveys(loadSurveys());
		setSettings(loadSettings());
		setDraft({
			...newSurvey(),
			answers: emptyAnswers()
		});
	}, []);
	function persist(next) {
		setSurveys(next);
		saveSurveys(next);
	}
	function updateAnswer(i, patch) {
		setDraft((prev) => {
			const answers = prev.answers.map((a, idx) => idx === i ? {
				...a,
				...patch
			} : a);
			return {
				...prev,
				answers
			};
		});
	}
	function onSave(e) {
		e.preventDefault();
		const clean = normalizeSurvey(draft);
		if (!clean.question || clean.answers.length === 0) {
			setNote("Add a question and at least one answer.");
			return;
		}
		persist(surveys.some((s) => s.id === clean.id) ? surveys.map((s) => s.id === clean.id ? clean : s) : [...surveys, clean]);
		setDraft({
			...newSurvey(),
			answers: emptyAnswers()
		});
		setNote("Saved on this browser.");
	}
	function edit(survey) {
		const answers = emptyAnswers();
		survey.answers.forEach((a, i) => {
			if (i < 8) answers[i] = a;
		});
		setDraft({
			...survey,
			answers
		});
		window.scrollTo({
			top: 0,
			behavior: "smooth"
		});
	}
	function remove(id) {
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
	function importJson(file) {
		const reader = new FileReader();
		reader.onload = () => {
			try {
				const next = JSON.parse(String(reader.result)).map((s) => normalizeSurvey(s)).filter((s) => s.question);
				persist(next);
				setNote(`Imported ${next.length} surveys.`);
			} catch {
				setNote("That file is not valid survey JSON.");
			}
		};
		reader.readAsText(file);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-[#071422]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-[family-name:var(--font-display)] text-4xl tracking-wide text-[#f0c43a]",
					children: "QUESTIONS"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[#c5d4e8]",
					children: "Surveys stay in this browser. Optional: push them to a Supabase table named surveys."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: onSave,
					className: "rounded-2xl border border-white/10 bg-[#10243f] p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-sm font-bold text-[#9ec4ff]",
							children: "Question"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							required: true,
							value: draft.question,
							onChange: (e) => setDraft({
								...draft,
								question: e.target.value
							}),
							rows: 2,
							className: "mt-1 mb-4 w-full rounded-lg border border-white/15 bg-[#071422] px-3 py-2",
							placeholder: "Name something people forget on a trip"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-[1fr_5rem] gap-2 text-xs font-bold uppercase tracking-wide text-[#9ec4ff]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Answer" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Points" })]
						}),
						draft.answers.map((answer, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 grid grid-cols-[1fr_5rem] gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: answer.text,
								onChange: (e) => updateAnswer(i, { text: e.target.value }),
								className: "rounded-lg border border-white/15 bg-[#071422] px-3 py-2",
								placeholder: `Answer ${i + 1}`
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								min: 0,
								value: answer.points || "",
								onChange: (e) => updateAnswer(i, { points: Number(e.target.value) }),
								className: "rounded-lg border border-white/15 bg-[#071422] px-2 py-2 text-center"
							})]
						}, i)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							className: "mt-4 rounded-full bg-[#f0c43a] px-5 py-2 font-extrabold text-[#071422]",
							children: "Save question"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-white/10 bg-[#10243f] p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "font-bold",
							children: [
								"Saved here (",
								surveys.length,
								")"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 flex flex-col gap-3",
							children: surveys.map((survey) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-xl bg-[#071422] p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-bold",
										children: survey.question
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-[#9ec4ff]",
										children: survey.answers.map((a) => `${a.text} (${a.points})`).join(" · ")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 flex gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "rounded-full bg-[#2563eb] px-3 py-1 text-sm",
											onClick: () => edit(survey),
											children: "Edit"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "rounded-full bg-[#e23d4a] px-3 py-1 text-sm",
											onClick: () => remove(survey.id),
											children: "Delete"
										})]
									})
								]
							}, survey.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "rounded-full border border-white/30 px-4 py-2 text-sm",
								onClick: exportJson,
								children: "Download JSON"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "rounded-full border border-white/30 px-4 py-2 text-sm",
								children: ["Import JSON", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "file",
									accept: "application/json",
									className: "hidden",
									onChange: (e) => {
										const file = e.target.files?.[0];
										if (file) importJson(file);
									}
								})]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-white/10 bg-[#10243f] p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-bold",
							children: "Optional Supabase"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-[#c5d4e8]",
							children: "Create a public table called surveys with columns id (text), question (text), and answers (jsonb)."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "mt-3 block text-sm",
							children: "Project URL"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: settings.url,
							onChange: (e) => setSettings({
								...settings,
								url: e.target.value
							}),
							className: "mt-1 w-full rounded-lg border border-white/15 bg-[#071422] px-3 py-2",
							placeholder: "https://your-project.supabase.co"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "mt-3 block text-sm",
							children: "Anon key"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: settings.anonKey,
							onChange: (e) => setSettings({
								...settings,
								anonKey: e.target.value
							}),
							className: "mt-1 w-full rounded-lg border border-white/15 bg-[#071422] px-3 py-2",
							placeholder: "eyJ..."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "rounded-full bg-[#f0c43a] px-4 py-2 font-bold text-[#071422]",
								onClick: syncUp,
								children: "Upload"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "rounded-full border border-[#f0c43a] px-4 py-2",
								onClick: syncDown,
								children: "Download"
							})]
						}),
						note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-[#f0c43a]",
							children: note
						})
					]
				})
			]
		})]
	});
}
//#endregion
export { AdminPage as component };
