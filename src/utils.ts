import chalk from 'chalk';
import _ from 'lodash';
import { CMSMatchResult, ConfigLoaderResult, ContentLoaderResult, SiteAnalyzerResult, SSGMatchResult } from '@stackbit/sdk';
import { track, EVENTS } from './telemetry';

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

export function trackInitResultStats(analyzeResult: SiteAnalyzerResult) {
    track(
        EVENTS.initResult,
        _.omitBy(
            {
                ssg_name: analyzeResult.config.ssgName,
                is_theme: analyzeResult.ssgMatchResult?.isTheme,
                cms_name: analyzeResult.config.cmsName,
                model_count: analyzeResult.config.models.length
            },
            _.isNil
        )
    );
}

export function trackValidateResultStats(configResult: ConfigLoaderResult, contentResult?: ContentLoaderResult) {
    track(
        EVENTS.validateResult,
        _.omitBy(
            {
                config_valid: configResult.valid,
                config_error_count: configResult.errors.length,
                ssg_name: configResult.config?.ssgName,
                cms_name: configResult.config?.cmsName,
                content_item_count: contentResult?.contentItems.length,
                content_error_count: contentResult?.errors.length
            },
            _.isNil
        )
    );
}
