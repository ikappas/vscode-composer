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

    static CommandCompletedSuccessfully: string = 'Command completed successufully.';
    static CommandCompletedWithErrors: string = 'Command completed with errors.';

    // Errors
    static ComposerNotFound: string = 'Composer could not be found in the system.';
    static ComposerProjectRequired: string = 'Open a folder with a composer project in order to access composer features.';
}
/* tslint:enable:variable-name */
