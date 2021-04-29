import os from 'os';
import { exec } from 'child_process';
import Analytics from 'analytics-node';
import Configstore from 'configstore';
import crypto from 'crypto';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import gitUrlParse from 'git-url-parse';
import _ from 'lodash';

const sdkPackageJson = require('@stackbit/sdk/package.json');
const cliPackageJson = require('../package.json');

const configDefaults = {
    // disable stats from being sent to Stackbit */
    telemetryDisabled: false,
    // anonymousId
    anonymousId: uuidv4(),
    identified: false
};
const configOptions = { globalConfigPath: true };
const config = new Configstore('stackbit-cli', configDefaults, configOptions);
let disabled = config.get('telemetryDisabled');
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
    computeTelemetryProperties(data).then((properties) => {
        telemetry.track({
            anonymousId: config.get('anonymousId'),
            event: `CLI ${event}`,
            properties: properties
        });
    });
}

export async function trackUncaughtException(data?: any) {
    return new Promise((resolve) => {
        telemetry.track({
            anonymousId: config.get('anonymousId'),
            event: 'cli_uncaught_exception',
            properties: {
                ...getDefaultTelemetryProperties(),
                ...data
            }
        }, () => {
            resolve(null);
        });
    });
}

export function disable() {
    track(EVENTS.telemetryDisable);
    config.set('telemetryDisabled', true);
}

export function enable() {
    config.set('telemetryDisabled', false);
    disabled = false;
    track(EVENTS.telemetryEnable);
}

// undefined => wasn't computed yet, no cache
// null => cached null value
// string => cached string value
let folderHash: undefined | null | string;
let repoUrlHash: undefined | null | string;

async function computeTelemetryProperties(data?: any) {
    const inputDir = _.get(data, 'inputDir') || _.get(data, 'input_dir');
    const folderHash = getFolderHash(inputDir);
    const repoUrlHash = await getRepoUrlHash(inputDir);
    return _.omitBy(
        {
            ...getDefaultTelemetryProperties(),
            folder_hash: folderHash,
            repo_hash: repoUrlHash,
            ..._.omit(data, ['inputDir', 'input_dir'])
        },
        _.isNil
    );
}

function getDefaultTelemetryProperties() {
    return {
        cli_version: cliPackageJson.version,
        sdk_version: sdkPackageJson.version,
        node_version: process.version,
        os: {
            type: os.type(),
            platform: os.platform(),
            release: os.release(),
            version: os.version()
        }
    };
}

function getFolderHash(inputDir: any): string | null {
    if (folderHash !== undefined) {
        return folderHash;
    }
    if (!inputDir || typeof inputDir !== 'string') {
        return null;
    }
    folderHash = md5(path.resolve(inputDir));
    return folderHash;
}

async function getRepoUrlHash(inputDir: any): Promise<string | null> {
    if (repoUrlHash !== undefined) {
        return repoUrlHash;
    }
    if (!inputDir || typeof inputDir !== 'string') {
        return null;
    }
    return new Promise((resolve: (value: string | null) => void, reject) => {
        exec(
            'git remote -v',
            {
                cwd: path.resolve(inputDir)
            },
            (error, stdout) => {
                // stdout:
                // origin  git@github.com:stackbit/stackbit-cli.git (fetch)
                // origin  git@github.com:stackbit/stackbit-cli.git (push)
                if (stdout) {
                    // get the remote from the first line
                    const match = stdout.trim().match(/^(\w+)\s+([^\s]+)/);
                    if (!match) {
                        resolve(null);
                        return;
                    }
                    const remoteUrl = match[2]!;
                    const urlObject = gitUrlParse(remoteUrl);
                    if (urlObject.source && urlObject.full_name) {
                        resolve(urlObject.source + '/' + urlObject.full_name);
                        return;
                    }
                }
                resolve(null);
            }
        );
    })
        .then((repoUrl) => {
            repoUrlHash = repoUrl ? md5(repoUrl) : null;
            return repoUrlHash;
        })
        .catch(() => {
            repoUrlHash = null;
            return repoUrlHash;
        });
}

function md5(data: string) {
    return crypto.createHash('md5').update(data).digest('hex');
}
