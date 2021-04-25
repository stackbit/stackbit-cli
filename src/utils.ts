import chalk from 'chalk';
import _ from 'lodash';
import { CMSMatchResult, SSGMatchResult } from '@stackbit/sdk';

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
