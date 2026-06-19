'use strict';

const assert = require('assert');
const { parseMqttPayload, parsePushbuttonEvent } = require('../nodes/lib/mqtt-payload');

describe('mqtt payload parsing', function () {
    it('parses JSON buffer payloads from MQTT', function () {
        const payload = Buffer.from('{"event_type":"shortpress"}');
        assert.deepStrictEqual(parseMqttPayload(payload), { event_type: 'shortpress' });
    });

    it('accepts already parsed objects', function () {
        assert.deepStrictEqual(parseMqttPayload({ event_type: 'longpress' }), { event_type: 'longpress' });
    });

    it('extracts pushbutton events', function () {
        const event = parsePushbuttonEvent(Buffer.from('{"event_type":"shortpress"}'));
        assert.strictEqual(event.eventType, 'shortpress');
        assert.deepStrictEqual(event.payload, { event_type: 'shortpress' });
    });

    it('returns null for empty payloads', function () {
        assert.strictEqual(parsePushbuttonEvent(''), null);
        assert.strictEqual(parsePushbuttonEvent(null), null);
    });
});
