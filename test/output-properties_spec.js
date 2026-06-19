'use strict';

const assert = require('assert');
const {
    applyClickOutputProperties,
    applyPassthroughOutputProperties,
    buildButtonplusMeta,
    includesOutputSource,
    migrateLegacyDebugOutput,
    resolveClickOutputProperties
} = require('../nodes/lib/output-properties');

describe('output properties', function () {
    const context = {
        payload: { event_type: 'shortpress' },
        topic: 'buttonplus/buttonplus_1/button/5-1/pushbutton',
        device: 'buttonplus_1',
        button_page: 1,
        button: 5,
        event_type: 'shortpress',
        buttonplus_debug: {
            input: { topic: 'buttonplus/buttonplus_1/button/5-1/pushbutton', payload: { event_type: 'shortpress' } },
            mqtt: []
        }
    };

    it('sends an empty click message when none are configured', function () {
        const msg = applyClickOutputProperties(undefined, context);

        assert.deepStrictEqual(msg, {});
    });

    it('maps event fields to custom msg properties', function () {
        const msg = applyClickOutputProperties([
            { property: 'topic', propertyType: 'msg', value: 'topic', valueType: 'event' },
            { property: 'page', propertyType: 'msg', value: 'button_page', valueType: 'event' },
            { property: 'pressed', propertyType: 'msg', value: 'event_type', valueType: 'event' }
        ], context);

        assert.strictEqual(msg.topic, context.topic);
        assert.strictEqual(msg.page, 1);
        assert.strictEqual(msg.pressed, 'shortpress');
    });

    it('maps payload and buttonplus metadata when configured', function () {
        const msg = applyClickOutputProperties([
            { property: 'payload', propertyType: 'msg', value: 'payload', valueType: 'event' },
            { property: 'buttonplus', propertyType: 'msg', value: 'buttonplus', valueType: 'event' }
        ], context);

        assert.deepStrictEqual(msg.payload, context.payload);
        assert.deepStrictEqual(msg.buttonplus, buildButtonplusMeta(context));
    });

    it('maps debug info when configured on click output', function () {
        const msg = applyClickOutputProperties([
            { property: 'buttonplus_debug', propertyType: 'msg', value: 'buttonplus_debug', valueType: 'event' }
        ], context);

        assert.deepStrictEqual(msg.buttonplus_debug, context.buttonplus_debug);
    });

    it('supports nested destination properties', function () {
        const msg = applyClickOutputProperties([
            { property: 'data.button', propertyType: 'msg', value: 'button', valueType: 'event' }
        ], context);

        assert.deepStrictEqual(msg.data, { button: 5 });
    });

    it('returns an empty list from resolveClickOutputProperties when unset', function () {
        assert.deepStrictEqual(resolveClickOutputProperties(), []);
        assert.deepStrictEqual(resolveClickOutputProperties([]), []);
    });

    it('passes through action messages when output properties are empty', function () {
        const RED = {
            util: {
                cloneMessage(msg) {
                    return { ...msg };
                }
            }
        };
        const input = { payload: 'test' };

        assert.strictEqual(applyPassthroughOutputProperties(RED, [], input, context), input);
    });

    it('adds debug info on action messages when configured', function () {
        const RED = {
            util: {
                cloneMessage(msg) {
                    return { ...msg };
                }
            }
        };
        const input = { payload: 'test' };
        const msg = applyPassthroughOutputProperties(RED, [{
            property: 'buttonplus_debug',
            propertyType: 'msg',
            value: 'buttonplus_debug',
            valueType: 'event'
        }], input, context);

        assert.strictEqual(msg.payload, 'test');
        assert.deepStrictEqual(msg.buttonplus_debug, context.buttonplus_debug);
    });

    it('detects configured output sources', function () {
        assert.strictEqual(includesOutputSource([], 'buttonplus_debug'), false);
        assert.strictEqual(includesOutputSource([], 'payload'), false);
        assert.strictEqual(includesOutputSource([{
            property: 'buttonplus_debug',
            value: 'buttonplus_debug'
        }], 'buttonplus_debug'), true);
    });

    it('migrates legacy debug checkbox to output properties', function () {
        assert.deepStrictEqual(migrateLegacyDebugOutput([], true), [{
            property: 'buttonplus_debug',
            propertyType: 'msg',
            value: 'buttonplus_debug',
            valueType: 'event'
        }]);
        assert.deepStrictEqual(migrateLegacyDebugOutput([{ property: 'payload', value: 'payload' }], true), [{
            property: 'payload',
            value: 'payload'
        }]);
    });
});
