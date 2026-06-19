'use strict';

const assert = require('assert');
const helper = require('node-red-node-test-helper');
const mqttNodes = require('@node-red/nodes/core/network/10-mqtt.js');
const buttonplusConfig = require('../nodes/buttonplus-config.js');
const buttonplusLed = require('../nodes/buttonplus-led.js');

describe('buttonplus-led node', function () {
    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function (done) {
        helper.unload().then(function () {
            helper.stopServer(done);
        });
    });

    it('should require a config node', function (done) {
        const flow = [
            { id: 'led1', type: 'buttonplus-led', config: 'missing-config' }
        ];

        helper.load([mqttNodes, buttonplusConfig, buttonplusLed], flow, function () {
            const node = helper.getNode('led1');
            try {
                assert.ok(node);
                done();
            } catch (err) {
                done(err);
            }
        });
    });

    it('should load with a valid config node', function (done) {
        const flow = [
            {
                id: 'mqtt1',
                type: 'mqtt-broker',
                name: 'test broker',
                broker: 'localhost',
                port: 1883,
                autoConnect: false
            },
            {
                id: 'cfg1',
                type: 'buttonplus-config',
                broker: 'mqtt1',
                prefix: 'buttonplus',
                device: 'buttonplus_1'
            },
            {
                id: 'led1',
                type: 'buttonplus-led',
                config: 'cfg1',
                page: 1,
                button: 1
            }
        ];

        helper.load([mqttNodes, buttonplusConfig, buttonplusLed], flow, function () {
            const node = helper.getNode('led1');
            try {
                assert.ok(node);
                done();
            } catch (err) {
                done(err);
            }
        });
    });
});
