import Analytics from 'analytics-node';
import Configstore from 'configstore';
import { v4 as uuidv4 } from 'uuid';

const configDefaults = {
    // disable stats from being sent to Stackbit */
    telemetryDisabled: false,
    // anonymousId
    anonymousId: uuidv4(),
    identified: false
};
const configOptions = { globalConfigPath: true };
const config = new Configstore('stackbit-cli', configDefaults, configOptions);
const disabled = config.get('telemetryDisabled');
const telemetryOptions = {
    host: 'https://api.stackbit.com',
    path: '/telemetry/cli',
    flushAt: 1
};

const telemetry = new Analytics('temp', telemetryOptions);

// We don't want flushInterval which is passed to setTimeout() to hang the process.
// But we can't use flushInterval: 0 (or other falsy value) in constructor options because it will fallback to 10000.
// So set it directly on constructor
// @ts-ignore
telemetry.flushInterval = 0;

export enum EVENTS {
    init = 'Init',
    initResult = 'Init Result',
    validate = 'Validate',
    validateResult = 'Validate Result',
    analyzeRepo = 'Analyze Repo',
    telemetryDisable = 'Disabled Telemetry',
    telemetryEnable = 'Enabled Telemetry'
}

export function identifyIfNeeded() {
    if (disabled) {
        return;
    }
    const identified = config.get('identified');
    if (identified) {
        return;
    }
    config.set('identified', true);
    telemetry.identify({
        anonymousId: config.get('anonymousId')
    });
}

export function track(event: EVENTS, data?: any) {
    if (disabled) {
        return;
    }
    identifyIfNeeded();
    telemetry.track({
        anonymousId: config.get('anonymousId'),
        event: `CLI ${event}`,
        properties: data
    });
}

export function disable() {
    track(EVENTS.telemetryDisable);
    config.set('telemetryDisabled', true);
}

export function enable() {
    track(EVENTS.telemetryEnable);
    config.set('telemetryDisabled', false);
}
