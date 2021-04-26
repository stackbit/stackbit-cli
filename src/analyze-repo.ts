import { analyzeSite, convertToYamlConfig, FileBrowser, GitHubFileBrowserAdapter } from '@stackbit/sdk';

import { printCMSMatchResult, printSSGMatchResult } from './utils';
import yaml from 'js-yaml';
import chalk from 'chalk';
import { track, EVENTS } from './telemetry';

export interface AnalyzeRepoOptions {
    repoUrl: string;
    branch: string;
    auth?: string;
}

export async function analyzeRepo({ repoUrl, branch, auth }: AnalyzeRepoOptions) {
    track(EVENTS.analyzeRepo);
    const parsedUrl = parseGitHubUrl(repoUrl);
    if (!parsedUrl) {
        console.log(`could not parse repository url: ${repoUrl}`);
        return;
    }

    console.log(`Analyzing repository files in ${repoUrl}, branch: ${branch} ...`);
    const fileBrowserAdapter = new GitHubFileBrowserAdapter({
        owner: parsedUrl.owner,
        repo: parsedUrl.repo,
        branch: branch,
        auth: auth
    });
    const fileBrowser = new FileBrowser({ fileBrowserAdapter });
    const analyzeResult = await analyzeSite({ fileBrowser });

    printSSGMatchResult(analyzeResult.ssgMatchResult);
    printCMSMatchResult(analyzeResult.cmsMatchResult);

    const yamlConfig = convertToYamlConfig({ config: analyzeResult.config });
    const yamlString = yaml.dump(yamlConfig);
    console.log(`\n${chalk.underline.bold('stackbit.yaml')}:\n${chalk.cyanBright(yamlString)}`);
}

function parseGitHubUrl(repoUrl: string) {
    const match = repoUrl.match(/github\.com[/:](.+?)\/(.+?)(\.git)?$/);
    if (!match) {
        return null;
    }
    const owner = match[1]!;
    const repo = match[2]!;
    return { owner, repo };
}
