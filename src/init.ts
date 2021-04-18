import path from 'path';
import chalk from 'chalk';
import yaml from 'js-yaml';
import { FileSystemFileBrowserAdapter, FileBrowser, writeConfig, convertToYamlConfig, analyzeSite } from '@stackbit/sdk';

import { printCMSMatchResult, printSSGMatchResult } from './utils';

export async function init({ inputDir, dryRun }: { inputDir: string; dryRun: boolean }) {
    console.log(`Analyzing files in ${chalk.blueBright(path.resolve(inputDir))} ...`);
    const fileBrowserAdapter = new FileSystemFileBrowserAdapter({ dirPath: inputDir });
    const fileBrowser = new FileBrowser({ fileBrowserAdapter });
    const analyzeResult = await analyzeSite({ fileBrowser });

    printSSGMatchResult(analyzeResult.ssgMatchResult);
    printCMSMatchResult(analyzeResult.cmsMatchResult);

    if (dryRun) {
        const yamlConfig = convertToYamlConfig({ config: analyzeResult.config });
        const yamlString = yaml.dump(yamlConfig);
        console.log(`\n${chalk.underline.bold('stackbit.yaml')}:\n${chalk.cyanBright(yamlString)}`);
    } else {
        await writeConfig({ dirPath: inputDir, config: analyzeResult.config });
        console.log(`\nThe ${chalk.cyanBright('stackbit.yaml')} file have been generated and saved at: ${path.resolve(inputDir, 'stackbit.yaml')}`)
    }
}
