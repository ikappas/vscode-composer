/*---------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

/* tslint:disable:variable-name */
export class Constants {
    static ExtensionName: string = 'composer';
	static OutputChannel: string = 'Composer';
}

export class CommandNames {
    static CommandPrefix: string = Constants.ExtensionName + '.';
	static About: string = CommandNames.CommandPrefix + 'About';
	static Archive: string = CommandNames.CommandPrefix + 'Archive';
	static ClearCache: string = CommandNames.CommandPrefix + 'ClearCache';
	static Diagnose: string = CommandNames.CommandPrefix + 'Diagnose';
	static DumpAutoload: string = CommandNames.CommandPrefix + 'DumpAutoload';
	static Install: string = CommandNames.CommandPrefix + 'Install';
	static Remove: string = CommandNames.CommandPrefix + 'Remove';
	static RemovePackage: string = CommandNames.CommandPrefix + 'RemovePackage';
	static Require: string = CommandNames.CommandPrefix + 'Require';
	static RunScript: string = CommandNames.CommandPrefix + 'RunScript';
	static SelfUpdate: string = CommandNames.CommandPrefix + 'SelfUpdate';
	static Show: string = CommandNames.CommandPrefix + 'Show';
	static Status: string = CommandNames.CommandPrefix + 'Status';
	static Update: string = CommandNames.CommandPrefix + 'Update';
	static Validate: string = CommandNames.CommandPrefix + 'Validate';
	static Version: string = CommandNames.CommandPrefix + 'Version';
}

export class SettingNames {
    static SettingsPrefix: string = Constants.ExtensionName + '.';
    static Enabled: string = SettingNames.SettingsPrefix + 'enabled';
    static ExecutablePath: string = SettingNames.SettingsPrefix + 'executablePath';
    static ProjectRoot: string = SettingNames.SettingsPrefix + 'projectRoot';
}
