import { CMSMatchResult, SSGMatchResult } from '@stackbit/sdk';
import chalk from 'chalk';
import _ from 'lodash';

export function printSSGMatchResult(ssgMatchResult: SSGMatchResult | null) {
    if (!ssgMatchResult) {
        console.log(`Couldn't match SSG`);
        return;
    }
    console.log(`Matched SSG: ${chalk.blueBright(ssgMatchResult.ssgName)}`);
    if (ssgMatchResult.ssgDir === undefined) {
        const possibleDirs = ssgMatchResult.options?.ssgDirs ? ` Possible folders: ${ssgMatchResult.options?.ssgDirs.join(', ')}` : '';
        console.log('Could not identify SSG folder.' + possibleDirs);
    } else {
        const ssgDir = ssgMatchResult.ssgDir === '' ? '.' : ssgMatchResult.ssgDir;
        console.log(`SSG directory: ${chalk.blueBright(`'${ssgDir}'`)}`);
        console.log(`Repo is theme: ${chalk.blueBright(!!ssgMatchResult.isTheme)}`);
        if (ssgMatchResult.envVars) {
            console.log(`Environment variables: ${chalk.blueBright(`${ssgMatchResult.envVars.join(', ')}`)}`);
        }
    }
}

export function printCMSMatchResult(cmsMatchResult: CMSMatchResult | null) {
    if (!cmsMatchResult) {
        return;
    }
    console.log(`Matched CMS: ${chalk.blueBright(cmsMatchResult.cmsName)}`);
    if (cmsMatchResult.cmsDir === undefined) {
        const possibleDirs = cmsMatchResult.options?.cmsDirs ? ` Possible folders: ${cmsMatchResult.options?.cmsDirs.join(', ')}` : '';
        console.log('Could not identify CMS folder.' + possibleDirs);
    } else {
        const cmsDir = cmsMatchResult.cmsDir === '' ? '.' : cmsMatchResult.cmsDir;
        console.log(`CMS directory: ${chalk.blueBright(`'${cmsDir}'`)}`);
        const otherProps = _.omit(cmsMatchResult, ['cmsName', 'cmsDir', 'options']);
        _.forEach(otherProps, (value, prop) => {
            console.log(`${prop}: ${chalk.blueBright(`'${value}'`)}`);
        });
    }
}
