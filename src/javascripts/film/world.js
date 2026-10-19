// The film's fictional clock and the macOS formats that read from it.
// Every on-screen time comes from here; the real clock is never used.

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_MS = 24 * 60 * 60 * 1000;

export function formatTime(date) {
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours % 12 || 12}:${minutes} ${hours < 12 ? "AM" : "PM"}`;
}

export function formatMenuClock(date) {
    const weekday = WEEKDAYS[date.getDay()].slice(0, 3);
    return `${weekday} ${MONTHS[date.getMonth()]} ${date.getDate()}  ${formatTime(date)}`;
}

function calendarDaysBetween(earlier, later) {
    const a = new Date(earlier.getFullYear(), earlier.getMonth(), earlier.getDate());
    const b = new Date(later.getFullYear(), later.getMonth(), later.getDate());
    return Math.round((b - a) / DAY_MS);
}

function shortDate(date) {
    return `${date.getMonth() + 1}/${date.getDate()}/${String(date.getFullYear()).slice(-2)}`;
}

function dayName(date, now) {
    const days = calendarDaysBetween(date, now);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days > 1 && days < 7) return WEEKDAYS[date.getDay()];
    return shortDate(date);
}

export function formatListLabel(date, now) {
    const day = dayName(date, now);
    return day === "Today" ? formatTime(date) : day;
}

export function formatChatStamp(date, now) {
    return { day: dayName(date, now), time: formatTime(date) };
}

export function formatDockDay(date) {
    return { month: MONTHS[date.getMonth()].toUpperCase(), day: String(date.getDate()) };
}

export function createWorld(initial) {
    let state = { ...initial };
    const listeners = new Set();
    return {
        get: () => state,
        set(patch) {
            state = { ...state, ...patch };
            listeners.forEach(listener => listener(state));
        },
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        }
    };
}
