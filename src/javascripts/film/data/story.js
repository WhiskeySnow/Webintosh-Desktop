// Script data for the film. Every value here comes from the design spec
// (docs/superpowers/specs/2026-10-19-screenlife-film-design.md).

const at = (month, day, hour, minute) => new Date(2026, month - 1, day, hour, minute);

export const SCENES = [
    { id: "00-cold-open", title: "Cold open", targetMs: 25000 },
    { id: "01-mia", title: "Mia", targetMs: 30000 },
    { id: "02-install", title: "Install", targetMs: 20000 },
    { id: "03-questions", title: "Questions", targetMs: 40000 },
    { id: "04-observation", title: "Observation", targetMs: 15000 },
    { id: "05-responsibility", title: "Responsibility", targetMs: 25000 },
    { id: "06-handover", title: "Handover", targetMs: 15000 },
    { id: "07-autopilot", title: "Autopilot", targetMs: 20000 },
    { id: "08-mia-again", title: "Mia again", targetMs: 20000 },
    { id: "09-cant-quit", title: "Can't quit", targetMs: 15000 },
    { id: "10-days", title: "Many days", targetMs: 35000 },
    { id: "11-pass-it-on", title: "Pass it on", targetMs: 25000 }
];

// World state at the start of each scene.
export const TIMELINE = [
    { time: at(10, 14, 23, 47), battery: 23, appearance: "dark" },
    { time: at(10, 14, 23, 47), battery: 23, appearance: "dark" },
    { time: at(10, 14, 23, 49), battery: 22, appearance: "dark" },
    { time: at(10, 14, 23, 50), battery: 22, appearance: "dark" },
    { time: at(10, 14, 23, 51), battery: 22, appearance: "dark" },
    { time: at(10, 14, 23, 52), battery: 22, appearance: "dark" },
    { time: at(10, 14, 23, 53), battery: 22, appearance: "dark" },
    { time: at(10, 14, 23, 54), battery: 22, appearance: "dark" },
    { time: at(10, 14, 23, 57), battery: 21, appearance: "dark" },
    { time: at(10, 14, 23, 58), battery: 21, appearance: "dark" },
    { time: at(10, 15, 8, 12), battery: 96, appearance: "light" },
    { time: at(11, 24, 23, 47), battery: 18, appearance: "dark" }
];

// Desktop icons in Finder's default order, from the top-right corner down.
export const DESKTOP_FILES = [
    { name: "Time-Based Media", thumb: "icons/folder.png" },
    { name: "Screenshots", thumb: "icons/folder.png" },
    { name: "pros and cons (3).docx", thumb: "thumbs/th-proscons.png", page: true },
    { name: "transfer application (unsubmitted).pdf", thumb: "thumbs/th-transfer.png", page: true },
    { name: "unsent.txt", thumb: "thumbs/th-unsent.png", page: true },
    { name: "soundwalk_take4.wav", thumb: "thumbs/th-wav.png" },
    { name: "midterm proposal FINAL (2).docx", thumb: "thumbs/th-proposal.png", page: true },
    { name: "IMG_4471.HEIC", thumb: "thumbs/th-img.png" },
    { name: "Screenshot 2026-10-14 at 1.12.47 AM.png", thumb: "thumbs/th-ss.png" },
    { name: "mia bday ideas.txt", thumb: "thumbs/th-bday.png", page: true }
];

export const SELECTED_FILE = "unsent.txt";

export const STICKY_LINES = [
    "TBM proposal — Thu 9AM",
    "call mom back",
    "decide transfer by Fri??",
    "laundry (actually)",
    "return jordan’s charger"
];

export const DOC_TEXT = {
    title: "TBM Midterm Proposal",
    workingTitle: "???",
    concept: "I want to make something about how I can never decide anything without asking three people first. Maybe a piece where the viewer makes every choice for me and I just"
};

export const CONTACTS = [
    { id: "mia", name: "Mia Chen", short: "Mia", pinned: true, avatar: "avatars/av-mia.jpg" },
    { id: "mom", name: "Mom", short: "Mom", pinned: true, initials: "M" },
    { id: "floor", name: "3rd floor 🪴", short: "3rd floor 🪴", pinned: true, avatar: "avatars/av-floor.jpg" },
    { id: "jordan", name: "Jordan (TBM)", avatar: "avatars/av-jordan.jpg", unread: true,
        last: { time: at(10, 14, 22, 2), text: "did u pick a topic yet. i’m doing sound again lol" } },
    { id: "sam", name: "Sam Okafor", initials: "SO",
        last: { time: at(10, 14, 20, 41), text: "lmk if u want food tmrw, i’m free after 2" } },
    { id: "dad", name: "Dad", initials: "D",
        last: { time: at(10, 11, 9, 30), text: "Mom said you sounded stressed. Everything ok? Call when you can" } },
    { id: "daniel", name: "Daniel Kim", initials: "DK",
        last: { time: at(10, 12, 18, 15), text: "haha ok see u thursday" } },
    { id: "ig", name: "32665", initials: "32…",
        last: { time: at(10, 10, 14, 3), text: "Your Instagram code is 482 913. Don’t share it." } }
];

