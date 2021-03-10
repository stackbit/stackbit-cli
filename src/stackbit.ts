#!/usr/bin/env node

import path from 'path';
import yargs from 'yargs';

import { validate } from './validate';

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
    .demandCommand().argv;
