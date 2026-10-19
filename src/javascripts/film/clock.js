// One virtual clock drives the whole film. Waits are anchored to the scheduled
// time (the cursor), not to "now", so small frame delays never accumulate.

const defaultNow = () => performance.now();
const defaultSleep = () => new Promise(resolve => requestAnimationFrame(() => resolve()));
const never = () => new Promise(() => {});

export class Timeline {
    constructor({ now = defaultNow, sleep = defaultSleep, rate = 1 } = {}) {
        this.now = now;
        this.sleep = sleep;
        this.rate = rate;
        this.startedAt = null;
        this.scheduled = 0;
        this.frozenAt = null;
    }

    start() {
        this.startedAt = this.now();
    }

    get t() {
        if (this.startedAt === null) {
            return 0;
        }
        const elapsed = (this.now() - this.startedAt) * this.rate;
        return this.frozenAt === null ? elapsed : Math.min(elapsed, this.frozenAt);
    }

    get cursor() {
        return this.scheduled;
    }

    freezeAt(ms) {
        this.frozenAt = ms;
    }

    async wait(ms) {
        this.scheduled += ms;
        await this.reach(this.scheduled);
    }

    async until(ms) {
        this.scheduled = Math.max(this.scheduled, ms);
        await this.reach(this.scheduled);
    }

    async animate(durationMs, onProgress) {
        const from = this.scheduled;
        const to = from + durationMs;
        this.scheduled = to;
        const frozenInside = this.frozenAt !== null && this.frozenAt < to;

        while (this.t < to) {
            onProgress(durationMs > 0 ? Math.max(0, (this.t - from) / durationMs) : 1);
            if (frozenInside && this.t >= this.frozenAt) {
                return never();
            }
            await this.sleep();
        }
        onProgress(1);
    }

    async reach(target) {
        const limit = this.frozenAt !== null && this.frozenAt < target ? this.frozenAt : target;
        while (this.t < limit) {
            await this.sleep();
        }
        if (limit < target) {
            return never();
        }
    }
}
