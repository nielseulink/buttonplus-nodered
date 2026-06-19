'use strict';

const assert = require('assert');
const {
    DEBUG_PROPERTY,
    createPublishSession,
    wrapConfigForTrace
} = require('../nodes/lib/debug-output');

describe('debug output', function () {
    it('passes through config when debug is disabled', async function () {
        const config = {
            qos: 1,
            retain: false,
            publish(topic, payload) {
                return Promise.resolve({ topic, payload });
            }
        };

        const session = createPublishSession(config, false);
        assert.strictEqual(session.config, config);
        assert.strictEqual(session.getDebugInfo({ payload: 1 }), null);
    });

    it('records mqtt publishes when debug is enabled', async function () {
        const config = {
            qos: 2,
            retain: true,
            publish(topic, payload, options) {
                return Promise.resolve({ topic, payload, options });
            }
        };

        const session = createPublishSession(config, true);
        await session.config.publish('buttonplus/device/page/set', '2');
        await session.config.publish('buttonplus/device/brightness/set', 80, { qos: 0, retain: false });

        const debugInfo = session.getDebugInfo({ page: 2, brightness: 80 });

        assert.deepStrictEqual(debugInfo.input, { page: 2, brightness: 80 });
        assert.deepStrictEqual(debugInfo.mqtt, [
            { topic: 'buttonplus/device/page/set', payload: '2', qos: 2, retain: true },
            { topic: 'buttonplus/device/brightness/set', payload: 80, qos: 0, retain: false }
        ]);
    });

    it('wrapConfigForTrace delegates publish to the original config', async function () {
        let called = false;
        const config = {
            qos: 0,
            retain: false,
            publish() {
                called = true;
                return Promise.resolve();
            }
        };
        const trace = [];
        const traced = wrapConfigForTrace(config, trace);

        await traced.publish('topic/a', 'value');

        assert.strictEqual(called, true);
        assert.deepStrictEqual(trace, [{ topic: 'topic/a', payload: 'value', qos: 0, retain: false }]);
    });

    it('exports a stable debug property name', function () {
        assert.strictEqual(DEBUG_PROPERTY, 'buttonplus_debug');
    });
});
