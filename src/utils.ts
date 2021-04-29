import chalk from 'chalk';
import _ from 'lodash';
import { CMSMatchResult, ConfigLoaderResult, ContentLoaderResult, SiteAnalyzerResult, SSGMatchResult } from '@stackbit/sdk';
import { track, EVENTS, trackUncaughtException } from './telemetry';

let uncaughtExceptionMonitorSet = false;

export function setupUncaughtExceptionHandler() {
    if (uncaughtExceptionMonitorSet) {
        return;
    }
    uncaughtExceptionMonitorSet = true;

    process.on('unhandledRejection', async (error: Error) => {
        await handleUncaughtException(error);
    });
    process.on('uncaughtException', async (error: Error) => {
        await handleUncaughtException(error);
    });
}

async function handleUncaughtException(error: Error) {
    await trackUncaughtException({
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack
        }
    });
    console.error('Uh-oh! Something went wrong');
    console.error(error);
    process.exit(1);
}

export function printSSGMatchResult(ssgMatchResult: SSGMatchResult | null) {
    if (!ssgMatchResult) {
        console.log(`Couldn't match SSG`);
        return;
    }
    console.log(`Matched SSG: ${chalk.cyanBright(ssgMatchResult.ssgName)}`);
    if (ssgMatchResult.ssgDir === undefined) {
        const possibleDirs = ssgMatchResult.options?.ssgDirs ? ` Possible folders: ${ssgMatchResult.options?.ssgDirs.join(', ')}` : '';
        console.log('Could not identify SSG folder.' + possibleDirs);
    } else {
        const ssgDir = ssgMatchResult.ssgDir === '' ? '.' : ssgMatchResult.ssgDir;
        console.log(`SSG directory: ${chalk.cyanBright(`'${ssgDir}'`)}`);
        console.log(`Repo is theme: ${chalk.cyanBright(!!ssgMatchResult.isTheme)}`);
        if (ssgMatchResult.envVars) {
            console.log(`Environment variables: ${chalk.cyanBright(`${ssgMatchResult.envVars.join(', ')}`)}`);
        }
    }
}

export function printCMSMatchResult(cmsMatchResult: CMSMatchResult | null) {
    if (!cmsMatchResult) {
        return;
    }
    console.log(`Matched CMS: ${chalk.cyanBright(cmsMatchResult.cmsName)}`);
    if (cmsMatchResult.cmsData !== undefined) {
        _.forEach(cmsMatchResult.cmsData, (value, prop) => {
            console.log(`${prop}: ${chalk.cyanBright(`'${value}'`)}`);
        });
    }
}

export function trackInitResultStats(analyzeResult: SiteAnalyzerResult, inputDir: string) {
    track(EVENTS.initResult, {
        inputDir,
        ssg_name: analyzeResult.config.ssgName,
        is_theme: analyzeResult.ssgMatchResult?.isTheme,
        cms_name: analyzeResult.config.cmsName,
        model_count: analyzeResult.config.models.length
    });
}

export function trackValidateResultStats(configResult: ConfigLoaderResult, contentResult: ContentLoaderResult | null, inputDir: string) {
    track(EVENTS.validateResult, {
        inputDir,
        config_valid: configResult.valid,
        config_error_count: configResult.errors.length,
        ssg_name: configResult.config?.ssgName,
        cms_name: configResult.config?.cmsName,
        content_valid: contentResult?.valid,
        content_item_count: contentResult?.contentItems.length,
        content_error_count: contentResult?.errors.length
    });
}
