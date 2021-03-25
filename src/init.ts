import { matchSSG, FileSystemFileBrowserAdapter, FileBrowser, matchCMS, writeConfig } from '@stackbit/sdk';
import { printCMSMatchResult, printSSGMatchResult } from './utils';
import path from 'path';
import chalk from 'chalk';
import _ from 'lodash';

export async function init({ inputDir, dryRun }: { inputDir: string; dryRun: boolean }) {
    console.log(`Analyzing files in ${chalk.blueBright(path.resolve(inputDir))} ...`);
    const fileBrowserAdapter = new FileSystemFileBrowserAdapter({ dirPath: inputDir });
    const fileBrowser = new FileBrowser({ fileBrowserAdapter });
    const ssgMatchResult = await matchSSG({ fileBrowser });
    printSSGMatchResult(ssgMatchResult);

    if (!ssgMatchResult) {
        return;
    }

    const cmsMatchResult = await matchCMS({ fileBrowser });
    printCMSMatchResult(cmsMatchResult);

    const stackbitYaml = _.omitBy(
        {
            stackbitVersion: '~0.3.0',
            ssgName: ssgMatchResult.ssgName,
            cmsName: cmsMatchResult?.cmsName
        },
        _.isNil
    );
    console.log(`\nstackbit.yaml: ${JSON.stringify(stackbitYaml, null, 2)}`);
}
