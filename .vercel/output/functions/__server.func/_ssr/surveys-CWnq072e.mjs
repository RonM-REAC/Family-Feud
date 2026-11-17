//#region node_modules/.nitro/vite/services/ssr/assets/surveys-CWnq072e.js
var KEY = "survey-showdown-v1";
var SETTINGS_KEY = "survey-showdown-settings";
var SCORES_KEY = "survey-showdown-scores";
var SAMPLES = [
	{
		id: "sample-sleep",
		question: "Name something people do when they cannot sleep",
		answers: [
			{
				text: "Count sheep",
				points: 28
			},
			{
				text: "Watch TV",
				points: 22
			},
			{
				text: "Read a book",
				points: 15
			},
			{
				text: "Warm milk",
				points: 12
			},
			{
				text: "Scroll a phone",
				points: 9
			},
			{
				text: "Listen to music",
				points: 6
			},
			{
				text: "Worry",
				points: 5
			},
			{
				text: "Get a snack",
				points: 3
			}
		]
	},
	{
		id: "sample-sick",
		question: "Name a reason people call in sick",
		answers: [
			{
				text: "Actually sick",
				points: 35
			},
			{
				text: "Need a day off",
				points: 18
			},
			{
				text: "Kids are home",
				points: 14
			},
			{
				text: "Doctor visit",
				points: 12
			},
			{
				text: "Too tired",
				points: 8
			},
			{
				text: "Bad weather",
				points: 6
			},
			{
				text: "Overslept",
				points: 4
			},
			{
				text: "Car trouble",
				points: 3
			}
		]
	},
	{
		id: "sample-drawer",
		question: "Name something you find in a kitchen drawer",
		answers: [
			{
				text: "Utensils",
				points: 32
			},
			{
				text: "Junk mail",
				points: 20
			},
			{
				text: "Batteries",
				points: 14
			},
			{
				text: "Rubber bands",
				points: 10
			},
			{
				text: "Tape",
				points: 8
			},
			{
				text: "Scissors",
				points: 7
			},
			{
				text: "Takeout menus",
				points: 5
			},
			{
				text: "Matches",
				points: 4
			}
		]
	}
];
function uid() {
	return Math.random().toString(36).slice(2, 10);
}
function loadSurveys() {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return SAMPLES;
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed) || parsed.length === 0) return SAMPLES;
		return parsed;
	} catch {
		return SAMPLES;
	}
}
function saveSurveys(surveys) {
	localStorage.setItem(KEY, JSON.stringify(surveys));
}
function newSurvey() {
	return {
		id: uid(),
		question: "",
		answers: Array.from({ length: 8 }, () => ({
			text: "",
			points: 0
		}))
	};
}
function normalizeSurvey(input) {
	const answers = (input.answers || []).map((a) => ({
		text: (a.text || "").trim(),
		points: Math.max(0, Math.round(Number(a.points) || 0))
	})).filter((a) => a.text).sort((a, b) => b.points - a.points).slice(0, 8);
	return {
		id: input.id || uid(),
		question: input.question.trim(),
		answers
	};
}
function loadSettings() {
	try {
		const raw = localStorage.getItem(SETTINGS_KEY);
		if (!raw) return {
			url: "",
			anonKey: ""
		};
		const parsed = JSON.parse(raw);
		return {
			url: parsed.url || "",
			anonKey: parsed.anonKey || ""
		};
	} catch {
		return {
			url: "",
			anonKey: ""
		};
	}
}
function saveSettings(settings) {
	localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
function loadScores() {
	try {
		const raw = localStorage.getItem(SCORES_KEY);
		if (!raw) return {
			leftName: "TEAM A",
			rightName: "TEAM B",
			leftScore: 0,
			rightScore: 0
		};
		return JSON.parse(raw);
	} catch {
		return {
			leftName: "TEAM A",
			rightName: "TEAM B",
			leftScore: 0,
			rightScore: 0
		};
	}
}
function saveScores(scores) {
	localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
}
function restBase(url) {
	return url.replace(/\/+$/, "") + "/rest/v1/surveys";
}
async function pullCloud(settings) {
	const res = await fetch(restBase(settings.url) + "?select=id,question,answers&order=id.asc", { headers: {
		apikey: settings.anonKey,
		Authorization: `Bearer ${settings.anonKey}`
	} });
	if (!res.ok) throw new Error(`Cloud read failed (${res.status})`);
	return (await res.json()).map((row) => normalizeSurvey({
		id: String(row.id),
		question: row.question,
		answers: row.answers || []
	}));
}
async function pushCloud(settings, surveys) {
	const headers = {
		apikey: settings.anonKey,
		Authorization: `Bearer ${settings.anonKey}`,
		"Content-Type": "application/json",
		Prefer: "resolution=merge-duplicates,return=minimal"
	};
	const res = await fetch(restBase(settings.url), {
		method: "POST",
		headers,
		body: JSON.stringify(surveys.map((s) => ({
			id: s.id,
			question: s.question,
			answers: s.answers
		})))
	});
	if (!res.ok) throw new Error(`Cloud save failed (${res.status})`);
}
//#endregion
export { normalizeSurvey as a, saveScores as c, newSurvey as i, saveSettings as l, loadSettings as n, pullCloud as o, loadSurveys as r, pushCloud as s, loadScores as t, saveSurveys as u };
