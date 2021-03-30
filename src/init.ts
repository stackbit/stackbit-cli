import path from 'path';
import chalk from 'chalk';
import yaml from 'js-yaml';
import { matchSSG, FileSystemFileBrowserAdapter, FileBrowser, matchCMS, writeConfig, Config, convertToYamlConfig } from '@stackbit/sdk';

import { printCMSMatchResult, printSSGMatchResult } from './utils';

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

    const config: Config = {
        stackbitVersion: '~0.3.0',
        models: []
    };

    config.ssgName = ssgMatchResult.ssgName;
    if (cmsMatchResult?.cmsName) {
        config.cmsName = cmsMatchResult.cmsName;
    }

    if (dryRun) {
        const yamlConfig = convertToYamlConfig({ config });
        const yamlString = yaml.dump(yamlConfig);
        console.log(`\nWould generate the following ${chalk.blueBright('stackbit.yaml')}:\n${chalk.cyanBright(yamlString)}`);
    } else {
        await writeConfig({ dirPath: inputDir, config });
    }
}
