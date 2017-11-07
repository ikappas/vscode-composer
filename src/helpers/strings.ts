/*---------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

/* tslint:disable:variable-name */
export class Strings {

    static ExecutingCommand: string =  'Executing: composer {0}';

    static InputPackageName: string = 'Input package name';
    static InputPackageNamePlaceHolder: string = 'namespace/name [version]';

    static ComposerArchiveInput: string = 'Optional. Input options, package name and/or version to archive.';
    static ComposerArchivePlaceHolder: string = '[options] [--] [<package>] [<version>]';

    static ComposerDumpAutoloadInput: string = 'Optional. Input options to use.';
    static ComposerDumpAutoloadPlaceHolder: string = '[options]';

    static ComposerShowInput: string = 'Composer Show Arguments';
    static ComposerShowPlaceHolder: string = '[options] [--] [<package>] [<version>]';

    static ComposerRequireInput: string = 'Input options and the name(s) of the package(s) to add';
    static ComposerRequirePlaceHolder = '[options] [--] [<packages>] ...';

    static ComposerRemoveInput: string = 'Input options and the name(s) of the package(s) to remove';
    static ComposerRemovePlaceHolder = '[options] [--] [<packages>] ...';

    static ComposerRunScriptInput: string = '';
    static ComposerRunScriptPlaceHolder: string = '[options] [--] [<script>] [<args>] ...';

	static CommandCompletedSuccessfully: string = 'Command completed successfully.';
    static CommandCompletedWithErrors: string = 'Command completed with errors.';

    // Errors
    static ComposerNotFound: string = 'Composer could not be found in the system.';
    static ComposerProjectRequired: string = 'Open a folder with a composer project in order to access composer features.';
}
/* tslint:enable:variable-name */

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
		let idx = parseInt(group, 10);
		return isNaN(idx) || idx < 0 || idx >= args.length ?
			match :
			args[idx];
	});
};
