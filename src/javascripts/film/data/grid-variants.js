// Screens on the wall in scene 10. Near the centre: her other mornings.
// Further out: other people's screens, all with VOLI open somewhere.

const day = n => new Date(2026, 9, 14 + n, 8, 12);

export const GRID_VARIANTS = [
    ...[2, 3, 5, 6, 8, 11, 15, 30].map((n, i) => ({
        id: `her-day-${i + 1}`,
        kind: "her",
        day: n,
        time: day(n),
        battery: 97 - i * 6,
        appearance: "light",
        wallpaper: "wallpapers/her.jpg",
        acceptedIn: [2.1, 1.9, 1.2, 1.0, 0.7, 0.4, 0.3, 0.1][i]
    })),
    ...Array.from({ length: 12 }, (_, i) => ({
        id: `other-${i + 1}`,
        kind: "other",
        time: new Date(2026, 10, 3 + i, 7 + (i % 5), 5 + i * 4),
        battery: 30 + (i * 17) % 70,
        appearance: i % 2 ? "light" : "dark",
        wallpaper: `wallpapers/others/other-${String(i + 1).padStart(2, "0")}.jpg`,
        layout: ["docs", "messages", "voli", "finder"][i % 4]
    }))
];
