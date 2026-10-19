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
    }
};
