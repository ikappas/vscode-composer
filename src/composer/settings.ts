/*---------------------------------------------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { ConfigurationScope, workspace, WorkspaceConfiguration } from 'vscode';
import { Constants } from '../helpers/constants';

export class SettingNames {
	static SettingsPrefix: string = Constants.ExtensionName + '.';
	static Enabled: string = SettingNames.SettingsPrefix + 'enabled';
	static ExecutablePath: string = SettingNames.SettingsPrefix + 'executablePath';
	static IgnorePlatformReqs: string = SettingNames.SettingsPrefix + 'ignorePlatformReqs';
	static RunInTerminal: string = SettingNames.SettingsPrefix + 'runInTerminal';
	static RunQuiet: string = SettingNames.SettingsPrefix + 'runQuiet';
	static WorkingPath: string = SettingNames.SettingsPrefix + 'workingPath';
}

export class ComposerSettings {
	private config: WorkspaceConfiguration

	constructor(scope?: ConfigurationScope) {
		this.config = workspace.getConfiguration('', scope);
	}

	public get enabled(): boolean {
		return this.config.get<boolean>(SettingNames.Enabled, true);
	}

	public get executablePath(): string {
		return this.config.get<string>(SettingNames.ExecutablePath) || 'composer';
	}

	public get ignorePlatformReqs(): boolean {
		return this.config.get<boolean>(SettingNames.IgnorePlatformReqs, false);
	}

	public get runInTerminal(): boolean {
		return this.config.get<boolean>(SettingNames.RunInTerminal, true);
	}

	public get runQuiet(): boolean {
		return this.config.get<boolean>(SettingNames.RunQuiet, false);
	}

	public get workingPath(): string {
		return this.config.get<string>(SettingNames.WorkingPath, undefined);
	}
}

/**
 * An event describing a transactional composer workspace settings change.
 */
export interface ComposerSettingsChangeEvent {

	/**
	 * The affected settings.
	 */
	settings: ComposerSettings;
}
