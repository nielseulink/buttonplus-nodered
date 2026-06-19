'use strict';

const assert = require('assert');
const { resolveLedTargets, publishLedState } = require('../nodes/lib/led-actions');

describe('resolveLedTargets', function () {
    it('returns empty for none', function () {
        assert.deepStrictEqual(resolveLedTargets('none'), []);
        assert.deepStrictEqual(resolveLedTargets(undefined), []);
    });

    it('returns single targets', function () {
        assert.deepStrictEqual(resolveLedTargets('front'), ['front']);
        assert.deepStrictEqual(resolveLedTargets('wall'), ['wall']);
    });

    it('returns both LEDs for combined selection', function () {
        assert.deepStrictEqual(resolveLedTargets('both'), ['front', 'wall']);
        assert.deepStrictEqual(resolveLedTargets('front+wall'), ['front', 'wall']);
    });
});

describe('publishLedState', function () {
    it('turns both LEDs off when led is none', async function () {
        const published = [];
        const config = {
            publish: (topic, payload) => {
                published.push({ topic, payload });
                return Promise.resolve();
            }
        };

        const base = 'buttonplus/device1/button/1-1/led';
        await publishLedState(config, {
            prefix: 'buttonplus',
            device: 'device1',
            page: 1,
            button: 1,
            led: 'none',
            color: '#a10303',
            brightness: 100,
            duration: 'none',
            skipWhenNone: false
        });

        assert.strictEqual(published.length, 6);
        assert.deepStrictEqual(
            published.map((entry) => entry.topic),
            [
                `${base}/front/rgb/set`,
                `${base}/front/brightness/set`,
                `${base}/front/on/set`,
                `${base}/wall/rgb/set`,
                `${base}/wall/brightness/set`,
                `${base}/wall/on/set`
            ]
        );
        assert.strictEqual(published[2].payload, false);
        assert.strictEqual(published[5].payload, false);
    });

    it('skips LED publish when led is none and skipWhenNone is true', async function () {
        const published = [];
        const config = {
            publish: (topic, payload) => {
                published.push({ topic, payload });
                return Promise.resolve();
            }
        };

        await publishLedState(config, {
            prefix: 'buttonplus',
            device: 'device1',
            page: 1,
            button: 1,
            led: 'none',
            skipWhenNone: true
        });

        assert.deepStrictEqual(published, []);
    });
});