export const MIA_HISTORY = [
    { from: "them", text: "did u eat", time: at(10, 13, 16, 12) },
    { from: "me", text: "kinda", time: at(10, 13, 16, 13) },
    { from: "them", text: "kinda???", time: at(10, 13, 16, 13) }
];

// Directions are in English so they can be passed straight to a TTS prompt.
export const VOICE_LINES = [
    { id: "P1a", role: "her", text: "I just", direction: "very soft, half to herself" },
    { id: "P1b", role: "her", text: "I just…", direction: "even softer, trailing off" },
    { id: "P2", role: "her", text: "what is it?", direction: "curious, tired" },
    { id: "P3", role: "her", text: "send it lol", direction: "offhand, doesn't care" },
    { id: "P4", role: "her", text: "kinda this is weird", direction: "a little uneasy, laughing it off" },
    { id: "P5", role: "her", text: "yeah delete", direction: "decisive, gets cut off mid-word" },
    { id: "M1", role: "mia", text: "you need to try this lol", direction: "bright, excited" },
    { id: "M2", role: "mia", text: "this weird app i found", direction: "casual" },
    { id: "M3", role: "mia", text: "it asks you random stuff and then guesses what you’re gonna pick", direction: "fast" },
    { id: "M4", role: "mia", text: "it’s lowkey way too accurate", direction: "laughing" },
    { id: "M5", role: "mia", text: "tell me if it gets you right lol", direction: "casual" },
    { id: "M6", role: "mia", text: "did it get you right??", direction: "curious" },
    { id: "M7", role: "mia", text: "wait", direction: "suddenly serious" },
    { id: "M8", role: "mia", text: "should i delete it lol", direction: "half joking, a little uneasy" }
];

export const HOVER = { stay: 2.3, truth: 0.4 };

export const DAYS = [
    { day: 1, date: at(10, 15, 8, 12), acceptedIn: 2.3,
        items: [["Lunch", "Ramen"], ["Outfit", "Black hoodie, jeans"], ["Playlist", "On Repeat"]] },
    { day: 4, date: at(10, 18, 8, 12), acceptedIn: 1.4,
        items: [["Reply to Mom", "“busy this week, call sunday”"], ["Sam’s dinner", "Skip"]] },
    { day: 9, date: at(10, 23, 8, 12), acceptedIn: 0.6,
        items: [["Transfer", "Stay (application withdrawn)"], ["TBM proposal", "Submitted"]] },
    { day: 23, date: at(11, 6, 8, 12), acceptedIn: 0.2,
        items: [["Mia Chen", "Mute conversation"], ["Jordan (TBM)", "Decline"]] },
    { day: 40, date: at(11, 23, 8, 12), acceptedIn: 0, items: [],
        note: "Today’s choices were made for you." }
];

// Camera notes for Premiere, keyed by scene and beat (spec §7).
export const SHOTS = {
    "00-cold-open": {
        hold: "从 130% 对准 “I just” 开始",
        "to-file": "随光标移向桌面，慢慢拉到 100%",
        "mia-notify": "通知出现时向右上角轻推"
    },
    "01-mia": {
        "type-what": "推到 160% 对准输入框",
        "type-send": "推到 160% 对准输入框",
        link: "链接卡片出现时拉回 120%"
    },
    "02-install": {
        download: "140% 跟着下载 → Finder",
        gatekeeper: "安全警告居中 150%"
    },
    "03-questions": {
        q1: "120% 不动",
        "q4-hover": "悬停的 2.3 秒里缓慢推到 200% 对准 Stay comfortable"
    },
    "04-observation": {
        observation: "卡片静止",
        line: "那句话出现后，5 秒内极慢推近 5%",
        silence: "低频嗡鸣进入"
    },
    "05-responsibility": {
        prompt: "150% 对准权限弹窗",
        settings: "平移到系统设置",
        "stop-short": "200% 对准开关"
    },
    "06-handover": {
        takeover: "从这一帧起镜头停止漂移（之后只用线性关键帧）",
        "roomtone-out": "房间底噪 2 秒内淡出，之后不再出现"
    },
    "07-autopilot": {
        doc: "线性匀速平移到文档，停 2 秒",
        sticky: "线性匀速平移到便利贴，停 2 秒",
        rename: "线性匀速平移到文件名，停 2 秒"
    },
    "08-mia-again": {
        "yeah-delete": "200% 对准 Messages 输入框",
        erase: "停在字被逐个删掉的过程上"
    },
    "09-cant-quit": {
        start: "回到 100%，漂移恢复"
    },
    "10-days": {
        "day-1": "硬切进入白天；在菜单栏日期变化这一帧切",
        "day-4": "跳切",
        "day-9": "跳切",
        "day-23": "跳切",
        "day-40": "跳切",
        grid: "拉远由网页渲染，Premiere 只加少量运动模糊",
        "music-stop": "音乐戛然而止，静止 2 秒"
    },
    "11-pass-it-on": {
        start: "硬切回深夜",
        "messages-open": "100% 看 Messages 自己打字",
        "daniel-typing": "推近“正在输入…”",
        black: "切黑"
    }
};
