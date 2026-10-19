// Test-only scenes, run with ?dev=<name>. Never part of the film.

import { DAYS } from "../data/story.js";

function inputFixture(stage) {
    stage.insertAdjacentHTML("beforeend", `
        <button id="dev-a" style="position:absolute;left:300px;top:300px;width:160px;height:60px">A</button>
        <button id="dev-b" style="position:absolute;left:1400px;top:700px;width:160px;height:60px">B</button>
        <input id="dev-input" style="position:absolute;left:700px;top:500px;width:400px;height:32px">`);
    const counts = { a: 0, b: 0 };
    stage.querySelector("#dev-a").addEventListener("click", () => counts.a++);
    stage.querySelector("#dev-b").addEventListener("click", () => counts.b++);
    return counts;
}

const countSounds = (film, pattern, from) => film.audioLog.slice(from).filter(entry => pattern.test(entry.id)).length;

export const devScenes = {
    "dev-anchors": {
        id: "dev-anchors",
        async run(ctx) {
            await ctx.at(1000);
            ctx.beat("a");
            await ctx.wait(600);
            ctx.beat("b");
            await ctx.at(1200);
            ctx.beat("c");
        }
    },
    "dev-input": {
        id: "dev-input",
        async run({ stage, cursor, keyboard, sound, film, timeline }) {
            const counts = inputFixture(stage);
            const results = film.results = {};

            await cursor.moveTo("#dev-a", { mode: "human" });
            await cursor.click({ mode: "human" });
            results.clicksA = counts.a;
            results.clickSoundsAfterHuman = countSounds(film, /^click$/, 0);

            await cursor.moveTo("#dev-b", { mode: "machine" });
            await cursor.click({ mode: "machine" });
            results.clicksB = counts.b;
            results.clickSoundsAfterMachine = countSounds(film, /^click$/, 0);

            await cursor.moveTo({ x: 200, y: 900 }, { mode: "machine" });
            const start = { ...cursor.pos };
            const b = stage.querySelector("#dev-b").getBoundingClientRect();
            const scale = Number(stage.dataset.scale);
            const s = stage.getBoundingClientRect();
            const end = { x: (b.left - s.left + b.width / 2) / scale, y: (b.top - s.top + b.height / 2) / scale };
            await cursor.moveTo("#dev-b", { mode: "human", until: 0.7 });
            const along = (cursor.pos.x - start.x) * (end.x - start.x) + (cursor.pos.y - start.y) * (end.y - start.y);
            results.untilFraction = along / ((end.x - start.x) ** 2 + (end.y - start.y) ** 2);

            const input = stage.querySelector("#dev-input");
            let mark = film.audioLog.length;
            await keyboard.type(input, ["no keep it"], { mode: "machine" });
            results.machineValue = input.value;
            results.keySoundsDuringMachine = countSounds(film, /^(key\d|space|return)$/, mark);

            input.value = "";
            mark = film.audioLog.length;
            const began = timeline.t;
            await keyboard.type(input, ["what is it?"], { mode: "human", voice: "P2" });
            results.humanElapsed = timeline.t - began;
            results.p2Duration = sound.duration("P2");
            results.humanValue = input.value;
            results.p2Played = film.audioLog.slice(mark).some(entry => entry.id === "P2");
            results.keySoundsDuringHuman = countSounds(film, /^(key\d|space)$/, mark);
        }
    },
    "dev-shell": {
        id: "dev-shell",
        async run({ ui, world, film, stage }) {
            const { shell, notifications, windows } = ui;
            const results = film.results = {};
            const text = selector => stage.querySelector(selector)?.textContent;

            ["Finder", "Safari", "Messages", "Mail", "Calendar", "Stickies"].forEach(app => shell.dock.setRunning(app, true));
            shell.dock.setBadge("Mail", 214);
            shell.desktop.select("unsent.txt", { focused: false });

            results.clockBefore = text(".mb-clock");
            world.set({ time: new Date(2026, 9, 14, 23, 48) });
            results.clockAfter = text(".mb-clock");
            world.set({ time: new Date(2026, 9, 14, 23, 47) });
            results.battery = text(".mb-battery-text");
            results.dockDay = [text(".dock-cal-month"), text(".dock-cal-day")];
            results.mailBadge = text('[data-app="Mail"] .badge');
            results.names = shell.desktop.names();
            results.unsentSelection = shell.desktop.icon("unsent.txt").dataset.selection;

            const mark = film.audioLog.length;
            notifications.show({ app: "Messages", icon: "icons/messages.png", title: "Mia Chen", body: "you need to try this lol" });
            notifications.show({ app: "Calendar", calendar: { month: "OCT", day: "15" }, title: "TBM Midterm Proposal", body: "Tomorrow · 370 Jay St, Room 410", time: "9:00 AM" });
            results.firstBannerTitle = text(".nb .nb-title");
            results.soundsAfterTwo = film.audioLog.length - mark;
            const silent = notifications.show({ app: "VOLI", icon: "icons/voli.svg", title: "VOLI", body: "silent", silent: true });
            results.soundsAfterSilent = film.audioLog.length - mark;
            notifications.dismiss(silent);

            world.set({ appearance: "light" });
            results.lightAppearance = stage.dataset.appearance;
            const bg = getComputedStyle(stage.querySelector(".nb")).backgroundColor.match(/\d+/g).map(Number);
            results.lightBannerLuminance = 0.2126 * bg[0] + 0.7152 * bg[1] + 0.0722 * bg[2];
            world.set({ appearance: "dark" });

            shell.menubar.showExtra("voli", '<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>');
            const menu = shell.menubar.openExtraMenu("voli", ["Quit VOLI"]);
            results.quitItem = Boolean(menu.item("Quit VOLI"));
            menu.close();

            windows.create({ id: "a", app: "Finder", menus: ["File"], x: 100, y: 100, w: 300, h: 200 });
            windows.create({ id: "b", app: "Messages", menus: ["File", "Edit"], x: 500, y: 100, w: 300, h: 200 });
            windows.focus("b");
            results.windows = windows.snapshot();
            results.menuApp = text(".mb-app");
            windows.get("a").close();
            windows.get("b").close();
        }
    },
    "dev-apps": {
        id: "dev-apps",
        async run({ ui, film, cursor }) {
            const { safari, finder, stickies, windows } = ui;
            const results = film.results = {};
            finder.openFolder("Time-Based Media");
            safari.openDocs();
            stickies.open();
            windows.focus("safari");
            results.docText = safari.docText.textContent;
            results.docParagraph = safari.docText.parentElement.textContent.trim();

            safari.openVoliSite();
            results.siteHasDownload = safari.downloadButton.textContent === "Download for Mac";
            results.activeTab = safari.el.querySelector(".stab.on").textContent.trim();
            results.tabCount = safari.el.querySelectorAll(".stab").length;
            results.address = safari.el.querySelector(".saddr-text").textContent;
            await safari.download("VOLI.dmg", 800);
            results.downloadItem = safari.downloadItem.querySelector(".dl-name").textContent;

            finder.openDmg();
            results.dmgHasVoli = Boolean(finder.item("VOLI"));
            results.dmgHasApplications = Boolean(finder.item("Applications"));
            let dropped = false;
            finder.item("Applications").addEventListener("film-drop", () => { dropped = true; });
            await cursor.drag(finder.item("VOLI"), finder.item("Applications"), { mode: "machine" });
            results.droppedOnApplications = dropped;
            await finder.copy(600);
            finder.openApplications();
            results.appsHaveVoli = Boolean(finder.item("VOLI"));

            stickies.strike(2);
            results.struck = getComputedStyle(stickies.line(2)).textDecorationLine;
            const added = stickies.appendLine();
            results.lastLineIsNew = added === stickies.line(5);
        }
    },
    "dev-desktop": {
        id: "dev-desktop",
        async run({ ui }) {
            const { shell, safari, finder, stickies, windows, notifications } = ui;
            ["Finder", "Safari", "Messages", "Mail", "Calendar", "Stickies"].forEach(app => shell.dock.setRunning(app, true));
            shell.dock.setBadge("Mail", 214);
            shell.dock.setBadge("Messages", 1);
            shell.desktop.select("unsent.txt", { focused: false });
            finder.openFolder("Time-Based Media");
            safari.openDocs();
            stickies.open();
            windows.focus("safari");
            notifications.show({ app: "Calendar", calendar: { month: "OCT", day: "15" }, title: "TBM Midterm Proposal", body: "Tomorrow · 370 Jay St, Room 410", time: "9:00 AM", silent: true });
            notifications.show({ app: "Messages", icon: "icons/messages.png", title: "Mia Chen", body: "you need to try this lol", silent: true });
        }
    },
    "dev-messages": {
        id: "dev-messages",
        async run({ ui, world, film, stage }) {
            const { messages, windows } = ui;
            const results = film.results = {};
            const text = selector => stage.querySelector(selector)?.textContent.trim();
            world.set({ time: new Date(2026, 9, 14, 23, 48) });
            messages.open("mia");
            windows.focus("messages");
            results.header = text(".mh-to");
            results.rows = [...stage.querySelectorAll(".mrow .mrow-name")].map(n => n.textContent.trim());
            results.miaPinnedCurrent = stage.querySelector('.mpin[data-contact="mia"]').classList.contains("cur");
            results.danielLabel = messages.listLabel("daniel");
            results.dadLabel = messages.listLabel("dad");

            const before = stage.querySelectorAll(".bubble").length;
            ["one", "two", "three"].forEach(t => messages.bubble("mia", { from: "them", text: t, silent: true }));
            results.tails = [...stage.querySelectorAll(".bubble")].slice(before).map(b => b.classList.contains("tail"));

            const mark = film.audioLog.length;
            messages.input.value = "send it lol";
            results.sentText = messages.send().textContent;
            results.sendSounds = film.audioLog.slice(mark).filter(e => e.id === "send").length;
            messages.input.value = "quiet";
            messages.send({ silent: true });
            results.sendSoundsAfterSilent = film.audioLog.slice(mark).filter(e => e.id === "send").length;
            messages.receipt("Read 11:48 PM");
            results.receipt = text(".receipt");

            messages.typing(true);
            results.typingShown = Boolean(stage.querySelector(".typing"));
            messages.typing(false);
            results.typingGone = !stage.querySelector(".typing");
            messages.link("mia", { from: "them", silent: true });
            results.linkTitle = text(".link-card .link-title");

            world.set({ time: new Date(2026, 10, 24, 23, 47) });
            results.danielLabelLater = messages.listLabel("daniel");
        }
    },
    "dev-messages-view": {
        id: "dev-messages-view",
        async run({ ui, world, cursor }) {
            const { messages, windows, safari, shell } = ui;
            ["Finder", "Safari", "Messages", "Mail", "Calendar", "Stickies"].forEach(app => shell.dock.setRunning(app, true));
            shell.dock.setBadge("Mail", 214);
            world.set({ time: new Date(2026, 9, 14, 23, 47), battery: 22 });
            safari.openDocs();
            messages.open("mia");
            windows.focus("messages");
            const say = (from, text) => messages.bubble("mia", { from, text, silent: true });
            say("them", "you need to try this lol");
            messages.input.value = "what is it?";
            messages.send({ silent: true });
            say("them", "this weird app i found");
            say("them", "it asks you random stuff and then guesses what you’re gonna pick");
            say("them", "it’s lowkey way too accurate 😭");
            world.set({ time: new Date(2026, 9, 14, 23, 48) });
            messages.input.value = "send it lol";
            messages.send({ silent: true });
            messages.receipt("Read 11:48 PM");
            world.set({ time: new Date(2026, 9, 14, 23, 49) });
            messages.link("mia", { from: "them", silent: true });
            messages.typing(true);
            await cursor.moveTo(".link-card", { mode: "machine", offset: { x: -20, y: 70 } });
        }
    },
    "dev-voli": {
        id: "dev-voli",
        async run({ ui, film, cursor }) {
            const { voli, windows } = ui;
            const results = film.results = {};
            const body = () => voli.el.querySelector(".voli-body").innerText.replace(/\s+/g, " ");
            voli.open();
            windows.focus("voli");
            voli.show("welcome");
            results.welcome = body();
            voli.show("question", { index: 4, prompt: "Would you rather know the truth, or stay comfortable?", options: ["Know the truth", "Stay comfortable"] });
            results.question = body();
            results.optionFound = Boolean(voli.option("Stay comfortable"));
            voli.show("observation");
            results.observation = body();
            const line = voli.appendLine("You deleted “I just” twice before Mia texted you.");
            results.lineAfterCard = line.previousElementSibling?.classList.contains("vcard") === true;
            results.lineText = line.textContent;
            voli.show("autopilot");
            results.autopilot = body();
            voli.show("control");
            results.control = body();
            voli.show("thanks");
            results.thanks = body();
            voli.show("daily", { day: DAYS[2] });
            results.daily = body();
            await cursor.moveTo(voli.button("Accept All"), { mode: "machine" });
            await cursor.click({ mode: "machine" });
            results.acceptedText = voli.el.querySelector(".v-accepted").textContent;
        }
    },
    "dev-voli-view": {
        id: "dev-voli-view",
        async run({ ui, world }) {
            const { voli, windows, shell } = ui;
            ["Finder", "Safari", "Messages", "Mail", "Calendar", "Stickies"].forEach(app => shell.dock.setRunning(app, true));
            shell.dock.add("VOLI", "assets/film/icons/voli.svg");
            shell.dock.setRunning("VOLI", true);
            const params = new URLSearchParams(location.search);
            if (params.get("light") === "1") {
                world.set({ appearance: "light", time: DAYS[2].date, battery: 88 });
                voli.open();
                windows.focus("voli");
                voli.show("daily", { day: DAYS[2] });
            } else {
                voli.open();
                windows.focus("voli");
                voli.show("observation");
                voli.appendLine("You deleted “I just” twice before Mia texted you.");
            }
        }
    },
    "dev-system": {
        id: "dev-system",
        async run({ ui, film }) {
            const { system } = ui;
            const results = film.results = {};
            const text = dialog => dialog.el.innerText.replace(/\s+/g, " ");
            const labels = dialog => [...dialog.el.querySelectorAll(".alert-btn")].map(b => b.textContent);

            const gate = system.gatekeeper({ app: "VOLI", browser: "Safari", time: "11:49 PM", host: "voli.app" });
            results.gatekeeper = text(gate);
            results.gatekeeperButtons = labels(gate);
            gate.close();

            const prompt = system.accessibilityPrompt("VOLI");
            results.prompt = text(prompt);
            results.promptButtons = labels(prompt);
            prompt.close();

            const trash = system.trashError("VOLI");
            results.trash = text(trash);
            results.finderErrorPlayed = film.audioLog.some(e => e.id === "finderError");
            trash.close();

            system.settings.openAccessibility([
                { name: "Raycast", icon: "icons/raycast.png", on: true },
                { name: "zoom.us", icon: "icons/zoom.png", on: true },
                { name: "VOLI", icon: "icons/voli.svg", on: false }
            ]);
            results.rows = [...document.querySelectorAll(".acc-row .acc-name")].map(n => n.textContent);
            results.settingsTitle = document.querySelector(".set-title").textContent;
            results.voliOnBefore = system.settings.toggle("VOLI").classList.contains("on");
            system.settings.setOn("VOLI", true, { sound: "toggle" });
            results.voliOnAfter = system.settings.toggle("VOLI").classList.contains("on");
            results.togglePlayed = film.audioLog.some(e => e.id === "toggle");
        }
    },
    "dev-system-view": {
        id: "dev-system-view",
        async run({ ui }) {
            const { system, voli, windows } = ui;
            voli.open();
            voli.show("autopilot");
            windows.focus("voli");
            const which = new URLSearchParams(location.search).get("which");
            if (which === "settings") {
                system.settings.openAccessibility([
                    { name: "Raycast", icon: "icons/raycast.png", on: true },
                    { name: "zoom.us", icon: "icons/zoom.png", on: true },
                    { name: "VOLI", icon: "icons/voli.svg", on: false }
                ]);
            } else if (which === "gate") {
                system.gatekeeper({ app: "VOLI", browser: "Safari", time: "11:49 PM", host: "voli.app" });
            } else {
                system.accessibilityPrompt("VOLI");
            }
        }
    },
    "dev-sound": {
        id: "dev-sound",
        async run(ctx) {
            ctx.sound.play("key1");
            await ctx.wait(100);
            ctx.sound.play("send");
        }
    },
    "dev-sound-missing": {
        id: "dev-sound-missing",
        async run(ctx) {
            await ctx.sound.load({ voice: { MISSING: { path: "voice/MISSING.wav", text: "0123456789" } } });
        }
    }
};
