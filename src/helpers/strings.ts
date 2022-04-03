/*---------------------------------------------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

export class Strings {

	static WorkingDirectory = 'Working Directory: {0}';
	static ExecutingCommand = 'Executing: composer {0}';

	static InputPackageName = 'Input package name';
	static InputPackageNamePlaceHolder = 'namespace/name [version]';

	static ComposerArchiveInput = 'Optional. Input options, package name and/or version to archive.';
	static ComposerArchivePlaceHolder = '[options] [--] [<package>] [<version>]';

	static ComposerDependsInput = 'Input options and package name';
	static ComposerDependsPlaceHolder = '[options] [--] <package>';

	static ComposerDumpAutoloadInput = 'Optional. Input options to use.';
	static ComposerDumpAutoloadPlaceHolder = '[options]';

	static ComposerInitInput = 'Optional. Input options to use.';
	static ComposerInitPlaceHolder = '[options]';

	static ComposerShowInput = 'Optional. Input package name and version';
	static ComposerShowPlaceHolder = '[<package>] [<version>]';

	static ComposerSuggestsInput = 'Input options and the name(s) of the package(s) that you want to list suggestions from.';
	static ComposerSuggestsPlaceHolder = '[options] [--] [<packages>]';

	static ComposerProhibitsInput = 'Input options, package name and version';
	static ComposerProhibitsPlaceHolder = '[options] [--] <package> <version>';

	static ComposerRequireInput = 'Input options and the name(s) of the package(s) to add';
	static ComposerRequirePlaceHolder = '[options] [--] [<packages>] ...';

	static ComposerRemoveInput = 'Input options and the name(s) of the package(s) to remove';
	static ComposerRemovePlaceHolder = '[options] [--] [<packages>] ...';

	static ComposerRunScriptInput = '';
	static ComposerRunScriptPlaceHolder = '[options] [--] [<script>] [<args>] ...';

	static ComposerWhyInput = 'Input options and package name';
	static ComposerWhyPlaceHolder = '[options] [--] <package>';

	static ComposerWhyNotInput = 'Input options, package name and version';
	static ComposerWhyNotPlaceHolder = '[options] [--] <package> <version>';

	static CommandKilledSuccessfully = 'Command process killed successfully.';
	static CommandCompletedSuccessfully = 'Command completed successfully.';
	static CommandCompletedWithErrors = 'Command completed with errors.';

	static WorkspaceFolderPick = 'Select workspace folder to run composer command ...';

	// Errors
	static ComposerExecutablePathRequired = 'Please set composer.executablePath in your user settings in order to to access composer features.';
	static ComposerNotFound = 'Composer could not be found in the system.';
	static ComposerContextRequired = 'Please open a workspace folder in order to access composer features.';
	static ComposerProjectRequired = 'Open a folder with a composer project in order to access composer features.';
	static ComposerCommandNotImplemented = 'The composer "{0}" command is not implemented';
}

declare global {
	interface StringConstructor {
		/**
		 * Helper to produce a string with a variable number of arguments. Insert variable segments
		 * into the string using the {n} notation where N is the index of the argument following the string.
		 * @param value string to which formatting is applied
		 * @param args replacements for {n}-entries
		 */
		format(value: string, ...args: any[]): string;

		/**
		 * The empty string.
		 */
		Empty: string;

		/**
		 * The space string.
		 */
		Space: string;
	}
}

const _formatRegexp = /{(\d+)}/g;

String.Empty = '';
String.Space = ' ';

String.format = (value: string, ...args: any[]): string => {
	if (args.length === 0) {
		return value;
	}
	return value.replace(_formatRegexp, function (match, group) {
		const idx = parseInt(group, 10);
		return isNaN(idx) || idx < 0 || idx >= args.length ?
			match :
			args[idx];
	});
};
