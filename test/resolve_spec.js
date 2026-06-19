'use strict';

const assert = require('assert');
const {
    resolveValue,
    normalizeOptionalField,
    resolvePublishField,
    resolvePublishNumberField,
    parseOptionalNumber,
    parseDurationSeconds
} = require('../nodes/lib/resolve');

describe('resolve helpers', function () {
    it('prefers msg values over node and fallback values', function () {
        assert.strictEqual(resolveValue('from-msg', 'from-node', 'fallback'), 'from-msg');
        assert.strictEqual(resolveValue(undefined, 'from-node', 'fallback'), 'from-node');
        assert.strictEqual(resolveValue(undefined, '', 'fallback'), 'fallback');
    });

    it('preserves valid falsy msg values', function () {
        assert.strictEqual(resolveValue(false, true, true), false);
        assert.strictEqual(resolveValue(0, 5, 10), 0);
        assert.strictEqual(resolveValue('', 'default', 'fallback'), '');
    });

    it('normalizes legacy false optional fields to empty', function () {
        assert.strictEqual(normalizeOptionalField(false), '');
        assert.strictEqual(normalizeOptionalField('false'), '');
        assert.strictEqual(normalizeOptionalField('Kitchen'), 'Kitchen');
        assert.strictEqual(normalizeOptionalField(0), 0);
    });

    it('publishes empty strings to clear fields on the device', function () {
        assert.deepStrictEqual(resolvePublishField({ label: '' }, 'label', 'Kitchen'), {
            publish: true,
            value: ''
        });
        assert.deepStrictEqual(resolvePublishField({}, 'label', 'Kitchen'), {
            publish: true,
            value: 'Kitchen'
        });
    });

    it('skips fields that are empty in both msg and node config', function () {
        assert.deepStrictEqual(resolvePublishField({}, 'label', ''), {
            publish: false
        });
        assert.deepStrictEqual(resolvePublishField({}, 'label', ''), {
            publish: false
        });
    });

    it('parses optional node numbers', function () {
        assert.strictEqual(parseOptionalNumber(''), '');
        assert.strictEqual(parseOptionalNumber(false), '');
        assert.strictEqual(parseOptionalNumber(2), 2);
        assert.strictEqual(parseOptionalNumber('3'), 3);
    });

    it('publishes configured numeric fields', function () {
        assert.deepStrictEqual(resolvePublishNumberField({}, 'page', 2), {
            publish: true,
            value: 2
        });
        assert.deepStrictEqual(resolvePublishNumberField({ page: 4 }, 'page', 2), {
            publish: true,
            value: 4
        });
        assert.deepStrictEqual(resolvePublishNumberField({}, 'page', ''), {
            publish: false
        });
    });

    it('parses pulse durations', function () {
        assert.strictEqual(parseDurationSeconds('none'), null);
        assert.strictEqual(parseDurationSeconds('steady'), null);
        assert.strictEqual(parseDurationSeconds('0.5'), 0.5);
        assert.strictEqual(parseDurationSeconds(1), 1);
        assert.strictEqual(parseDurationSeconds(0), null);
    });
});
