import { CMSMatchResult, SSGMatchResult } from '@stackbit/sdk';
import chalk from 'chalk';

export function printSSGMatchResult(ssgMatchResult: SSGMatchResult | null) {
    if (!ssgMatchResult) {
        console.log(`Couldn't match SSG`);
        return;
    }
    console.log(`Matched SSG: ${chalk.blueBright(ssgMatchResult.ssgName)}`);
    console.log(`Repo is theme: ${chalk.blueBright(!!ssgMatchResult.isTheme)}`);
    if (ssgMatchResult.ssgDir === undefined) {
        const possibleDirs = ssgMatchResult.options?.ssgDirs ? ` Possible folders: ${ssgMatchResult.options?.ssgDirs.join(', ')}` : '';
        console.log('Could not identify SSG folder.' + possibleDirs);
    } else {
        const ssgDir = ssgMatchResult.ssgDir === '' ? '.' : ssgMatchResult.ssgDir;
        console.log(`SSG directory: ${chalk.blueBright(`'${ssgDir}'`)}`);
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
    }
}
