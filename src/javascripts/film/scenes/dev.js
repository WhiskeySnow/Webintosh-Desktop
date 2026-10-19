// Test-only scenes, run with ?dev=<name>. Never part of the film.

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
