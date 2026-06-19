'use strict';

const assert = require('assert');
const {
    buttonBaseTopic,
    deviceBaseTopic,
    displayItemBaseTopic,
    ledBaseTopic,
    pushButtonTopic
} = require('../nodes/lib/topics');

describe('topics', function () {
    it('builds button topics with normalized prefix', function () {
        assert.strictEqual(
            buttonBaseTopic('buttonplus/', 'device1', 2, 3),
            'buttonplus/device1/button/2-3'
        );
    });

    it('builds led topics', function () {
        assert.strictEqual(
            ledBaseTopic('buttonplus', 'device1', 1, 2, 'front'),
            'buttonplus/device1/button/1-2/led/front'
        );
    });

    it('builds pushbutton topic', function () {
        assert.strictEqual(
            pushButtonTopic('buttonplus', 'device1', 4, 1),
            'buttonplus/device1/button/4-1/pushbutton'
        );
    });

    it('builds display and device topics', function () {
        assert.strictEqual(
            displayItemBaseTopic('buttonplus', 'device1', 5),
            'buttonplus/device1/displayitem/5'
        );
        assert.strictEqual(
            deviceBaseTopic('buttonplus', 'device1'),
            'buttonplus/device1'
        );
    });
});
