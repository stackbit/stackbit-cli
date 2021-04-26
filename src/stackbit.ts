#!/usr/bin/env node

import path from 'path';
import yargs from 'yargs';

import { validate } from './validate';
import { init } from './init';
import { analyzeRepo } from './analyze-repo';
import * as telemetry from './telemetry';

yargs(process.argv.slice(2))
    .command(
        'validate',
        'validates stackbit configuration and any content against the schema defined in configuration',
        (yargs) =>
            yargs
                .option('input-dir', {
                    alias: 'i',
                    description: 'input dir with stackbit.yaml',
                    default: '.'
                })
                .options('config-only', {
                    boolean: true,
                    description: 'validate configuration only, do not load and validate content',
                    default: false
                })
                .options('quiet', {
                    alias: 'q',
                    boolean: true,
                    description: 'validate with less verbosity',
                    default: false
                }),
        async (argv) => {
            await validate({
                inputDir: path.resolve(argv['input-dir']),
                configOnly: argv['config-only'],
                quiet: argv['quiet']
            });
        }
    )
    .command(
        'init',
        'Generates stackbit.yaml by introspecting website project files',
        (yargs) =>
            yargs
                .option('input-dir', {
                    alias: 'i',
                    description: 'project dir',
                    default: '.'
                })
                .option('dry-run', {
                    description: 'print configuration instead of writing it to stackbit.yaml',
                    boolean: true,
                    default: false
                }),
        async (argv) => {
            await init({
                inputDir: path.resolve(argv['input-dir']),
                dryRun: argv['dry-run']
            });
        }
    )
    .command(
        'analyze-repo',
        'Analyze GitHub repository for SSG and CMS, use to debug repositories imported via stackbit.com/import',
        (yargs) =>
            yargs
                .option('repo-url', {
                    alias: 'u',
                    description: 'repository URL',
                    demandOption: true,
                    string: true
                })
                .option('branch', {
                    alias: 'b',
                    description: 'repository branch',
                    string: true,
                    default: 'main'
                })
                .option('auth', {
                    alias: 'a',
                    description: 'authentication token',
                    string: true
                }),
        async (argv) => {
            await analyzeRepo({
                repoUrl: argv['repo-url'],
                branch: argv['branch'],
                auth: argv['auth']
            });
        }
    )
    .command({
        command: 'telemetry-enable',
        describe: 'Enable telemetry',
        handler: () => {
            telemetry.enable();
        }
    })
    .command({
        command: 'telemetry-disable',
        describe: 'Disable telemetry',
        handler: () => {
            telemetry.disable();
        }
    })
    .demandCommand().argv;
