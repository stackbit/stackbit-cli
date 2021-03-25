import { FileBrowser, GitHubFileBrowserAdapter, matchCMS, matchSSG } from '@stackbit/sdk';
import { printCMSMatchResult, printSSGMatchResult } from './utils';

export interface AnalyzeRepoOptions {
    repoUrl: string;
    branch: string;
    auth?: string;
}

export async function analyzeRepo({ repoUrl, branch, auth }: AnalyzeRepoOptions) {
    const parsedUrl = parseGitHubUrl(repoUrl);
    if (!parsedUrl) {
        console.log(`could not parse repository url: ${repoUrl}`);
        return;
    }

    console.log('Analyzing repository files in ...');
    const fileBrowserAdapter = new GitHubFileBrowserAdapter({
        owner: parsedUrl.owner,
        repo: parsedUrl.repo,
        branch: branch,
        auth: auth
    });
    const fileBrowser = new FileBrowser({ fileBrowserAdapter });
    const ssgMatchResult = await matchSSG({ fileBrowser });
    printSSGMatchResult(ssgMatchResult);

    if (!ssgMatchResult) {
        return;
    }
    const cmsMatchResult = await matchCMS({ fileBrowser });
    printCMSMatchResult(cmsMatchResult);
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
