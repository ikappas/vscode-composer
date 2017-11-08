/*---------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

/* tslint:disable:variable-name */
export class Constants {
	static ExtensionName: string = 'composer';
	static OutputChannel: string = 'Composer';
}

export class SettingNames {
	static SettingsPrefix: string = Constants.ExtensionName + '.';
	static Enabled: string = SettingNames.SettingsPrefix + 'enabled';
	static ExecutablePath: string = SettingNames.SettingsPrefix + 'executablePath';
	static WorkingPath: string = SettingNames.SettingsPrefix + 'workingPath';
}
