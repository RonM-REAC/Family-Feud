//#region node_modules/.nitro/vite/services/ssr/assets/_tanstack-start-manifest_v-DtBGVsoE.js
var tsrStartManifest = () => ({ routes: {
	__root__: {
		filePath: "/workspace/src/routes/__root.tsx",
		children: [
			"/",
			"/admin",
			"/board"
		],
		preloads: ["/assets/index-CcaTzmEb.js"],
		scripts: [{ attrs: {
			type: "module",
			async: !0,
			src: "/assets/index-CcaTzmEb.js"
		} }]
	},
	"/": {
		filePath: "/workspace/src/routes/index.tsx",
		children: void 0,
		preloads: ["/assets/routes-BbtxKPjV.js", "/assets/site-nav-BidAUcmR.js"]
	},
	"/admin": {
		filePath: "/workspace/src/routes/admin.tsx",
		children: void 0,
		preloads: [
			"/assets/admin-BJPDPcx6.js",
			"/assets/site-nav-BidAUcmR.js",
			"/assets/surveys-DdIGoXAm.js"
		]
	},
	"/board": {
		filePath: "/workspace/src/routes/board.tsx",
		children: void 0,
		preloads: [
			"/assets/board-Ckr_iGOs.js",
			"/assets/site-nav-BidAUcmR.js",
			"/assets/surveys-DdIGoXAm.js"
		]
	}
} });
//#endregion
export { tsrStartManifest };
