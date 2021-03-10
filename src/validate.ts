import _ from 'lodash';
import chalk from 'chalk';
import { loadConfig, loadContent, Config, ContentValidationError } from '@stackbit/sdk';

const red = chalk.red;
const green = chalk.green;
const redCross = red('✘');

interface ValidateOptions {
    inputDir: string;
    configOnly: boolean;
    quiet: boolean;
}

export async function validate({ inputDir, configOnly, quiet }: ValidateOptions) {
    const quietConsole = getQuietConsole({ quiet });
    quietConsole.debug(`loading and validating Stackbit configuration from: ${inputDir}`);

    const configResult = await loadConfig({
        dirPath: inputDir
    });

    quietConsole.group();
    if (configResult.errors.length === 0) {
        console.log(green('✔ configuration is valid'));
    } else {
        console.group(red(`found ${configResult.errors.length} errors in configuration:`));
        configResult.errors.forEach((error) => {
            console.log(`${redCross} ${error.message}`);
        });
        console.groupEnd();
    }
    quietConsole.groupEnd();

    if (configOnly || !configResult.config) {
        return;
    }

    const contentResult = await validateContent({
        dirPath: inputDir,
        config: configResult.config,
        quiet: quiet,
        skipUnmodeledContent: false
    });

    if (configResult.errors.length === 0 && contentResult.errors.length === 0) {
        console.log(green('✔ validation passed'));
    } else {
        console.log(red('✘ validation failed, see errors above'));
    }
}

interface ValidateContentOptions {
    dirPath: string;
    config: Config;
    quiet: boolean;
    skipUnmodeledContent: boolean;
}

export async function validateContent({ dirPath, config, quiet, skipUnmodeledContent }: ValidateContentOptions) {
    const quietConsole = getQuietConsole({ quiet });
    quietConsole.group(`loading and validating content from: ${dirPath}`);

    const result = await loadContent({ dirPath, config, skipUnmodeledContent });
    const { modeledItems, unmodeledItems } = _.groupBy(result.contentItems, (contentItem) =>
        contentItem.__metadata.modelName !== null ? 'modeledItems' : 'unmodeledItems'
    );
    quietConsole.debug(
        `loaded ${result.contentItems.length} files in total (${(modeledItems || []).length} matched, ${(unmodeledItems || []).length} unmatched)`
    );

    if (!quiet && typeof modeledItems !== 'undefined' && modeledItems.length > 0) {
        const modeledItemsByModelName = _.groupBy(modeledItems, (contentItem) => contentItem.__metadata.modelName);
        console.group(`${modeledItems.length} files matched to models:`);
        _.forEach(modeledItemsByModelName, (contentItems, modelName) => {
            console.group(`${modelName}: ${contentItems.length} files:`);
            _.forEach(contentItems, (contentItem) => {
                console.log(contentItem.__metadata.filePath);
            });
            console.groupEnd();
        });
        console.groupEnd();
    }

    if (!quiet && typeof unmodeledItems !== 'undefined' && unmodeledItems.length > 0) {
        console.group(red(`${unmodeledItems.length} files could not be matched to models:`));
        _.forEach(unmodeledItems, (contentItem) => {
            console.log(contentItem.__metadata.filePath);
        });
        console.groupEnd();
    }

    if (result.errors.length === 0) {
        console.log(green('✔ content files are valid'));
    } else {
        console.group(red(`found ${result.errors.length} errors in content files:`));
        result.errors.forEach((error) => {
            if (error instanceof ContentValidationError) {
                console.log(`${redCross} ${error.filePath} (${error.modelName}): ${error.message}`);
            } else {
                console.log(`${redCross} ${error.message}`);
            }
        });
        console.groupEnd();
    }

    quietConsole.groupEnd();
    return result;
}

function getQuietConsole({ quiet }: { quiet: boolean }) {
    if (!quiet) {
        return console;
    }
    const noop = () => {};
    const quietConsole = new console.Console({ stdout: process.stdout, stderr: process.stderr });
    quietConsole.debug = noop;
    quietConsole.error = noop;
    quietConsole.group = noop;
    quietConsole.groupEnd = noop;
    return quietConsole;
}
