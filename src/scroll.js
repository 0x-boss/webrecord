import { chromium } from 'playwright';

export const render =  async (actions , website , viewport={ width: 500, height: 720 } ) => {

    const browser = await chromium.launch({
        headless: true,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--enable-gpu',
            '--disable-software-rasterization',
            '--use-angle=vulkan',
            '--gpu-mode=advanced'
        ]
    });
    const context = await browser.newContext({
        viewport,
        recordVideo: {
            dir: "./videos",
            size: viewport
        }
        
    })

    const page = await context.newPage();
    await page.goto(website , { waitUntil: 'networkidle' });


    async function wait(page, duration) {
        await page.waitForTimeout(duration)
    }
    async function scrollBy(page, distance, duration, easing = 'easeInOutCubic') {
        await page.evaluate(({ duration, distance, easing }) => {
            const easingFunctions = {
                linear: (t) => t,
                easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
                easeInQuad: (t) => t * t,
                easeOutQuad: (t) => t * (2 - t),
                easeInOutCubic: (t) => t < 0.5
                    ? 4 * t * t * t
                    : 1 - Math.pow(-2 * t + 2, 3) / 2,
                easeOutCubic: (t) => Math.pow(t - 1, 3) + 1,
                easeInOutCirc: (t) =>
                    t < 0.5
                        ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
                        : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,
            };

            const ease = easingFunctions[easing] || easingFunctions.linear;

            const el = document.scrollingElement || document.documentElement;
            const startY = el.scrollTop;
            const viewportH = window.innerHeight;
            const distPx = (distance / 100) * viewportH;

            const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
            const targetY = Math.max(0, Math.min(maxScroll, startY + distPx));

            if (!Number.isFinite(duration) || duration <= 0) {
                el.scrollTop = targetY;
                return;
            }

            const start = performance.now();

            return new Promise((resolve) => {
                function step(now) {
                    const p = Math.min(1, (now - start) / duration);
                    const y = startY + (targetY - startY) + (startY - targetY) * (1 - ease(p));
                    el.scrollTop = y;
                    if (p < 1) {
                        requestAnimationFrame(step);
                    } else {
                        resolve();
                    }
                }
                requestAnimationFrame(step);
            });
        }, { duration, distance, easing });
    }

    async function scrollAll(page, duration, easing = 'easeInOutCubic') {
        await page.evaluate(({ duration, distance, easing }) => {
            const easingFunctions = {
                linear: (t) => t,
                easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
                easeInQuad: (t) => t * t,
                easeOutQuad: (t) => t * (2 - t),
                easeInOutCubic: (t) => t < 0.5
                    ? 4 * t * t * t
                    : 1 - Math.pow(-2 * t + 2, 3) / 2,
                easeOutCubic: (t) => Math.pow(t - 1, 3) + 1,
                easeInOutCirc: (t) =>
                    t < 0.5
                        ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
                        : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,
            };

            const ease = easingFunctions[easing] || easingFunctions.linear;

            const el = document.scrollingElement || document.documentElement;
            const startY = el.scrollTop;


            const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
            const targetY = Math.max(0, maxScroll);

            if (!Number.isFinite(duration) || duration <= 0) {
                el.scrollTop = targetY;
                return;
            }

            const start = performance.now();

            return new Promise((resolve) => {
                function step(now) {
                    const p = Math.min(1, (now - start) / duration);
                    const y = startY + (targetY - startY) + (startY - targetY) * (1 - ease(p));
                    el.scrollTop = y;
                    if (p < 1) {
                        requestAnimationFrame(step);
                    } else {
                        resolve();
                    }
                }
                requestAnimationFrame(step);
            });
        }, { duration, easing });
    }

    async function loopScroll(
        page,
        type = 'byiterations',
        distance = 100,
        duration,
        delay = 0,
        iterations = 1,
        easing = 'easeInOutCubic'
    ) {
        for (let i = 0; i < iterations; i++) {
            switch (type) {
                case 'byiterations':
                    await scrollBy(page, distance, duration, easing);
                    break;

                case 'allpage':
                    await page.evaluate(
                        async ({ distance, duration, easing, delay }) => {
                            const el = document.scrollingElement || document.documentElement;

                            const stepPx = Math.max(1, Math.floor((window.innerHeight * distance) / 100));
                            const easingFunctions = {
                                linear: (t) => t,
                                easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
                                easeInQuad: (t) => t * t,
                                easeOutQuad: (t) => t * (2 - t),
                                easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
                                easeOutCubic: (t) => Math.pow(t - 1, 3) + 1,
                                easeInOutCirc: (t) =>
                                    t < 0.5
                                        ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
                                        : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,
                            };
                            const ease = easingFunctions[easing] || easingFunctions.linear;

                            const smoothScrollBy = async (px, ms) => {
                                if (!ms || ms <= 0) {
                                    window.scrollBy(0, px);
                                    return;
                                }
                                const startY = window.scrollY;
                                const currentEl = document.scrollingElement || document.documentElement;
                                const targetY = Math.min(startY + px, currentEl.scrollHeight - currentEl.clientHeight);
                                const total = targetY - startY;
                                const start = performance.now();

                                await new Promise((resolve) => {
                                    const tick = (now) => {
                                        const t = Math.min(1, (now - start) / ms);
                                        const y = startY + total * ease(t);
                                        window.scrollTo(0, y);
                                        if (t < 1) requestAnimationFrame(tick);
                                        else resolve();
                                    };
                                    requestAnimationFrame(tick);
                                });
                            };

                            // Recompute maxScroll each step to handle lazy/infinite loading
                            // and pause between steps if delay > 0
                            while (true) {
                                const curEl = document.scrollingElement || document.documentElement;
                                const maxScroll = Math.max(0, curEl.scrollHeight - curEl.clientHeight);
                                if (window.scrollY >= maxScroll) break;

                                await smoothScrollBy(stepPx, duration);

                                if (delay > 0) {
                                    await new Promise((r) => setTimeout(r, delay));
                                }
                            }
                        },
                        { distance, duration, easing, delay }
                    );
                    break;
            }

            // Keep an inter-iteration delay only for per-iteration scrolling
            if (delay > 0 && type === 'byiterations') {
                await page.waitForTimeout(delay);
            }
        }
    }




    const timeline = async (actions = []) => {
        actions.sort((b, a) => b.i - a.i)
        for (let i = 0; i < actions.length; i++) {
            const action = actions[i];
            switch (action.type) {
                case "wait":
                    await wait(page, action.duration)
                    break;
                case "scrollby":
                    await scrollBy(page, action.distance, action.duration, action?.easing)
                    break;
                case "scrollall":
                    await scrollAll(page, action.duration, action?.easing)
                    break;
                case "loopscroll":
                    await loopScroll(page, action.scrolltype, action?.distance, action.duration, action.delay, action.iterations, action?.easing)
                    break;
            }

        }
        console.log("Done.");
        await context.close();
        
        const videoPath = await page.video().path();
        console.log(`Video saved to: ${videoPath}`);
    }


    await timeline(actions)
};

    const actions = [
        { type: "wait", duration: 6500, i: 1 },
        //    {type:"scrollby",duration:3000,distance:100,easing:'easeInOutCubic',i:2},
        //   {type:"scrollall",duration:40000,easing:"easeInOutCubic",i:3}
        { type: "loopscroll", scrolltype: "allpage", distance: 100, duration: 2000, iterations: 3, delay: 0, easing: "easeInOutCubic", i: 4 }
    ]
render(actions, 'https://www.example.com');